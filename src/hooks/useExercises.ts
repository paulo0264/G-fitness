import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Exercise {
  id: string;
  name: string;
  description: string | null;
  muscle_group: string;
  equipment: string | null;
  instructions: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateExerciseData {
  name: string;
  description?: string;
  muscle_group: string;
  equipment?: string;
  instructions?: string;
}

export function useExercises() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setExercises(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar exercícios",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addExercise = async (exerciseData: CreateExerciseData) => {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .insert([exerciseData])
        .select()
        .single();

      if (error) throw error;

      setExercises(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      toast({
        title: "Exercício cadastrado",
        description: "Exercício adicionado com sucesso!",
      });
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao cadastrar exercício",
        description: error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const updateExercise = async (id: string, updates: Partial<CreateExerciseData>) => {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setExercises(prev => prev.map(e => e.id === id ? data : e).sort((a, b) => a.name.localeCompare(b.name)));
      toast({
        title: "Exercício atualizado",
        description: "Dados atualizados com sucesso!",
      });
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar exercício",
        description: error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const deleteExercise = async (id: string) => {
    try {
      const { error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setExercises(prev => prev.filter(e => e.id !== id));
      toast({
        title: "Exercício removido",
        description: "Exercício removido com sucesso!",
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
    fetchExercises();
  }, []);

  return {
    exercises,
    loading,
    addExercise,
    updateExercise,
    deleteExercise,
    refreshExercises: fetchExercises
  };
}