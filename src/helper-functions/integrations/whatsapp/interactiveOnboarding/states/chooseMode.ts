import type { StateHandler } from '../types';

export const chooseMode: StateHandler = async ({ message }) => {
  const id = message?.interactive?.button_reply?.id ||
    message?.text?.trim()?.toUpperCase()

  if (id === 'SHARED' || id === 'DEDICATED') {
    return {
      nextState: 'chooseCapabilities',
      payloadPatch: {
        mode: id === 'SHARED' ? 'shared' : 'dedicated'
      },
      reply: 'Great choice 👍'
    };
  }

  return {
    reply: {
      type: 'interactive',
      interactive: {
        type: 'button',
        body: { text: 'How do you want to host your data?' },
        action: {
          buttons: [
            { type: 'reply', reply: { id: 'SHARED', title: 'Shared (SME)' } },
            { type: 'reply', reply: { id: 'DEDICATED', title: 'Dedicated (Enterprise)' } }
          ]
        }
      }
    },
    nextState: 'chooseMode'
  };
};
