import type { StateHandler } from '../types'

export const start: StateHandler = async () => {
  return {
    reply: {
      type: 'interactive',
      interactive: {
        type: 'button',
        body: {
          text: `👋 Welcome!\n\nWhat would you like to do?`
        },
        action: {
          buttons: [
            {
              type: 'reply',
              reply: {
                id: 'MENU',
                title: '📋 View Menu'
              }
            },
            {
              type: 'reply',
              reply: {
                id: 'HELP',
                title: '❓ Help'
              }
            }
          ]
        }
      }
    },
    nextState: 'showMenu'
  }
}
