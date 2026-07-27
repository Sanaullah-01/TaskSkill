'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '../schemas/auth.schema';
import { loginAction } from '../actions/auth.actions';
import { verifyMfaLoginAction } from '@/features/security/actions/mfa.actions';
import { toast } from 'sonner';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export function LoginForm() {
  const [isPending, startTransition] = React.useTransition();
  const { executeRecaptcha } = useGoogleReCaptcha();
  
  // MFA State
  const [mfaFactorId, setMfaFactorId] = React.useState<string | null>(null);
  const [mfaCode, setMfaCode] = React.useState('');

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: LoginInput) {
    if (!executeRecaptcha) {
      toast.error('Security check not ready. Please try again.');
      return;
    }

    const recaptchaToken = await executeRecaptcha('login');

    startTransition(async () => {
      const result = await loginAction({ ...values, recaptchaToken });
      
      if (result?.requiresMfa && result?.factorId) {
        setMfaFactorId(result.factorId);
        return;
      }
      
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('Successfully logged in');
      }
    });
  }

  const handleMfaSubmit = () => {
    if (!mfaFactorId || mfaCode.length < 6) return;

    startTransition(async () => {
      const result = await verifyMfaLoginAction(mfaFactorId, mfaCode);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('Successfully logged in');
        window.location.href = '/dashboard';
      }
    });
  };

  if (mfaFactorId) {
    return (
      <div className="grid gap-6">
        <div className="text-center mb-4">
          <h2 className="text-lg font-medium">Two-Factor Authentication</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Please enter the 6-digit code from your authenticator app.
          </p>
        </div>
        <div className="flex justify-center mb-4">
          <Input 
            value={mfaCode}
            onChange={(e) => setMfaCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
            placeholder="000000"
            className="max-w-[200px] text-center tracking-[0.5em] text-2xl font-mono h-14"
          />
        </div>
        <Button onClick={handleMfaSubmit} className="w-full" disabled={isPending || mfaCode.length !== 6}>
          {isPending ? 'Verifying...' : 'Verify Code'}
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="m@example.com" {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>
                  <Link
                    href="/forgot-password"
                    className="text-sm font-medium text-muted-foreground hover:text-primary"
                  >
                    Forgot password?
                  </Link>
                </div>
                <FormControl>
                  <Input type="password" {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? 'Signing in...' : 'Sign in'}
        </Button>
        </form>
      </Form>
    </div>
  );
}
