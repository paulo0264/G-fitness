-- Create workout history table to track completed workouts
CREATE TABLE public.workout_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  workout_id UUID NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completion_date DATE NOT NULL DEFAULT CURRENT_DATE,
  exercises_completed JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.workout_history ENABLE ROW LEVEL SECURITY;

-- Create policies for workout history
CREATE POLICY "Public can view workout history"
ON public.workout_history
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create workout history"
ON public.workout_history
FOR INSERT
WITH CHECK (auth.role() = 'authenticated'::text);

CREATE POLICY "Authenticated users can update workout history"
ON public.workout_history
FOR UPDATE
USING (auth.role() = 'authenticated'::text);

-- Create index for better performance on common queries
CREATE INDEX idx_workout_history_student_date ON public.workout_history(student_id, completion_date);
CREATE INDEX idx_workout_history_student_workout ON public.workout_history(student_id, workout_id);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_workout_history_updated_at
BEFORE UPDATE ON public.workout_history
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();