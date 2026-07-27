'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  bio: z.string().max(160).optional().nullable(),
  timezone: z.string().optional().nullable(),
});

export async function updateProfileAction(data: z.infer<typeof updateProfileSchema>) {
  try {
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData.user) {
      return { error: 'Unauthorized' };
    }

    const validatedData = updateProfileSchema.parse(data);

    const { error } = await supabase
      .from('profiles')
      .update(validatedData)
      .eq('id', authData.user.id);

    if (error) {
      console.error('Update profile error:', error);
      return { error: 'Failed to update profile' };
    }

    revalidatePath('/settings/general');
    revalidatePath('/profile');
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: 'Invalid profile data provided' };
    }
    return { error: 'An unexpected error occurred' };
  }
}

export async function updateAvatarAction(avatar_url: string) {
  try {
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData.user) {
      return { error: 'Unauthorized' };
    }

    const { error } = await supabase
      .from('profiles')
      .update({ avatar_url })
      .eq('id', authData.user.id);

    if (error) {
      console.error('Update avatar error:', error);
      return { error: 'Failed to update avatar' };
    }

    // Also update auth metadata for faster client-side access
    await supabase.auth.updateUser({
      data: { avatar_url }
    });

    revalidatePath('/settings/general');
    revalidatePath('/profile');
    return { success: true };
  } catch (error) {
    return { error: 'An unexpected error occurred' };
  }
}
