import type { StateHandler } from '../types';

export const collectCountry: StateHandler = async ({ message }) => {
  const text = String(message?.text || '').trim().toUpperCase();

  if (text.length === 2) {
    return {
      nextState: 'confirm',
      payloadPatch: { country: text },
      reply: 'Country saved 🇰🇪'
    };
  }

  return {
    reply: 'Please reply with your 2-letter country code (e.g. KE, GB)',
    nextState: 'collectCountry'
  };
};
