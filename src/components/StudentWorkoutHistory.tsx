import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Dumbbell, TrendingUp, CheckCircle, Target } from 'lucide-react';
import { useWorkoutHistory, WorkoutHistoryEntry } from '@/hooks/useWorkoutHistory';
import { format } from 'date-fns';

interface StudentWorkoutHistoryProps {
  studentId: string;
  studentName: string;
  onBack: () => void;
}

const StudentWorkoutHistory = ({ studentId, studentName, onBack }: StudentWorkoutHistoryProps) => {
  const { history, loading } = useWorkoutHistory(studentId);
  const [selectedEntry, setSelectedEntry] = useState<WorkoutHistoryEntry | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando histórico...</p>
        </div>
      </div>
    );
  }

  if (selectedEntry) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-surface/50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => setSelectedEntry(null)}
                className="hover:bg-surface-hover"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-heading">{selectedEntry.workout_name}</h1>
                <p className="text-caption">
                  Concluído em {format(new Date(selectedEntry.completed_at), "dd/MM/yyyy 'às' HH:mm")}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="space-y-4">
            {selectedEntry.exercises_completed.map((exercise, index) => (
              <Card key={exercise.id || index} className="exercise-card">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-success/10 rounded-full">
                    <CheckCircle className="w-5 h-5 text-success" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{exercise.name}</h3>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>{exercise.sets} séries</span>
                        <span>{exercise.reps} reps</span>
                        {exercise.weight && <span>{exercise.weight}kg</span>}
                        {exercise.rest_time && <span>{exercise.rest_time}s descanso</span>}
                      </div>
                    </div>
                    
                    {exercise.notes && (
                      <p className="text-sm text-muted-foreground bg-muted/20 p-2 rounded mt-2">
                        💡 {exercise.notes}
                      </p>
                    )}
                    
                    {exercise.instructions && (
                      <p className="text-xs text-muted-foreground mt-1">
                        📋 {exercise.instructions}
                      </p>
                    )}
                    
                    {exercise.muscle_group && (
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {exercise.muscle_group}
                        </Badge>
                        {exercise.equipment && (
                          <Badge variant="outline" className="text-xs">
                            {exercise.equipment}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {selectedEntry.notes && (
            <Card className="gym-card mt-6">
              <h3 className="font-semibold mb-2">Observações</h3>
              <p className="text-muted-foreground">{selectedEntry.notes}</p>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-surface/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack} className="hover:bg-surface-hover">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-heading">Histórico de Treinos</h1>
              <p className="text-caption">{studentName}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="gym-card">
            <div className="flex items-center gap-4">
              <div className="bg-success/10 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-caption">Total de Treinos</p>
                <p className="text-2xl font-bold text-success">{history.length}</p>
              </div>
            </div>
          </Card>

          <Card className="gym-card">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-caption">Exercícios Totais</p>
                <p className="text-2xl font-bold">
                  {history.reduce((total, entry) => total + entry.exercises_completed.length, 0)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="gym-card">
            <div className="flex items-center gap-4">
              <div className="bg-warning/10 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-caption">Esta Semana</p>
                <p className="text-2xl font-bold">
                  {history.filter(entry => {
                    const entryDate = new Date(entry.completion_date);
                    const now = new Date();
                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    return entryDate >= weekAgo;
                  }).length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* History List */}
        <div className="space-y-4">
          <h2 className="text-subheading mb-6">Treinos Concluídos</h2>
          
          {history.length === 0 ? (
            <Card className="gym-card text-center py-12">
              <div className="bg-muted/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-muted-foreground mb-2">Nenhum treino concluído ainda</h3>
              <p className="text-caption">
                Seus treinos concluídos aparecerão aqui.
              </p>
            </Card>
          ) : (
            history.map((entry) => (
              <Card 
                key={entry.id} 
                className="gym-card-compact cursor-pointer hover:scale-[1.02] transition-transform"
                onClick={() => setSelectedEntry(entry)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-success/10">
                      <CheckCircle className="w-6 h-6 text-success" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{entry.workout_name}</h3>
                      <p className="text-caption">
                        {entry.workout_type} • {entry.exercises_completed.length} exercícios
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(entry.completed_at), "dd/MM/yyyy 'às' HH:mm")}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <Badge className="status-completed">
                      Concluído
                    </Badge>
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

export default StudentWorkoutHistory;