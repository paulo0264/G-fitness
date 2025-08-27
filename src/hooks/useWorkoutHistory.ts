import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface WorkoutHistoryEntry {
  id: string;
  student_id: string;
  workout_id: string;
  completed_at: string;
  completion_date: string;
  exercises_completed: any[];
  notes?: string;
  workout_name?: string;
  workout_type?: string;
  student_name?: string;
}

export function useWorkoutHistory(studentId?: string) {
  const [history, setHistory] = useState<WorkoutHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchHistory = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('workout_history')
        .select('*')
        .order('completed_at', { ascending: false });

      if (studentId) {
        query = query.eq('student_id', studentId);
      }

      const { data: historyData, error } = await query;

      if (error) throw error;

      if (!historyData || historyData.length === 0) {
        setHistory([]);
        return;
      }

      // Get unique workout and student IDs
      const workoutIds = [...new Set(historyData.map(h => h.workout_id))];
      const studentIds = [...new Set(historyData.map(h => h.student_id))];

      // Fetch workout names and types
      const { data: workoutsData } = await supabase
        .from('workouts')
        .select('id, name, workout_type')
        .in('id', workoutIds);

      // Fetch student names
      const { data: studentsData } = await supabase
        .from('students')
        .select('id, name')
        .in('id', studentIds);

      // Combine the data
      const formattedHistory = historyData.map(entry => ({
        ...entry,
        exercises_completed: Array.isArray(entry.exercises_completed) 
          ? entry.exercises_completed 
          : [],
        workout_name: workoutsData?.find(w => w.id === entry.workout_id)?.name || 'Treino',
        workout_type: workoutsData?.find(w => w.id === entry.workout_id)?.workout_type || 'Treino',
        student_name: studentsData?.find(s => s.id === entry.student_id)?.name || 'Aluno'
      }));

      setHistory(formattedHistory);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar histórico",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [studentId]);

  return {
    history,
    loading,
    refreshHistory: fetchHistory
  };
}