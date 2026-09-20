import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { zodResolver } from '@/lib/utils/zodResolver';
import { signUpSchema, type SignUpValues } from '@/features/auth/schemas/auth.schema';
import { useRegister } from '@/features/auth/hooks/useRegister';
import { PATHS } from '@/app/routes/paths';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { Spinner } from '@/components/ui/Spinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

export function SignUpPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpValues>({ resolver: zodResolver(signUpSchema) });
  const registerMutation = useRegister();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>The first account ever created becomes the super admin.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit((v) => registerMutation.mutate(v))}
          className="space-y-4"
          noValidate
        >
          <FormField label="Full name" htmlFor="full_name" error={errors.full_name?.message}>
            <Input id="full_name" autoComplete="name" placeholder="Jane Doe" {...register('full_name')} />
          </FormField>
          <FormField label="Email" htmlFor="email" error={errors.email?.message}>
            <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" {...register('email')} />
          </FormField>
          <FormField label="Password" htmlFor="password" error={errors.password?.message}>
            <Input id="password" type="password" autoComplete="new-password" placeholder="At least 8 characters" {...register('password')} />
          </FormField>

          <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
            {registerMutation.isPending && <Spinner />} Create account
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to={PATHS.auth.signIn} className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
