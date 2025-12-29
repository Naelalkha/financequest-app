/**
 * Types pour les événements d'économie
 * @description Modèle Firestore /users/{uid}/savingsEvents
 */

/** Période de base pour le calcul */
export type SavingsPeriod = 'month' | 'year';

/** Type de preuve fournie */
export type ProofType = 'note' | 'file' | 'screenshot';

/** Source de l'économie */
export type SavingsSource = 'quest' | 'manual';

/**
 * Preuve d'une économie
 */
export interface Proof {
    /** Type de preuve */
    type: ProofType;
    /** URL du fichier (optionnel) */
    url?: string;
    /** Note textuelle (optionnel) */
    note?: string;
}

/**
 * Événement d'économie
 * @description Représente une économie réalisée par l'utilisateur
 */
export interface SavingsEvent {
    /** Identifiant unique */
    id: string;
    /** Date de création */
    createdAt: Date;
    /** Date de mise à jour */
    updatedAt: Date;
    /** Titre de l'économie */
    title: string;
    /** ID de la quête associée */
    questId: string;
    /** Montant économisé */
    amount: number;
    /** Base de calcul */
    period: SavingsPeriod;
    /** Vérifié par le système */
    verified: boolean;
    /** Preuve fournie */
    proof: Proof | null;
    /** Source de l'économie */
    source: SavingsSource;
}

/** Valeurs par défaut pour un nouveau SavingsEvent */
export const DEFAULT_SAVINGS_EVENT: Partial<SavingsEvent> = {
    verified: false,
    proof: null,
    source: 'quest',
    period: 'month'
};

/** Champs protégés (modification serveur uniquement) */
export const PROTECTED_SAVINGS_FIELDS: (keyof SavingsEvent)[] = ['verified'];

/**
 * Valide si un objet est un SavingsEvent valide
 */
export const isValidSavingsEvent = (event: unknown): event is SavingsEvent => {
    if (!event || typeof event !== 'object') return false;

    const e = event as Record<string, unknown>;

    const hasRequiredFields =
        typeof e.title === 'string' &&
        typeof e.questId === 'string' &&
        typeof e.amount === 'number' &&
        (e.period === 'month' || e.period === 'year') &&
        (e.source === 'quest' || e.source === 'manual');

    if (!hasRequiredFields) return false;

    // Valider la preuve si présente
    if (e.proof !== null && e.proof !== undefined) {
        if (typeof e.proof !== 'object') return false;

        const proof = e.proof as Record<string, unknown>;
        const validProofTypes: ProofType[] = ['note', 'file', 'screenshot'];
        if (!validProofTypes.includes(proof.type as ProofType)) return false;

        if (proof.url && typeof proof.url !== 'string') return false;
        if (proof.note && typeof proof.note !== 'string') return false;
    }

    return true;
};

/**
 * Crée un nouveau SavingsEvent avec les valeurs par défaut
 */
export const createSavingsEvent = (
    data: Partial<SavingsEvent>
): Omit<SavingsEvent, 'id'> => {
    const now = new Date();

    return {
        ...DEFAULT_SAVINGS_EVENT,
        ...data,
        createdAt: now,
        updatedAt: now,
        verified: false,
        title: data.title || '',
        questId: data.questId || '',
        amount: data.amount || 0,
        period: data.period || 'month',
        proof: data.proof || null,
        source: data.source || 'quest',
    };
};
