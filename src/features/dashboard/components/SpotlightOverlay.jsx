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

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { haptic } from '../../../utils/haptics';

const SpotlightOverlay = ({
    isVisible,
    onDismiss,
    buttonRef,
    onSpotlightClick
}) => {
    const { t } = useTranslation('dashboard');
    const [spotlight, setSpotlight] = useState(null);

    // Animation config partagée pour synchroniser le mask et le glow ring
    // Le trou commence fermé (scale: 0) et s'ouvre en iris
    const irisAnimation = {
        initial: { scale: 0, opacity: 1 },
        animate: { scale: 1, opacity: 1 },
        transition: { delay: 0.1, type: "spring", damping: 20, stiffness: 300 }
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
                        haptic.light();
                        onDismiss();
                    }
                }}
            >
                {/* --- 1. LE MASQUE SVG (Le Trou) --- */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
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
                </svg>

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
                        onClick={() => {
                            haptic.heavy();
                            onSpotlightClick?.();
                        }}
                    />
                )}

                {/* --- 4. LE TOOLTIP "DATA LINK" --- */}
                {spotlight && (
                    <div
                        className="absolute z-[1001] pointer-events-none flex flex-col items-center"
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
                        {/* La ligne s'arrête exactement sur le bord supérieur de l'anneau lumineux */}
                        <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: 20 }}
                            transition={{ delay: 0.4, duration: 0.3 }}
                            className="w-[1px] bg-gradient-to-b from-[#E2FF00]/50 to-transparent"
                        />
                        
                        {/* Le Point de contact - positionné exactement sur le bord de l'anneau */}
                        <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.6 }}
                            className="w-1.5 h-1.5 bg-[#E2FF00] rounded-full shadow-[0_0_10px_#E2FF00]"
                            style={{
                                // Positionné exactement sur le bord supérieur de l'anneau
                                // L'anneau a un strokeWidth de 1.5px, donc on centre le point sur le bord
                                marginTop: '-0.75px' // Moitié du strokeWidth pour centrer sur le bord
                            }}
                        />
                    </div>
                )}

                {/* Hint pour fermer (Discret en bas) */}
                <div className="absolute bottom-10 w-full text-center">
                    <p className="text-[10px] text-neutral-300 font-mono uppercase tracking-[0.2em] opacity-80">
                        {t('dismissHint')}
                    </p>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default SpotlightOverlay;
