import { VendorOnboardingSchema } from './validation/vendorOnboarding.schema';

export const submitOnboarding = async ({ app, context }: any) => {
  const payload = {
    name: context.name || 'WhatsApp Vendor',
    country: context.country || 'KE',
    isolation_level: context.isolation_level,
    capabilities: context.capabilities,
    mpesa: context.mpesa,
    db:
      context.isolation_level === 'dedicated'
        ? { db_name: `${context.name.toLowerCase().replace(/\s+/g, '_')}_db` }
        : undefined
  };

  const parsed = VendorOnboardingSchema.safeParse(payload);

  if (!parsed.success) {
    return {
      reply: `Missing information: ${parsed.error.issues
        .map(i => i.path.join('.'))
        .join(', ')}`,
      nextState: 'chooseIsolation'
    };
  }

  await app.service('internal/vendors/onboard').create(parsed.data, {
    internal: true
  });

  return {
    reply: '✅ Vendor onboarded successfully!',
    nextState: 'completed'
  };
};
