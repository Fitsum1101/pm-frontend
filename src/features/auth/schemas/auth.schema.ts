import { z } from 'zod';

// Mirrors auth-service Joi validation (email, password min 8, full_name 2–100).
export const signInSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export const signUpSchema = z.object({
  full_name: z.string().min(2, 'Name is too short').max(100, 'Name is too long'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const verifyOtpSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6, 'Code must be 6 digits'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Enter a valid email'),
});

// Mirrors auth-service resetPasswordSchema: email + 6-digit code + new password.
export const resetPasswordSchema = z.object({
  email: z.string().email('Enter a valid email'),
  code: z.string().length(6, 'Code must be 6 digits'),
  new_password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type SignInValues = z.infer<typeof signInSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
export type VerifyOtpValues = z.infer<typeof verifyOtpSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
