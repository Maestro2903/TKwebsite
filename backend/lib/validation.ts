import { z } from 'zod';

/**
 * Zod schemas for input validation
 */

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, 'Phone number must be 10 digits and start with 6-9');

export const nameSchema = z
  .string()
  .trim()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must be less than 50 characters')
  .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces');

export const collegeSchema = z
  .string()
  .trim()
  .min(2, 'College name must be at least 2 characters')
  .max(100, 'College name must be less than 100 characters')
  .refine(
    (val) => !/<|>|script|javascript|on\w+=/i.test(val),
    'College name contains invalid characters'
  );

export const userProfileSchema = z.object({
  name: nameSchema,
  college: collegeSchema,
  phone: phoneSchema,
});

export const paymentInitiationSchema = z.object({
  userId: z.string().min(1),
  amount: z.number().positive(),
  passType: z.string().min(1),
  teamData: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
  }).optional(),
  teamId: z.string().optional(),
  teamMemberCount: z.number().int().positive().optional(),
});

/**
 * Legacy API maintained for backward compatibility where needed, 
 * but now powered by Zod internally.
 */

export function validatePhone(phone: string) {
  const result = phoneSchema.safeParse(phone);
  return result.success
    ? { valid: true }
    : { valid: false, error: result.error.errors[0].message };
}

export function validateName(name: string) {
  const result = nameSchema.safeParse(name);
  return result.success
    ? { valid: true }
    : { valid: false, error: result.error.errors[0].message };
}

export function validateCollege(college: string) {
  const result = collegeSchema.safeParse(college);
  return result.success
    ? { valid: true }
    : { valid: false, error: result.error.errors[0].message };
}

export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return '';

  return input
    .trim()
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '');
}

export function validateProfileInput(data: any) {
  const result = userProfileSchema.safeParse(data);
  if (result.success) {
    return { valid: true, errors: {} };
  }

  const errors: Record<string, string> = {};
  result.error.errors.forEach((err) => {
    if (err.path[0]) {
      errors[err.path[0].toString()] = err.message;
    }
  });

  return { valid: false, errors };
}
