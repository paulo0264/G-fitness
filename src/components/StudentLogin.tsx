
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Lock, User, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import StudentDashboard from './StudentDashboard';

interface StudentLoginProps {
  onBack: () => void;
}

const StudentLogin = ({ onBack }: StudentLoginProps) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [loggedInStudent, setLoggedInStudent] = useState<any>(null);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('Tentando login com:', { username: credentials.username, password: credentials.password });
      
      const { data: studentData, error } = await supabase
        .rpc('authenticate_student', {
          p_username: credentials.username,
          p_password: credentials.password
        });

      console.log('Resultado da autenticação:', { studentData, error });

      if (error) {
        setError('Erro ao conectar com o banco de dados');
        return;
      }

      if (studentData && studentData.length > 0) {
        const student = studentData[0];
        setLoggedInStudent({
          id: student.id,
          name: student.name,
          username: student.username,
          age: student.age,
          goal: student.goal,
          medical_notes: student.medical_notes
        });
        toast({
          title: "Login realizado com sucesso!",
          description: `Bem-vindo, ${student.name}!`,
        });
      } else {
        setError('Usuário ou senha incorretos');
      }
    } catch (err: any) {
      setError('Erro ao fazer login. Tente novamente.');
      toast({
        title: "Erro no login",
        description: "Não foi possível conectar com o servidor.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loggedInStudent) {
    return (
      <StudentDashboard 
        student={loggedInStudent}
        onLogout={() => {
          setLoggedInStudent(null);
          setCredentials({ username: '', password: '' });
        }}
        onBack={onBack}
      />
    );
  }

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
              <h1 className="text-heading">Área do Aluno</h1>
              <p className="text-caption">Faça login para acessar seus treinos</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card className="gym-card">
            <div className="text-center mb-8">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-subheading mb-2">Acesso do Aluno</h2>
              <p className="text-caption">
                Entre com suas credenciais para acessar seus treinos personalizados
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username">Usuário</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="username"
                    type="text"
                    value={credentials.username}
                    onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="Digite seu usuário"
                    className="pl-10 bg-surface border-border"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={credentials.password}
                    onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Digite sua senha"
                    className="pl-10 pr-10 bg-surface border-border"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-surface-hover"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                  <p className="text-sm text-destructive text-center">{error}</p>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full btn-gym-primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full mr-2"></div>
                    Entrando...
                  </div>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Entrar
                  </>
                )}
              </Button>
            </form>

            {/* Info */}
            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                Use o usuário e senha fornecidos pelo seu instrutor
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;
