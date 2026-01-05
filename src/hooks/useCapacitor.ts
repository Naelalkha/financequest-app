import { useCallback, useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { SplashScreen } from '@capacitor/splash-screen';

/**
 * Hook to detect if running in native Capacitor environment
 */
export function useIsNative(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Hook to get current platform
 */
export function usePlatform(): 'ios' | 'android' | 'web' {
  return Capacitor.getPlatform() as 'ios' | 'android' | 'web';
}

/**
 * Hook to initialize Capacitor plugins on app start
 */
export function useCapacitorInit() {
  const isNative = useIsNative();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!isNative) {
      setInitialized(true);
      return;
    }

    const init = async () => {
      try {
        // Configure status bar for dark theme
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#050505' });

        // Hide splash screen after app is ready
        await SplashScreen.hide();

        setInitialized(true);
      } catch (error) {
        console.error('Failed to initialize Capacitor plugins:', error);
        setInitialized(true);
      }
    };

    init();
  }, [isNative]);

  return initialized;
}

/**
 * Hook for haptic feedback
 * Uses native haptics on iOS/Android, falls back to vibration API on web
 */
export function useHaptics() {
  const isNative = useIsNative();

  const impact = useCallback(async (style: 'light' | 'medium' | 'heavy' = 'medium') => {
    if (isNative) {
      const impactStyle = {
        light: ImpactStyle.Light,
        medium: ImpactStyle.Medium,
        heavy: ImpactStyle.Heavy,
      }[style];
      await Haptics.impact({ style: impactStyle });
    } else if (navigator.vibrate) {
      // Fallback for web with vibration support
      const duration = { light: 10, medium: 25, heavy: 50 }[style];
      navigator.vibrate(duration);
    }
  }, [isNative]);

  const notification = useCallback(async (type: 'success' | 'warning' | 'error' = 'success') => {
    if (isNative) {
      const notificationType = {
        success: NotificationType.Success,
        warning: NotificationType.Warning,
        error: NotificationType.Error,
      }[type];
      await Haptics.notification({ type: notificationType });
    } else if (navigator.vibrate) {
      // Pattern feedback for web
      const patterns = {
        success: [30, 50, 30],
        warning: [50, 30, 50],
        error: [100, 50, 100],
      }[type];
      navigator.vibrate(patterns);
    }
  }, [isNative]);

  const selectionChanged = useCallback(async () => {
    if (isNative) {
      await Haptics.selectionChanged();
    } else if (navigator.vibrate) {
      navigator.vibrate(5);
    }
  }, [isNative]);

  return {
    impact,
    notification,
    selectionChanged,
  };
}
