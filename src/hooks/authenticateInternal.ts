import { Forbidden } from '@feathersjs/errors'
import { HookContext } from '@feathersjs/feathers'

export const authenticateInternal = async (context: HookContext) => {
  const apiKey = context.params?.headers?.['x-internal-key']

  if (!apiKey || apiKey !== process.env.INTERNAL_API_KEY) {
    throw new Forbidden('Unauthorized')
  }

  return context
}
