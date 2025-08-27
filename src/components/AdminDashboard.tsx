
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { ArrowLeft, Plus, Search, Users, Dumbbell, Calendar, User, Edit, Trash2, Eye, LogOut, Clock, Power } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useStudents, type Student } from '@/hooks/useStudents';
import { useWorkouts } from '@/hooks/useWorkouts';
import { useExercises } from '@/hooks/useExercises';
import StudentForm from './StudentForm';
import WorkoutManager from './WorkoutManager';
import WorkoutForm from './WorkoutForm';
import StudentDetails from './StudentDetails';
import { WorkoutHistory } from './WorkoutHistory';

type TabType = 'students' | 'workouts' | 'history';

interface AdminDashboardProps {
  onBack: () => void;
}

const AdminDashboard = ({ onBack }: AdminDashboardProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('students');
  const { toast } = useToast();
  const { students, loading, addStudent, deleteStudent, toggleStudentStatus, updateStudent } = useStudents();
  const { workouts } = useWorkouts();
  const { exercises } = useExercises();
  
  const isActiveTab = (tab: TabType) => activeTab === tab;
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [selectedStudentForWorkout, setSelectedStudentForWorkout] = useState<Student | null>(null);
  const [showStudentWorkoutHistory, setShowStudentWorkoutHistory] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.goal.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic for students
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, endIndex);

  // Reset to first page when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const activeStudents = students.filter(s => s.active).length;
  const totalStudents = students.length;

  const handleAddStudent = async (studentData: any) => {
    const { error } = await addStudent(studentData);
    if (!error) {
      setShowStudentForm(false);
    }
  };

  const handleEditStudent = async (studentData: any) => {
    if (!editingStudent) return;
    const { error } = await updateStudent(editingStudent.id, studentData);
    if (!error) {
      setEditingStudent(null);
    }
  };

  const handleDeleteStudent = async (id: string) => {
    await deleteStudent(id);
  };

  const handleToggleStatus = async (id: string) => {
    await toggleStudentStatus(id);
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
      window.location.href = '/';
    } catch (error: any) {
      toast({
        title: "Erro ao fazer logout",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (showStudentForm) {
    return (
      <StudentForm 
        onBack={() => setShowStudentForm(false)}
        onSave={handleAddStudent}
      />
    );
  }

  if (editingStudent) {
    return (
      <StudentForm 
        onBack={() => setEditingStudent(null)}
        onSave={handleEditStudent}
        student={editingStudent}
        isEditing={true}
      />
    );
  }

  if (selectedStudent) {
    return (
      <StudentDetails 
        student={selectedStudent}
        onBack={() => setSelectedStudent(null)}
      />
    );
  }

  if (selectedStudentForWorkout) {
    return (
      <WorkoutForm 
        onBack={() => setSelectedStudentForWorkout(null)}
        students={students}
        exercises={exercises}
        preselectedStudentId={selectedStudentForWorkout.id}
      />
    );
  }

  if (showStudentWorkoutHistory) {    
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-surface/50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => setShowStudentWorkoutHistory(null)} className="hover:bg-surface-hover">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-heading">Histórico de Treinos - {showStudentWorkoutHistory.name}</h1>
                <p className="text-caption">Visualize o histórico de treinos concluídos por este aluno</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <WorkoutHistory studentId={showStudentWorkoutHistory.id} />
        </div>
      </div>
    );
  }

  if (activeTab === 'workouts') {
    return (
      <WorkoutManager 
        onBack={() => setActiveTab('students')}
        students={students.filter(s => s.active)}
      />
    );
  }

  if (activeTab === 'history') {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-surface/50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => setActiveTab('students')} className="hover:bg-surface-hover">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-heading">Histórico Geral de Treinos</h1>
                <p className="text-caption">Visualize todos os treinos concluídos pelos alunos</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <WorkoutHistory />
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
                <h1 className="text-heading">Painel do Administrador</h1>
                <p className="text-caption">Gerencie alunos e treinos da academia</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={() => setActiveTab('students')}
                variant={isActiveTab('students') ? 'default' : 'ghost'}
                className={isActiveTab('students') ? 'btn-gym-primary' : 'hover:bg-surface-hover'}
              >
                <Users className="w-4 h-4 mr-2" />
                Alunos
              </Button>
              <Button
                onClick={() => setActiveTab('workouts')}
                variant={isActiveTab('workouts') ? 'default' : 'ghost'}
                className={isActiveTab('workouts') ? 'btn-gym-primary' : 'hover:bg-surface-hover'}
              >
                <Dumbbell className="w-4 h-4 mr-2" />
                Treinos
              </Button>
              <Button
                onClick={() => setActiveTab('history')}
                variant={isActiveTab('history') ? 'default' : 'ghost'}
                className={isActiveTab('history') ? 'btn-gym-primary' : 'hover:bg-surface-hover'}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Histórico
              </Button>
              <Button
                onClick={handleSignOut}
                variant="ghost"
                className="hover:bg-destructive/10 text-destructive ml-2"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card className="gym-card">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-caption">Total de Alunos</p>
                    <p className="text-2xl font-bold">{totalStudents}</p>
                  </div>
                </div>
              </Card>

              <Card className="gym-card">
                <div className="flex items-center gap-4">
                  <div className="bg-success/10 p-3 rounded-lg">
                    <User className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <p className="text-caption">Alunos Ativos</p>
                    <p className="text-2xl font-bold text-success">{activeStudents}</p>
                  </div>
                </div>
              </Card>

              <Card className="gym-card">
                <div className="flex items-center gap-4">
                  <div className="bg-warning/10 p-3 rounded-lg">
                    <Calendar className="w-6 h-6 text-warning" />
                  </div>
                  <div>
                    <p className="text-caption">Treinos Criados</p>
                    <p className="text-2xl font-bold">{workouts.length}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Students Section */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-subheading">Lista de Alunos</h2>
                <Button onClick={() => setShowStudentForm(true)} className="btn-gym-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Aluno
                </Button>
              </div>

              {/* Search */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar alunos por nome ou objetivo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-surface border-border"
                />
              </div>

              {/* Students Table */}
              <div className="bg-surface rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Idade</TableHead>
                      <TableHead>Objetivo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Observações</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedStudents.map((student) => (
                      <TableRow key={student.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>{student.age} anos</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Dumbbell className="w-4 h-4 text-muted-foreground" />
                            <span>{student.goal}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={student.active ? 'status-completed' : 'status-pending'}>
                            {student.active ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          {student.medical_notes ? (
                            <p className="text-xs text-muted-foreground truncate" title={student.medical_notes}>
                              {student.medical_notes}
                            </p>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 justify-end">
                            {/* <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => setSelectedStudent(student)}
                              className="h-8 w-8 p-0 hover:bg-surface-hover"
                              title="Ver detalhes"
                            >
                              <Eye className="w-4 h-4" />
                            </Button> */}
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => setSelectedStudentForWorkout(student)}
                              className="h-8 w-8 p-0 hover:bg-primary/10 text-primary"
                              title="Elaborar treino"
                            >
                              <Dumbbell className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => setShowStudentWorkoutHistory(student)}
                              className="h-8 w-8 p-0 hover:bg-warning/10 text-warning"
                              title="Ver histórico de treinos"
                            >
                              <Clock className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => setEditingStudent(student)}
                              className="h-8 w-8 p-0 hover:bg-primary/10 text-primary"
                              title="Editar dados"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleToggleStatus(student.id)}
                              className="h-8 w-8 p-0 hover:bg-surface-hover"
                              title="Alterar status ativo/inativo"
                            >
                              <Power className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleDeleteStudent(student.id)}
                              className="h-8 w-8 p-0 hover:bg-destructive/10 text-destructive"
                              title="Remover aluno"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
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

              {filteredStudents.length === 0 && !loading && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Nenhum aluno encontrado</h3>
                  <p className="text-caption mb-4">
                    {searchTerm ? 'Tente ajustar sua busca' : 'Cadastre o primeiro aluno para começar'}
                  </p>
                  {!searchTerm && (
                    <Button onClick={() => setShowStudentForm(true)} className="btn-gym-primary">
                      <Plus className="w-4 h-4 mr-2" />
                      Cadastrar Primeiro Aluno
                    </Button>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
