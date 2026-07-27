'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, type SignupInput } from '../schemas/auth.schema';
import { signupAction } from '../actions/auth.actions';
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
import { useRouter } from 'next/navigation';

export function SignupForm() {
  const [isPending, startTransition] = React.useTransition();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const router = useRouter();

  const form = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: SignupInput) {
    if (!executeRecaptcha) {
      toast.error('Security check not ready. Please try again.');
      return;
    }

    const recaptchaToken = await executeRecaptcha('signup');

    startTransition(async () => {
      const result = await signupAction({ ...values, recaptchaToken });
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('Account created successfully! Check your email to verify.');
        router.push('/login');
      }
    });
  }

  return (
    <div className="grid gap-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Creating account...' : 'Create account'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
