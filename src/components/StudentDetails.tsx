
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, Target, Calendar, Activity } from 'lucide-react';
import type { Student } from '@/hooks/useStudents';

interface StudentDetailsProps {
  student: Student;
  onBack: () => void;
}

const StudentDetails = ({ student, onBack }: StudentDetailsProps) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-surface/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack} className="hover:bg-surface-hover">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-heading">Detalhes do Aluno</h1>
              <p className="text-caption">Informações completas e histórico</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Student Profile */}
          <Card className="gym-card mb-8">
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                {student.photo ? (
                  <img 
                    src={student.photo} 
                    alt={student.name} 
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-primary" />
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-subheading mb-1">{student.name}</h2>
                    <p className="text-caption">{student.age} anos</p>
                  </div>
                  <Badge className={student.active ? 'status-completed' : 'status-pending'}>
                    {student.active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Objetivo</p>
                      <p className="text-sm font-medium">{student.goal}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Cadastrado em</p>
                      <p className="text-sm font-medium">
                        {new Date(student.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <p className="text-sm font-medium">
                        {student.active ? 'Treinando' : 'Pausado'}
                      </p>
                    </div>
                  </div>
                </div>

                {student.medical_notes && (
                  <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                    <p className="text-sm">
                      <strong>Observações Médicas:</strong> {student.medical_notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Workout History */}
          <Card className="gym-card">
            <h3 className="font-semibold mb-4">Histórico de Treinos</h3>
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Histórico de treinos estará disponível em breve
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentDetails;
