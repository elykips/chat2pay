export const chooseIsolation = async () => ({
  reply: {
    type: 'interactive',
    interactive: {
      type: 'button',
      body: {
        text: 'How would you like your data hosted?'
      },
      action: {
        buttons: [
          { type: 'reply', reply: { id: 'ISO_SHARED', title: 'Shared (SME)' } },
          { type: 'reply', reply: { id: 'ISO_DEDICATED', title: 'Dedicated (Enterprise)' } }
        ]
      }
    }
  },
  nextState: 'captureIsolation'
});
