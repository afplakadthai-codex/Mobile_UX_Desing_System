import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Bettavaro',
  slug: 'bettavaro-mobile',
  scheme: 'bettavaro',
  version: '0.1.0',
  orientation: 'portrait',
  userInterfaceStyle: 'light',
  splash: {
    resizeMode: 'contain',
    backgroundColor: '#06251D'
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.bettavaro.mobile'
  },
  android: {
    package: 'com.bettavaro.mobile'
  },
  web: {
    bundler: 'metro'
  },
 plugins: [
  'expo-secure-store',
],
  extra: {
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://bettavaro.com/api/mobile/v1'
  }
};

export default config;
