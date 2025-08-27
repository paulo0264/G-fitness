import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { ArrowLeft, Plus, Search, Dumbbell, Calendar, User, Edit, Trash2, Eye, Clock } from 'lucide-react';
import { useWorkouts } from '@/hooks/useWorkouts';
import { useExercises } from '@/hooks/useExercises';
import type { Student } from '@/hooks/useStudents';
import WorkoutForm from './WorkoutForm';
import WorkoutDetails from './WorkoutDetails';

interface WorkoutManagerProps {
  onBack: () => void;
  students: Student[];
}

const WorkoutManager = ({ onBack, students }: WorkoutManagerProps) => {
  const { workouts, loading: workoutsLoading, deleteWorkout } = useWorkouts();
  const { exercises, loading: exercisesLoading } = useExercises();
  const [showWorkoutForm, setShowWorkoutForm] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Reset to first page when search changes - MUST be before any conditional returns
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  if (workoutsLoading || exercisesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const filteredWorkouts = workouts.filter(workout => {
    const student = students.find(s => s.id === workout.student_id);
    const studentName = student?.name || '';
    return workout.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           workout.workout_type.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Pagination logic for workouts
  const totalPages = Math.ceil(filteredWorkouts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedWorkouts = filteredWorkouts.slice(startIndex, endIndex);

  const handleDeleteWorkout = async (id: string) => {
    await deleteWorkout(id);
  };

  if (showWorkoutForm) {
    return (
      <WorkoutForm 
        onBack={() => setShowWorkoutForm(false)}
        students={students}
        exercises={exercises}
      />
    );
  }

  if (selectedWorkout) {
    return (
      <WorkoutDetails 
        workout={selectedWorkout}
        student={students.find(s => s.id === selectedWorkout.student_id)}
        onBack={() => setSelectedWorkout(null)}
        exercises={exercises}
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
                <h1 className="text-heading">Gerenciar Treinos</h1>
                <p className="text-caption">Crie e gerencie treinos semanais para seus alunos</p>
              </div>
            </div>
            <Button onClick={() => setShowWorkoutForm(true)} className="btn-gym-primary">
              <Plus className="w-4 h-4 mr-2" />
              Novo Treino
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="gym-card">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <Dumbbell className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-caption">Total de Treinos</p>
                <p className="text-2xl font-bold">{workouts.length}</p>
              </div>
            </div>
          </Card>

          <Card className="gym-card">
            <div className="flex items-center gap-4">
              <div className="bg-success/10 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-caption">Treinos Ativos</p>
                <p className="text-2xl font-bold text-success">{workouts.filter(w => w.active).length}</p>
              </div>
            </div>
          </Card>

          <Card className="gym-card">
            <div className="flex items-center gap-4">
              <div className="bg-warning/10 p-3 rounded-lg">
                <User className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-caption">Alunos com Treino</p>
                <p className="text-2xl font-bold">{new Set(workouts.map(w => w.student_id)).size}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar treinos por nome, aluno ou tipo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-surface border-border"
          />
        </div>

        {/* Workouts Table */}
        <div className="bg-surface rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Nome do Treino</TableHead>
                <TableHead>Aluno</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Exercícios</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedWorkouts.map((workout) => {
                const student = students.find(s => s.id === workout.student_id);
                const exerciseCount = workout.workout_exercises?.length || 0;
                
                return (
                  <TableRow key={workout.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{workout.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span>{student?.name || 'Aluno não encontrado'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dumbbell className="w-4 h-4 text-muted-foreground" />
                        <span>{workout.workout_type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{exerciseCount} exercício{exerciseCount !== 1 ? 's' : ''}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={workout.active ? 'status-completed' : 'status-pending'}>
                        {workout.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      {workout.description ? (
                        <p className="text-xs text-muted-foreground truncate" title={workout.description}>
                          {workout.description}
                        </p>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 justify-end">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => setSelectedWorkout(workout)}
                          className="h-8 w-8 p-0 hover:bg-surface-hover"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleDeleteWorkout(workout.id)}
                          className="h-8 w-8 p-0 hover:bg-destructive/10 text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) setCurrentPage(currentPage - 1);
                    }}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(page);
                      }}
                      isActive={currentPage === page}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                    }}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {filteredWorkouts.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Dumbbell className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-subheading mb-4">
              {searchTerm ? 'Nenhum treino encontrado' : 'Nenhum treino criado ainda'}
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              {searchTerm 
                ? 'Tente ajustar sua busca ou limpar os filtros'
                : 'Crie o primeiro treino para começar a organizar os exercícios dos seus alunos.'
              }
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowWorkoutForm(true)} className="btn-gym-primary">
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Treino
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutManager;