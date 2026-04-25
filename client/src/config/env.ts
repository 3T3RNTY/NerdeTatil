import { Platform } from 'react-native';

type EnvMap = Record<string, string | undefined>

const runtimeEnv: EnvMap =
  (globalThis as { process?: { env?: EnvMap } }).process?.env ?? {}

const appName = runtimeEnv.EXPO_PUBLIC_APP_NAME ?? 'NerdeTatil'

// Determine API base URL based on platform and environment variables
const getApiBaseUrl = (): string => {
  // If explicitly set via environment variable, use that (RECOMMENDED for physical devices)
  if (runtimeEnv.EXPO_PUBLIC_API_BASE_URL) {
    return runtimeEnv.EXPO_PUBLIC_API_BASE_URL;
  }

  // For different platforms, use appropriate API URL
  if (Platform.OS === 'android') {
    // For physical device: use environment variable EXPO_PUBLIC_API_BASE_URL
    // For emulator: use 10.0.2.2 to reach the host machine
    return 'http://10.0.2.2:5000/api';
  } else if (Platform.OS === 'ios') {
    // For physical device: use environment variable EXPO_PUBLIC_API_BASE_URL
    // For simulator: localhost works
    return 'http://localhost:5000/api';
  } else {
    // Web or other platforms: use localhost
    return 'http://localhost:5000/api';
  }
};

const apiBaseUrl = getApiBaseUrl();
const mockEnabled = (runtimeEnv.EXPO_PUBLIC_ENABLE_MOCK ?? 'false') === 'true'

export const env = {
  appName,
  apiBaseUrl,
  mockEnabled,
} as const

export const appConfig = {
  appName,
  apiBaseUrl,
  mockEnabled,
}
