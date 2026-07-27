import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center p-4">
      <h2 className="mb-4 text-3xl font-bold tracking-tight">Not Found</h2>
      <p className="mb-8 text-muted-foreground text-center max-w-md">Could not find requested resource</p>
      <Link
        href="/"
        className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Return Home
      </Link>
    </div>
  );
}
