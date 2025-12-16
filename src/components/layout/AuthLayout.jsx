import React from 'react';
import { useTranslation } from 'react-i18next';
import logo from '../../assets/logo-moniyo.png';

const AuthLayout = ({ children }) => {
    const { t } = useTranslation('auth');

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 py-6 relative overflow-hidden">

            {/* Header / Brand */}
            <div className="relative z-10 flex flex-col items-center mb-4 animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="relative flex justify-center items-center mb-2">
                    {/* Le Logo avec glow subtil */}
                    <img
                        src={logo}
                        className="relative z-10 w-28"
                        alt="Moniyo Logo"
                        style={{ filter: 'drop-shadow(rgba(226, 255, 0, 0.45) 0px 0px 6px)' }}
                    />
                </div>
                <h1 className="font-sans font-black text-2xl tracking-tighter text-white">MONIYO</h1>
                <p className="font-mono text-[9px] text-neutral-500 tracking-[0.3em] uppercase mt-1">
                    {t('system_subtitle')}
                </p>
            </div>

            {/* Main Content Area */}
            <div className="w-full max-w-sm relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-500">
                {children}
            </div>

            {/* Legal Footer */}
            <div className="mt-4 text-center opacity-40">
                <p className="font-mono text-[9px] text-neutral-600">
                    SECURED BY 256-BIT ENCRYPTION
                </p>
            </div>
        </div>
    );
};

export default AuthLayout;
