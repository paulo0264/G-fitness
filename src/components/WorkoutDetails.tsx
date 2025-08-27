import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Dumbbell, Clock, Weight, RotateCcw, User, Calendar, Info } from 'lucide-react';
import type { Workout } from '@/hooks/useWorkouts';
import type { Student } from '@/hooks/useStudents';
import type { Exercise } from '@/hooks/useExercises';

interface WorkoutDetailsProps {
  workout: Workout;
  student: Student | undefined;
  onBack: () => void;
  exercises: Exercise[];
}

const WorkoutDetails = ({ workout, student, onBack, exercises }: WorkoutDetailsProps) => {
  const [activeTab, setActiveTab] = useState<'exercises' | 'info'>('exercises');

  const totalExercises = workout.workout_exercises?.length || 0;
  const totalSets = workout.workout_exercises?.reduce((acc, we) => acc + we.sets, 0) || 0;
  
  // Estimated workout duration (2 minutes per set + rest time)
  const estimatedDuration = workout.workout_exercises?.reduce((acc, we) => {
    const exerciseTime = we.sets * 2; // 2 minutes per set
    const restTime = ((we.rest_time || 60) * (we.sets - 1)) / 60; // rest time in minutes
    return acc + exerciseTime + restTime;
  }, 0) || 0;

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
                <h1 className="text-heading">{workout.name}</h1>
                <p className="text-caption">
                  {student?.name || 'Aluno não encontrado'} • {workout.workout_type}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={workout.active ? 'status-completed' : 'status-pending'}>
                {workout.active ? 'Ativo' : 'Inativo'}
              </Badge>
              <Button variant="ghost" className="hover:bg-surface-hover">
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="gym-card-compact">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Dumbbell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-caption">Exercícios</p>
                <p className="text-xl font-bold">{totalExercises}</p>
              </div>
            </div>
          </Card>

          <Card className="gym-card-compact">
            <div className="flex items-center gap-3">
              <div className="bg-success/10 p-2 rounded-lg">
                <Weight className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-caption">Total de Séries</p>
                <p className="text-xl font-bold">{totalSets}</p>
              </div>
            </div>
          </Card>

          <Card className="gym-card-compact">
            <div className="flex items-center gap-3">
              <div className="bg-warning/10 p-2 rounded-lg">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-caption">Duração Estimada</p>
                <p className="text-xl font-bold">{Math.round(estimatedDuration)}min</p>
              </div>
            </div>
          </Card>

          <Card className="gym-card-compact">
            <div className="flex items-center gap-3">
              <div className="bg-muted/30 p-2 rounded-lg">
                <Calendar className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-caption">Criado em</p>
                <p className="text-sm font-medium">
                  {new Date(workout.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'exercises' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('exercises')}
            className={activeTab === 'exercises' ? 'btn-gym-primary' : 'hover:bg-surface-hover'}
          >
            <Dumbbell className="w-4 h-4 mr-2" />
            Exercícios
          </Button>
          <Button
            variant={activeTab === 'info' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('info')}
            className={activeTab === 'info' ? 'btn-gym-primary' : 'hover:bg-surface-hover'}
          >
            <Info className="w-4 h-4 mr-2" />
            Informações
          </Button>
        </div>

        {/* Content */}
        {activeTab === 'exercises' && (
          <div className="space-y-6">
            {workout.workout_exercises && workout.workout_exercises.length > 0 ? (
              workout.workout_exercises
                .sort((a, b) => a.order_index - b.order_index)
                .map((workoutExercise, index) => {
                  const exercise = exercises.find(ex => ex.id === workoutExercise.exercise_id) || workoutExercise.exercise;
                  
                  return (
                    <Card key={workoutExercise.id} className="exercise-card">
                      <div className="flex items-start gap-4">
                        <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-primary">
                          {index + 1}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="font-semibold text-lg">{exercise?.name || 'Exercício não encontrado'}</h3>
                              <Badge variant="secondary" className="mt-1">
                                {exercise?.muscle_group || 'N/A'}
                              </Badge>
                            </div>
                          </div>

                          {/* Exercise parameters */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="bg-muted/30 p-3 rounded-lg text-center">
                              <div className="flex items-center justify-center gap-2 mb-1">
                                <Weight className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm font-medium">Séries</span>
                              </div>
                              <p className="text-xl font-bold">{workoutExercise.sets}</p>
                            </div>

                            <div className="bg-muted/30 p-3 rounded-lg text-center">
                              <div className="flex items-center justify-center gap-2 mb-1">
                                <RotateCcw className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm font-medium">Repetições</span>
                              </div>
                              <p className="text-xl font-bold">{workoutExercise.reps}</p>
                            </div>

                            {workoutExercise.weight && (
                              <div className="bg-muted/30 p-3 rounded-lg text-center">
                                <div className="flex items-center justify-center gap-2 mb-1">
                                  <Dumbbell className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm font-medium">Peso</span>
                                </div>
                                <p className="text-xl font-bold">{workoutExercise.weight}kg</p>
                              </div>
                            )}

                            <div className="bg-muted/30 p-3 rounded-lg text-center">
                              <div className="flex items-center justify-center gap-2 mb-1">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm font-medium">Descanso</span>
                              </div>
                              <p className="text-xl font-bold">{workoutExercise.rest_time || 60}s</p>
                            </div>
                          </div>

                          {/* Exercise instructions */}
                          {exercise?.instructions && (
                            <div className="bg-surface p-4 rounded-lg">
                              <h4 className="font-medium mb-2">Instruções:</h4>
                              <p className="text-sm text-muted-foreground">{exercise.instructions}</p>
                            </div>
                          )}

                          {/* Workout exercise notes */}
                          {workoutExercise.notes && (
                            <div className="bg-warning/10 p-3 rounded-lg mt-3">
                              <h4 className="font-medium mb-1 text-warning">Observações:</h4>
                              <p className="text-sm">{workoutExercise.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })
            ) : (
              <div className="text-center py-16">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Dumbbell className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-subheading mb-4">Nenhum exercício no treino</h2>
                <p className="text-muted-foreground">Este treino ainda não possui exercícios configurados.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'info' && (
          <div className="max-w-2xl">
            <Card className="gym-card">
              <h2 className="text-subheading mb-6">Informações do Treino</h2>
              
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Aluno
                    </h3>
                    <p className="text-muted-foreground">{student?.name || 'N/A'}</p>
                    {student?.goal && (
                      <p className="text-sm text-muted-foreground mt-1">Objetivo: {student.goal}</p>
                    )}
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Tipo de Treino</h3>
                    <Badge variant="secondary">{workout.workout_type}</Badge>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Status</h3>
                    <Badge className={workout.active ? 'status-completed' : 'status-pending'}>
                      {workout.active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Data de Criação</h3>
                    <p className="text-muted-foreground">
                      {new Date(workout.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                {workout.description && (
                  <div>
                    <h3 className="font-semibold mb-2">Descrição</h3>
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <p className="text-muted-foreground">{workout.description}</p>
                    </div>
                  </div>
                )}

                {/* Student medical notes */}
                {student?.medical_notes && (
                  <div>
                    <h3 className="font-semibold mb-2 text-warning">Observações Médicas do Aluno</h3>
                    <div className="bg-warning/10 p-4 rounded-lg border border-warning/20">
                      <p className="text-sm">{student.medical_notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutDetails;