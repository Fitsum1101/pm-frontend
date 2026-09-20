import type { RouteObject } from 'react-router-dom';
import { AuthLayout } from '@/app/layouts/AuthLayout';
import { PublicOnlyRoute } from '@/app/guards/PublicOnlyRoute';
import { SignInPage } from '@/pages/auth/SignInPage';
import { SignUpPage } from '@/pages/auth/SignUpPage';
import { VerifyOtpPage } from '@/pages/auth/VerifyOtpPage';
import { LoginTwoFactorPage } from '@/pages/auth/LoginTwoFactorPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';

// /auth/* — sign-in / sign-up / verify-otp, kept behind PublicOnlyRoute so
// logged-in users are redirected to the dashboard.
export const authRoutes: RouteObject = {
  path: 'auth',
  element: (
    <PublicOnlyRoute>
      <AuthLayout />
    </PublicOnlyRoute>
  ),
  children: [
    { path: 'sign-in', element: <SignInPage /> },
    { path: 'sign-up', element: <SignUpPage /> },
    { path: 'verify-otp', element: <VerifyOtpPage /> },
    { path: 'two-factor', element: <LoginTwoFactorPage /> },
    { path: 'forgot-password', element: <ForgotPasswordPage /> },
    { path: 'reset-password', element: <ResetPasswordPage /> },
  ],
};
