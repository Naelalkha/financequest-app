import React, { useState, useEffect, useRef } from 'react';

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$@%&?!";

/**
 * Hook to create a scrambled text decoding effect.
 * 
 * @param text The final text to display
 * @param duration Duration of the effect in ms
 * @param onFinish Callback function when animation is complete
 * @param trigger Optional value to trigger re-animation
 * @returns The current scrambled string
 */
export const useScrambleText = (
    text: string,
    duration: number = 800,
    onFinish?: () => void,
    trigger?: unknown
): string => {
    const [displayedText, setDisplayedText] = useState(text);
    const startTimeRef = useRef<number | null>(null);
    const rafRef = useRef<number | null>(null);
    const hasFinishedRef = useRef(false);

    useEffect(() => {
        startTimeRef.current = Date.now();
        hasFinishedRef.current = false;

        const animate = () => {
            const now = Date.now();
            const startTime = startTimeRef.current || now;
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const textLength = text.length;
            const progressIndex = Math.floor(progress * textLength);

            if (progress >= 1) {
                setDisplayedText(text);
                if (onFinish && !hasFinishedRef.current) {
                    hasFinishedRef.current = true;
                    onFinish();
                }
                return;
            }

            let result = '';
            for (let i = 0; i < textLength; i++) {
                if (i < progressIndex) {
                    result += text[i];
                } else {
                    if (text[i] === ' ') {
                        result += ' ';
                    } else {
                        result += CHARS[Math.floor(Math.random() * CHARS.length)];
                    }
                }
            }

            setDisplayedText(result);
            rafRef.current = requestAnimationFrame(animate);
        };

        rafRef.current = requestAnimationFrame(animate);

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [text, duration, trigger, onFinish]);

    return displayedText;
};

/**
 * Props du composant ScrambleText
 * @description Effet de décodage de texte "Cyberpunk / Tactical OS"
 */
export interface ScrambleTextProps {
    /** Texte final à afficher */
    text: string;
    /** Durée de l'effet en ms */
    duration?: number;
    /** Classes CSS */
    className?: string;
    /** Styles inline */
    style?: React.CSSProperties;
    /** Valeur pour déclencher la ré-animation */
    trigger?: unknown;
    /** Élément HTML à utiliser */
    as?: React.ElementType;
    /** Callback quand l'animation est terminée */
    onFinish?: () => void;
}

/**
 * ScrambleText Component
 * 
 * A "Cyberpunk / Tactical OS" text decoder effect.
 * Random characters resolve into the target text over a set duration.
 */
export const ScrambleText: React.FC<ScrambleTextProps> = ({
    text,
    duration = 800,
    className = "",
    style,
    trigger,
    as: Component = 'span',
    onFinish
}) => {
    const displayedText = useScrambleText(text, duration, onFinish, trigger);

    return React.createElement(
        Component,
        { className, style },
        displayedText
    );
};

export default ScrambleText;
