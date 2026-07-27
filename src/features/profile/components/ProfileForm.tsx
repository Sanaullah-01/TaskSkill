'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { updateProfileAction } from '../actions/profile.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const profileFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }).max(50),
  bio: z.string().max(160, { message: 'Bio must not be longer than 160 characters.' }).optional(),
  timezone: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileFormProps {
  initialData: {
    name: string | null;
    bio: string | null;
    timezone: string | null;
  };
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema) as any,
    defaultValues: {
      name: initialData.name || '',
      bio: initialData.bio || '',
      timezone: initialData.timezone || 'UTC',
    },
    mode: 'onChange',
  });

  function onSubmit(data: ProfileFormValues) {
    startTransition(async () => {
      const result = await updateProfileAction(data);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Profile updated successfully.');
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-8">
        <FormField
          control={form.control as any}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Name</FormLabel>
              <FormControl>
                <Input placeholder="Your name" {...field} disabled={isPending} />
              </FormControl>
              <FormDescription>
                This is the name that will be displayed on your profile and in emails.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control as any}
          name="timezone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Timezone</FormLabel>
              <FormControl>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  {...field}
                  disabled={isPending}
                >
                  <option value="UTC">Coordinated Universal Time (UTC)</option>
                  <option value="America/New_York">Eastern Time (US & Canada)</option>
                  <option value="America/Chicago">Central Time (US & Canada)</option>
                  <option value="America/Denver">Mountain Time (US & Canada)</option>
                  <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                  <option value="Europe/London">London</option>
                  <option value="Europe/Paris">Paris</option>
                  <option value="Asia/Tokyo">Tokyo</option>
                  <option value="Australia/Sydney">Sydney</option>
                </select>
              </FormControl>
              <FormDescription>
                Used to format due dates across the application.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control as any}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us a little bit about yourself"
                  className="resize-none"
                  {...field}
                  disabled={isPending}
                />
              </FormControl>
              <FormDescription>
                You can write a short biography (max 160 characters).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving...' : 'Update profile'}
        </Button>
      </form>
    </Form>
  );
}
