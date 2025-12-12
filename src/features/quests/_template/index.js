/**
 * [QUEST_NAME] Quest - Moniyo Protocol
 * 
 * Template pour nouvelles quêtes.
 * 
 * INSTRUCTIONS DE COPIE:
 * 1. Copier ce dossier vers /pilotage/[quest-name]/ (ou autre catégorie)
 * 2. Renommer tous les fichiers .template.* vers leurs noms finaux
 * 3. Renommer TemplateFlow → [QuestName]Flow
 * 4. Remplacer tous les [PLACEHOLDER] par les vraies valeurs
 * 5. Créer le contenu dans insightData.js
 * 6. Enregistrer dans registry.js
 * 7. Ajouter les traductions dans quests.json
 * 
 * FICHIERS TEMPLATE DISPONIBLES:
 * - Flow.template.jsx       → [QuestName]Flow.jsx
 * - metadata.template.js    → metadata.js
 * - insightData.template.js → insightData.js
 * 
 * DOCUMENTATION:
 * Voir GUIDE.md pour les instructions complètes
 */

// Main flow component
export { default as TemplateFlow } from './Flow.template';

// Individual screens
export { default as ProtocolScreen } from './screens/ProtocolScreen';
export { default as ExecutionScreen } from './screens/ExecutionScreen';
export { default as DebriefScreen } from './screens/DebriefScreen';

// Quest metadata
export { default as templateQuest } from './metadata.template';
export { templateQuest as metadata } from './metadata.template';

// Insight data template
export * from './insightData.template';
