'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

// Random string generator for recovery codes
function generateRecoveryCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 10; i++) {
    if (i === 5) result += '-';
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function enrollMfaAction() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) return { error: 'Unauthorized' };

  // Check if already enrolled
  const { data: factors } = await supabase.auth.mfa.listFactors();
  if (factors?.all && factors.all.length > 0) {
    return { error: 'MFA is already enrolled' };
  }

  const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
  if (error) return { error: error.message };

  return { 
    success: true, 
    factorId: data.id, 
    qrCode: data.totp.qr_code,
    secret: data.totp.secret
  };
}

export async function verifyMfaSetupAction(factorId: string, code: string) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) return { error: 'Unauthorized' };

  const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
  if (challengeError) return { error: challengeError.message };

  const { data: verifyData, error: verifyError } = await supabase.auth.mfa.verify({
    factorId,
    challengeId: challengeData.id,
    code,
  });

  if (verifyError) return { error: verifyError.message };

  // After successful verification, generate 10 recovery codes
  const rawCodes = Array.from({ length: 10 }, () => generateRecoveryCode());
  const hashedCodes = await Promise.all(
    rawCodes.map(code => bcrypt.hash(code.replace('-', ''), 10))
  );

  const insertData = hashedCodes.map(hash => ({
    user_id: authData.user.id,
    code_hash: hash,
    used: false
  }));

  const { error: insertError } = await supabase
    .from('recovery_codes')
    .insert(insertData);

  if (insertError) {
    console.error('Failed to save recovery codes', insertError);
    // Continue anyway since MFA is enrolled, but log error
  }

  revalidatePath('/settings/security');
  
  return { 
    success: true, 
    recoveryCodes: rawCodes 
  };
}

export async function unenrollMfaAction() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) return { error: 'Unauthorized' };

  const { data: factors } = await supabase.auth.mfa.listFactors();
  
  if (!factors || factors.all.length === 0) {
    return { error: 'No MFA factors found' };
  }

  // Delete all factors
  for (const factor of factors.all) {
    await supabase.auth.mfa.unenroll({ factorId: factor.id });
  }

  // Delete all recovery codes
  await supabase
    .from('recovery_codes')
    .delete()
    .eq('user_id', authData.user.id);

  revalidatePath('/settings/security');
  return { success: true };
}

export async function verifyMfaLoginAction(factorId: string, code: string) {
  const supabase = await createClient();
  
  // Create challenge
  const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
  if (challengeError) return { error: challengeError.message };

  // Verify code
  const { error: verifyError } = await supabase.auth.mfa.verify({
    factorId,
    challengeId: challengeData.id,
    code,
  });

  if (verifyError) return { error: verifyError.message };

  return { success: true };
}
