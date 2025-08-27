import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Student {
  id: string;
  user_id: string;
  name: string;
  age: number;
  goal: string;
  medical_notes: string | null;
  active: boolean;
  photo: string | null;
  created_at: string;
  updated_at: string;
  username: string;
  password: string;
}

export interface CreateStudentData {
  name: string;
  age: number;
  goal: string;
  medical_notes?: string;
  active?: boolean;
  photo?: string;
  username: string;
  password: string;
}

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStudents(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar alunos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addStudent = async (studentData: CreateStudentData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('students')
        .insert([{
          ...studentData,
          user_id: user.id,
          medical_notes: studentData.medical_notes || null,
          active: studentData.active ?? true,
          username: studentData.username,
          password: studentData.password
        }])
        .select()
        .single();

      if (error) throw error;

      setStudents(prev => [data, ...prev]);
      toast({
        title: "Aluno cadastrado",
        description: "Aluno adicionado com sucesso!",
      });
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao cadastrar aluno",
        description: error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const updateStudent = async (id: string, updates: Partial<CreateStudentData>) => {
    try {
      const { data, error } = await supabase
        .from('students')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setStudents(prev => prev.map(s => s.id === id ? data : s));
      toast({
        title: "Aluno atualizado",
        description: "Dados atualizados com sucesso!",
      });
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar aluno",
        description: error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const deleteStudent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setStudents(prev => prev.filter(s => s.id !== id));
      toast({
        title: "Aluno removido",
        description: "Aluno removido com sucesso!",
      });
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao remover aluno",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const toggleStudentStatus = async (id: string) => {
    try {
      const student = students.find(s => s.id === id);
      if (!student) throw new Error('Aluno não encontrado');

      const { data, error } = await supabase
        .from('students')
        .update({ active: !student.active })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setStudents(prev => prev.map(s => s.id === id ? data : s));
      toast({
        title: `Aluno ${data.active ? 'ativado' : 'desativado'}`,
        description: "Status atualizado com sucesso!",
      });
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao alterar status",
        description: error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return {
    students,
    loading,
    addStudent,
    updateStudent,
    deleteStudent,
    toggleStudentStatus,
    refreshStudents: fetchStudents
  };
}