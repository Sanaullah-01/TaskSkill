import type { Metadata } from 'next';
import { Inter, Geist } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Toaster } from 'sonner';
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://taskskill.vercel.app'),
  title: {
    default: 'TaskSkill - Premium Task Management',
    template: '%s | TaskSkill',
  },
  description: 'TaskSkill is a modern SaaS task management platform designed for speed and productivity.',
  keywords: ['task manager', 'productivity', 'saas', 'collaboration', 'linear alternative'],
  authors: [{ name: 'TaskSkill Team' }],
  creator: 'TaskSkill',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://taskskill.vercel.app',
    title: 'TaskSkill - Premium Task Management',
    description: 'TaskSkill is a modern SaaS task management platform designed for speed and productivity.',
    siteName: 'TaskSkill',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'TaskSkill Dashboard Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TaskSkill - Premium Task Management',
    description: 'TaskSkill is a modern SaaS task management platform designed for speed and productivity.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <body className={`${inter.className} antialiased min-h-screen bg-background text-foreground`}>
        <Providers>
          {children}
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
