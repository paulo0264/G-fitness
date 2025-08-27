
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, LogOut, Calendar, CheckCircle, Circle, Clock, Target, TrendingUp, User, Dumbbell, History } from 'lucide-react';
import { useStudentWorkouts, StudentWorkout } from '@/hooks/useStudentWorkouts';
import StudentWorkoutHistory from './StudentWorkoutHistory';

interface StudentDashboardProps {
  student: { id: string; name: string; username: string; age?: number; goal?: string; medical_notes?: string };
  onLogout: () => void;
  onBack: () => void;
}

const StudentDashboard = ({ student, onLogout, onBack }: StudentDashboardProps) => {
  const [selectedWorkout, setSelectedWorkout] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const { workouts, loading, toggleExercise, completeWorkout } = useStudentWorkouts(student.id);

  const completedWorkouts = workouts.filter(workout => workout.completed).length;
  const totalWorkouts = workouts.length;
  const overallProgress = totalWorkouts > 0 ? (completedWorkouts / totalWorkouts) * 100 : 0;

  const currentWorkout = workouts.find(workout => workout.id === selectedWorkout);

  if (showHistory) {
    return (
      <StudentWorkoutHistory 
        studentId={student.id}
        studentName={student.name}
        onBack={() => setShowHistory(false)}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando treinos...</p>
        </div>
      </div>
    );
  }

  if (selectedWorkout && currentWorkout) {
    const completedExercises = currentWorkout.exercises.filter(ex => ex.completed).length;
    const workoutProgress = (completedExercises / currentWorkout.exercises.length) * 100;
    const allExercisesCompleted = completedExercises === currentWorkout.exercises.length;

    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border bg-surface/50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  onClick={() => setSelectedWorkout(null)}
                  className="hover:bg-surface-hover"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <div>
                  <h1 className="text-heading">{currentWorkout.name}</h1>
                  <p className="text-caption">
                    {completedExercises} de {currentWorkout.exercises.length} exercícios concluídos
                  </p>
                </div>
              </div>
              <Badge className={currentWorkout.completed ? 'status-completed' : 'status-pending'}>
                {currentWorkout.completed ? 'Concluído' : 'Pendente'}
              </Badge>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Progress */}
          <Card className="gym-card mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Progresso do Treino</h3>
                <Progress value={workoutProgress} className="h-2" />
                <p className="text-caption mt-1">{Math.round(workoutProgress)}% concluído</p>
              </div>
            </div>
          </Card>

          {/* Exercises */}
          <div className="space-y-4">
            {currentWorkout.exercises.map((exercise) => (
              <Card key={exercise.id} className="exercise-card">
                <div className="flex items-start gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExercise(currentWorkout.id, exercise.id)}
                    className={`p-0 w-8 h-8 rounded-full ${
                      exercise.completed 
                        ? 'text-success hover:text-success/80' 
                        : 'text-muted-foreground hover:text-primary'
                    }`}
                  >
                    {exercise.completed ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <Circle className="w-6 h-6" />
                    )}
                  </Button>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`font-semibold ${exercise.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {exercise.name}
                      </h3>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>{exercise.sets} séries</span>
                        <span>{exercise.reps} reps</span>
                        {exercise.weight && <span>{exercise.weight}kg</span>}
                      </div>
                    </div>
                    
                    {exercise.notes && (
                      <p className="text-sm text-muted-foreground bg-muted/30 p-2 rounded">
                        💡 {exercise.notes}
                      </p>
                    )}
                    
                    {exercise.instructions && (
                      <p className="text-xs text-muted-foreground mt-1">
                        📋 {exercise.instructions}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Complete Workout Button */}
          <div className="mt-8 text-center">
            <Button 
              onClick={() => completeWorkout(currentWorkout.id)}
              disabled={!allExercisesCompleted}
              className={`px-8 ${allExercisesCompleted ? 'btn-gym-primary' : 'opacity-50 cursor-not-allowed'}`}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {allExercisesCompleted ? 'Finalizar Treino' : `Conclua todos os exercícios (${completedExercises}/${currentWorkout.exercises.length})`}
            </Button>
            
            {/* Always show completed exercises count */}
            <p className="text-xs text-muted-foreground mt-2">
              {completedExercises} de {currentWorkout.exercises.length} exercícios concluídos
            </p>
          </div>
        </div>
      </div>
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
                <h1 className="text-heading">Olá, {student.name}!</h1>
                <p className="text-caption">Seus treinos personalizados</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setShowHistory(true)} className="hover:bg-surface-hover">
                <History className="w-4 h-4 mr-2" />
                Histórico
              </Button>
              <Button variant="ghost" onClick={onLogout} className="hover:bg-surface-hover text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="gym-card">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <Dumbbell className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-caption">Treinos Disponíveis</p>
                <p className="text-2xl font-bold">{totalWorkouts}</p>
              </div>
            </div>
          </Card>

          <Card className="gym-card">
            <div className="flex items-center gap-4">
              <div className="bg-success/10 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-caption">Concluídos</p>
                <p className="text-2xl font-bold text-success">{completedWorkouts}</p>
              </div>
            </div>
          </Card>

          <Card className="gym-card">
            <div className="flex items-center gap-4">
              <div className="bg-warning/10 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-caption">Progresso</p>
                <p className="text-2xl font-bold">{Math.round(overallProgress)}%</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Student Info */}
        <Card className="gym-card mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-primary/10 p-3 rounded-lg">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Informações do Aluno</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                {student.age && (
                  <div>
                    <span className="text-muted-foreground">Idade: </span>
                    <span>{student.age} anos</span>
                  </div>
                )}
                {student.goal && (
                  <div>
                    <span className="text-muted-foreground">Objetivo: </span>
                    <span>{student.goal}</span>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Progresso: </span>
                  <span>{Math.round(overallProgress)}% dos treinos</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Workouts */}
        <div className="space-y-4">
          <h2 className="text-subheading mb-6">Seus Treinos</h2>
          
          {workouts.length === 0 ? (
            <Card className="gym-card text-center py-12">
              <div className="bg-muted/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Dumbbell className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-muted-foreground mb-2">Nenhum treino disponível hoje</h3>
              <p className="text-caption">
                Você já concluiu todos os treinos de hoje ou seu instrutor ainda não criou treinos para você. 
                Os treinos concluídos estarão disponíveis novamente amanhã.
              </p>
            </Card>
          ) : (
            workouts.map((workout) => (
              <Card 
                key={workout.id} 
                className="gym-card-compact cursor-pointer hover:scale-[1.02] transition-transform"
                onClick={() => setSelectedWorkout(workout.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      workout.completed ? 'bg-success/10' : 'bg-primary/10'
                    }`}>
                      {workout.completed ? (
                        <CheckCircle className="w-6 h-6 text-success" />
                      ) : (
                        <Dumbbell className="w-6 h-6 text-primary" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold">{workout.name}</h3>
                      <p className="text-caption">
                        {workout.workout_type} • {workout.exercises.length} exercícios
                      </p>
                      {workout.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {workout.description}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <Badge className={workout.completed ? 'status-completed' : 'status-pending'}>
                      {workout.completed ? 'Concluído' : 'Pendente'}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {workout.exercises.filter(ex => ex.completed).length}/{workout.exercises.length} exercícios
                    </p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
