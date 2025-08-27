-- Allow public read of active workouts and related exercises for Student area

-- Workouts: replace authenticated-only SELECT with public SELECT for active workouts
DROP POLICY IF EXISTS "Authenticated users can view workouts" ON public.workouts;
CREATE POLICY "Public can view active workouts"
ON public.workouts
FOR SELECT
USING (active = true);

-- Workout Exercises: replace authenticated-only SELECT with public SELECT when workout is active
DROP POLICY IF EXISTS "Authenticated users can view workout_exercises" ON public.workout_exercises;
CREATE POLICY "Public can view exercises for active workouts"
ON public.workout_exercises
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.workouts w
    WHERE w.id = workout_exercises.workout_id
      AND w.active = true
  )
);

-- Exercises: replace authenticated-only SELECT with public SELECT (read-only)
DROP POLICY IF EXISTS "Authenticated users can view exercises" ON public.exercises;
CREATE POLICY "Public can view exercises"
ON public.exercises
FOR SELECT
USING (true);