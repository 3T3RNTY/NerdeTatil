import { Platform } from 'react-native';

/**
 * Cross-platform storage utility that uses:
 * - localStorage on web
 * - AsyncStorage on native (iOS/Android)
 * - Memory storage as fallback
 */

const isWeb = Platform.OS === 'web';

// Only load AsyncStorage on non-web platforms to avoid native module errors
let AsyncStorage: any = null;
let hasAsyncStorage = false;

if (!isWeb) {
  try {
    AsyncStorage = require('@react-native-async-storage/async-storage').default;
    hasAsyncStorage = true;
  } catch (error) {
    // AsyncStorage failed to load, will use fallback
  }
}

// Fallback memory storage for when nothing else is available
const memoryStore: Record<string, string> = {};

class StorageUtil {
  async getItem(key: string): Promise<string | null> {
    try {
      if (isWeb && typeof localStorage !== 'undefined') {
        return localStorage.getItem(key);
      }
      if (hasAsyncStorage && AsyncStorage) {
        return await AsyncStorage.getItem(key);
      }
    } catch (error) {
      // Silently fail and use memory fallback
    }
    return memoryStore[key] || null;
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (isWeb && typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
        return;
      }
      if (hasAsyncStorage && AsyncStorage) {
        await AsyncStorage.setItem(key, value);
        return;
      }
    } catch (error) {
      // Silently fail and use memory fallback
    }
    memoryStore[key] = value;
  }

  async removeItem(key: string): Promise<void> {
    try {
      if (isWeb && typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
      } else if (hasAsyncStorage && AsyncStorage) {
        await AsyncStorage.removeItem(key);
      }
    } catch (error) {
      // Silently fail
    }
    delete memoryStore[key];
  }

  async clear(): Promise<void> {
    try {
      if (isWeb && typeof localStorage !== 'undefined') {
        localStorage.clear();
      } else if (hasAsyncStorage && AsyncStorage) {
        await AsyncStorage.clear();
      }
    } catch (error) {
      // Silently fail
    }
    Object.keys(memoryStore).forEach((key) => {
      delete memoryStore[key];
    });
  }
}

export const storage = new StorageUtil();
