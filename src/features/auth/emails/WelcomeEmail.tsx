import * as React from 'react';

interface WelcomeEmailProps {
  name: string;
}

export const WelcomeEmail: React.FC<Readonly<WelcomeEmailProps>> = ({ name }) => (
  <div style={{ fontFamily: 'sans-serif', padding: '20px', color: '#333' }}>
    <h1 style={{ color: '#000' }}>Welcome to TaskSkill, {name}!</h1>
    <p>We are thrilled to have you on board.</p>
    <p>TaskSkill is designed to help you manage your tasks efficiently and beautifully.</p>
    <br />
    <p>Get started by exploring your new dashboard.</p>
    <br />
    <p>Best regards,</p>
    <p>The TaskSkill Team</p>
  </div>
);
