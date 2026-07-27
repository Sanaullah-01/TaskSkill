'use client';

import * as React from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { CircleNotch, User, Camera } from '@phosphor-icons/react';
import { AvatarCropper } from './AvatarCropper';

export function ProfileSettings() {
  const supabase = createClient();
  
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  
  const [userId, setUserId] = React.useState<string | null>(null);
  const [name, setName] = React.useState('');
  const [bio, setBio] = React.useState('');
  const [timezone, setTimezone] = React.useState('UTC');
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  
  const [selectedImageStr, setSelectedImageStr] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      setUserId(user.id);

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error && error.code !== 'PGRST116') throw error;
      
      if (profile) {
        setName(profile.name || '');
        setBio(profile.bio || '');
        setTimezone(profile.timezone || 'UTC');
        setAvatarUrl(profile.avatar_url);
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          name,
          bio,
          timezone,
          // avatar_url is updated directly when crop is finished
        });
        
      if (error) throw error;
      toast.success('Profile updated successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const imageDataUrl = await readFile(file);
      setSelectedImageStr(imageDataUrl);
      // Reset input so the same file can be selected again if needed
      e.target.value = '';
    }
  };

  const onCropComplete = async (croppedBlob: Blob) => {
    if (!userId) return;
    
    try {
      // Show saving state in the cropper or let the cropper handle its own state
      // (The cropper handles its own isProcessing state, but we upload here)
      
      const filePath = `${userId}/avatar.jpg`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, croppedBlob, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Save to profile
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          avatar_url: publicUrl,
        });

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      setSelectedImageStr(null);
      toast.success('Avatar updated!');
      
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to upload avatar');
      throw err; // throw to let the cropper know it failed
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><CircleNotch className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="bg-background border rounded-lg p-6 max-w-2xl shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <User className="w-8 h-8 text-primary" />
        <div>
          <h2 className="text-lg font-semibold">Personal Information</h2>
          <p className="text-sm text-muted-foreground">
            Update your photo and personal details here.
          </p>
        </div>
      </div>

      <div className="mb-8 flex items-center gap-6">
        <div className="relative group">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-background bg-secondary flex items-center justify-center shadow-md">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-10 h-10 text-muted-foreground" />
            )}
          </div>
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:scale-105 active:scale-95"
          >
            <Camera className="w-4 h-4" />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/jpeg,image/png,image/webp" 
            onChange={onFileChange}
          />
        </div>
        <div className="space-y-1 text-sm">
          <p className="font-medium">Profile Picture</p>
          <p className="text-muted-foreground">JPG, PNG or WebP. 1:1 ratio recommended.</p>
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-primary font-medium hover:underline"
          >
            Change photo
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none" htmlFor="name">Full Name</label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            placeholder="Jane Doe"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none" htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
            placeholder="Tell us a little bit about yourself"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none" htmlFor="timezone">Timezone</label>
          <select
            id="timezone"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="UTC">UTC (Universal Coordinated Time)</option>
            <option value="America/New_York">Eastern Time (US & Canada)</option>
            <option value="America/Chicago">Central Time (US & Canada)</option>
            <option value="America/Denver">Mountain Time (US & Canada)</option>
            <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
            <option value="Europe/London">London (GMT)</option>
            <option value="Europe/Paris">Central European Time (CET)</option>
            <option value="Asia/Dubai">Dubai (GST)</option>
            <option value="Asia/Tokyo">Tokyo (JST)</option>
            <option value="Australia/Sydney">Sydney (AEST)</option>
          </select>
        </div>

        <div className="pt-4">
          <button 
            type="submit" 
            disabled={isSaving}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full sm:w-auto"
          >
            {isSaving ? <><CircleNotch className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 'Save Changes'}
          </button>
        </div>
      </form>

      {selectedImageStr && (
        <AvatarCropper 
          imageSrc={selectedImageStr} 
          onClose={() => setSelectedImageStr(null)} 
          onCropComplete={onCropComplete} 
        />
      )}
    </div>
  );
}

// Helper to convert file to data URL for react-easy-crop
function readFile(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(reader.result as string), false);
    reader.readAsDataURL(file);
  });
}
