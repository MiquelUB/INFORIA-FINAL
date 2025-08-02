import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Plus, 
  FileText, 
  Calendar, 
  Phone, 
  Mail, 
  ExternalLink,
  Clock,
  Tag
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  address?: string;
  emergencyContact?: string;
  status: "Activo" | "Inactivo" | "En pausa";
  totalSessions: number;
  tags: string[];
  notes?: string;
  createdAt: string;
}

interface Report {
  id: string;
  file_name: string;
  gdrive_file_url: string;
  created_at: string;
  file_size?: number;
}

// Mock data para desarrollo
const mockPatient: Patient = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  name: "María García López",
  email: "maria.garcia@email.com",
  phone: "+34 612 345 678",
  dateOfBirth: "1985-03-15",
  address: "Calle Mayor 123, Madrid",
  emergencyContact: "Juan García López - +34 600 123 456",
  status: "Activo",
  totalSessions: 12,
  tags: ["Ansiedad", "Terapia Cognitiva", "Mindfulness"],
  notes: "Paciente con ansiedad generalizada. Responde bien a técnicas de respiración y mindfulness. Progreso constante en las últimas sesiones.",
  createdAt: "2023-06-15"
};

const mockReports: Report[] = [
  {
    id: "1",
    file_name: "Informe de Sesión - María García - 20/01/2025",
    gdrive_file_url: "https://docs.google.com/document/d/1ABC123",
    created_at: "2025-01-20T10:30:00Z",
    file_size: 2048
  },
  {
    id: "2", 
    file_name: "Informe de Sesión - María García - 15/01/2025",
    gdrive_file_url: "https://docs.google.com/document/d/1DEF456",
    created_at: "2025-01-15T14:20:00Z",
    file_size: 1536
  },
  {
    id: "3",
    file_name: "Informe de Sesión - María García - 10/01/2025", 
    gdrive_file_url: "https://docs.google.com/document/d/1GHI789",
    created_at: "2025-01-10T09:15:00Z",
    file_size: 1792
  }
];

const PatientDetailedProfile = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatientData = async () => {
      if (!patientId) return;

      try {
        setLoading(true);
        
        // En desarrollo, usar datos mock
        // TODO: Implementar consultas reales a Supabase
        setPatient(mockPatient);
        setReports(mockReports);
        
        // Consulta real (descomentar cuando esté lista la tabla patients)
        /*
        const { data: patientData, error: patientError } = await supabase
          .from('patients')
          .select('*')
          .eq('id', patientId)
          .single();

        if (patientError) throw patientError;
        setPatient(patientData);

        const { data: reportsData, error: reportsError } = await supabase
          .from('reports')
          .select('id, file_name, gdrive_file_url, created_at, file_size')
          .eq('patient_id', patientId)
          .order('created_at', { ascending: false });

        if (reportsError) throw reportsError;
        setReports(reportsData || []);
        */
        
      } catch (error) {
        console.error('Error fetching patient data:', error);
        // En caso de error, usar datos mock para desarrollo
        setPatient(mockPatient);
        setReports(mockReports);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [patientId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Activo":
        return "bg-green-100 text-green-800 border-green-200";
      case "En pausa":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Inactivo":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "N/A";
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Cargando datos del paciente...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-serif font-semibold text-foreground mb-4">
              Paciente no encontrado
            </h1>
            <p className="text-muted-foreground mb-6">
              El paciente que buscas no existe o no tienes permisos para verlo.
            </p>
            <Button onClick={() => navigate('/patients')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a la lista
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/patients')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Volver</span>
            </Button>
            <div>
              <h1 className="text-3xl font-serif font-semibold text-foreground">
                Ficha del Paciente
              </h1>
              <p className="text-muted-foreground font-sans">
                Información detallada y historial clínico
              </p>
            </div>
          </div>
          
          <Link 
            to="/session-workspace" 
            state={{ patientId: patient.id }}
          >
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-sans">
              <Plus className="mr-2 h-4 w-4" />
              Redactar Nuevo Informe
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Patient Information */}
          <div className="lg:col-span-1 space-y-6">
            {/* Patient Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src="/placeholder.svg" alt={patient.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground font-sans text-lg">
                      {patient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="font-serif text-xl font-medium text-foreground">
                      {patient.name}
                    </CardTitle>
                    <Badge className={getStatusColor(patient.status)}>
                      {patient.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-sans">{patient.email}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-sans">{patient.phone}</span>
                  </div>
                  {patient.dateOfBirth && (
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-sans">
                        {new Date(patient.dateOfBirth).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  )}
                  {patient.address && (
                    <div className="flex items-center space-x-3">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-sans">{patient.address}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-sans text-muted-foreground">Sesiones totales</span>
                    <span className="font-sans font-medium">{patient.totalSessions}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-sans text-muted-foreground">Paciente desde</span>
                    <span className="font-sans font-medium">
                      {new Date(patient.createdAt).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                </div>

                {patient.tags.length > 0 && (
                  <div className="pt-4 border-t">
                    <h4 className="text-sm font-medium text-foreground mb-2">Etiquetas</h4>
                    <div className="flex flex-wrap gap-2">
                      {patient.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="font-sans">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {patient.notes && (
                  <div className="pt-4 border-t">
                    <h4 className="text-sm font-medium text-foreground mb-2">Notas</h4>
                    <p className="text-sm text-muted-foreground font-sans">
                      {patient.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Reports History */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-xl font-medium text-foreground">
                  Historial de Informes
                </CardTitle>
                <p className="text-sm text-muted-foreground font-sans">
                  {reports.length} informe{reports.length !== 1 ? 's' : ''} en total
                </p>
              </CardHeader>
              <CardContent>
                {reports.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-serif text-lg font-medium text-foreground mb-2">
                      No hay informes aún
                    </h3>
                    <p className="text-muted-foreground font-sans mb-4">
                      Comienza creando el primer informe para este paciente.
                    </p>
                    <Link 
                      to="/session-workspace" 
                      state={{ patientId: patient.id }}
                    >
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Crear Primer Informe
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reports.map(report => (
                      <div 
                        key={report.id} 
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <h4 className="font-sans font-medium text-foreground">
                              {report.file_name}
                            </h4>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  {new Date(report.created_at).toLocaleDateString('es-ES')}
                                </span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {new Date(report.created_at).toLocaleTimeString('es-ES', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </span>
                              {report.file_size && (
                                <span>{formatFileSize(report.file_size)}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(report.gdrive_file_url, '_blank')}
                          className="flex items-center space-x-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                          <span>Abrir</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientDetailedProfile;
