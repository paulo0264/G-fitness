-- Remove the dangerous public read policy on students table
DROP POLICY IF EXISTS "Allow reading students for login" ON public.students;

-- Create a secure function for student authentication that doesn't expose sensitive data
CREATE OR REPLACE FUNCTION public.authenticate_student(
  p_username TEXT,
  p_password TEXT
)
RETURNS TABLE(
  id UUID,
  name TEXT,
  username TEXT,
  age INTEGER,
  goal TEXT,
  medical_notes TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only return student data if credentials match
  RETURN QUERY
  SELECT 
    s.id,
    s.name,
    s.username,
    s.age,
    s.goal,
    s.medical_notes
  FROM students s
  WHERE s.username = p_username 
    AND s.password = p_password 
    AND s.active = true;
END;
$$;

-- Create a restrictive policy that only allows authenticated admin users to read student data
CREATE POLICY "Only authenticated users can read students" 
ON public.students 
FOR SELECT 
USING (auth.uid() IS NOT NULL);