import * as React from 'react';
import { Separator } from '@/components/ui/separator';
import { ProfileForm } from '@/features/profile/components/ProfileForm';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function SettingsGeneralPage() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authData.user.id)
    .single();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">General</h3>
        <p className="text-sm text-muted-foreground">
          Update your public profile information and timezone preferences.
        </p>
      </div>
      <Separator />
      <ProfileForm 
        initialData={{
          name: profile?.name || authData.user.user_metadata.name || '',
          bio: profile?.bio || '',
          timezone: profile?.timezone || 'UTC',
        }} 
      />
    </div>
  );
}
