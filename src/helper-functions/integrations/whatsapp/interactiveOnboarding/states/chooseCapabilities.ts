// import type { StateHandler } from '../types';

// const CAPABILITIES = [
//   { id: 'commerce.orders', title: 'Orders' },
//   { id: 'payments.core', title: 'Payments' },
//   { id: 'payments.mpesa_stk', title: 'M-Pesa STK' }
// ];

// export const chooseCapabilities: StateHandler = async ({ message, payload }) => {
//   const selected = message?.interactive?.list_reply?.id;

//   if (selected) {
//     const caps = new Set(payload.capabilities || []);
//     caps.add(selected);

//     return {
//       nextState: 'collectCountry',
//       payloadPatch: { capabilities: Array.from(caps) },
//       reply: 'Capabilities selected ✅'
//     };
//   }

//   return {
//     reply: {
//       type: 'interactive',
//       interactive: {
//         type: 'list',
//         body: { text: 'Select a capability to enable:' },
//         action: {
//           button: 'Choose',
//           sections: [
//             {
//               title: 'Capabilities',
//               rows: CAPABILITIES.map(c => ({
//                 id: c.id,
//                 title: c.title
//               }))
//             }
//           ]
//         }
//       }
//     },
//     nextState: 'chooseCapabilities'
//   };
// };


import type { StateHandler } from '../types'

const ALL_CAPABILITIES = [
  { id: 'commerce.orders', label: 'Orders' },
  { id: 'payments.core', label: 'Payments Core' },
  { id: 'payments.mpesa_stk', label: 'M-PESA STK Push' }
]

export const chooseCapabilities: StateHandler = async ({ message, payload }) => {
  const selected = payload.capabilities ?? []

  const clicked =
    message?.interactive?.button_reply?.id ||
    message?.interactive?.list_reply?.id ||
    message?.text?.trim()

  // DONE
  if (clicked === 'DONE') {
    if (selected.length === 0) {
      return {
        reply: 'Please select at least one capability.',
        nextState: 'chooseCapabilities'
      }
    }

    return {
      reply: `✅ Capabilities saved.`,
      nextState: 'collectCountry',
      payloadPatch: {}
    }
  }

  // Add capability if valid
  const cap = ALL_CAPABILITIES.find(c => c.id === clicked)
  if (cap && !selected.includes(cap.id)) {
    selected.push(cap.id)
  }

  return {
    reply: {
      type: 'interactive',
      interactive: {
        type: 'button',
        body: {
          text:
            `Select capabilities:\n\n` +
            selected.map(c => `✅ ${c}`).join('\n')
        },
        action: {
          buttons: [
            ...ALL_CAPABILITIES
              .filter(c => !selected.includes(c.id))
              .slice(0, 2) // WhatsApp limit
              .map(c => ({
                type: 'reply',
                reply: { id: c.id, title: c.label }
              })),
            {
              type: 'reply',
              reply: { id: 'DONE', title: 'Done' }
            }
          ]
        }
      }
    },
    nextState: 'chooseCapabilities',
    payloadPatch: { capabilities: selected }
  }
}
