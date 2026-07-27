import Link from 'next/link';

export default function ForgotPasswordPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center p-4">
      <div className="w-full max-w-sm mx-auto space-y-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Reset Password</h1>
        <p className="text-sm text-muted-foreground">
          Password reset flow is coming soon.
        </p>
        <Link href="/login" className="text-sm font-medium underline underline-offset-4 hover:text-primary">
          Back to login
        </Link>
      </div>
    </div>
  );
}
