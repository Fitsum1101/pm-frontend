import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { zodResolver } from '@/lib/utils/zodResolver';
import { signInSchema, type SignInValues } from '@/features/auth/schemas/auth.schema';
import { useLogin } from '@/features/auth/hooks/useLogin';
import { PATHS } from '@/app/routes/paths';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { Spinner } from '@/components/ui/Spinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

export function SignInPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInValues>({ resolver: zodResolver(signInSchema) });
  const login = useLogin();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Sign in to your account to continue.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit((v) => login.mutate(v))} className="space-y-4" noValidate>
          <FormField label="Email" htmlFor="email" error={errors.email?.message}>
            <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" {...register('email')} />
          </FormField>
          <FormField label="Password" htmlFor="password" error={errors.password?.message}>
            <Input id="password" type="password" autoComplete="current-password" placeholder="••••••••" {...register('password')} />
          </FormField>

          <div className="text-right">
            <Link to={PATHS.auth.forgotPassword} className="text-sm font-medium text-primary hover:underline">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="w-full" disabled={login.isPending}>
            {login.isPending && <Spinner />} Sign in
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          No account?{' '}
          <Link to={PATHS.auth.signUp} className="font-medium text-primary hover:underline">
            Create one
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
