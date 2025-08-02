-- Create appointments table for calendar functionality
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL, -- Will reference patients table when created
    title TEXT NOT NULL,
    description TEXT, -- Optional description of the appointment
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
    appointment_type TEXT DEFAULT 'session' CHECK (appointment_type IN ('session', 'consultation', 'follow_up', 'initial_assessment')),
    location TEXT, -- Optional location (office, online, etc.)
    notes TEXT, -- Private notes for the therapist
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON public.appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON public.appointments(start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_end_time ON public.appointments(end_time);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_date_range ON public.appointments(start_time, end_time);

-- Enable Row Level Security (RLS)
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own appointments" ON public.appointments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own appointments" ON public.appointments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own appointments" ON public.appointments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own appointments" ON public.appointments
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_appointments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON public.appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_appointments_updated_at();

-- Add comments for documentation
COMMENT ON TABLE public.appointments IS 'Appointments table for calendar functionality - stores all therapist appointments';
COMMENT ON COLUMN public.appointments.title IS 'Title/name of the appointment';
COMMENT ON COLUMN public.appointments.description IS 'Optional detailed description of the appointment';
COMMENT ON COLUMN public.appointments.start_time IS 'Start time of the appointment';
COMMENT ON COLUMN public.appointments.end_time IS 'End time of the appointment';
COMMENT ON COLUMN public.appointments.status IS 'Current status of the appointment';
COMMENT ON COLUMN public.appointments.appointment_type IS 'Type of appointment (session, consultation, etc.)';
COMMENT ON COLUMN public.appointments.location IS 'Location where the appointment takes place';
COMMENT ON COLUMN public.appointments.notes IS 'Private notes for the therapist about this appointment';

-- Insert some sample data for development
INSERT INTO public.appointments (user_id, patient_id, title, description, start_time, end_time, status, appointment_type, location, notes) VALUES
-- These will need to be updated with real user_id and patient_id values when the tables are created
('00000000-0000-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440000', 'Sesión de seguimiento - María García', 'Sesión de seguimiento para evaluar progreso en técnicas de mindfulness', '2025-01-27 10:00:00+00', '2025-01-27 11:00:00+00', 'scheduled', 'session', 'Oficina Principal', 'Paciente responde bien a técnicas de respiración'),
('00000000-0000-0000-0000-000000000000', '6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'Evaluación inicial - Carlos Ruiz', 'Primera sesión de evaluación para determinar necesidades terapéuticas', '2025-01-27 14:00:00+00', '2025-01-27 15:30:00+00', 'scheduled', 'initial_assessment', 'Oficina Principal', 'Paciente refiere síntomas de depresión'),
('00000000-0000-0000-0000-000000000000', '6ba7b811-9dad-11d1-80b4-00c04fd430c8', 'Sesión EMDR - Ana Fernández', 'Continuación de terapia EMDR para procesamiento de trauma', '2025-01-28 09:00:00+00', '2025-01-28 10:30:00+00', 'scheduled', 'session', 'Oficina Principal', 'Progreso significativo en procesamiento de recuerdos'),
('00000000-0000-0000-0000-000000000000', '6ba7b812-9dad-11d1-80b4-00c04fd430c8', 'Terapia de pareja - Javier Moreno', 'Sesión conjunta con pareja para trabajar comunicación', '2025-01-28 16:00:00+00', '2025-01-28 17:30:00+00', 'scheduled', 'session', 'Oficina Principal', 'Ambos miembros de la pareja asistirán'),
('00000000-0000-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440000', 'Sesión de mindfulness - María García', 'Práctica de técnicas de mindfulness y relajación', '2025-01-29 11:00:00+00', '2025-01-29 12:00:00+00', 'scheduled', 'session', 'Oficina Principal', 'Continuar con ejercicios de respiración diafragmática'),
('00000000-0000-0000-0000-000000000000', '6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'Sesión de terapia cognitiva - Carlos Ruiz', 'Trabajo en identificación de pensamientos automáticos', '2025-01-29 15:00:00+00', '2025-01-29 16:00:00+00', 'scheduled', 'session', 'Oficina Principal', 'Enfocarse en distorsiones cognitivas identificadas'),
('00000000-0000-0000-0000-000000000000', '6ba7b811-9dad-11d1-80b4-00c04fd430c8', 'Sesión de procesamiento - Ana Fernández', 'Procesamiento de material traumático con EMDR', '2025-01-30 10:00:00+00', '2025-01-30 11:30:00+00', 'scheduled', 'session', 'Oficina Principal', 'Preparar para procesamiento de recuerdo específico'),
('00000000-0000-0000-0000-000000000000', '6ba7b812-9dad-11d1-80b4-00c04fd430c8', 'Sesión individual - Javier Moreno', 'Sesión individual para trabajar aspectos personales', '2025-01-30 17:00:00+00', '2025-01-30 18:00:00+00', 'scheduled', 'session', 'Oficina Principal', 'Enfoque en desarrollo personal y autoestima'); 