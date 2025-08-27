import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Search, Dumbbell, Check } from 'lucide-react';
import type { Exercise } from '@/hooks/useExercises';

interface ExerciseSelectorProps {
  exercises: Exercise[];
  onBack: () => void;
  onSelect: (exercise: Exercise) => void;
  selectedExercises: string[];
}

const ExerciseSelector = ({ exercises, onBack, onSelect, selectedExercises }: ExerciseSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>('');

  const muscleGroups = Array.from(new Set(exercises.map(ex => ex.muscle_group))).sort();

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exercise.muscle_group.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMuscleGroup = !selectedMuscleGroup || exercise.muscle_group === selectedMuscleGroup;
    const notSelected = !selectedExercises.includes(exercise.id);
    
    return matchesSearch && matchesMuscleGroup && notSelected;
  });

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
              <h1 className="text-heading">Selecionar Exercício</h1>
              <p className="text-caption">Escolha um exercício para adicionar ao treino</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="mb-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar exercícios por nome ou grupo muscular..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-surface border-border"
            />
          </div>

          {/* Muscle Group Filters */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedMuscleGroup === '' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedMuscleGroup('')}
              className={selectedMuscleGroup === '' ? 'btn-gym-primary' : 'hover:bg-surface-hover'}
            >
              Todos
            </Button>
            {muscleGroups.map((group) => (
              <Button
                key={group}
                variant={selectedMuscleGroup === group ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedMuscleGroup(group)}
                className={selectedMuscleGroup === group ? 'btn-gym-primary' : 'hover:bg-surface-hover'}
              >
                {group}
              </Button>
            ))}
          </div>
        </div>

        {/* Exercises Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExercises.map((exercise) => (
            <Card key={exercise.id} className="gym-card-compact group cursor-pointer hover:border-primary/30" onClick={() => onSelect(exercise)}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center">
                    <Dumbbell className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{exercise.name}</h3>
                    <Badge variant="secondary" className="mt-1">
                      {exercise.muscle_group}
                    </Badge>
                  </div>
                </div>
              </div>

              {exercise.equipment && (
                <div className="mb-3">
                  <p className="text-sm text-muted-foreground">
                    <strong>Equipamento:</strong> {exercise.equipment}
                  </p>
                </div>
              )}

              {exercise.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {exercise.description}
                </p>
              )}

              <Button 
                className="w-full btn-gym-primary group-hover:bg-primary-hover"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(exercise);
                }}
              >
                <Check className="w-4 h-4 mr-2" />
                Selecionar
              </Button>
            </Card>
          ))}
        </div>

        {filteredExercises.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Dumbbell className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-subheading mb-4">Nenhum exercício encontrado</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              {searchTerm || selectedMuscleGroup
                ? 'Tente ajustar sua busca ou limpar os filtros'
                : 'Não há exercícios disponíveis no momento'
              }
            </p>
            {(searchTerm || selectedMuscleGroup) && (
              <Button 
                variant="ghost" 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedMuscleGroup('');
                }}
                className="hover:bg-surface-hover"
              >
                Limpar Filtros
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExerciseSelector;