const DEBUG = process.env.NODE_ENV === 'development'

export const debugLog = (
  component: string, 
  action: string, 
  data?: unknown
) => {
  if (DEBUG) {
    console.log(`[${component}] ${action}`, data || '')
  }
}