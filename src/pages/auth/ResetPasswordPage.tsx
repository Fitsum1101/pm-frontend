import { useForm } from 'react-hook-form';
import { Link, useLocation } from 'react-router-dom';
import { zodResolver } from '@/lib/utils/zodResolver';
import {
  resetPasswordSchema,
  type ResetPasswordValues,
} from '@/features/auth/schemas/auth.schema';
import { useResetPassword } from '@/features/auth/hooks/usePassword';
import { useResendOtp } from '@/features/auth/hooks/useVerifyOtp';
import { PATHS } from '@/app/routes/paths';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { Spinner } from '@/components/ui/Spinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

export function ResetPasswordPage() {
  const location = useLocation();
  const prefillEmail = (location.state as { email?: string } | null)?.email ?? '';

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: prefillEmail, code: '', new_password: '' },
  });

  const reset = useResetPassword();
  const resend = useResendOtp();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reset password</CardTitle>
        <CardDescription>Enter the code we emailed you and choose a new password.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit((v) => reset.mutate(v))} className="space-y-4" noValidate>
          <FormField label="Email" htmlFor="email" error={errors.email?.message}>
            <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
          </FormField>
          <FormField label="Reset code" htmlFor="code" error={errors.code?.message}>
            <Input id="code" inputMode="numeric" maxLength={6} placeholder="123456" {...register('code')} />
          </FormField>
          <FormField label="New password" htmlFor="new_password" error={errors.new_password?.message}>
            <Input
              id="new_password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              {...register('new_password')}
            />
          </FormField>

          <Button type="submit" className="w-full" disabled={reset.isPending}>
            {reset.isPending && <Spinner />} Reset password
          </Button>
        </form>

        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Didn't get the code?</span>
          <Button
            variant="ghost"
            size="sm"
            disabled={resend.isPending}
            onClick={() => resend.mutate({ email: getValues('email'), type: 'PASSWORD_RESET' })}
          >
            {resend.isPending ? 'Sending…' : 'Resend code'}
          </Button>
        </div>
        {resend.isSuccess && (
          <p className="mt-1 text-xs text-muted-foreground">A new code has been sent.</p>
        )}

        <p className="mt-4 text-center text-sm text-muted-foreground">
          <Link to={PATHS.auth.signIn} className="font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
