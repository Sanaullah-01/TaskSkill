'use server';
import * as React from 'react';

import { createClient } from '@/lib/supabase/server';
import { 
  loginSchema, type LoginInput, 
  signupSchema, type SignupInput,
  forgotPasswordSchema, type ForgotPasswordInput
} from '../schemas/auth.schema';
import { resend } from '@/lib/resend/client';
import { WelcomeEmail } from '../emails/WelcomeEmail';
import { redirect } from 'next/navigation';

async function verifyRecaptchaToken(token: string) {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY || '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe';
  
  try {
    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${token}`,
    });
    
    const data = await res.json();
    // Enforce a strict minimum score threshold of 0.5 for v3
    return data.success && data.score >= 0.5;
  } catch (error) {
    return false;
  }
}

export async function loginAction(data: LoginInput) {
  const result = loginSchema.safeParse(data);
  if (!result.success) {
    return { error: 'Invalid input data' };
  }

  const isValidToken = await verifyRecaptchaToken(result.data.recaptchaToken);
  if (!isValidToken) {
    return { error: 'Security check failed. Please try again.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: result.data.email,
    password: result.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  // Check if MFA is required
  const { data: factors } = await supabase.auth.mfa.listFactors();
  if (factors && factors.all.length > 0) {
    // User has MFA enrolled, they need to verify it.
    // We return the factorId so the UI can challenge them.
    const totpFactor = factors.all.find(f => f.factor_type === 'totp');
    if (totpFactor) {
      return { requiresMfa: true, factorId: totpFactor.id };
    }
  }

  redirect('/dashboard');
}

export async function signupAction(data: SignupInput) {
  const result = signupSchema.safeParse(data);
  if (!result.success) {
    return { error: 'Invalid input data' };
  }

  const isValidToken = await verifyRecaptchaToken(result.data.recaptchaToken);
  if (!isValidToken) {
    return { error: 'Security check failed. Please try again.' };
  }

  const supabase = await createClient();
  const { data: authData, error } = await supabase.auth.signUp({
    email: result.data.email,
    password: result.data.password,
    options: {
      data: {
        name: result.data.name,
      }
    }
  });

  if (error) {
    return { error: error.message };
  }

  // Send Welcome Email
  if (authData.user && authData.user.email) {
    try {
      await resend.emails.send({
        from: 'TaskSkill <onboarding@resend.dev>',
        to: authData.user.email,
        subject: 'Welcome to TaskSkill!',
        react: React.createElement(WelcomeEmail, { name: result.data.name }),
      });
    } catch (emailError) {
      console.error('Failed to send welcome email', emailError);
    }
  }

  return { success: true };
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

export async function forgotPasswordAction(data: ForgotPasswordInput) {
  const result = forgotPasswordSchema.safeParse(data);
  if (!result.success) {
    return { error: 'Invalid email address' };
  }

  const isValidToken = await verifyRecaptchaToken(result.data.recaptchaToken);
  if (!isValidToken) {
    return { error: 'Security check failed. Please try again.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(result.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
