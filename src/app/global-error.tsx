'use client';

import * as React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Log the error to an error reporting service like Sentry here
    console.error('Global Error Caught:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 text-center">
        <AlertCircle className="h-24 w-24 text-destructive mb-8" />
        <h1 className="text-4xl font-bold tracking-tight mb-4">Something went wrong!</h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          A critical error occurred. Our engineers have been notified. Please try refreshing the page or navigating back to safety.
        </p>
        <div className="flex gap-4">
          <Button onClick={() => reset()}>Try again</Button>
          <Button variant="outline" onClick={() => window.location.href = '/'}>
            Return Home
          </Button>
        </div>
      </body>
    </html>
  );
}
