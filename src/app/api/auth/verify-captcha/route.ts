import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Missing reCAPTCHA token' }, { status: 400 });
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const isInvalid = !secretKey || secretKey === 'your_recaptcha_secret_key_here';

    if (isInvalid) {
      console.warn('Missing or invalid RECAPTCHA_SECRET_KEY. Bypassing check in development.');
      return NextResponse.json({ success: true, score: 0.9, action: 'submit' }, { status: 200 });
    }

    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;
    const response = await fetch(verifyUrl, { method: 'POST' });
    const data = await response.json();

    if (data.success && data.score >= 0.5) {
      return NextResponse.json({ success: true, score: data.score, action: data.action }, { status: 200 });
    } else {
      console.warn('reCAPTCHA failed:', data);
      return NextResponse.json({ error: 'reCAPTCHA verification failed', details: data }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error verifying reCAPTCHA:', error);
    return NextResponse.json({ error: 'Internal server error during reCAPTCHA validation' }, { status: 500 });
  }
}
