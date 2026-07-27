import * as React from 'react';
// Note: In a full production app, you would use @react-email/components for styling.
// For simplicity in this Next.js API, we'll return a raw HTML string or simple React component.

export function WelcomeEmailTemplate({ email }: { email: string }) {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 16px', letterSpacing: '-0.5px' }}>
          Welcome to TaskSkill
        </h1>
        <p style={{ color: '#52525B', fontSize: '16px', lineHeight: '1.5', margin: '0' }}>
          Hi {email},
        </p>
      </div>
      
      <div style={{ backgroundColor: '#F4F4F5', padding: '24px', borderRadius: '8px', marginBottom: '32px' }}>
        <p style={{ color: '#18181B', fontSize: '15px', lineHeight: '1.6', margin: '0 0 16px' }}>
          We're thrilled to have you on board. TaskSkill is designed to keep you focused and help your team manage projects without the friction.
        </p>
        <p style={{ color: '#18181B', fontSize: '15px', lineHeight: '1.6', margin: '0' }}>
          Log in to your workspace to start creating tasks and tracking your progress.
        </p>
      </div>

      <a 
        href="https://taskskill.com/dashboard" 
        style={{ 
          display: 'inline-block', 
          backgroundColor: '#18181B', 
          color: '#FFFFFF', 
          padding: '12px 24px', 
          borderRadius: '6px', 
          textDecoration: 'none', 
          fontWeight: '500',
          fontSize: '14px'
        }}
      >
        Go to Dashboard
      </a>
      
      <hr style={{ borderColor: '#E4E4E7', borderStyle: 'solid', borderWidth: '1px 0 0 0', margin: '40px 0 24px' }} />
      
      <p style={{ color: '#A1A1AA', fontSize: '13px', margin: '0' }}>
        © {new Date().getFullYear()} TaskSkill, Inc. All rights reserved.
      </p>
    </div>
  );
}
