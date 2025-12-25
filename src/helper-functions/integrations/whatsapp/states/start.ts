import type { StateHandler } from '../types'

export const start: StateHandler = async () => {
  return {
    reply: `Hi 👋 Welcome! Reply MENU to see items, or HELP for support.`,
    nextState: 'showMenu'
  }
}
