import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Incident } from '../types/incident';

export function useRealtimeIncidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch initial incidents (Status not resolved)
    const fetchIncidents = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .neq('status', 'resolved')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error("Error fetching incidents:", error);
      } else {
        setIncidents(data as Incident[]);
      }
      setLoading(false);
    };

    fetchIncidents();

    // 2. Setup Realtime subscription
    const channel = supabase.channel('public:incidents')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'incidents' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newIncident = payload.new as Incident;
            setIncidents(prev => [newIncident, ...prev].sort((a, b) => 
               new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime()
            ));
          } else if (payload.eventType === 'UPDATE') {
             const updatedIncident = payload.new as Incident;
             setIncidents(prev => prev.map(inc => 
                inc.id === updatedIncident.id ? updatedIncident : inc
             ));
             
             // If resolved, you might want to filter it out after a delay, or keep it depending on UX.
             // For now, we update it in place.
          } else if (payload.eventType === 'DELETE') {
             setIncidents(prev => prev.filter(inc => inc.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateIncidentStatus = async (id: string, status: string) => {
     const { error } = await supabase
       .from('incidents')
       .update({ status })
       .eq('id', id);
       
     if (error) console.error("Error updating status:", error);
  };

  return { incidents, loading, updateIncidentStatus };
}
