import type { StateHandler } from '../types';

export const start: StateHandler = async () => {
  return {
    reply: {
      type: 'interactive',
      interactive: {
        type: 'button',
        body: { text: 'Welcome 👋\nLet’s onboard your business.' },
        action: {
          buttons: [
            { type: 'reply', reply: { id: 'START', title: 'Start onboarding' } }
          ]
        }
      }
    },
    nextState: 'chooseMode'
  };
};
