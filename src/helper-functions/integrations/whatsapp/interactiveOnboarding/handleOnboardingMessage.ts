import { onboardingStates } from ".";

export async function handleOnboardingMessage({
  app,
  session,
  message,
  phone
}: any) {
  const { state, payload } = session;

  const result = await onboardingStates[state]({
    message,
    payload
  });

  // Persist progress
  await app.service('onboarding-sessions').upsertByPhone(session.id, {
    state: result.nextState,
    payload: result.payloadPatch
  });

  // 🎯 If ready → call onboarding API
  if (result.ready) {
    await app.service('vendors').create(result.vendorPayload);

    await app.service('onboarding-sessions').upsertByPhone(session.id, {
      state: 'completed'
    });

    return {
      reply: '✅ Vendor onboarded successfully!'
    };
  }

  return {
    reply: result.reply
  };
}
