-- Create appointments table to store all appointment bookings
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  appointment_date TEXT NOT NULL,
  appointment_time TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  contact_method TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT
);

-- Enable Row Level Security
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to insert appointments
CREATE POLICY "Anyone can insert appointments" 
ON public.appointments 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Create policy to allow authenticated users to view all appointments
CREATE POLICY "Authenticated users can view all appointments" 
ON public.appointments 
FOR SELECT 
TO authenticated
USING (true);

-- Create policy to allow authenticated users to update appointments
CREATE POLICY "Authenticated users can update appointments" 
ON public.appointments 
FOR UPDATE 
TO authenticated
USING (true);

-- Create policy to allow authenticated users to delete appointments
CREATE POLICY "Authenticated users can delete appointments" 
ON public.appointments 
FOR DELETE 
TO authenticated
USING (true);

-- Create index for faster queries on appointment_date
CREATE INDEX idx_appointments_date ON public.appointments(appointment_date);

-- Create index for faster queries on status
CREATE INDEX idx_appointments_status ON public.appointments(status);