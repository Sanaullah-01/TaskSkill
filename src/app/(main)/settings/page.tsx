import * as React from 'react';
import { MfaSettings } from '@/features/auth/components/MfaSettings';
import { ProfileSettings } from '@/features/settings/components/ProfileSettings';

export default function SettingsPage() {
  return (
    <div className="flex-1 overflow-y-auto p-8 bg-background h-[calc(100vh-3.5rem)]">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account settings and security preferences.
          </p>
        </div>

        <div className="space-y-10">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Profile</h2>
            <hr className="border-border" />
            <ProfileSettings />
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Security</h2>
            <hr className="border-border" />
            <MfaSettings />
          </div>
        </div>
      </div>
    </div>
  );
}
