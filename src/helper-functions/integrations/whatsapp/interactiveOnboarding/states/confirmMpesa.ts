export const confirmMpesa = async ({ context }) => ({
  reply: `We will use Safaricom shortcode 174379.
Reply YES to confirm.`,
  nextState: 'submitOnboarding',
  contextPatch: {
    mpesa: {
      business_shortcode: '174379',
      passkey_secret_ref: 'plain:bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919'
    }
  }
});
