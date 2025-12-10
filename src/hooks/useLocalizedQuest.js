import { useTranslation } from 'react-i18next';

/**
 * Hook pour charger une quête avec ses traductions
 * 
 * Remplace l'ancien système avec title_fr/title_en par un système i18n centralisé
 * 
 * @param {Object} quest - Quest metadata object avec i18nKey
 * @returns {Object} - Quest avec traductions chargées
 * 
 * @example
 * const quest = useLocalizedQuest(cutSubscriptionQuest);
 * console.log(quest.title); // "Coupe 1 abonnement inutile" (si langue FR)
 */
export const useLocalizedQuest = (quest) => {
    const { t } = useTranslation('quests');

    if (!quest) return null;

    // Si la quête utilise le nouveau format avec i18nKey
    if (quest.i18nKey) {
        const key = quest.i18nKey;

        return {
            ...quest,
            codename: t(`${key}.codename`),
            title: t(`${key}.title`),
            description: t(`${key}.description`),
            objectives: t(`${key}.objectives`, { returnObjects: true }),
            prerequisites: t(`${key}.prerequisites`, { returnObjects: true })
        };
    }

    // Fallback pour les anciennes quêtes avec title_fr/title_en
    // (à supprimer une fois toutes les quêtes migrées)
    const { i18n } = useTranslation();
    const isEnglish = i18n.language.startsWith('en');

    if (quest.title_fr || quest.title_en) {
        return {
            ...quest,
            title: isEnglish ? (quest.title_en || quest.title_fr) : (quest.title_fr || quest.title_en),
            description: isEnglish ? (quest.description_en || quest.description_fr) : (quest.description_fr || quest.description_en),
            objectives: isEnglish ? (quest.objectives_en || quest.objectives_fr) : (quest.objectives_fr || quest.objectives_en),
            prerequisites: isEnglish ? (quest.prerequisites_en || quest.prerequisites_fr) : (quest.prerequisites_fr || quest.prerequisites_en)
        };
    }

    // Dernière fallback: retourner la quête telle quelle
    return quest;
};

export default useLocalizedQuest;
