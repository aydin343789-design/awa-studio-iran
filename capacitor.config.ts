import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.awa.iran',
  appName: 'آوای ایران آزاد',
  webDir: 'dist',
  bundledWebRuntime: false,
  android: { allowMixedContent: true },
};

export default config;
