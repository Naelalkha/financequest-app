import { useParams, Navigate } from 'react-router-dom';
import QuestFlowWrapper from '../quest/generic/QuestFlowWrapper';
import CutSubscriptionCore from '../quest/cores/CutSubscriptionCore';
import { cutSubscriptionQuest } from '../../data/quests/cut-subscription-v1';

/**
 * QuestRouter - Routeur dynamique pour les quêtes
 * 
 * Map les IDs de quêtes vers leurs CORES + DATA
 * Route: /quests/:id
 * 
 * Pour ajouter une nouvelle quête :
 * 1. Importer le CORE (src/components/quest/cores/...)
 * 2. Importer la DATA (src/data/quests/...)
 * 3. Ajouter l'entrée dans QUEST_REGISTRY
 */

// Registre des quêtes : ID → { core, data }
const QUEST_REGISTRY = {
  'cut-subscription-v1': {
    core: CutSubscriptionCore,
    data: cutSubscriptionQuest
  },
  // Ajoutez vos futures quêtes ici :
  // 'emergency-fund-v1': {
  //   core: EmergencyFundCore,
  //   data: emergencyFundQuest
  // },
};

const QuestRouter = () => {
  const { id } = useParams();
  
  // Récupérer la config de la quête
  const questRegistry = QUEST_REGISTRY[id];
  
  // Si la quête n'existe pas, rediriger vers la liste
  if (!questRegistry) {
    console.warn(`Quest "${id}" not found in QUEST_REGISTRY`);
    return <Navigate to="/quests" replace />;
  }
  
  const { core, data } = questRegistry;
  
  // Render directement QuestFlowWrapper avec la config
  return (
    <QuestFlowWrapper
      questId={id}
      questConfig={data}
      coreSteps={core.steps}
      onStepValidation={core.validate}
      completionConfig={core.completionConfig}
      impactConfig={core.impactConfig}
      showIntro={core.wrapperConfig?.showIntro ?? true}
    />
  );
};

export default QuestRouter;

