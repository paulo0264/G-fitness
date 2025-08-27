import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, X, Dumbbell, Save } from 'lucide-react';
import { useWorkouts } from '@/hooks/useWorkouts';
import type { Student } from '@/hooks/useStudents';
import type { Exercise } from '@/hooks/useExercises';
import ExerciseSelector from './ExerciseSelector';

interface WorkoutFormProps {
  onBack: () => void;
  students: Student[];
  exercises: Exercise[];
  preselectedStudentId?: string;
}

interface WorkoutExerciseData {
  exercise_id: string;
  exercise?: Exercise;
  sets: number;
  reps: string;
  weight?: number;
  rest_time?: number;
  notes?: string;
  order_index: number;
}

const WorkoutForm = ({ onBack, students, exercises, preselectedStudentId }: WorkoutFormProps) => {
  const { addWorkout } = useWorkouts();
  const [loading, setLoading] = useState(false);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  
  const [formData, setFormData] = useState({
    student_id: preselectedStudentId || '',
    name: '',
    description: '',
    workout_type: '',
    active: true
  });

  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExerciseData[]>([]);

  const workoutTypes = [
    'Treino A - Superior',
    'Treino B - Inferior',
    'Treino C - Push',
    'Treino D - Pull',
    'Treino E - Pernas',
    'Cardio',
    'Funcional',
    'Personalizado'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.student_id || !formData.name || !formData.workout_type) return;

    setLoading(true);
    
    const exercisesData = workoutExercises.map((ex, index) => ({
      exercise_id: ex.exercise_id,
      sets: ex.sets,
      reps: ex.reps,
      weight: ex.weight || null,
      rest_time: ex.rest_time || 60,
      notes: ex.notes || null,
      order_index: index
    }));

    const { error } = await addWorkout(formData, exercisesData);
    
    if (!error) {
      onBack();
    }
    
    setLoading(false);
  };

  const addExerciseToWorkout = (exercise: Exercise) => {
    const newExercise: WorkoutExerciseData = {
      exercise_id: exercise.id,
      exercise,
      sets: 3,
      reps: '8-12',
      weight: 0,
      rest_time: 60,
      notes: '',
      order_index: workoutExercises.length
    };
    
    setWorkoutExercises([...workoutExercises, newExercise]);
    setShowExerciseSelector(false);
  };

  const removeExercise = (index: number) => {
    setWorkoutExercises(workoutExercises.filter((_, i) => i !== index));
  };

  const updateExercise = (index: number, field: keyof WorkoutExerciseData, value: any) => {
    const updated = [...workoutExercises];
    updated[index] = { ...updated[index], [field]: value };
    setWorkoutExercises(updated);
  };

  if (showExerciseSelector) {
    return (
      <ExerciseSelector
        exercises={exercises}
        onBack={() => setShowExerciseSelector(false)}
        onSelect={addExerciseToWorkout}
        selectedExercises={workoutExercises.map(we => we.exercise_id)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-surface/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={onBack} className="hover:bg-surface-hover">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-heading">Criar Novo Treino</h1>
                <p className="text-caption">Configure um treino personalizado para o aluno</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
          {/* Basic Info */}
          <Card className="gym-card">
            <h2 className="text-subheading mb-6">Informações Básicas</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="student">Aluno *</Label>
                <Select
                  value={formData.student_id}
                  onValueChange={(value) => setFormData({ ...formData, student_id: value })}
                >
                  <SelectTrigger className="bg-surface border-border">
                    <SelectValue placeholder="Selecione um aluno" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name} - {student.goal}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="workout_type">Tipo de Treino *</Label>
                <Select
                  value={formData.workout_type}
                  onValueChange={(value) => setFormData({ ...formData, workout_type: value })}
                >
                  <SelectTrigger className="bg-surface border-border">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {workoutTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nome do Treino *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Treino A - Peito e Tríceps"
                  className="bg-surface border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição opcional do treino..."
                  className="bg-surface border-border"
                  rows={3}
                />
              </div>
            </div>
          </Card>

          {/* Exercises */}
          <Card className="gym-card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-subheading">Exercícios do Treino</h2>
              <Button
                type="button"
                onClick={() => setShowExerciseSelector(true)}
                className="btn-gym-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Exercício
              </Button>
            </div>

            {workoutExercises.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
                <Dumbbell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Nenhum exercício adicionado</h3>
                <p className="text-caption mb-4">Adicione exercícios para montar o treino</p>
                <Button
                  type="button"
                  onClick={() => setShowExerciseSelector(true)}
                  variant="ghost"
                  className="hover:bg-surface-hover"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Primeiro Exercício
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {workoutExercises.map((workoutExercise, index) => (
                  <div key={index} className="exercise-card">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-primary">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold">{workoutExercise.exercise?.name}</h4>
                          <p className="text-caption">{workoutExercise.exercise?.muscle_group}</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExercise(index)}
                        className="hover:bg-destructive/10 text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label>Séries</Label>
                        <Input
                          type="number"
                          value={workoutExercise.sets}
                          onChange={(e) => updateExercise(index, 'sets', parseInt(e.target.value) || 0)}
                          className="bg-surface border-border"
                          min="1"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Repetições</Label>
                        <Input
                          value={workoutExercise.reps}
                          onChange={(e) => updateExercise(index, 'reps', e.target.value)}
                          placeholder="8-12"
                          className="bg-surface border-border"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Peso (kg)</Label>
                        <Input
                          type="number"
                          value={workoutExercise.weight || ''}
                          onChange={(e) => updateExercise(index, 'weight', parseFloat(e.target.value) || 0)}
                          className="bg-surface border-border"
                          step="0.5"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Descanso (seg)</Label>
                        <Input
                          type="number"
                          value={workoutExercise.rest_time || 60}
                          onChange={(e) => updateExercise(index, 'rest_time', parseInt(e.target.value) || 60)}
                          className="bg-surface border-border"
                          step="30"
                        />
                      </div>
                    </div>

                    {workoutExercise.exercise?.instructions && (
                      <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          <strong>Instruções:</strong> {workoutExercise.exercise.instructions}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Actions */}
          <div className="flex gap-4 justify-end">
            <Button type="button" variant="ghost" onClick={onBack} className="hover:bg-surface-hover">
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !formData.student_id || !formData.name || !formData.workout_type}
              className="btn-gym-primary"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Salvar Treino
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkoutForm;