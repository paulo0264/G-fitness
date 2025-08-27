-- Ensure RLS is enabled (no-op if already enabled)
ALTER TABLE public.workout_history ENABLE ROW LEVEL SECURITY;

-- Create a SECURITY DEFINER helper to check if a student is active, avoiding RLS recursion
DO $do$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'is_active_student'
  ) THEN
    CREATE OR REPLACE FUNCTION public.is_active_student(p_student_id uuid)
    RETURNS boolean
    LANGUAGE sql
    SECURITY DEFINER
    SET search_path = public
    AS $fn$
      SELECT EXISTS (
        SELECT 1 FROM public.students s
        WHERE s.id = p_student_id AND s.active = true
      );
    $fn$;
  END IF;
END
$do$;

-- Add a permissive INSERT policy for public users that only allows inserts when the student exists and is active
DO $do$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'workout_history' 
      AND policyname = 'Public can insert workout_history for active students'
  ) THEN
    CREATE POLICY "Public can insert workout_history for active students"
    ON public.workout_history
    FOR INSERT
    WITH CHECK (
      public.is_active_student(student_id)
    );
  END IF;
END
$do$;