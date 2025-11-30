import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useLocalQuests } from '../hooks/useLocalQuests';

/**
 * QuestRouter - Simplified Quest Router
 * 
 * Route: /quests/:id
 * 
 * Simplified version: redirects to quest list with modal
 * The quest details are handled by QuestDetailsModal in the dashboard/quest list
 */
const QuestRouter = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { quests, loading } = useLocalQuests();

  useEffect(() => {
    if (!loading && quests) {
      // Check if quest exists
      const questExists = quests.some(q => q.id === id);

      if (questExists) {
        // Redirect to quests page - the modal will be handled there
        navigate(`/quests?quest=${id}`, { replace: true });
      } else {
        // Quest not found, redirect to quest list
        console.warn(`Quest "${id}" not found`);
        navigate('/quests', { replace: true });
      }
    }
  }, [id, quests, loading, navigate]);

  // Show loading while we redirect
  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E5FF00]"></div>
      </div>
    );
  }

  // Return null while redirecting
  return null;
};

export default QuestRouter;
