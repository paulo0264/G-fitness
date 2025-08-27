-- Add username and password columns to students table
ALTER TABLE public.students 
ADD COLUMN username text,
ADD COLUMN password text;

-- Add unique constraint for username
ALTER TABLE public.students 
ADD CONSTRAINT unique_username UNIQUE (username);