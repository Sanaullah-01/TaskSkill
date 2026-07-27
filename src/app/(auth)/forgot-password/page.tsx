import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  return (
    <>
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Forgot Password</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and we will send you a reset link.
        </p>
      </div>
      <ForgotPasswordForm />
      <p className="px-8 text-center text-sm text-muted-foreground">
        Remember your password?{' '}
        <Link
          href="/login"
          className="underline underline-offset-4 hover:text-primary"
        >
          Sign in
        </Link>
      </p>
    </>
  );
}
