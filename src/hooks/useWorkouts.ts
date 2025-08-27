import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Exercise } from './useExercises';

export interface WorkoutExercise {
  id: string;
  workout_id: string;
  exercise_id: string;
  sets: number;
  reps: string;
  weight: number | null;
  rest_time: number | null;
  notes: string | null;
  order_index: number;
  exercise?: Exercise;
}

export interface Workout {
  id: string;
  student_id: string;
  name: string;
  description: string | null;
  workout_type: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  workout_exercises?: WorkoutExercise[];
}

export interface CreateWorkoutData {
  student_id: string;
  name: string;
  description?: string;
  workout_type: string;
  active?: boolean;
}

export interface CreateWorkoutExerciseData {
  exercise_id: string;
  sets: number;
  reps: string;
  weight?: number;
  rest_time?: number;
  notes?: string;
  order_index: number;
}

export function useWorkouts() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchWorkouts = async (studentId?: string) => {
    try {
      setLoading(true);
      let query = supabase
        .from('workouts')
        .select(`
          *,
          workout_exercises(
            *,
            exercise:exercises(*)
          )
        `)
        .order('created_at', { ascending: false });

      if (studentId) {
        query = query.eq('student_id', studentId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setWorkouts(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar treinos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addWorkout = async (workoutData: CreateWorkoutData, exercises: CreateWorkoutExerciseData[] = []) => {
    try {
      const { data: workout, error: workoutError } = await supabase
        .from('workouts')
        .insert([{
          ...workoutData,
          active: workoutData.active ?? true
        }])
        .select()
        .single();

      if (workoutError) throw workoutError;

      // Add exercises to workout if provided
      if (exercises.length > 0) {
        const exercisesWithWorkoutId = exercises.map(ex => ({
          ...ex,
          workout_id: workout.id
        }));

        const { error: exercisesError } = await supabase
          .from('workout_exercises')
          .insert(exercisesWithWorkoutId);

        if (exercisesError) throw exercisesError;
      }

      await fetchWorkouts();
      toast({
        title: "Treino criado",
        description: "Treino adicionado com sucesso!",
      });
      return { data: workout, error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao criar treino",
        description: error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const updateWorkout = async (id: string, updates: Partial<CreateWorkoutData>) => {
    try {
      const { data, error } = await supabase
        .from('workouts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setWorkouts(prev => prev.map(w => w.id === id ? { ...w, ...data } : w));
      toast({
        title: "Treino atualizado",
        description: "Dados atualizados com sucesso!",
      });
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar treino",
        description: error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const deleteWorkout = async (id: string) => {
    try {
      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setWorkouts(prev => prev.filter(w => w.id !== id));
      toast({
        title: "Treino removido",
        description: "Treino removido com sucesso!",
      });
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao remover treino",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const addExerciseToWorkout = async (workoutId: string, exerciseData: CreateWorkoutExerciseData) => {
    try {
      const { data, error } = await supabase
        .from('workout_exercises')
        .insert([{
          ...exerciseData,
          workout_id: workoutId
        }])
        .select(`
          *,
          exercise:exercises(*)
        `)
        .single();

      if (error) throw error;

      setWorkouts(prev => prev.map(w => {
        if (w.id === workoutId) {
          return {
            ...w,
            workout_exercises: [...(w.workout_exercises || []), data]
          };
        }
        return w;
      }));

      toast({
        title: "Exercício adicionado",
        description: "Exercício adicionado ao treino!",
      });
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar exercício",
        description: error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const removeExerciseFromWorkout = async (workoutExerciseId: string) => {
    try {
      const { error } = await supabase
        .from('workout_exercises')
        .delete()
        .eq('id', workoutExerciseId);

      if (error) throw error;

      setWorkouts(prev => prev.map(w => ({
        ...w,
        workout_exercises: w.workout_exercises?.filter(we => we.id !== workoutExerciseId)
      })));

      toast({
        title: "Exercício removido",
        description: "Exercício removido do treino!",
      });
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao remover exercício",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  return {
    workouts,
    loading,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    addExerciseToWorkout,
    removeExerciseFromWorkout,
    refreshWorkouts: fetchWorkouts
  };
}