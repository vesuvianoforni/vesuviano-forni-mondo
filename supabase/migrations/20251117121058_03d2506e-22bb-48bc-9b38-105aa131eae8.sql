-- Create table for configurable ovens
CREATE TABLE public.configurator_ovens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  delivery_time_weeks INTEGER NOT NULL,
  diameters JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for configurator options (installation, gas conversion, etc.)
CREATE TABLE public.configurator_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for saved configurations (quotes)
CREATE TABLE public.configurator_quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  oven_id UUID REFERENCES public.configurator_ovens(id),
  diameter TEXT NOT NULL,
  has_installation BOOLEAN NOT NULL DEFAULT false,
  has_gas BOOLEAN NOT NULL DEFAULT false,
  total_price DECIMAL(10,2) NOT NULL,
  delivery_time_weeks INTEGER NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  customer_name TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.configurator_ovens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configurator_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configurator_quotes ENABLE ROW LEVEL SECURITY;

-- Policies for configurator_ovens
CREATE POLICY "Anyone can view active ovens"
  ON public.configurator_ovens
  FOR SELECT
  USING (is_active = true OR auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage ovens"
  ON public.configurator_ovens
  FOR ALL
  USING (auth.role() = 'authenticated');

-- Policies for configurator_options
CREATE POLICY "Anyone can view active options"
  ON public.configurator_options
  FOR SELECT
  USING (is_active = true OR auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage options"
  ON public.configurator_options
  FOR ALL
  USING (auth.role() = 'authenticated');

-- Policies for configurator_quotes
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

-- Create indexes
CREATE INDEX idx_configurator_ovens_active ON public.configurator_ovens(is_active);
CREATE INDEX idx_configurator_options_type ON public.configurator_options(type);
CREATE INDEX idx_configurator_quotes_status ON public.configurator_quotes(status);

-- Add trigger for updated_at
CREATE TRIGGER update_configurator_ovens_updated_at
  BEFORE UPDATE ON public.configurator_ovens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_configurator_options_updated_at
  BEFORE UPDATE ON public.configurator_options
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();