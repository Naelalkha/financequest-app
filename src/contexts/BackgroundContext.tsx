import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';

export type BackgroundMode = 'macro' | 'micro';

export interface BackgroundConfig {
    blur?: boolean;
    blurAmount?: number;
    patternOpacity?: number;
}

interface BackgroundContextValue {
    mode: BackgroundMode;
    config: BackgroundConfig;
    setBackgroundMode: (newMode: BackgroundMode, newConfig?: BackgroundConfig) => void;
}

const BackgroundContext = createContext<BackgroundContextValue | null>(null);

interface BackgroundProviderProps {
    children: ReactNode;
}

export const BackgroundProvider: React.FC<BackgroundProviderProps> = ({ children }) => {
    const [mode, setMode] = useState<BackgroundMode>('macro');
    const [config, setConfig] = useState<BackgroundConfig>({});

    const setBackgroundMode = useCallback((newMode: BackgroundMode, newConfig: BackgroundConfig = {}) => {
        setMode(newMode);
        setConfig(newConfig);
    }, []);

    // Memoize context value to prevent unnecessary re-renders
    const value = useMemo(() => ({
        mode,
        config,
        setBackgroundMode
    }), [mode, config, setBackgroundMode]);

    return (
        <BackgroundContext.Provider value={value}>
            {children}
        </BackgroundContext.Provider>
    );
};

export const useBackground = (): BackgroundContextValue => {
    const context = useContext(BackgroundContext);
    if (!context) {
        throw new Error('useBackground must be used within a BackgroundProvider');
    }
    return context;
};
