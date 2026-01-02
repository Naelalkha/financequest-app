/**
 * Quest Metadata Schema
 * 
 * Defines the structure and validation for quest metadata files
 * Install zod: npm install zod
 * 
 * Usage:
 * import { questMetadataSchema } from './questSchema';
 * const validated = questMetadataSchema.parse(myQuestData);
 */

// Uncomment when zod is installed:
// import { z } from 'zod';

// export const questMetadataSchema = z.object({
//   id: z.string().regex(/^[a-z0-9-]+$/, 'ID must be lowercase with hyphens only'),
//   category: z.enum(['budget', 'defense', 'croissance', 'strategie']),
//   country: z.string().optional(),
//   difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
//   duration: z.number().positive('Duration must be positive'),
//   xp: z.number().positive('XP must be positive'),
//   isPremium: z.boolean(),
//   starterPack: z.boolean().optional(),
//   order: z.number().optional(),
//   
//   // i18n key reference
//   i18nKey: z.string({
//     required_error: 'i18nKey is required for new quest format',
//     invalid_type_error: 'i18nKey must be a string'
//   }),
//   
//   metadata: z.object({
//     version: z.string(),
//     lastUpdated: z.string().datetime(),
//     author: z.string(),
//     tags: z.array(z.string()),
//     relatedQuests: z.array(z.string()),
//     averageCompletionTime: z.number().positive(),
//     completionRate: z.number().min(0).max(1),
//     userRating: z.number().min(0).max(5),
//     featured: z.boolean().optional()
//   }),
//   
//   estimatedImpact: z.object({
//     amount: z.number(),
//     period: z.enum(['month', 'year', 'once'])
//   }),
//   
//   icons: z.object({
//     main: z.any(), // React icon component
//     steps: z.array(z.any()).optional()
//   }),
//   
//   colors: z.object({
//     primary: z.string().regex(/^#[0-9A-F]{6}$/i, 'Must be hex color'),
//     secondary: z.string().regex(/^#[0-9A-F]{6}$/i, 'Must be hex color'),
//     accent: z.string().regex(/^#[0-9A-F]{6}$/i, 'Must be hex color'),
//     background: z.string(),
//     darkBackground: z.string()
//   }),
//   
//   rewards: z.object({
//     badge: z.string(),
//     unlocks: z.array(z.string())
//   }),
//   
//   core: z.any() // React component
// });

/** Quest input for validation */
interface QuestValidationInput {
    id?: string;
    category?: string;
    difficulty?: string;
    i18nKey?: string;
    title_fr?: string;
    title_en?: string;
}

/** Validation result */
interface ValidationResult {
    valid: boolean;
    errors?: string[];
}

/**
 * Validate quest metadata structure
 */
export const validateQuestMetadata = (quest: QuestValidationInput): ValidationResult => {
    const errors: string[] = [];

    // Required fields
    if (!quest.id) errors.push('Missing required field: id');
    if (!quest.category) errors.push('Missing required field: category');
    if (!quest.difficulty) errors.push('Missing required field: difficulty');
    if (!quest.i18nKey) errors.push('Missing required field: i18nKey (use new i18n format)');

    // Validate ID format
    if (quest.id && !/^[a-z0-9-]+$/.test(quest.id)) {
        errors.push('ID must be lowercase with hyphens only');
    }

    // Validate category
    const validCategories = ['budget', 'defense', 'croissance', 'strategie'];
    if (quest.category && !validCategories.includes(quest.category)) {
        errors.push(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
    }

    // Validate difficulty
    const validDifficulties = ['beginner', 'intermediate', 'advanced'];
    if (quest.difficulty && !validDifficulties.includes(quest.difficulty)) {
        errors.push(`Invalid difficulty. Must be one of: ${validDifficulties.join(', ')}`);
    }

    // Check for deprecated format
    if (quest.title_fr || quest.title_en) {
        errors.push('⚠️ Deprecated format: use i18nKey instead of title_fr/title_en');
    }

    return {
        valid: errors.length === 0,
        errors: errors.length > 0 ? errors : undefined
    };
};

export default validateQuestMetadata;
