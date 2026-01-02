/**
 * 💡 SpotlightOverlay V2 - Tactical HUD Edition
 * Overlay sombre avec "trou" spotlight sur le bouton mission
 * Design "Tactical OS" avec Data Link et Target Lock
 * 
 * Features:
 * - Masque SVG performant pour le spotlight
 * - Tooltip "HUD" relié au bouton par une ligne de connexion
 * - Glow "Target Lock" avec double bordure (précision + atmosphère)
 * - Animation "Scale In" sur l'ouverture du trou
 */

import React, { useEffect, useState, RefObject } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { haptic } from '../../../utils/haptics';

/** Spotlight position and dimensions */
interface SpotlightPosition {
    x: number;
    y: number;
    width: number;
    height: number;
    btnWidth: number;
    btnHeight: number;
}

/** Exit mode for smooth transitions */
type ExitMode = 'none' | 'toModal' | 'dismiss';

/** SpotlightOverlay component props */
interface SpotlightOverlayProps {
    isVisible: boolean;
    onDismiss: () => void;
    buttonRef: RefObject<HTMLButtonElement | null>;  // La ref peut être null au montage
    onSpotlightClick: () => void;
}

const SpotlightOverlay: React.FC<SpotlightOverlayProps> = ({
    isVisible,
    onDismiss,
    buttonRef,
    onSpotlightClick
}) => {
    const { t } = useTranslation('dashboard');
    const [spotlight, setSpotlight] = useState<SpotlightPosition | null>(null);

    // Track if the spotlight mask is ready to prevent flash of raw dashboard
    // This ensures smooth visual continuity from PainPointScreen's fade-to-black
    const [overlayReady, setOverlayReady] = useState(false);

    // Track exit animation state for smooth dismissal
    // 'none' = not exiting, 'toModal' = CTA clicked (keep black), 'dismiss' = outside click (fade overlay only)
    const [exitMode, setExitMode] = useState<ExitMode>('none');

    // Mark overlay as ready once spotlight position is calculated
    useEffect(() => {
        if (spotlight) {
            // Small delay to ensure SVG mask is rendered before revealing
            const timer = setTimeout(() => setOverlayReady(true), 50);
            return () => clearTimeout(timer);
        }
    }, [spotlight]);

    // Handle smooth exit for CTA click (to SmartMissionModal)
    // Keeps black overlay visible until modal is ready
    const handleExitToModal = (callback: (() => void) | undefined): void => {
        if (exitMode !== 'none') return;
        setExitMode('toModal');
        haptic.medium();
        // Wait for fade animation to complete before calling callback
        setTimeout(() => {
            callback?.();
        }, 300);
    };

    // Handle dismiss (click outside) - fade overlay but keep spotlight hole visible
    const handleDismiss = (callback: (() => void) | undefined): void => {
        if (exitMode !== 'none') return;
        setExitMode('dismiss');
        haptic.light();
        // Wait for fade animation to complete before calling callback
        setTimeout(() => {
            callback?.();
        }, 300);
    };

    // Animation config partagée pour synchroniser le mask et le glow ring
    // Le trou commence fermé (scale: 0) et s'ouvre en iris
    const irisAnimation = {
        initial: { scale: 0, opacity: 1 },
        animate: { scale: 1, opacity: 1 },
        transition: { delay: 0.1, type: "spring" as const, damping: 20, stiffness: 300 }
    };

    useEffect(() => {
        if (!isVisible) return;

        const updatePosition = () => {
            if (!buttonRef?.current) return;
            const btnRect = buttonRef.current.getBoundingClientRect();

            // Padding confortable autour du bouton pour le "trou"
            // Augmenté pour créer de l'espace entre le bouton et l'anneau lumineux
            const paddingX = 48;
            const paddingY = 32;

            setSpotlight({
                x: btnRect.left + btnRect.width / 2,
                y: btnRect.top + btnRect.height / 2,
                width: btnRect.width + paddingX,
                height: btnRect.height + paddingY,
                btnWidth: btnRect.width,
                btnHeight: btnRect.height
            });
        };

        const timeout = setTimeout(updatePosition, 100);
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition);

        return () => {
            clearTimeout(timeout);
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition);
        };
    }, [isVisible, buttonRef]);

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                // Le container - PAS d'animation d'opacité, immédiatement opaque
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[1000] overflow-hidden"
                onClick={(e) => {
                    if (e.target === e.currentTarget) {
                        handleDismiss(onDismiss);
                    }
                }}
            >
                {/* --- 0. IMMEDIATE BLACK OVERLAY (prevents flash & smooth exit) --- */}
                {/* toModal: stays black until SmartMissionModal is ready */}
                {/* dismiss: stays transparent, lets SVG mask fade independently */}
                <motion.div
                    initial={{ opacity: 1 }}
                    animate={{
                        opacity: exitMode === 'toModal' ? 1 : (overlayReady ? 0 : 1)
                    }}
                    transition={{ duration: exitMode === 'toModal' ? 0.3 : 0.2 }}
                    className="absolute inset-0 bg-black pointer-events-none"
                    style={{ zIndex: (overlayReady && exitMode !== 'toModal') ? -1 : 1 }}
                />

                {/* --- 1. LE MASQUE SVG (Le Trou) --- */}
                {/* On dismiss: fade out the dark overlay only, keeping the spotlight button visible */}
                <motion.svg
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    animate={{ opacity: exitMode === 'dismiss' ? 0 : 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <defs>
                        <mask id="tactical-mask">
                            <rect width="100%" height="100%" fill="white" />
                            {spotlight && (
                                <motion.rect
                                    initial={irisAnimation.initial}
                                    animate={irisAnimation.animate}
                                    transition={irisAnimation.transition}
                                    x={spotlight.x - spotlight.width / 2}
                                    y={spotlight.y - spotlight.height / 2}
                                    width={spotlight.width}
                                    height={spotlight.height}
                                    rx="20"
                                    fill="black"
                                />
                            )}
                        </mask>
                    </defs>

                    {/* Fond noir - 94% pour voir le dashboard, mais container immédiat */}
                    <rect
                        width="100%"
                        height="100%"
                        fill="rgba(5, 5, 5, 0.94)"
                        mask="url(#tactical-mask)"
                        className="backdrop-blur-[4px]"
                    />

                    {/* --- 2. LE GLOW TACTIQUE (Viseur) --- */}
                    {spotlight && (
                        <>
                            {/* Cercle Fin (Précision) - synchronisé avec le mask pour l'effet iris */}
                            <motion.rect
                                initial={irisAnimation.initial}
                                animate={irisAnimation.animate}
                                transition={irisAnimation.transition}
                                x={spotlight.x - spotlight.width / 2}
                                y={spotlight.y - spotlight.height / 2}
                                width={spotlight.width}
                                height={spotlight.height}
                                rx="20"
                                fill="none"
                                stroke="#E2FF00"
                                strokeWidth="1.5"
                            />

                            {/* Halo Diffus - pulse aussi maintenant */}
                            <motion.rect
                                x={spotlight.x - spotlight.width / 2 - 4}
                                y={spotlight.y - spotlight.height / 2 - 4}
                                width={spotlight.width + 8}
                                height={spotlight.height + 8}
                                rx="24"
                                fill="none"
                                stroke="#E2FF00"
                                strokeWidth="4"
                                animate={{
                                    opacity: [0.1, 0.25, 0.1]  // Pulse subtil
                                }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                            />
                        </>
                    )}
                </motion.svg>

                {/* --- 3. ZONE CLIQUABLE --- */}
                {spotlight && (
                    <div
                        className="absolute cursor-pointer"
                        style={{
                            left: spotlight.x - spotlight.width / 2,
                            top: spotlight.y - spotlight.height / 2,
                            width: spotlight.width,
                            height: spotlight.height,
                            borderRadius: 20
                        }}
                        onClick={() => handleExitToModal(onSpotlightClick)}
                    />
                )}

                {/* --- 4. LE TOOLTIP "DATA LINK" --- */}
                {spotlight && (
                    <motion.div
                        className="absolute z-[1001] pointer-events-none flex flex-col items-center"
                        animate={{ opacity: exitMode !== 'none' ? 0 : 1 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            left: spotlight.x,
                            top: spotlight.y - spotlight.height / 2,
                            transform: 'translate(-50%, -100%)',
                        }}
                    >
                        {/* Le Tooltip (Briefing Box) */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: -20 }}
                            transition={{ delay: 0.2, type: "spring" }}
                            className="bg-[#111] border border-white/10 rounded-xl p-4 w-[280px] shadow-[0_0_30px_rgba(226,255,0,0.15)] relative overflow-hidden group"
                        >
                            {/* Effet de scan en background */}
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent translate-y-[-100%] animate-[scan_3s_infinite]" />

                            {/* Header */}
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-[#E2FF00] rounded-full animate-pulse" />
                                    <span className="text-[10px] font-mono text-[#E2FF00] tracking-widest uppercase">
                                        {t('systemDetection')}
                                    </span>
                                </div>
                                <Target className="w-3 h-3 text-neutral-500" />
                            </div>

                            {/* Contenu */}
                            <h4 className="text-white font-[800] text-sm mb-1 leading-tight">
                                {t('opportunityUnlocked')}
                            </h4>
                            <p className="text-neutral-400 text-xs leading-relaxed">
                                {t('spotlight')}
                            </p>

                            {/* Footer (CTA Hint) */}
                            <div className="mt-3 pt-3 border-t border-dashed border-white/10 flex items-center justify-between text-[#E2FF00]">
                                <span className="text-[10px] font-mono uppercase tracking-wider">Première Mission</span>
                                <ChevronRight className="w-3 h-3" />
                            </div>
                        </motion.div>

                        {/* La Ligne de Connexion (Data Link) */}
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 20 }}
                            transition={{ delay: 0.4, duration: 0.3 }}
                            className="w-[1px] bg-gradient-to-b from-[#E2FF00]/50 to-transparent"
                        />

                        {/* Le Point de contact */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.6 }}
                            className="w-1.5 h-1.5 bg-[#E2FF00] rounded-full shadow-[0_0_10px_#E2FF00]"
                            style={{ marginTop: '-0.75px' }}
                        />
                    </motion.div>
                )}

                {/* Hint pour fermer (Discret en bas) */}
                <motion.div
                    className="absolute bottom-10 w-full text-center"
                    animate={{ opacity: exitMode !== 'none' ? 0 : 1 }}
                    transition={{ duration: 0.2 }}
                >
                    <p className="text-[10px] text-neutral-300 font-mono uppercase tracking-[0.2em] opacity-80">
                        {t('dismissHint')}
                    </p>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default SpotlightOverlay;
