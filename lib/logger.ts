export const logger = {
  info(message: string, extra?: Record<string, unknown>) {
    console.info(message, extra ?? '')
  },
  warn(message: string, extra?: Record<string, unknown>) {
    console.warn(message, extra ?? '')
  },
  error(message: string, extra?: Record<string, unknown>) {
    console.error(message, extra ?? '')
  },
}
