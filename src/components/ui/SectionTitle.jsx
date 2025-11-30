import React from 'react';
import './SectionTitle.css';

/**
 * Design System Section Title Component
 * Standardized titles for sections (grey, uppercase, tracked spacing)
 */
export const SectionTitle = ({
    children,
    level = '2',
    className = '',
    action = null,
    ...props
}) => {
    const Tag = `h${level}`;

    return (
        <div className={`fq-section-title-wrapper ${className}`.trim()}>
            <Tag className="fq-section-title" {...props}>
                {children}
            </Tag>
            {action && (
                <div className="fq-section-title-action">
                    {action}
                </div>
            )}
        </div>
    );
};

export default SectionTitle;
