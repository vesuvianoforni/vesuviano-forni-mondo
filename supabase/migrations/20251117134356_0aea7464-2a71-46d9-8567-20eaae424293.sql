-- Add video_url_360 column to configurator_ovens
ALTER TABLE public.configurator_ovens 
ADD COLUMN video_url_360 text;

-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Update RLS policies for configurator_ovens to require admin role for modifications
DROP POLICY IF EXISTS "Authenticated users can manage ovens" ON public.configurator_ovens;

CREATE POLICY "Admins can manage ovens"
ON public.configurator_ovens
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Update RLS policies for configurator_options
DROP POLICY IF EXISTS "Authenticated users can manage options" ON public.configurator_options;

CREATE POLICY "Admins can manage options"
ON public.configurator_options
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Update RLS policy for configurator_quotes to allow admins full access
CREATE POLICY "Admins can manage all quotes"
ON public.configurator_quotes
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));