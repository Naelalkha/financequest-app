import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useNavigate } from "react-router-dom";
import { Archive, LayoutList, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useLocalizedQuest from '../../hooks/useLocalizedQuest';
import { useAuth } from "../../contexts/AuthContext";
import { useLocalQuests, Quest } from "../../hooks/useLocalQuests";
import { collection, query, where, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { updateGamificationOnQuestComplete } from "../../services/gamification";
import QuestDetailsModal from "../dashboard/components/QuestDetailsModal";
import QuestCartridge from "./components/QuestCartridge";
import { CutSubscriptionFlow } from "./pilotage/cut-subscription";
import { MicroExpensesFlow } from "./pilotage/micro-expenses";
import { Budget503020Flow } from "./pilotage/budget-50-30-20";

/** Quest with progress info */
interface QuestWithProgress extends Quest {
  progress?: number;
}

/** Completed quest item - extracted for performance */
interface CompletedQuestItemProps {
  quest: Quest;
  completedLabel: string;
}

const CompletedQuestItem = memo(({ quest, completedLabel }: CompletedQuestItemProps) => {
  const localizedQuest = useLocalizedQuest(quest);

  return (
    <div className="bg-white/5 border border-white/5 p-4 rounded-xl flex items-center justify-between opacity-60 hover:opacity-100 transition-opacity">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-neutral-800 rounded-full flex items-center justify-center text-neutral-400 text-xs">
          ✓
        </div>
        <div>
          <h4 className="font-sans font-bold text-white line-through decoration-gold">
            {localizedQuest?.title || quest.title}
          </h4>
          <span className="font-mono text-[10px] text-emerald">
            +{(quest.estimatedImpact?.amount ?? 0).toFixed(2)} SAVED
          </span>
        </div>
      </div>
      <span className="font-mono text-[10px] text-neutral-600">{completedLabel}</span>
    </div>
  );
});

CompletedQuestItem.displayName = 'CompletedQuestItem';


/**
 * QuestListView - Autonomous quest list view
 * Now uses QuestDetailsModal for all quest interactions
 */
const QuestListView = () => {
    const { t } = useTranslation('quests');
    const { user } = useAuth();
    const navigate = useNavigate();
    const { quests, loading: questsLoading } = useLocalQuests();
    const [tab, setTab] = useState("ACTIVE");
    const [userProgress, setUserProgress] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedQuest, setSelectedQuest] = useState<QuestWithProgress | null>(null);
    const [showQuestModal, setShowQuestModal] = useState(false);

    // Load user quest progress
    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const loadUserProgress = async () => {
            try {
                const progressQuery = query(
                    collection(db, 'userQuests'),
                    where('userId', '==', user.uid)
                );
                const progressSnapshot = await getDocs(progressQuery);
                const progress = {};
                progressSnapshot.docs.forEach(doc => {
                    const data = doc.data();
                    progress[data.questId] = {
                        status: data.status,
                        progress: data.progress || 0,
                        completedAt: data.completedAt,
                        score: data.score || 0
                    };
                });
                setUserProgress(progress);
            } catch (error) {
                console.error('Error fetching user progress:', error);
            } finally {
                setLoading(false);
            }
        };

        loadUserProgress();
    }, [user]);

    // Derive active and completed quests
    const activeQuests = useMemo(() => {
        if (!quests) return [];
        return quests
            .filter(q => {
                const progress = userProgress[q.id];
                return progress?.status === 'active' || (!progress && !userProgress[q.id]);
            })
            .map(q => ({
                ...q,
                progress: userProgress[q.id]?.progress || 0
            }));
    }, [quests, userProgress]);

    const completedQuests = useMemo(() => {
        if (!quests) return [];
        return quests.filter(q => userProgress[q.id]?.status === 'completed');
    }, [quests, userProgress]);

    const handleStartQuest = () => {
        // Navigate to dashboard where SmartMission can be triggered
        navigate('/dashboard');
    };

    const handleOpenQuest = (quest) => {
        setSelectedQuest(quest);
        setShowQuestModal(true);
    };

    const handleCompleteQuest = async (modifiedQuest) => {
        if (!user) return;

        try {
            const questId = modifiedQuest.id;
            const xpReward = modifiedQuest.xpReward || 120;

            // 1. Mark quest as completed
            const questDocId = `${user.uid}_${questId}`;
            const questRef = doc(db, 'userQuests', questDocId);

            // Calculate values - use direct annual value if provided, otherwise monthly × 12
            const annualSavings = modifiedQuest.annualSavings 
                || (modifiedQuest.monetaryValue ? modifiedQuest.monetaryValue * 12 : 0);
            const monthlySavings = modifiedQuest.annualSavings 
                ? Math.round(modifiedQuest.annualSavings / 12)
                : modifiedQuest.monetaryValue;

            const now = new Date().toISOString();
            await setDoc(questRef, {
                userId: user.uid,
                questId: questId,
                status: 'completed',
                progress: 100,
                completedAt: now,
                monetaryValue: monthlySavings || 0,
                annualSavings: annualSavings || 0,
                xpReward: xpReward,
                updatedAt: now
            }, { merge: true });

            // 2. Update gamification (XP, level, badges) - this updates xpTotal
            const gamificationResult = await updateGamificationOnQuestComplete(user.uid, {
                quest: modifiedQuest,
                score: null,
                userProgress: userProgress,
                allQuests: quests || []
            });

            // 3. Refresh progress to hide completed quest
            const progressQuery = query(
                collection(db, 'userQuests'),
                where('userId', '==', user.uid)
            );
            const progressSnapshot = await getDocs(progressQuery);
            const progress = {};
            progressSnapshot.docs.forEach(doc => {
                const data = doc.data();
                progress[data.questId] = {
                    status: data.status,
                    progress: data.progress || 0,
                    completedAt: data.completedAt,
                    score: data.score || 0
                };
            });
            setUserProgress(progress);

            // 4. Close modal
            setShowQuestModal(false);
            setSelectedQuest(null);
        } catch (error) {
            console.error('Error completing quest:', error);
        }
    };

    const isLoading = questsLoading || loading;

    return (
        <div className="pt-4 px-6 pb-24 animate-slide-up">

            {/* Page Header */}
            <div className="flex items-end justify-between mb-8 border-b border-white/10 pb-4">
                <div>
                    <h1 className="font-sans font-bold text-4xl md:text-5xl text-white tracking-tight leading-none">
                        MISSION<br /><span className="text-neutral-600">LOG_01</span>
                    </h1>
                </div>
                <div className="text-right hidden md:block">
                    <span className="font-mono text-xs text-gold block">SYSTEM STATUS</span>
                    <span className="font-mono text-xs text-white">ONLINE</span>
                </div>
            </div>

            {/* Tabs / Filter */}
            <div className="flex gap-4 mb-6">
                <button
                    onClick={() => setTab("ACTIVE")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono text-xs font-bold transition-all border ${tab === "ACTIVE"
                        ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                        : "bg-transparent text-neutral-500 border-neutral-800 hover:border-neutral-600"
                        }`}
                >
                    <LayoutList className="w-3 h-3" />
                    {t('tab_active').toUpperCase()} ({activeQuests.length})
                </button>
                <button
                    onClick={() => setTab("ARCHIVE")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono text-xs font-bold transition-all border ${tab === "ARCHIVE"
                        ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                        : "bg-transparent text-neutral-500 border-neutral-800 hover:border-neutral-600"
                        }`}
                >
                    <Archive className="w-3 h-3" />
                    {t('tab_archive').toUpperCase()} ({completedQuests.length})
                </button>
            </div>

            {/* Content Area */}
            <div className="space-y-4 min-h-[300px]">
                {tab === "ACTIVE" ? (
                    <>
                        {/* Add New Quest Button (Small version) */}
                        <button
                            onClick={handleStartQuest}
                            disabled={isLoading}
                            className="w-full h-16 border border-dashed border-neutral-700 rounded-2xl flex items-center justify-center gap-3 text-neutral-500 hover:text-gold hover:border-gold hover:bg-gold/5 transition-all group mb-6"
                        >
                            {isLoading ? (
                                <span className="font-mono text-xs animate-pulse">{t('scanning').toUpperCase()}</span>
                            ) : (
                                <>
                                    <div className="w-6 h-6 rounded-full border border-current flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Plus className="w-3 h-3" />
                                    </div>
                                    <span className="font-mono text-xs font-bold tracking-widest">{t('find_new_quest').toUpperCase()}</span>
                                </>
                            )}
                        </button>

                        {activeQuests.length === 0 ? (
                            <div className="text-center py-12 opacity-50">
                                <LayoutList className="w-12 h-12 mx-auto mb-3 text-neutral-700" />
                                <p className="font-mono text-xs text-neutral-500">{t('no_active').toUpperCase()}</p>
                            </div>
                        ) : (
                            activeQuests.map(quest => (
                                <QuestCartridge
                                    key={quest.id}
                                    quest={quest}
                                    onOpen={handleOpenQuest}
                                    isPriority={false}
                                />
                            ))
                        )}
                    </>
                ) : (
                    /* ARCHIVE TAB */
                    <div className="space-y-3">
                        {completedQuests.length === 0 ? (
                            <div className="text-center py-12 opacity-50">
                                <Archive className="w-12 h-12 mx-auto mb-3 text-neutral-700" />
                                <p className="font-mono text-xs text-neutral-500">{t('archive_empty').toUpperCase()}</p>
                            </div>
                        ) : (
                            completedQuests.map(quest => (
                                <CompletedQuestItem
                                    key={quest.id}
                                    quest={quest}
                                    completedLabel={t('completed_status').toUpperCase()}
                                />
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Quest Details Modal */}
            {showQuestModal && selectedQuest && (
                selectedQuest.id === 'cut-subscription' ? (
                    <CutSubscriptionFlow
                        quest={selectedQuest}
                        onClose={() => {
                            setShowQuestModal(false);
                            setSelectedQuest(null);
                        }}
                        onComplete={(result) => {
                            // Transform result to match expected format
                            handleCompleteQuest({
                                ...selectedQuest,
                                id: result.questId,
                                title: result.serviceName
                                    ? `${t('cutSubscription.title')} - ${result.serviceName}`
                                    : selectedQuest.title,
                                monetaryValue: result.monthlyAmount,
                                xpReward: result.xpEarned
                            });
                        }}
                        userProgress={{
                            streak: 1,
                            xpProgress: 50
                        }}
                    />
                ) : selectedQuest.id === 'micro-expenses' ? (
                    <MicroExpensesFlow
                        quest={selectedQuest}
                        onClose={() => {
                            setShowQuestModal(false);
                            setSelectedQuest(null);
                        }}
                        onComplete={(result) => {
                            // Transform result to match expected format
                            // Pass yearlySavings directly to avoid rounding errors (monthly × 12 ≠ yearly)
                            handleCompleteQuest({
                                ...selectedQuest,
                                id: result.questId,
                                title: result.expenseName
                                    ? `${t('microExpenses.title')} - ${result.expenseName}`
                                    : selectedQuest.title,
                                annualSavings: result.yearlySavings,
                                xpReward: result.xpEarned
                            });
                        }}
                        userProgress={{
                            streak: 1,
                            xpProgress: 50
                        }}
                    />
                ) : selectedQuest.id === 'budget-50-30-20' ? (
                    <Budget503020Flow
                        quest={selectedQuest}
                        onClose={() => {
                            setShowQuestModal(false);
                            setSelectedQuest(null);
                        }}
                        onComplete={(result) => {
                            handleCompleteQuest({
                                ...selectedQuest,
                                id: result.questId,
                                annualSavings: result.annualSavings,
                                xpReward: result.xpEarned
                            });
                        }}
                        userProgress={{
                            streak: 1,
                            xpProgress: 50
                        }}
                    />
                ) : (
                    <QuestDetailsModal
                        quest={selectedQuest}
                        onClose={() => {
                            setShowQuestModal(false);
                            setSelectedQuest(null);
                        }}
                        onComplete={handleCompleteQuest}
                    />
                )
            )}
        </div>
    );
};

export default QuestListView;
