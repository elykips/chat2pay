export const captureIsolation = async ({ message, context }) => {
  const id = message?.interactive?.button_reply?.id;

  if (!id) {
    return { reply: 'Please select one option.', nextState: 'chooseIsolation' };
  }

  const isolation_level =
    id === 'ISO_SHARED' ? 'shared' : 'dedicated';

  return {
    reply: 'Great. Now select the capabilities you need.',
    nextState: 'chooseCapabilities',
    contextPatch: { isolation_level }
  };
};
