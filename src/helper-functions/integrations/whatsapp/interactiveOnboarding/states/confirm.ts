import type { StateHandler } from '../types';

export const confirm: StateHandler = async ({ payload }) => {
  return {
    reply: {
      type: 'interactive',
      interactive: {
        type: 'button',
        body: {
          text:
`Please confirm:
Mode: ${payload.mode}
Country: ${payload.country}
Capabilities: ${payload.capabilities?.join(', ')}`},
        action: {
          buttons: [
            { type: 'reply', reply: { id: 'CONFIRM', title: 'Confirm & Create' } }
          ]
        }
      }
    },
    nextState: 'completed',
    ready: true,
    vendorPayload: {
      name: 'Vendor from WhatsApp',
      country: payload.country,
      isolation_level: payload.mode,
      capabilities: payload.capabilities,
      mpesa: {
        business_shortcode: '174379',
        passkey_secret_ref: 'plain:bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919'
      },
      ...(payload.mode === 'dedicated'
        ? { db: { db_name: 'vendor_db' } }
        : {})
    }
  };
};
