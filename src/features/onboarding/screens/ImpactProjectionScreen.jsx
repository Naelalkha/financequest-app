/**
 * 🎯 ÉCRAN 3 : SIMULATION TACTIQUE
 * "POTENTIEL DÉVERROUILLÉ" - Projection d'impact sur 1 mois, 1 an, 10 ans
 * 
 * Affiche le "Triple Impact" avec un Area Chart animé
 * Crée l'effet "Wow" avec des chiffres impressionnants
 */

import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Rocket, TrendingUp, Calendar, Target } from 'lucide-react';
import { haptic } from '../../../utils/haptics';
import { onboardingStore } from '../onboardingStore';
import { getStrategyById, formatCurrency } from '../strategyData';

/**
 * Animated Area Chart - Pure SVG implementation
 * Draws an exponential growth curve with fill gradient
 */
const AreaChart = ({ strategy, isVisible }) => {
    const width = 320;
    const height = 160;
    const padding = { top: 20, right: 20, bottom: 30, left: 20 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Generate exponential curve points (compound growth simulation)
    const generatePath = () => {
        const points = [];
        const years = 10;
        const steps = 20;

        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const year = t * years;
            // Exponential growth curve: e^(rate * year)
            const growth = Math.exp(0.07 * year);
            const x = padding.left + (t * chartWidth);
            const y = padding.top + chartHeight - (growth - 1) * (chartHeight / (Math.exp(0.07 * years) - 1));
            points.push({ x, y });
        }
        return points;
    };

    const points = generatePath();

    // Create SVG path
    const linePath = points.map((p, i) =>
        `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
    ).join(' ');

    // Area path (closed shape)
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding.bottom} L ${padding.left} ${height - padding.bottom} Z`;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.95 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="relative w-full max-w-sm mx-auto"
        >
            <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
                {/* Gradient definition */}
                <defs>
                    <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={strategy?.color || '#E2FF00'} stopOpacity="0.4" />
                        <stop offset="100%" stopColor={strategy?.color || '#E2FF00'} stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={strategy?.color || '#E2FF00'} stopOpacity="0.5" />
                        <stop offset="100%" stopColor={strategy?.color || '#E2FF00'} stopOpacity="1" />
                    </linearGradient>
                </defs>

                {/* Grid lines */}
                {[0, 1, 2, 3].map((i) => (
                    <line
                        key={i}
                        x1={padding.left}
                        y1={padding.top + (i * chartHeight / 3)}
                        x2={width - padding.right}
                        y2={padding.top + (i * chartHeight / 3)}
                        stroke="rgba(255,255,255,0.05)"
                        strokeDasharray="4 4"
                    />
                ))}

                {/* Area fill */}
                <motion.path
                    d={areaPath}
                    fill="url(#areaGradient)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isVisible ? 1 : 0 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                />

                {/* Line */}
                <motion.path
                    d={linePath}
                    fill="none"
                    stroke="url(#lineGradient)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: isVisible ? 1 : 0 }}
                    transition={{ delay: 0.4, duration: 1.2, ease: "easeOut" }}
                />

                {/* End point glow */}
                <motion.circle
                    cx={points[points.length - 1].x}
                    cy={points[points.length - 1].y}
                    r="8"
                    fill={strategy?.color || '#E2FF00'}
                    opacity="0.3"
                    initial={{ scale: 0 }}
                    animate={{ scale: isVisible ? [1, 1.5, 1] : 0 }}
                    transition={{ delay: 1.4, duration: 1.5, repeat: Infinity }}
                />
                <motion.circle
                    cx={points[points.length - 1].x}
                    cy={points[points.length - 1].y}
                    r="4"
                    fill={strategy?.color || '#E2FF00'}
                    initial={{ scale: 0 }}
                    animate={{ scale: isVisible ? 1 : 0 }}
                    transition={{ delay: 1.4, type: 'spring' }}
                />

                {/* X-axis labels */}
                <text x={padding.left} y={height - 8} fill="rgba(255,255,255,0.4)" fontSize="10" fontFamily="monospace">
                    AUJOURD'HUI
                </text>
                <text x={width - padding.right} y={height - 8} fill="rgba(255,255,255,0.4)" fontSize="10" fontFamily="monospace" textAnchor="end">
                    10 ANS
                </text>
            </svg>
        </motion.div>
    );
};

/**
 * Animated counter for impact numbers
 */
const AnimatedCounter = ({ value, prefix = '+', suffix = '', delay = 0 }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            const duration = 1200;
            const startTime = Date.now();

            const updateValue = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                // Ease out cubic
                const eased = 1 - Math.pow(1 - progress, 3);
                setDisplayValue(Math.round(value * eased));

                if (progress < 1) {
                    requestAnimationFrame(updateValue);
                }
            };

            requestAnimationFrame(updateValue);
        }, delay);

        return () => clearTimeout(timer);
    }, [value, delay]);

    return (
        <span>
            {prefix} {formatCurrency(displayValue)} {suffix}
        </span>
    );
};

/**
 * Impact metric row
 */
const ImpactRow = ({ icon: Icon, label, value, suffix, isHighlighted, delay }) => (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay, type: 'spring', stiffness: 300 }}
        className={`
      flex items-center justify-between p-4 rounded-xl
      ${isHighlighted
                ? 'bg-[#E2FF00]/10 border border-[#E2FF00]/30'
                : 'bg-white/5 border border-white/10'
            }
    `}
    >
        <div className="flex items-center gap-3">
            <div className={`
        w-10 h-10 rounded-lg flex items-center justify-center
        ${isHighlighted ? 'bg-[#E2FF00]/20' : 'bg-white/5'}
      `}>
                <Icon className={`w-5 h-5 ${isHighlighted ? 'text-[#E2FF00]' : 'text-neutral-400'}`} />
            </div>
            <span className={`
        font-mono text-xs tracking-wider uppercase
        ${isHighlighted ? 'text-[#E2FF00]' : 'text-neutral-500'}
      `}>
                {label}
            </span>
        </div>
        <span className={`
      font-black text-xl
      ${isHighlighted ? 'text-[#E2FF00]' : 'text-white'}
    `}>
            <AnimatedCounter value={value} suffix={suffix} delay={delay * 1000} />
        </span>
    </motion.div>
);

const ImpactProjectionScreen = ({ onNext }) => {
    const [isVisible, setIsVisible] = useState(false);
    const selectedStrategy = getStrategyById(onboardingStore.getState().selectedStrategyId);

    useEffect(() => {
        haptic.medium();
        // Trigger animations after mount
        const timer = setTimeout(() => setIsVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const handleContinue = () => {
        haptic.success();
        onNext();
    };

    // Fallback if no strategy selected (shouldn't happen)
    const strategy = selectedStrategy || {
        title: 'STRATÉGIE',
        impactMonthly: 150,
        impactAnnual: 1800,
        impact10Years: 26000,
        color: '#E2FF00',
    };

    return (
        <div className="min-h-screen bg-transparent flex flex-col relative overflow-hidden">
            {/* Radial glow background */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: `radial-gradient(ellipse at 50% 30%, ${strategy.color}10 0%, transparent 60%)`,
                }}
            />

            {/* Content */}
            <div className="relative z-10 flex-1 flex flex-col px-6 py-12">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-[#E2FF00] font-mono text-xs tracking-[0.3em] mb-3"
                    >
                        SIMULATION TACTIQUE
                    </motion.p>
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-3xl md:text-4xl font-black text-white tracking-tight"
                    >
                        POTENTIEL DÉVERROUILLÉ
                    </motion.h1>
                </motion.div>

                {/* Area Chart */}
                <div className="mb-8">
                    <AreaChart strategy={strategy} isVisible={isVisible} />
                </div>

                {/* Triple Impact Grid */}
                <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
                    <div className="space-y-3">
                        <ImpactRow
                            icon={Calendar}
                            label="FLUX MENSUEL"
                            value={strategy.impactMonthly}
                            suffix="€/mois"
                            delay={0.8}
                        />
                        <ImpactRow
                            icon={TrendingUp}
                            label="CASH ANNUEL"
                            value={strategy.impactAnnual}
                            suffix="€/an"
                            delay={1.0}
                        />
                        <ImpactRow
                            icon={Target}
                            label="VISION 10 ANS"
                            value={strategy.impact10Years}
                            suffix="€"
                            isHighlighted
                            delay={1.2}
                        />
                    </div>

                    {/* Concrete Impact Card - Tactical Translation */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.5, type: 'spring', stiffness: 200 }}
                        className="mt-6 p-5 rounded-2xl bg-neutral-900/80 border border-white/10 backdrop-blur-sm"
                    >
                        {/* Label */}
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-[#E2FF00]/10 flex items-center justify-center">
                                <Target className="w-4 h-4 text-[#E2FF00]" />
                            </div>
                            <span className="font-mono text-[10px] tracking-[0.2em] text-neutral-500 uppercase">
                                Impact Opérationnel
                            </span>
                        </div>

                        {/* Concrete benefit text */}
                        <p className="text-white font-bold text-base leading-relaxed">
                            {strategy.concreteBenefit || "Transforme tes efforts en résultats concrets."}
                        </p>
                    </motion.div>
                </div>

                {/* CTA Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.8 }}
                    className="mt-8"
                >
                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={handleContinue}
                        className="w-full max-w-md mx-auto bg-[#E2FF00] text-black font-black py-4 px-8 rounded-xl 
                       shadow-[0_0_30px_rgba(226,255,0,0.3)] 
                       hover:shadow-[0_0_50px_rgba(226,255,0,0.5)]
                       active:scale-[0.98] transition-all duration-200
                       uppercase tracking-wider text-base flex items-center justify-center gap-3"
                    >
                        <Rocket className="w-5 h-5" />
                        ACTIVER CE PROTOCOLE
                    </motion.button>
                </motion.div>
            </div>

            {/* Progress indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
                <div className="w-2 h-2 rounded-full bg-[#E2FF00]/30" />
                <div className="w-2 h-2 rounded-full bg-[#E2FF00]/30" />
                <div className="w-6 h-2 rounded-full bg-[#E2FF00]" />
                <div className="w-2 h-2 rounded-full bg-[#E2FF00]/30" />
                <div className="w-2 h-2 rounded-full bg-[#E2FF00]/30" />
            </div>
        </div>
    );
};

export default ImpactProjectionScreen;
