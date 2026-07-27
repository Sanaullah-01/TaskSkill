'use client';

import * as React from 'react';
import { createClient } from '@/lib/supabase/client';
import { updateAvatarAction } from '../actions/profile.actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Camera, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AvatarUploadProps {
  userId: string;
  url: string | null;
  name: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function AvatarUpload({ userId, url, name, size = 'lg' }: AvatarUploadProps) {
  const [uploading, setUploading] = React.useState(false);
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(url);
  const supabase = createClient();

  const sizeClasses = {
    sm: 'h-10 w-10',
    md: 'h-16 w-16',
    lg: 'h-24 w-24 text-2xl',
    xl: 'h-32 w-32 text-4xl',
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      // Update backend via server action
      const result = await updateAvatarAction(publicUrl);
      
      if (result.error) {
        throw new Error(result.error);
      }

      setAvatarUrl(publicUrl);
      toast.success('Avatar updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Error uploading avatar');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative group cursor-pointer">
        <Avatar className={cn(sizeClasses[size], "border-2 border-border")}>
          <AvatarImage src={avatarUrl || undefined} alt={name || 'User avatar'} className="object-cover" />
          <AvatarFallback className="bg-muted text-muted-foreground uppercase">
            {name ? name.substring(0, 2) : 'U'}
          </AvatarFallback>
        </Avatar>
        
        <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer text-white">
          {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Camera className="h-6 w-6" />}
          <input
            type="file"
            id="avatar"
            accept="image/*"
            onChange={uploadAvatar}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>
      
      <div className="text-center space-y-1">
        <label 
          htmlFor="avatar-btn" 
          className={cn(
            "text-sm font-medium text-primary hover:underline cursor-pointer",
            uploading && "opacity-50 cursor-not-allowed pointer-events-none"
          )}
        >
          {uploading ? 'Uploading...' : 'Change picture'}
        </label>
        <input
          type="file"
          id="avatar-btn"
          accept="image/*"
          onChange={uploadAvatar}
          disabled={uploading}
          className="hidden"
        />
        <p className="text-xs text-muted-foreground">
          JPG, GIF or PNG. Max size of 2MB.
        </p>
      </div>
    </div>
  );
}
