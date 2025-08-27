
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, User, Save, Camera, RefreshCw, Key } from 'lucide-react';
import type { CreateStudentData } from '@/hooks/useStudents';

interface StudentFormProps {
  onBack: () => void;
  onSave: (student: CreateStudentData) => void;
  student?: import('@/hooks/useStudents').Student;
  isEditing?: boolean;
}

const StudentForm = ({ onBack, onSave, student, isEditing = false }: StudentFormProps) => {
  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const [formData, setFormData] = useState({
    name: student?.name || '',
    age: student?.age?.toString() || '',
    goal: student?.goal || '',
    medical_notes: student?.medical_notes || '',
    photo: student?.photo || '',
    username: student?.username || '',
    password: student?.password || generateRandomPassword()
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const goalOptions = [
    'Hipertrofia',
    'Emagrecimento',
    'Resistência',
    'Força',
    'Condicionamento',
    'Reabilitação',
    'Bem-estar geral'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.age || parseInt(formData.age) < 12 || parseInt(formData.age) > 120) {
      newErrors.age = 'Idade deve estar entre 12 e 120 anos';
    }

    if (!formData.goal) {
      newErrors.goal = 'Objetivo é obrigatório';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Usuário é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      await onSave({
        name: formData.name.trim(),
        age: parseInt(formData.age),
        goal: formData.goal,
        medical_notes: formData.medical_notes.trim() || undefined,
        active: true,
        photo: formData.photo || undefined,
        username: formData.username.trim(),
        password: formData.password
      });
      setIsSubmitting(false);
    }
  };

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
              <h1 className="text-heading">{isEditing ? 'Editar Aluno' : 'Cadastrar Novo Aluno'}</h1>
              <p className="text-caption">{isEditing ? 'Altere os dados do aluno' : 'Preencha os dados do aluno'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="gym-card">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Photo */}
              <div className="text-center">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  {formData.photo ? (
                    <img 
                      src={formData.photo} 
                      alt="Preview" 
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-primary" />
                  )}
                </div>
                <Button type="button" variant="outline" size="sm" className="bg-surface hover:bg-surface-hover">
                  <Camera className="w-4 h-4 mr-2" />
                  Adicionar Foto
                </Button>
              </div>

              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b border-border pb-2">
                  Informações Pessoais
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Digite o nome completo"
                      className={`bg-surface border-border ${errors.name ? 'border-destructive' : ''}`}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age">Idade *</Label>
                    <Input
                      id="age"
                      type="number"
                      value={formData.age}
                      onChange={(e) => handleInputChange('age', e.target.value)}
                      placeholder="Digite a idade"
                      min="12"
                      max="120"
                      className={`bg-surface border-border ${errors.age ? 'border-destructive' : ''}`}
                    />
                    {errors.age && (
                      <p className="text-sm text-destructive">{errors.age}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goal">Objetivo Principal *</Label>
                  <Select value={formData.goal} onValueChange={(value) => handleInputChange('goal', value)}>
                    <SelectTrigger className={`bg-surface border-border ${errors.goal ? 'border-destructive' : ''}`}>
                      <SelectValue placeholder="Selecione o objetivo principal" />
                    </SelectTrigger>
                    <SelectContent className="bg-surface border-border">
                      {goalOptions.map((goal) => (
                        <SelectItem key={goal} value={goal} className="hover:bg-surface-hover">
                          {goal}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.goal && (
                    <p className="text-sm text-destructive">{errors.goal}</p>
                  )}
                </div>
              </div>

              {/* Access Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b border-border pb-2 flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Acesso do Sistema
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Usuário *</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      placeholder="Digite o nome de usuário"
                      className={`bg-surface border-border ${errors.username ? 'border-destructive' : ''}`}
                    />
                    {errors.username && (
                      <p className="text-sm text-destructive">{errors.username}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Senha Gerada</Label>
                    <div className="flex gap-2">
                      <Input
                        id="password"
                        value={formData.password}
                        readOnly
                        className="bg-surface border-border"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleInputChange('password', generateRandomPassword())}
                        className="bg-surface hover:bg-surface-hover border-border"
                      >
                        <RefreshCw className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b border-border pb-2">
                  Informações Médicas
                </h3>
                
                  <div className="space-y-2">
                    <Label htmlFor="medicalNotes">Observações Médicas ou de Saúde</Label>
                    <Textarea
                      id="medicalNotes"
                      value={formData.medical_notes}
                      onChange={(e) => handleInputChange('medical_notes', e.target.value)}
                      placeholder="Ex: Problema no joelho direito, hipertensão controlada, etc. (Opcional)"
                      className="bg-surface border-border min-h-[100px]"
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground">
                      Informe qualquer condição médica, lesão ou restrição que possa afetar os treinos.
                    </p>
                  </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t border-border">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onBack}
                  className="flex-1 bg-surface hover:bg-surface-hover border-border"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 btn-gym-primary"
                  disabled={isSubmitting}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSubmitting ? (isEditing ? 'Salvando...' : 'Cadastrando...') : (isEditing ? 'Salvar Alterações' : 'Cadastrar Aluno')}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentForm;
