import { useForm } from 'react-hook-form';
import { useLocation } from 'react-router-dom';
import { zodResolver } from '@/lib/utils/zodResolver';
import { verifyOtpSchema, type VerifyOtpValues } from '@/features/auth/schemas/auth.schema';
import { useVerifyOtp, useResendOtp } from '@/features/auth/hooks/useVerifyOtp';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { Spinner } from '@/components/ui/Spinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

export function VerifyOtpPage() {
  const location = useLocation();
  const prefillEmail = (location.state as { email?: string } | null)?.email ?? '';

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<VerifyOtpValues>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { email: prefillEmail, code: '' },
  });

  const verify = useVerifyOtp();
  const resend = useResendOtp();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verify your email</CardTitle>
        <CardDescription>Enter the 6-digit code we sent to your inbox.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit((v) => verify.mutate({ ...v, type: 'EMAIL_VERIFICATION' }))}
          className="space-y-4"
          noValidate
        >
          <FormField label="Email" htmlFor="email" error={errors.email?.message}>
            <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
          </FormField>
          <FormField label="Verification code" htmlFor="code" error={errors.code?.message}>
            <Input id="code" inputMode="numeric" maxLength={6} placeholder="123456" {...register('code')} />
          </FormField>

          <Button type="submit" className="w-full" disabled={verify.isPending}>
            {verify.isPending && <Spinner />} Verify email
          </Button>
        </form>

        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Didn’t get the code?</span>
          <Button
            variant="ghost"
            size="sm"
            disabled={resend.isPending}
            onClick={() => resend.mutate({ email: getValues('email'), type: 'EMAIL_VERIFICATION' })}
          >
            {resend.isPending ? 'Sending…' : 'Resend code'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
