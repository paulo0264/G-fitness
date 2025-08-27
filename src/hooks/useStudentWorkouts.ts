import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface StudentExercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight?: number;
  rest_time?: number;
  notes?: string;
  completed: boolean;
  exercise_id: string;
  muscle_group?: string;
  equipment?: string;
  instructions?: string;
}

export interface StudentWorkout {
  id: string;
  name: string;
  description?: string;
  workout_type: string;
  exercises: StudentExercise[];
  completed: boolean;
}

export function useStudentWorkouts(studentId: string) {
  const [workouts, setWorkouts] = useState<StudentWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchWorkouts = async () => {
    if (!studentId) return;
    
    try {
      setLoading(true);
      
      // Check which workouts were completed today
      const today = new Date().toISOString().split('T')[0];
      const { data: completedToday } = await supabase
        .from('workout_history')
        .select('workout_id')
        .eq('student_id', studentId)
        .eq('completion_date', today);
      
      const completedWorkoutIds = completedToday?.map(h => h.workout_id) || [];
      
      // Fetch workouts for the student, excluding those completed today
      const { data: workoutsData, error: workoutsError } = await supabase
        .from('workouts')
        .select('*')
        .eq('student_id', studentId)
        .eq('active', true)
        .not('id', 'in', `(${completedWorkoutIds.length > 0 ? completedWorkoutIds.map(id => `"${id}"`).join(',') : '""'})`)
        .order('created_at', { ascending: true });

      if (workoutsError) throw workoutsError;

      if (!workoutsData || workoutsData.length === 0) {
        setWorkouts([]);
        return;
      }

      // Fetch workout exercises with exercise details
      const workoutIds = workoutsData.map(w => w.id);
      const { data: exercisesData, error: exercisesError } = await supabase
        .from('workout_exercises')
        .select(`
          *,
          exercises (
            name,
            muscle_group,
            equipment,
            instructions,
            description
          )
        `)
        .in('workout_id', workoutIds)
        .order('order_index', { ascending: true });

      if (exercisesError) throw exercisesError;

      // Group exercises by workout
      const workoutsWithExercises = workoutsData.map(workout => {
        const workoutExercises = exercisesData?.filter(ex => ex.workout_id === workout.id) || [];
        
        return {
          id: workout.id,
          name: workout.name,
          description: workout.description,
          workout_type: workout.workout_type,
          completed: false, // We'll track this locally for now
          exercises: workoutExercises.map(ex => ({
            id: ex.id,
            name: ex.exercises?.name || 'Exercício',
            sets: ex.sets,
            reps: ex.reps,
            weight: ex.weight,
            rest_time: ex.rest_time,
            notes: ex.notes,
            completed: false, // We'll track this locally for now
            exercise_id: ex.exercise_id,
            muscle_group: ex.exercises?.muscle_group,
            equipment: ex.exercises?.equipment,
            instructions: ex.exercises?.instructions
          }))
        };
      });

      setWorkouts(workoutsWithExercises);
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

  const toggleExercise = (workoutId: string, exerciseId: string) => {
    setWorkouts(prev => prev.map(workout => {
      if (workout.id === workoutId) {
        const updatedExercises = workout.exercises.map(exercise => 
          exercise.id === exerciseId 
            ? { ...exercise, completed: !exercise.completed }
            : exercise
        );
        
        const allCompleted = updatedExercises.every(ex => ex.completed);
        
        return {
          ...workout,
          exercises: updatedExercises,
          completed: allCompleted
        };
      }
      return workout;
    }));
  };

  const completeWorkout = async (workoutId: string) => {
    try {
      const workout = workouts.find(w => w.id === workoutId);
      if (!workout) return;

      // Save workout completion to history
      const { error } = await supabase
        .from('workout_history')
        .insert([{
          student_id: studentId,
          workout_id: workoutId,
          exercises_completed: workout.exercises.map(ex => ({
            id: ex.id,
            exercise_id: ex.exercise_id,
            name: ex.name,
            sets: ex.sets,
            reps: ex.reps,
            weight: ex.weight,
            rest_time: ex.rest_time,
            notes: ex.notes,
            muscle_group: ex.muscle_group,
            equipment: ex.equipment,
            instructions: ex.instructions,
            completed: true,
            completion_time: new Date().toISOString()
          })),
          notes: `Treino ${workout.name} concluído com ${workout.exercises.length} exercícios`
        }]);

      if (error) throw error;

      // Update local state
      setWorkouts(prev => prev.map(w => {
        if (w.id === workoutId) {
          return {
            ...w,
            exercises: w.exercises.map(ex => ({ ...ex, completed: true })),
            completed: true
          };
        }
        return w;
      }));

      // Remove completed workout from list after a short delay
      setTimeout(() => {
        setWorkouts(prev => prev.filter(w => w.id !== workoutId));
      }, 2000);

      toast({
        title: "Treino concluído! 🎉",
        description: "Parabéns! Este treino estará disponível novamente amanhã.",
      });

    } catch (error: any) {
      toast({
        title: "Erro ao finalizar treino",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, [studentId]);

  return {
    workouts,
    loading,
    toggleExercise,
    completeWorkout,
    refreshWorkouts: fetchWorkouts
  };
}