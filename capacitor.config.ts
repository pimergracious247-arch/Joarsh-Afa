import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.biblequest.dailyverse',
  appName: 'Bible Quest Daily verse and Quiz',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    AdMob: {
      appId: 'ca-app-pub-7897492892059206~7970405530',
    },
  },
};

export default config;
