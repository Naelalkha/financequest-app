import React, { useState, useEffect, useRef } from 'react';

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$@%&?!";

/**
 * Hook to create a scrambled text decoding effect.
 * 
 * @param {string} text The final text to display
 * @param {number} duration Duration of the effect in ms
 * @param {function} onFinish Callback function when animation is complete
 * @param {any} trigger Optional value to trigger re-animation
 * @returns {string} The current scrambled string
 */
export const useScrambleText = (text, duration = 800, onFinish, trigger) => {
    const [displayedText, setDisplayedText] = useState(text);
    const startTimeRef = useRef(null);
    const rafRef = useRef(null);
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
 * ScrambleText Component
 * 
 * A "Cyberpunk / Tactical OS" text decoder effect.
 * Random characters resolve into the target text over a set duration.
 * 
 * Usage:
 * <ScrambleText text="SYSTEM ONLINE" className="text-xl font-bold" />
 */
export const ScrambleText = ({
    text,
    duration = 800,
    className = "",
    style,
    trigger,
    as: Component = 'span',
    onFinish
}) => {
    const displayedText = useScrambleText(text, duration, onFinish, trigger);

    return (
        <Component className={className} style={style}>
            {displayedText}
        </Component>
    );
};

export default ScrambleText;
