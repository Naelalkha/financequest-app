import React, { useEffect } from 'react';
import AppBackground from '../app/AppBackground';
import BottomNav from '../app/BottomNav';
import ImpactViewV2 from '../impact/ImpactViewV2';
import { useSavingsEvents } from '../../hooks/useSavingsEvents';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../app/LoadingSpinner';

const Impact = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { events, loading, loadEvents, createEvent, updateEvent, deleteEvent } = useSavingsEvents();

  // Load events on mount
  useEffect(() => {
    if (user) {
      console.log('📊 Loading impact events for user:', user.uid);
      loadEvents({ limitCount: 100 });
    }
  }, [user, loadEvents]);

  // Handlers for ImpactViewV2
  const handleAdd = async (data) => {
    console.log('➕ Adding new savings event:', data);
    await createEvent({
      title: data.title,
      amount: data.amount,
      period: 'month',
      source: 'manual',
      proof: {
        type: 'note',
        note: `Added manually on ${data.date}`
      }
    });
    console.log('✅ Savings event added, total events:', events.length + 1);
  };

  const handleEdit = async (id, data) => {
    console.log('✏️ Editing savings event:', id, data);
    await updateEvent(id, {
      title: data.title,
      amount: data.amount,
    });
    console.log('✅ Savings event updated');
  };

  const handleDelete = async (id) => {
    console.log('🗑️ Deleting savings event:', id);
    if (window.confirm(t('impact.ledger.toast.deleted') || 'Delete this savings?')) {
      await deleteEvent(id);
      console.log('✅ Savings event deleted');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <AppBackground variant="onyx" />
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-24">
      <AppBackground variant="onyx" />
      
      <div className="relative z-10 max-w-md mx-auto min-h-screen flex flex-col">
        
        {/* ImpactView with Receipt Design */}
        <ImpactViewV2
          entries={events}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

      </div>

      <BottomNav />
    </div>
  );
};

export default Impact;
