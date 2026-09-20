import { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { FormField } from '@/components/ui/FormField';
import { Spinner } from '@/components/ui/Spinner';
import { useTheme } from '@/providers/ThemeProvider';
import { useAuthStore } from '@/store/authStore';
import { useAuthLogout } from '@/hooks/useAuthLogout';
import {
  useTwoFactorStatus,
  useSetupTwoFactor,
  useVerifyTwoFactor,
  useDisableTwoFactor,
} from '@/features/auth/hooks/useTwoFactor';
import type { TwoFactorSetup } from '@/features/auth/api/authService';

// Google Authenticator (TOTP): Enable → scan QR / enter code → confirm.
function TwoFactorCard() {
  const status = useTwoFactorStatus();
  const setup = useSetupTwoFactor();
  const verify = useVerifyTwoFactor();
  const disable = useDisableTwoFactor();

  const [setupData, setSetupData] = useState<TwoFactorSetup | null>(null);
  const [code, setCode] = useState('');
  const [disabling, setDisabling] = useState(false);
  const [password, setPassword] = useState('');

  const enabled = status.data?.two_factor_enabled;

  const startSetup = () =>
    setup.mutate(undefined, { onSuccess: (data) => setSetupData(data) });

  const confirmEnable = () =>
    verify.mutate(code, {
      onSuccess: () => {
        setSetupData(null);
        setCode('');
      },
    });

  const confirmDisable = () =>
    disable.mutate(
      { password: password || undefined },
      {
        onSuccess: () => {
          setDisabling(false);
          setPassword('');
        },
      },
    );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Two-factor authentication
          {enabled && <Badge variant="success">Enabled</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Protect your account with a code from Google Authenticator at sign-in.
        </p>

        {status.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner /> Loading…
          </div>
        ) : enabled ? (
          // ─── Enabled → allow disabling (password or code) ───────────────────
          disabling ? (
            <div className="space-y-3">
              <FormField label="Current password" htmlFor="tfa-pass">
                <Input
                  id="tfa-pass"
                  type="password"
                  placeholder="Enter your password to confirm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </FormField>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  onClick={confirmDisable}
                  disabled={disable.isPending || !password}
                >
                  {disable.isPending && <Spinner />} Disable 2FA
                </Button>
                <Button variant="ghost" onClick={() => setDisabling(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="outline" onClick={() => setDisabling(true)}>
              Disable 2FA
            </Button>
          )
        ) : setupData ? (
          // ─── Setup in progress → show QR + manual key + code input ──────────
          <div className="space-y-3">
            <p className="text-sm">Scan this QR code with Google Authenticator:</p>
            <img
              src={setupData.qr_code}
              alt="2FA QR code"
              className="h-44 w-44 rounded-md border border-border bg-white p-2"
            />
            <div className="text-sm">
              <span className="text-muted-foreground">Or enter this key manually: </span>
              <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs text-foreground">
                {setupData.manual_key}
              </code>
            </div>
            <FormField label="Enter the 6-digit code" htmlFor="tfa-code">
              <Input
                id="tfa-code"
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              />
            </FormField>
            <div className="flex gap-2">
              <Button onClick={confirmEnable} disabled={verify.isPending || code.length !== 6}>
                {verify.isPending && <Spinner />} Verify &amp; enable
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setSetupData(null);
                  setCode('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="outline" onClick={startSetup} disabled={setup.isPending}>
            {setup.isPending && <Spinner />} Enable 2FA
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthLogout();

  return (
    <div className="max-w-2xl">
      <PageHeader title="Settings" description="Manage your preferences and session." />

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Theme</p>
              <p className="text-sm text-muted-foreground">Currently using {theme} mode.</p>
            </div>
            <Button variant="outline" onClick={toggleTheme}>
              Switch to {theme === 'dark' ? 'light' : 'dark'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Role</span>
              <span className="font-medium">{user?.role}</span>
            </div>
          </CardContent>
        </Card>

        <TwoFactorCard />

        <Card>
          <CardHeader>
            <CardTitle>Session</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={logout}>
              Log out of this device
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
