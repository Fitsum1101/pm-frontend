import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { zodResolver } from '@/lib/utils/zodResolver';
import {
  forgotPasswordSchema,
  type ForgotPasswordValues,
} from '@/features/auth/schemas/auth.schema';
import { useForgotPassword } from '@/features/auth/hooks/usePassword';
import { PATHS } from '@/app/routes/paths';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { Spinner } from '@/components/ui/Spinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

export function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({ resolver: zodResolver(forgotPasswordSchema) });
  const forgot = useForgotPassword();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Forgot password</CardTitle>
        <CardDescription>Enter your email and we'll send you a reset code.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit((v) => forgot.mutate(v))} className="space-y-4" noValidate>
          <FormField label="Email" htmlFor="email" error={errors.email?.message}>
            <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" {...register('email')} />
          </FormField>

          <Button type="submit" className="w-full" disabled={forgot.isPending}>
            {forgot.isPending && <Spinner />} Send reset code
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Remembered it?{' '}
          <Link to={PATHS.auth.signIn} className="font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
