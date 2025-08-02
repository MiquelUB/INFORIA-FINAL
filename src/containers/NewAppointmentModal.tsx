import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock, User, MapPin, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createAppointment, CreateAppointmentData } from "@/services/appointmentApi";

interface Patient {
  id: string;
  name: string;
  email: string;
}

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: Date;
  selectedTime?: { start: Date; end: Date };
  onAppointmentCreated?: () => void;
}

// Mock data para desarrollo
const mockPatients: Patient[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "María García López",
    email: "maria.garcia@email.com"
  },
  {
    id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    name: "Carlos Ruiz Mendez",
    email: "carlos.ruiz@email.com"
  },
  {
    id: "6ba7b811-9dad-11d1-80b4-00c04fd430c8",
    name: "Ana Fernández Silva",
    email: "ana.fernandez@email.com"
  },
  {
    id: "6ba7b812-9dad-11d1-80b4-00c04fd430c8",
    name: "Javier Moreno Castro",
    email: "javier.moreno@email.com"
  }
];

const appointmentTypes = [
  { value: "session", label: "Sesión Terapéutica" },
  { value: "consultation", label: "Consulta" },
  { value: "follow_up", label: "Seguimiento" },
  { value: "initial_assessment", label: "Evaluación Inicial" }
];

const NewAppointmentModal: React.FC<NewAppointmentModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  selectedTime,
  onAppointmentCreated
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateAppointmentData>({
    patient_id: "",
    title: "",
    description: "",
    start_time: "",
    end_time: "",
    appointment_type: "session",
    location: "Oficina Principal",
    notes: ""
  });

  // Inicializar fechas cuando se abre el modal
  useEffect(() => {
    if (isOpen && selectedTime) {
      setFormData(prev => ({
        ...prev,
        start_time: selectedTime.start.toISOString(),
        end_time: selectedTime.end.toISOString()
      }));
    } else if (isOpen && selectedDate) {
      // Si solo se seleccionó una fecha, crear un slot de 1 hora
      const startTime = new Date(selectedDate);
      startTime.setHours(9, 0, 0, 0); // 9:00 AM por defecto
      const endTime = new Date(startTime);
      endTime.setHours(10, 0, 0, 0); // 10:00 AM por defecto
      
      setFormData(prev => ({
        ...prev,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString()
      }));
    }
  }, [isOpen, selectedDate, selectedTime]);

  const handleInputChange = (field: keyof CreateAppointmentData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDateChange = (field: 'start_time' | 'end_time', value: string) => {
    const date = new Date(value);
    setFormData(prev => ({
      ...prev,
      [field]: date.toISOString()
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.patient_id) {
      toast({
        title: "Error",
        description: "Debe seleccionar un paciente.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "El título de la cita es requerido.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await createAppointment(formData);
      
      toast({
        title: "Cita creada",
        description: "La cita se ha creado correctamente.",
      });

      // Limpiar formulario
      setFormData({
        patient_id: "",
        title: "",
        description: "",
        start_time: "",
        end_time: "",
        appointment_type: "session",
        location: "Oficina Principal",
        notes: ""
      });

      // Cerrar modal y refrescar calendario
      onClose();
      onAppointmentCreated?.();

    } catch (error) {
      console.error('Error creating appointment:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo crear la cita.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toISOString().slice(0, 16); // Formato para input datetime-local
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Nueva Cita</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Paciente */}
          <div className="space-y-2">
            <Label htmlFor="patient" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Paciente *</span>
            </Label>
            <Select
              value={formData.patient_id}
              onValueChange={(value) => handleInputChange('patient_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar paciente" />
              </SelectTrigger>
              <SelectContent>
                {mockPatients.map(patient => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Título de la cita *</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Ej: Sesión de seguimiento"
              required
            />
          </div>

          {/* Tipo de cita */}
          <div className="space-y-2">
            <Label htmlFor="appointment_type">Tipo de cita</Label>
            <Select
              value={formData.appointment_type}
              onValueChange={(value) => handleInputChange('appointment_type', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {appointmentTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fecha y hora de inicio */}
          <div className="space-y-2">
            <Label htmlFor="start_time" className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Fecha y hora de inicio *</span>
            </Label>
            <Input
              id="start_time"
              type="datetime-local"
              value={formData.start_time ? formatDateTime(formData.start_time) : ""}
              onChange={(e) => handleDateChange('start_time', e.target.value)}
              required
            />
          </div>

          {/* Fecha y hora de fin */}
          <div className="space-y-2">
            <Label htmlFor="end_time" className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Fecha y hora de fin *</span>
            </Label>
            <Input
              id="end_time"
              type="datetime-local"
              value={formData.end_time ? formatDateTime(formData.end_time) : ""}
              onChange={(e) => handleDateChange('end_time', e.target.value)}
              required
            />
          </div>

          {/* Ubicación */}
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>Ubicación</span>
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="Ej: Oficina Principal"
            />
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Descripción opcional de la cita..."
              rows={3}
            />
          </div>

          {/* Notas privadas */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas privadas</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Notas privadas para el terapeuta..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creando..." : "Crear Cita"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewAppointmentModal; 