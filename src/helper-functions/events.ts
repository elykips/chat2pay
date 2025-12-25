export async function emitEvent(event: string, payload: any) {
  console.log(`📣 EVENT: ${event}`, payload)
}
