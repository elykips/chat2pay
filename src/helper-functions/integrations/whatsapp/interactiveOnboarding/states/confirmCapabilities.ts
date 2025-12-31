export const confirmCapabilities = async ({ message, context }) => {
  const id = message?.interactive?.button_reply?.id;

  if (id === 'CAP_MORE') {
    return { nextState: 'chooseCapabilities' };
  }

  return {
    reply: 'Please confirm your M-Pesa shortcode.',
    nextState: 'confirmMpesa'
  };
};
