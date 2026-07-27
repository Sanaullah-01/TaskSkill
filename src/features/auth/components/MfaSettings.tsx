'use client';

import * as React from 'react';
import { createClient } from '@/lib/supabase/client';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import { ShieldCheck, ShieldWarning, CircleNotch } from '@phosphor-icons/react';

export function MfaSettings() {
  const supabase = createClient();
  const [factorId, setFactorId] = React.useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = React.useState<string | null>(null);
  const [verifyCode, setVerifyCode] = React.useState('');
  const [isEnrolled, setIsEnrolled] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    checkMfaStatus();
  }, []);

  const checkMfaStatus = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (error) throw error;
      
      setIsEnrolled(data.nextLevel === 'aal2');
    } catch (err) {
      console.error('Error checking MFA status', err);
    }
  };

  const setupMfa = async () => {
    setIsLoading(true);
    try {
      // Clean up any existing unverified factors first to prevent collision errors
      const { data: factors } = await supabase.auth.mfa.listFactors();
      if (factors && factors.totp.length > 0) {
        for (const factor of factors.totp) {
          await supabase.auth.mfa.unenroll({ factorId: factor.id });
        }
      }

      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
      });
      if (error) throw error;

      setFactorId(data.id);
      // Supabase returns the raw URI needed to generate the QR code
      setQrCodeUrl(data.totp.uri);
    } catch (err: any) {
      toast.error(err.message || 'Failed to start MFA setup');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyAndEnable = async () => {
    if (!factorId) return;
    setIsLoading(true);
    try {
      const challenge = await supabase.auth.mfa.challenge({ factorId });
      if (challenge.error) throw challenge.error;

      const verify = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.data.id,
        code: verifyCode,
      });
      
      if (verify.error) throw verify.error;

      toast.success('Two-Factor Authentication enabled!');
      setIsEnrolled(true);
      setQrCodeUrl(null);
      setVerifyCode('');
    } catch (err: any) {
      toast.error(err.message || 'Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const disableMfa = async () => {
    setIsLoading(true);
    try {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      if (factors && factors.totp.length > 0) {
        const factorIdToUnenroll = factors.totp[0].id;
        const { error } = await supabase.auth.mfa.unenroll({ factorId: factorIdToUnenroll });
        if (error) throw error;
        toast.success('Two-Factor Authentication disabled');
        setIsEnrolled(false);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to disable MFA');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background border rounded-lg p-6 max-w-xl shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        {isEnrolled ? (
          <ShieldCheck className="w-8 h-8 text-emerald-500" />
        ) : (
          <ShieldWarning className="w-8 h-8 text-amber-500" />
        )}
        <div>
          <h2 className="text-lg font-semibold">Two-Factor Authentication</h2>
          <p className="text-sm text-muted-foreground">
            {isEnrolled ? 'Your account is protected by MFA.' : 'Add an extra layer of security to your account.'}
          </p>
        </div>
      </div>

      {!isEnrolled && !qrCodeUrl && (
        <button onClick={setupMfa} disabled={isLoading} className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full sm:w-auto">
          {isLoading ? <><CircleNotch className="mr-2 h-4 w-4 animate-spin" /> Setting up...</> : 'Enable 2FA (Authenticator App)'}
        </button>
      )}

      {isEnrolled && (
        <button onClick={disableMfa} disabled={isLoading} className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 px-4 py-2 w-full sm:w-auto">
          {isLoading ? <><CircleNotch className="mr-2 h-4 w-4 animate-spin" /> Disabling...</> : 'Disable 2FA'}
        </button>
      )}

      {qrCodeUrl && !isEnrolled && (
        <div className="space-y-4 border rounded-md p-4 bg-secondary/10 mt-6">
          <p className="text-sm font-medium">1. Scan this QR Code with your Authenticator App (like Google Authenticator or Authy).</p>
          <div className="bg-white p-4 rounded-md inline-block">
            <QRCodeSVG value={qrCodeUrl} size={200} />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">2. Enter the 6-digit code generated by your app.</p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="000000"
                maxLength={6}
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:max-w-[200px] text-center tracking-widest text-lg"
              />
              <button onClick={verifyAndEnable} disabled={isLoading || verifyCode.length !== 6} className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                {isLoading ? <CircleNotch className="h-4 w-4 animate-spin" /> : 'Verify'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
