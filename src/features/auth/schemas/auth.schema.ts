import * as z from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  recaptchaToken: z.string().min(1, 'Security check failed'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long').regex(/[a-zA-Z0-9]/, 'Password must contain alphanumeric characters'),
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  recaptchaToken: z.string().min(1, 'Security check failed'),
});

export type SignupInput = z.infer<typeof signupSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  recaptchaToken: z.string().min(1, 'Security check failed'),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })
  .and(z.object({ recaptchaToken: z.string().min(1, 'Security check failed').optional() }));

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
