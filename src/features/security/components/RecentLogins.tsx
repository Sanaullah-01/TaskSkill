import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/server';
import { formatDistanceToNow } from 'date-fns';
import { Monitor, Smartphone, Globe } from 'lucide-react';

export async function RecentLogins() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) return null;

  const { data: logins } = await supabase
    .from('login_history')
    .select('*')
    .eq('user_id', authData.user.id)
    .order('created_at', { ascending: false })
    .limit(5);

  const getDeviceIcon = (userAgent: string | null) => {
    if (!userAgent) return <Globe className="h-5 w-5 text-muted-foreground" />;
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return <Smartphone className="h-5 w-5 text-muted-foreground" />;
    }
    return <Monitor className="h-5 w-5 text-muted-foreground" />;
  };

  const formatUserAgent = (userAgent: string | null) => {
    if (!userAgent) return 'Unknown Device';
    
    // Very naive parser for UI display
    let browser = 'Unknown Browser';
    let os = 'Unknown OS';

    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';

    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac OS X')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';

    return `${browser} on ${os}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          The most recent logins to your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!logins || logins.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent activity found.</p>
        ) : (
          <div className="space-y-6">
            {logins.map((login, index) => (
              <div key={login.id} className="flex items-start">
                <div className="mr-4 mt-1 bg-muted p-2 rounded-full">
                  {getDeviceIcon(login.user_agent)}
                </div>
                <div className="flex flex-col flex-1 gap-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium leading-none">
                      {formatUserAgent(login.user_agent)}
                      {index === 0 && <span className="ml-2 text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full">Current Session</span>}
                    </p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                      {formatDistanceToNow(new Date(login.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    IP Address: {login.ip_address || 'Unknown'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
