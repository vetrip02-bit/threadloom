import { z } from 'zod'
import { BRANDING_METHODS, CUSTOMER_TYPES } from '@/data/catalog'

/** Strips control characters and collapses runs of whitespace. */
export function sanitize(value: string): string {
  return value
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, ' ')
    .trim()
}

const cleanString = (min: number, max: number, label: string) =>
  z
    .string({ required_error: label + ' is required.' })
    .transform(sanitize)
    .pipe(
      z
        .string()
        .min(
          min,
          min === 1
            ? label + ' is required.'
            : label + ' must be at least ' + min + ' characters.',
        )
        .max(max, label + ' must be ' + max + ' characters or fewer.'),
    )

const optionalString = (max: number) =>
  z
    .string()
    .optional()
    .transform((v) => (v ? sanitize(v) : ''))
    .pipe(z.string().max(max, 'Must be ' + max + ' characters or fewer.'))

/**
 * Free e-mail domains are allowed — plenty of small Indian businesses run on
 * them — but the field is still labelled "business email" in the UI.
 */
export const emailSchema = z
  .string({ required_error: 'Email is required.' })
  .transform((v) => sanitize(v).toLowerCase())
  .pipe(
    z
      .string()
      .min(5, 'Enter a valid email address.')
      .max(254, 'Email address is too long.')
      .email('Enter a valid email address.'),
  )

/** Accepts common Indian and international formats; stores the cleaned value. */
export const phoneSchema = z
  .string({ required_error: 'Phone number is required.' })
  .transform((v) => sanitize(v).replace(/[^\d+]/g, ''))
  .pipe(
    z
      .string()
      .min(8, 'Enter a valid phone number.')
      .max(16, 'Enter a valid phone number.')
      .regex(/^\+?\d{8,15}$/, 'Enter a valid phone number.'),
  )

export const customerTypeSchema = z.enum(CUSTOMER_TYPES, {
  errorMap: () => ({ message: 'Select a customer type.' }),
})

export const brandingMethodSchema = z.enum(BRANDING_METHODS, {
  errorMap: () => ({ message: 'Select a branding method.' }),
})

export const quoteItemSchema = z.object({
  productId: cleanString(1, 64, 'Product'),
  productName: cleanString(1, 120, 'Product name'),
  category: cleanString(1, 64, 'Category'),
  quantity: z.coerce
    .number({ invalid_type_error: 'Enter a quantity.' })
    .int('Enter a whole number.')
    .min(1, 'Quantity must be at least 1.')
    .max(1000000, 'Contact us directly for quantities above 1,000,000.'),
  color: optionalString(60),
  sizes: optionalString(200),
  brandingMethod: brandingMethodSchema,
  notes: optionalString(500),
})
export type QuoteItemInput = z.infer<typeof quoteItemSchema>

export const quoteRequestSchema = z.object({
  firstName: cleanString(1, 60, 'First name'),
  lastName: cleanString(1, 60, 'Last name'),
  organization: cleanString(2, 120, 'Organization'),
  email: emailSchema,
  phone: phoneSchema,
  city: cleanString(2, 80, 'City'),
  /** Routes the enquiry to the right sales desk. */
  customerType: customerTypeSchema,
  requirements: cleanString(10, 2000, 'Requirements'),
  estimatedQuantity: z.coerce
    .number({ invalid_type_error: 'Enter an estimated quantity.' })
    .int('Enter a whole number.')
    .min(1, 'Estimated quantity must be at least 1.')
    .max(1000000, 'Contact us directly for quantities above 1,000,000.'),
  expectedDate: z
    .string()
    .optional()
    .transform((v) => (v ? sanitize(v) : ''))
    .pipe(
      z
        .string()
        .max(10)
        .regex(/^(\d{4}-\d{2}-\d{2})?$/, 'Enter the date as YYYY-MM-DD.'),
    ),
  consent: z.literal(true, {
    errorMap: () => ({
      message: 'Please confirm you agree to be contacted about this enquiry.',
    }),
  }),
  items: z
    .array(quoteItemSchema)
    .max(50, 'Remove some items — 50 is the maximum per enquiry.'),
  /** Where the enquiry came from; used only to label the CRM record. */
  source: z.enum(['quote', 'contact', 'customization']).default('quote'),
  /**
   * Honeypot. Deliberately permissive: a bot that fills it in must receive a
   * normal success response, not a validation error naming the field. The
   * route checks the value and silently discards the submission.
   */
  company_website: z.string().max(200).optional(),
})
export type QuoteRequestInput = z.infer<typeof quoteRequestSchema>

/** Flattens a ZodError into `{ fieldName: 'first message' }` for the UI. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path.join('.') || 'form'
    if (!out[key]) out[key] = issue.message
  }
  return out
}
