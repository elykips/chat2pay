import { Application } from '@feathersjs/koa';
import { VendorOnboardingSchema } from '../../helper-functions/integrations/whatsapp/interactiveOnboarding/validation/vendorOnboarding.schema';

export async function advanceOnboarding(app: Application, session: any) {
  const candidatePayload = session.payload;

  // 🚦 Validation gate
  const parsed = VendorOnboardingSchema.safeParse(candidatePayload);

  if (!parsed.success) {
    return {
      status: 'invalid',
      errors: parsed.error.flatten()
    };
  }

  // ✅ Guaranteed safe here
  await app.service('internal/vendors/onboard').create(parsed.data, {
    internal: true
  });

  return { status: 'provisioned' };
}
