import * as React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AvatarUpload } from '@/features/profile/components/AvatarUpload';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Edit2, MapPin, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default async function ProfilePage() {
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

  const name = profile?.name || authData.user.user_metadata.name || 'Anonymous User';
  const avatarUrl = profile?.avatar_url || authData.user.user_metadata.avatar_url;
  const memberSince = format(new Date(authData.user.created_at), 'MMMM yyyy');

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Public Profile</h2>
          <p className="text-muted-foreground">
            This is how others will see you on the platform.
          </p>
        </div>
        <Link 
          href="/settings/general"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
        >
          <Edit2 className="mr-2 h-4 w-4" />
          Edit Profile
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card>
            <CardContent className="pt-6 flex flex-col items-center">
              <AvatarUpload 
                userId={authData.user.id} 
                url={avatarUrl} 
                name={name} 
                size="xl" 
              />
              
              <div className="mt-6 text-center w-full space-y-4">
                <Badge variant="secondary" className="w-full justify-center">
                  Free Plan
                </Badge>
                
                <div className="flex items-center justify-center text-sm text-muted-foreground">
                  <Clock className="mr-2 h-4 w-4" />
                  Joined {memberSince}
                </div>

                {profile?.timezone && (
                  <div className="flex items-center justify-center text-sm text-muted-foreground">
                    <MapPin className="mr-2 h-4 w-4" />
                    {profile.timezone}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
              <CardDescription>Your personal biography.</CardDescription>
            </CardHeader>
            <CardContent>
              {profile?.bio ? (
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {profile.bio}
                </p>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed rounded-md bg-muted/20">
                  <p className="text-sm text-muted-foreground mb-4">
                    You haven't written a bio yet.
                  </p>
                  <Link 
                    href="/settings/general"
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 px-3"
                  >
                    Add Bio
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest actions across the platform.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-8 text-center border border-dashed rounded-md bg-muted/20">
                <p className="text-sm text-muted-foreground">
                  No public activity to show.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
