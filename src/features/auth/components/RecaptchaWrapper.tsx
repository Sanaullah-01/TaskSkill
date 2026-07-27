'use client';

import * as React from 'react';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

export function RecaptchaWrapper({ children }: { children: React.ReactNode }) {
  // We use the env variable. If missing, we still render children so the app doesn't crash in dev.
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '';
  const isInvalid = !siteKey || siteKey === 'your_recaptcha_site_key_here';

  if (isInvalid) {
    console.warn('Missing or invalid NEXT_PUBLIC_RECAPTCHA_SITE_KEY. reCAPTCHA will not be active.');
    return (
      <GoogleReCaptchaProvider reCaptchaKey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI">
        {children}
      </GoogleReCaptchaProvider>
    );
  }

  return (
    <GoogleReCaptchaProvider reCaptchaKey={siteKey}>
      {children}
    </GoogleReCaptchaProvider>
  );
}
