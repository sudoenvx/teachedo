import { z } from 'zod'

const optionalEmail = z
  .string()
  .trim()
  .email('Enter a valid email address')
  .or(z.literal(''))
  .optional()

const optionalNumber = z.preprocess(
  (value) => (value === '' || (typeof value === 'number' && Number.isNaN(value)) ? undefined : value),
  z.number().finite().min(0, 'The price cannot be negative').optional(),
)

export const createTeacherSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Full name must be at least 2 characters'),
    username: z.string().trim().min(3, 'Username must be at least 3 characters'),
    email: optionalEmail,
    phoneNumber: z.string().trim().min(7, 'Enter the primary phone number'),
    subjectSpecialization: z.string().trim().optional(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Confirm the password'),
    accountStatus: z.enum(['active', 'suspended_payment', 'inactive', 'trial']).default('active'),
    pricingMode: z.enum(['default', 'custom']).default('default'),
    pricePerStudent: optionalNumber,
    customSubdomain: z
      .string()
      .trim()
      .toLowerCase()
      .regex(/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/, 'Use letters, numbers, and hyphens only')
      .optional()
      .or(z.literal('')),
    profileImage: z.any().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => data.pricingMode !== 'custom' || data.pricePerStudent !== undefined, {
    message: 'Enter a custom price per student',
    path: ['pricePerStudent'],
  })

export type CreateTeacherFormValues = z.input<typeof createTeacherSchema>
