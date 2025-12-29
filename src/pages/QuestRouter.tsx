import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLocalQuests } from '../hooks/useLocalQuests';

/**
 * QuestRouter - Simplified Quest Router
 * Route: /quests/:id
 */
const QuestRouter: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { quests, loading } = useLocalQuests();

    useEffect(() => {
        if (!loading && quests) {
            const questExists = quests.some(q => q.id === id);

            if (questExists) {
                navigate(`/quests?quest=${id}`, { replace: true });
            } else {
                console.warn(`Quest "${id}" not found`);
                navigate('/quests', { replace: true });
            }
        }
    }, [id, quests, loading, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E5FF00]"></div>
            </div>
        );
    }

    return null;
};

export default QuestRouter;
