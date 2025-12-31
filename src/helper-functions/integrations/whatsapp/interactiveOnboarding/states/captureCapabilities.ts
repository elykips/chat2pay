export const captureCapabilities = async ({ message, context }) => {
  const id = message?.interactive?.list_reply?.id;

  if (!id) {
    return { reply: 'Please select at least one capability.', nextState: 'chooseCapabilities' };
  }

  const map = {
    CAP_orders: 'commerce.orders',
    CAP_payments: 'payments.core',
    CAP_mpesa: 'payments.mpesa_stk'
  };

  const nextCaps = new Set(context.capabilities || []);
  nextCaps.add(map[id as keyof typeof map]);

  return {
    reply: {
      type: 'interactive',
      interactive: {
        type: 'button',
        body: { text: 'Add more capabilities or continue?' },
        action: {
          buttons: [
            { type: 'reply', reply: { id: 'CAP_MORE', title: 'Add More' } },
            { type: 'reply', reply: { id: 'CAP_DONE', title: 'Continue' } }
          ]
        }
      }
    },
    nextState: 'confirmCapabilities',
    contextPatch: { capabilities: [...nextCaps] }
  };
};
