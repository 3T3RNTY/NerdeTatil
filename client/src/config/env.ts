type EnvMap = Record<string, string | undefined>

const runtimeEnv: EnvMap =
  (globalThis as { process?: { env?: EnvMap } }).process?.env ?? {}

const appName = runtimeEnv.EXPO_PUBLIC_APP_NAME ?? 'NerdeTatil'
const apiBaseUrl = runtimeEnv.EXPO_PUBLIC_API_BASE_URL ?? 'https://api.ornek.com'
const mockEnabled = (runtimeEnv.EXPO_PUBLIC_ENABLE_MOCK ?? 'true') === 'true'

export const env = {
  appName,
  apiBaseUrl,
  mockEnabled,
} as const
