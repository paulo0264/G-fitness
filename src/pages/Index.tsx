
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Users, Dumbbell, Calendar, BarChart3, User, Lock, LogIn } from 'lucide-react';
import AdminDashboard from '@/components/AdminDashboard';
import StudentLogin from '@/components/StudentLogin';
import { Link } from 'react-router-dom';

const Index = () => {
  const [activeView, setActiveView] = useState<'home' | 'admin' | 'student'>('home');

  if (activeView === 'admin') {
    return <AdminDashboard onBack={() => setActiveView('home')} />;
  }

  if (activeView === 'student') {
    return <StudentLogin onBack={() => setActiveView('home')} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-background via-background to-surface">
        <div className="absolute inset-0 opacity-50" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <div className="relative container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-8">
              <div className="bg-primary/10 p-4 rounded-2xl">
                <Dumbbell className="w-16 h-16 text-primary" />
              </div>
            </div>
            
            <h1 className="text-display mb-6 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Gerenciador de Treinos
            </h1>
            
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              Sistema completo de gestão de treinos para academias. 
              Gerencie alunos, crie treinos personalizados e acompanhe o progresso.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button 
                  className="btn-gym-primary text-lg px-8 py-4 group"
                >
                  <LogIn className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                  Login Administrador
                </Button>
              </Link>
              
              <Button 
                onClick={() => setActiveView('student')}
                variant="outline"
                className="text-lg px-8 py-4 border-border bg-surface hover:bg-surface-hover group"
              >
                <User className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Área do Aluno
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-heading mb-4">Funcionalidades Principais</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Tudo o que você precisa para gerenciar sua academia de forma eficiente
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="gym-card group cursor-pointer">
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Gestão de Alunos</h3>
              <p className="text-caption">Cadastre e gerencie todos os seus alunos com informações completas</p>
            </div>
          </Card>

          <Card className="gym-card group cursor-pointer">
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <Dumbbell className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Treinos Personalizados</h3>
              <p className="text-caption">Crie treinos detalhados separados por dias da semana</p>
            </div>
          </Card>

          <Card className="gym-card group cursor-pointer">
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <Calendar className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Planejamento Semanal</h3>
              <p className="text-caption">Organize treinos por dias e acompanhe o progresso semanal</p>
            </div>
          </Card>

          <Card className="gym-card group cursor-pointer">
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <BarChart3 className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Relatórios e Progresso</h3>
              <p className="text-caption">Acompanhe a evolução e frequência dos seus alunos</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-surface/50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="flex justify-center items-center mb-4">
              <Dumbbell className="w-6 h-6 text-primary mr-2" />
              <span className="font-semibold">Gerenciador de Treinos</span>
            </div>
            <p className="text-caption">
              Sistema completo de gestão de treinos para academias
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
