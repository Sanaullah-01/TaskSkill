import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { WelcomeEmailTemplate } from '@/emails/WelcomeEmail';

// Note: Ensure RESEND_API_KEY is in your .env
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY is missing. Skipping welcome email.');
      return NextResponse.json({ success: true, warning: 'Missing Resend key' }, { status: 200 });
    }

    // Send the welcome email
    const data = await resend.emails.send({
      from: 'TaskSkill <onboarding@resend.dev>', // Use resend.dev for testing, switch to custom domain in prod
      to: [email],
      subject: 'Welcome to TaskSkill!',
      react: WelcomeEmailTemplate({ email }) as React.ReactElement,
    });

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: any) {
    console.error('Error sending welcome email:', error);
    return NextResponse.json({ error: error.message || 'Failed to send email' }, { status: 500 });
  }
}
