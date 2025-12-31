import { onboardingStates } from './index';

export async function runOnboardingState({
  state,
  payload,
  message,
  phone,
}: any) {
  const handler = onboardingStates[state];

  if (!handler) {
    throw new Error(`Invalid onboarding state: ${state}`);
  }

  return handler({ payload, message, phone });
}
