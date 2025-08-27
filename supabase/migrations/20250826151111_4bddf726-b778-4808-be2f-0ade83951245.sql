-- Atualizar políticas RLS para permitir operações de usuários autenticados

-- Política para workouts: permitir que usuários autenticados vejam todos os workouts (não apenas ativos)
DROP POLICY IF EXISTS "Public can view active workouts" ON public.workouts;
CREATE POLICY "Authenticated users can view all workouts" 
ON public.workouts 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Política para workout_exercises: permitir que usuários autenticados vejam todos os exercícios
DROP POLICY IF EXISTS "Public can view exercises for active workouts" ON public.workout_exercises;
CREATE POLICY "Authenticated users can view all workout exercises" 
ON public.workout_exercises 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Política para workout_history: permitir que usuários autenticados vejam todo o histórico
DROP POLICY IF EXISTS "Public can view workout history" ON public.workout_history;
CREATE POLICY "Authenticated users can view workout history" 
ON public.workout_history 
FOR SELECT 
USING (auth.uid() IS NOT NULL);