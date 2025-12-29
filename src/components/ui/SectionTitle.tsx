import React from 'react';
import './SectionTitle.css';

/** Niveaux de heading autorisés */
export type HeadingLevel = '1' | '2' | '3' | '4' | '5' | '6';

/**
 * Props du composant SectionTitle
 * @description Titres de sections standardisés (grey, uppercase, tracked spacing)
 */
export interface SectionTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
    /** Niveau de heading (1-6) */
    level?: HeadingLevel;
    /** Action optionnelle (bouton, lien, etc.) */
    action?: React.ReactNode;
    /** Contenu du titre */
    children: React.ReactNode;
}

/**
 * Design System Section Title Component
 * Standardized titles for sections (grey, uppercase, tracked spacing)
 */
export const SectionTitle: React.FC<SectionTitleProps> = ({
    children,
    level = '2',
    className = '',
    action = null,
    ...props
}) => {
    // Dynamic heading tag based on level
    const Tag: React.ElementType = `h${level}`;

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
