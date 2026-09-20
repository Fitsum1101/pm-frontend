import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useLoginTwoFactor } from '@/features/auth/hooks/useLogin';
import { PATHS } from '@/app/routes/paths';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { Spinner } from '@/components/ui/Spinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

// Shown only when sign-in returned `requiresTwoFactor`. Exchanges the challenge
// token + authenticator code for a real session via the same login response.
export function LoginTwoFactorPage() {
  const location = useLocation();
  const state = location.state as
    | { tempToken?: string; message?: string; from?: string }
    | null;
  const tempToken = state?.tempToken;

  const [code, setCode] = useState('');
  const verify = useLoginTwoFactor(state?.from);

  // Reached directly without a challenge → back to sign-in.
  if (!tempToken) return <Navigate to={PATHS.auth.signIn} replace />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Two-factor authentication</CardTitle>
        <CardDescription>
          {state?.message || 'Enter the 6-digit code from your Google Authenticator app.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            verify.mutate({ tempToken, code });
          }}
          className="space-y-4"
          noValidate
        >
          <FormField label="Authentication code" htmlFor="code">
            <Input
              id="code"
              inputMode="numeric"
              autoFocus
              maxLength={6}
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            />
          </FormField>

          <Button type="submit" className="w-full" disabled={verify.isPending || code.length !== 6}>
            {verify.isPending && <Spinner />} Verify &amp; sign in
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
