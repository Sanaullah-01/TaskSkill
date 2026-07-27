'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export function LogoutAllDevices() {
  const [isPending, startTransition] = React.useTransition();
  const router = useRouter();

  const handleLogoutAll = () => {
    if (!confirm('Are you sure you want to sign out from all devices? You will be logged out of your current session as well.')) return;

    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        toast.error('Failed to sign out from all devices');
        return;
      }

      toast.success('Successfully signed out from all devices');
      router.push('/login');
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-destructive flex items-center gap-2">
          <LogOut className="h-5 w-5" />
          Logout All Devices
        </CardTitle>
        <CardDescription>
          Sign out of all active sessions across all your devices, including this one.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="destructive" onClick={handleLogoutAll} disabled={isPending}>
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Sign out everywhere'}
        </Button>
      </CardContent>
    </Card>
  );
}
