-- Drop existing table and recreate with new structure
DROP TABLE IF EXISTS public.configurator_quotes CASCADE;
DROP TABLE IF EXISTS public.configurator_ovens CASCADE;
DROP TABLE IF EXISTS public.configurator_options CASCADE;

-- Create new configurator_ovens table with model-based structure
CREATE TABLE public.configurator_ovens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  model_name TEXT NOT NULL, -- Sebastian, Realbosco, Anastasia, Ottavio
  fuel_type TEXT NOT NULL, -- Elettrico, Gas, Legna, Rotante
  diameter INTEGER NOT NULL, -- 80, 100, 120, 130
  pizza_capacity TEXT NOT NULL, -- e.g. "2 pizze", "5-6 pizze"
  base_price NUMERIC NOT NULL,
  delivery_time_weeks INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create configurator_options table for additional services
CREATE TABLE public.configurator_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'installation', 'gas_conversion', etc.
  price NUMERIC NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create configurator_quotes table
CREATE TABLE public.configurator_quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  oven_id UUID REFERENCES public.configurator_ovens(id),
  has_installation BOOLEAN NOT NULL DEFAULT false,
  has_gas BOOLEAN NOT NULL DEFAULT false,
  total_price NUMERIC NOT NULL,
  delivery_time_weeks INTEGER NOT NULL,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.configurator_ovens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configurator_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configurator_quotes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for configurator_ovens
CREATE POLICY "Anyone can view active ovens"
ON public.configurator_ovens
FOR SELECT
USING (is_active = true OR auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage ovens"
ON public.configurator_ovens
FOR ALL
USING (auth.role() = 'authenticated');

-- RLS Policies for configurator_options
CREATE POLICY "Anyone can view active options"
ON public.configurator_options
FOR SELECT
USING (is_active = true OR auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage options"
ON public.configurator_options
FOR ALL
USING (auth.role() = 'authenticated');

-- RLS Policies for configurator_quotes
CREATE POLICY "Anyone can create quotes"
ON public.configurator_quotes
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Authenticated users can view all quotes"
ON public.configurator_quotes
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update quotes"
ON public.configurator_quotes
FOR UPDATE
USING (auth.role() = 'authenticated');

-- Create trigger for updated_at
CREATE TRIGGER update_configurator_ovens_updated_at
BEFORE UPDATE ON public.configurator_ovens
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_configurator_options_updated_at
BEFORE UPDATE ON public.configurator_options
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();