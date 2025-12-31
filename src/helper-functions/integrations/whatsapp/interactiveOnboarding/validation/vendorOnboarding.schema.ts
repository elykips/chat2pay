import { z } from 'zod';

export const CapabilitiesSchema = z
  .array(z.string().min(1))
  .nonempty('At least one capability is required');

export const MpesaSchema = z.object({
  business_shortcode: z.string().min(3),
  passkey_secret_ref: z.string().startsWith('plain:')
});

export const VendorOnboardingSchema = z.object({
  name: z.string().min(2),
  country: z.string().length(2).transform(v => v.toUpperCase()),
  isolation_level: z.enum(['shared', 'dedicated']),

  capabilities: CapabilitiesSchema,

  mpesa: MpesaSchema,

  db: z
    .object({
      db_name: z.string().min(3)
    })
    .optional()
})
.superRefine((data, ctx) => {
  if (data.isolation_level === 'dedicated' && !data.db?.db_name) {
    ctx.addIssue({
      path: ['db', 'db_name'],
      message: 'db.db_name is required for dedicated vendors',
      code: z.ZodIssueCode.custom
    });
  }

  if (data.isolation_level === 'shared' && data.db) {
    ctx.addIssue({
      path: ['db'],
      message: 'db must not be provided for shared vendors',
      code: z.ZodIssueCode.custom
    });
  }
});

export type VendorOnboardingPayload =
  z.infer<typeof VendorOnboardingSchema>;
