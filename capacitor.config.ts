import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.moniyo.app',
  appName: 'Moniyo',
  webDir: 'dist',
  server: {
    // Use HTTPS scheme for both platforms to ensure compatibility with Firebase/Google APIs
    // This avoids CORS issues with Firestore and other Google services
    androidScheme: 'https',
    iosScheme: 'https',
    hostname: 'localhost',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#050505',
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK', // Light text on dark background
      backgroundColor: '#050505',
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#E2FF00',
    },
  },
  ios: {
    // Enable WebView Inspector for debugging
    webContentsDebuggingEnabled: true,
    // Prefer fullscreen and hide status bar during splash
    preferredContentMode: 'mobile',
  },
  android: {
    // Enable WebView debugging
    webContentsDebuggingEnabled: true,
    // Background color matching app theme
    backgroundColor: '#050505',
  },
};

export default config;
