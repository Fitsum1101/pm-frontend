import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { Spinner } from '@/components/ui/Spinner';
import { AppLoadingState } from '@/components/feedback/AppStates';
import { useMe, useUpdateMe, useUpdateAvatar } from '@/features/users/hooks/useUsers';
import { fileToAvatarDataUrl } from '@/lib/utils/image';

interface ProfileForm {
  full_name: string;
  bio: string;
}

function initials(name: string): string {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?';
}

export function ProfilePage() {
  const profile = useMe();
  const update = useUpdateMe();
  const updateAvatar = useUpdateAvatar();
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const { register, handleSubmit, reset } = useForm<ProfileForm>({
    defaultValues: { full_name: '', bio: '' },
  });

  useEffect(() => {
    if (profile.data) {
      reset({ full_name: profile.data.full_name ?? '', bio: profile.data.bio ?? '' });
    }
  }, [profile.data, reset]);

  if (profile.isLoading) return <AppLoadingState label="Loading profile…" />;

  const avatarUrl = profile.data?.avatar_url;

  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file
    if (!file) return;
    setAvatarError(null);
    try {
      const dataUrl = await fileToAvatarDataUrl(file);
      updateAvatar.mutate(dataUrl);
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : 'Could not process image');
    }
  };

  return (
    <div className="max-w-2xl">
      <PageHeader title="Profile" description="Update your personal information." />

      <Card>
        <CardContent className="pt-6">
          {/* Avatar */}
          <div className="mb-6 flex items-center gap-4">
            <div className="relative">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="h-20 w-20 rounded-full object-cover ring-2 ring-border"
                />
              ) : (
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-xl font-semibold text-primary ring-2 ring-border">
                  {initials(profile.data?.full_name ?? '')}
                </span>
              )}
              {updateAvatar.isPending && (
                <span className="absolute inset-0 flex items-center justify-center rounded-full bg-background/60">
                  <Spinner />
                </span>
              )}
            </div>

            <div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onPickFile}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileRef.current?.click()}
                disabled={updateAvatar.isPending}
              >
                {avatarUrl ? 'Change photo' : 'Upload photo'}
              </Button>
              <p className="mt-1 text-xs text-muted-foreground">JPG or PNG, up to a few MB.</p>
              {avatarError && <p className="mt-1 text-xs text-destructive">{avatarError}</p>}
            </div>
          </div>

          {/* Details */}
          <form onSubmit={handleSubmit((v) => update.mutate(v))} className="space-y-4">
            <FormField label="Full name" htmlFor="full_name">
              <Input id="full_name" {...register('full_name')} />
            </FormField>
            <FormField label="Bio" htmlFor="bio">
              <Input id="bio" placeholder="A short bio" {...register('bio')} />
            </FormField>

            <Button type="submit" disabled={update.isPending}>
              {update.isPending && <Spinner />} Save changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
