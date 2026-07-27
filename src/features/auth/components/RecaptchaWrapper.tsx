'use client';

import * as React from 'react';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

export function RecaptchaWrapper({ children }: { children: React.ReactNode }) {
  // Use Google's standard v3 testing key if no env var is provided
  // Testing key: 6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';

  return (
    <GoogleReCaptchaProvider 
      reCaptchaKey={siteKey}
      scriptProps={{
        async: false,
        defer: false,
        appendTo: 'head',
        nonce: undefined,
      }}
    >
      {children}
    </GoogleReCaptchaProvider>
  );
}
