'use client';

import * as React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/redux/hooks';
import { setUser } from '@/redux/slices/authSlice';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { CircleNotch } from '@phosphor-icons/react';
import Link from 'next/link';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showMfa, setShowMfa] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [factorId, setFactorId] = useState<string | null>(null);
  
  const router = useRouter();
  const dispatch = useAppDispatch();
  const supabase = createClient();
  const { executeRecaptcha } = useGoogleReCaptcha();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!executeRecaptcha) {
        throw new Error('reCAPTCHA not ready');
      }

      const token = await executeRecaptcha('login');
      
      const captchaRes = await fetch('/api/auth/verify-captcha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const captchaData = await captchaRes.json();
      
      if (!captchaData.success) {
        throw new Error('reCAPTCHA verification failed. Please try again.');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      // Check MFA status
      const { data: mfaData, error: mfaError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (mfaError) {
        throw mfaError;
      }

      if (mfaData.nextLevel === 'aal2' && mfaData.currentLevel === 'aal1') {
        // User has MFA enabled but hasn't verified it yet
        const { data: factors } = await supabase.auth.mfa.listFactors();
        if (factors && factors.totp.length > 0) {
          setFactorId(factors.totp[0].id);
          setShowMfa(true);
          return;
        }
      }

      dispatch(setUser(data.user));
      toast.success('Welcome back.');
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMfaVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!factorId) return;

    setIsLoading(true);
    try {
      const challenge = await supabase.auth.mfa.challenge({ factorId });
      if (challenge.error) throw challenge.error;

      const verify = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.data.id,
        code: mfaCode,
      });

      if (verify.error) throw verify.error;

      const { data: { user } } = await supabase.auth.getUser();
      dispatch(setUser(user));
      toast.success('Verification successful. Welcome back.');
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-6">
      <div className="flex flex-col space-y-2 text-center mb-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          {showMfa ? 'Two-Factor Authentication' : 'Welcome back'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {showMfa 
            ? 'Enter the 6-digit code from your authenticator app.' 
            : 'Enter your credentials below to access your workspace.'}
        </p>
      </div>

      {showMfa ? (
        <form onSubmit={handleMfaVerify} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="mfaCode">
              Authentication Code
            </label>
            <input
              id="mfaCode"
              type="text"
              placeholder="000000"
              maxLength={6}
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
              required
              disabled={isLoading}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-center tracking-widest text-lg"
            />
          </div>
          <button disabled={isLoading || mfaCode.length !== 6} type="submit" className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
            {isLoading && <CircleNotch className="mr-2 h-4 w-4 animate-spin" />}
            Verify Code
          </button>
          <button type="button" onClick={() => setShowMfa(false)} disabled={isLoading} className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
            Cancel
          </button>
        </form>
      ) : (
        <>
          <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-4">
          <div className="space-y-2 flex flex-col">
            <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          
          <div className="space-y-2 flex flex-col">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Password
              </label>
              <Link href="/forgot-password" className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors">
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full active:scale-[0.98]"
        >
          {isLoading ? (
            <CircleNotch className="h-4 w-4 animate-spin mr-2" />
          ) : null}
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      
      <div className="text-center text-sm">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="font-medium underline underline-offset-4 hover:text-primary">
          Sign up
        </Link>
      </div>
      </>
      )}
    </div>
  );
}
