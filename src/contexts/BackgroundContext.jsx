import React, { createContext, useContext, useState, useCallback } from 'react';

const BackgroundContext = createContext(null);

export const BackgroundProvider = ({ children }) => {
    // mode: 'macro' (default, grid) | 'micro' (vignette, no grid)
    const [mode, setMode] = useState('macro');

    // config: additional options like blur, exact opacity, etc.
    const [config, setConfig] = useState({});

    const setBackgroundMode = useCallback((newMode, newConfig = {}) => {
        setMode(newMode);
        setConfig(newConfig);
    }, []);

    return (
        <BackgroundContext.Provider value={{ mode, config, setBackgroundMode }}>
            {children}
        </BackgroundContext.Provider>
    );
};

export const useBackground = () => {
    const context = useContext(BackgroundContext);
    if (!context) {
        throw new Error('useBackground must be used within a BackgroundProvider');
    }
    return context;
};
