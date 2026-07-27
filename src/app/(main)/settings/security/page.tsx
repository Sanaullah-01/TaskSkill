import * as React from 'react';
import { Separator } from '@/components/ui/separator';
import { TwoFactorSetup } from '@/features/security/components/TwoFactorSetup';
import { RecentLogins } from '@/features/security/components/RecentLogins';
import { LogoutAllDevices } from '@/features/security/components/LogoutAllDevices';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function SettingsSecurityPage() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    redirect('/login');
  }

  // Check if MFA is currently enrolled
  const { data: factors } = await supabase.auth.mfa.listFactors();
  const isEnrolled = factors?.all && factors.all.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Security</h3>
        <p className="text-sm text-muted-foreground">
          Manage your account security, two-factor authentication, and sessions.
        </p>
      </div>
      <Separator />
      
      <div className="space-y-8">
        <TwoFactorSetup isEnrolled={isEnrolled || false} />
        <RecentLogins />
        <LogoutAllDevices />
      </div>
    </div>
  );
}
