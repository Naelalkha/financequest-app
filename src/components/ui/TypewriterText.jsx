import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';

/**
 * TypewriterText Component
 * 
 * Renders text character by character with a blinking terminal cursor.
 * "Typewriter" effect for a tactical/retro-terminal feel.
 * 
 * The cursor blinks during typing, then fades out elegantly when finished.
 */
export const TypewriterText = ({
    text,
    className = "",
    style,
    cursorColor = '#E2FF00',
    typingSpeed = 80,
    startDelay = 0,
    onFinish,
    showCursor = true,
    hideCursorOnFinish = true
}) => {
    const [displayedText, setDisplayedText] = useState('');
    const [isFinished, setIsFinished] = useState(false);

    // Use a unique ID to prevent re-running on re-renders
    const animationId = useMemo(() => Math.random(), []);

    useEffect(() => {
        let timeoutId;
        let intervalId;
        let currentIndex = 0;

        // Reset state
        setDisplayedText('');
        setIsFinished(false);

        timeoutId = setTimeout(() => {
            intervalId = setInterval(() => {
                currentIndex++;
                if (currentIndex <= text.length) {
                    setDisplayedText(text.slice(0, currentIndex));
                } else {
                    clearInterval(intervalId);
                    setIsFinished(true);
                    if (onFinish) {
                        onFinish();
                    }
                }
            }, typingSpeed);
        }, startDelay);

        return () => {
            clearTimeout(timeoutId);
            clearInterval(intervalId);
        };
    }, [animationId]); // Only run once per mount

    const hasText = displayedText.length > 0;

    return (
        <span className={className} style={{ display: 'inline-block', position: 'relative', ...style }}>
            {displayedText}
            {showCursor && (
                <motion.span
                    initial={{ opacity: 1 }}
                    animate={{
                        opacity: isFinished && hideCursorOnFinish ? 0 : [1, 0]
                    }}
                    transition={
                        isFinished && hideCursorOnFinish
                            ? { duration: 0.4, ease: "easeOut" }
                            : { duration: 0.6, repeat: Infinity, repeatType: 'reverse', ease: "linear" }
                    }
                    style={{
                        color: cursorColor,
                        ...(hasText ? {
                            position: 'absolute',
                            left: '100%',
                            marginLeft: '4px',
                            top: '0'
                        } : {
                            display: 'inline-block'
                        })
                    }}
                >
                    █
                </motion.span>
            )}
        </span>
    );
};

export default TypewriterText;
