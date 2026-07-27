'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, type ForgotPasswordInput } from '../schemas/auth.schema';
import { forgotPasswordAction } from '../actions/auth.actions';
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

export function ForgotPasswordForm() {
  const [isPending, startTransition] = React.useTransition();
  const { executeRecaptcha } = useGoogleReCaptcha();

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  async function onSubmit(values: ForgotPasswordInput) {
    if (!executeRecaptcha) {
      toast.error('Security check not ready. Please try again.');
      return;
    }

    const recaptchaToken = await executeRecaptcha('forgot_password');

    startTransition(async () => {
      const result = await forgotPasswordAction({ ...values, recaptchaToken });
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('Password reset link sent to your email.');
      }
    });
  }

  return (
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

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? 'Sending link...' : 'Send reset link'}
        </Button>
      </form>
    </Form>
  );
}
