import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useWorkoutHistory } from "@/hooks/useWorkoutHistory";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays, User, Dumbbell, Search } from "lucide-react";

interface WorkoutHistoryProps {
  studentId?: string;
}

export function WorkoutHistory({ studentId }: WorkoutHistoryProps) {
  const { history, loading } = useWorkoutHistory(studentId);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter history by search term
  const filteredHistory = useMemo(() => {
    if (!searchTerm) return history;
    return history.filter((entry) =>
      entry.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.workout_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.workout_type?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [history, searchTerm]);

  // Pagination logic
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedHistory = filteredHistory.slice(startIndex, endIndex);

  // Reset to first page when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Histórico de Treinos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            Carregando histórico...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (filteredHistory.length === 0 && !searchTerm) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Histórico de Treinos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="font-semibold mb-2">Nenhum treino concluído ainda</h3>
            <p className="text-sm max-w-md mx-auto">
              {studentId 
                ? "Este aluno ainda não concluiu nenhum treino. Os treinos aparecerão aqui quando forem finalizados pelo aluno." 
                : "Nenhum aluno concluiu treinos ainda. O histórico será atualizado automaticamente quando os alunos finalizarem seus treinos."
              }
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          Histórico de Treinos
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Search - only show if not filtered by studentId */}
        {!studentId && (
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar por nome do aluno ou treino..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-surface border-border"
            />
          </div>
        )}

        {/* No results message */}
        {filteredHistory.length === 0 && searchTerm && (
          <div className="text-center text-muted-foreground py-8">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="font-semibold mb-2">Nenhum resultado encontrado</h3>
            <p className="text-sm max-w-md mx-auto">
              Tente ajustar sua busca ou limpar o filtro para ver todos os treinos.
            </p>
          </div>
        )}

        {filteredHistory.length > 0 && (
          <>
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {paginatedHistory.map((entry) => (
                  <div
                    key={entry.id}
                    className="border rounded-lg p-4 bg-card hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium flex items-center gap-2">
                          <Dumbbell className="h-4 w-4" />
                          {entry.workout_name || 'Treino'}
                        </h3>
                        {!studentId && (
                          <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                            <User className="h-3 w-3" />
                            {entry.student_name || 'Aluno'}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary">
                          {format(new Date(entry.completed_at), "dd/MM/yyyy", { locale: ptBR })}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(entry.completed_at), "HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      <strong>Exercícios concluídos:</strong> {entry.exercises_completed?.length || 0}
                    </div>
                    
                    {entry.notes && (
                      <div className="text-sm mt-2 p-2 bg-muted/50 rounded">
                        <strong>Observações:</strong> {entry.notes}
                      </div>
                    )}
                    
                    {entry.exercises_completed && entry.exercises_completed.length > 0 && (
                      <div className="mt-3">
                        <details className="text-sm">
                          <summary className="cursor-pointer text-primary hover:underline">
                            Ver detalhes dos exercícios
                          </summary>
                          <div className="mt-2 space-y-2">
                            {entry.exercises_completed.map((ex: any, index: number) => (
                              <div key={index} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                                <span>{ex.name}</span>
                                <div className="text-xs text-muted-foreground">
                                  {ex.sets} x {ex.reps}
                                  {ex.weight && ` - ${ex.weight}kg`}
                                </div>
                              </div>
                            ))}
                          </div>
                        </details>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>

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
          </>
        )}
      </CardContent>
    </Card>
  );
}