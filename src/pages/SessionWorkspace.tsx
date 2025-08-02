import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { NavigationHeader } from "@/components/NavigationHeader";
import { Play, Square, Upload, FileAudio, Volume2, Trash2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateIntelligentReport, saveReport } from "@/services/reportApi";
import ReportDisplayModal from "@/containers/ReportDisplayModal";

const SessionWorkspace = () => {
  const { toast } = useToast();
  const location = useParams();
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState("00:00");
  const [notes, setNotes] = useState("");
  const [transcription, setTranscription] = useState("");
  const [hasFinishedRecording, setHasFinishedRecording] = useState(false);
  const [finalDuration, setFinalDuration] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [generatedReport, setGeneratedReport] = useState<string>("");
  const [isReportModalOpen, setReportModalOpen] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [sessionType, setSessionType] = useState<string>("");

  // Obtener patientId del estado de navegación
  const patientId = location.patientId;
  const patientName = location.patientName || "Paciente";

  // Tipos de sesión disponibles
  const sessionTypes = [
    { value: "Primera Visita", label: "Primera Visita" },
    { value: "Seguimiento", label: "Seguimiento" },
    { value: "Alta", label: "Alta" },
    { value: "Evaluación", label: "Evaluación" },
    { value: "Crisis", label: "Crisis" },
    { value: "Mantenimiento", label: "Mantenimiento" }
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      const startTime = Date.now();
      interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        setTimer(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleStartRecording = () => {
    setIsRecording(true);
    setHasFinishedRecording(false);
    setTimer("00:00");
    // TODO: Implement actual recording logic
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setFinalDuration(timer);
    setHasFinishedRecording(true);
    // This is a placeholder for the actual audio file
    const dummyAudioFile = new File(["dummy audio data"], "session_recording.mp3", { type: "audio/mpeg" });
    setAudioFile(dummyAudioFile);
    // Simular transcripción para pruebas
    setTranscription("El paciente expresó sentimientos de ansiedad durante la sesión. Mencionó dificultades en el trabajo y problemas de sueño. El terapeuta sugirió técnicas de relajación y estableció objetivos para la próxima sesión.");
    // TODO: Implement stop recording logic and get the actual audio file
  };

  const handleDeleteRecording = () => {
    setHasFinishedRecording(false);
    setTimer("00:00");
    setFinalDuration("");
    setAudioFile(null);
    setTranscription("");
  };

  const handleGenerateReport = async () => {
    if (!notes.trim()) {
      toast({
        title: "Error",
        description: "Las notas de la sesión no pueden estar vacías.",
        variant: "destructive",
      });
      return;
    }

    if (!sessionType) {
      toast({
        title: "Error",
        description: "Debe seleccionar un tipo de sesión.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    toast({ title: "Generando informe...", description: "Este proceso puede tardar unos segundos." });

    try {
      const { report } = await generateIntelligentReport(transcription, notes);
      setGeneratedReport(report);
      setReportModalOpen(true);
      toast({ title: "Informe generado", description: "El informe se ha generado correctamente." });
    } catch (error) {
      console.error("Error al generar el informe:", error);
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCloseReportModal = () => {
    setReportModalOpen(false);
    setGeneratedReport("");
  };

  const handleSaveReport = async (content: string) => {
    if (!patientId) {
      toast({
        title: "Error",
        description: "No se ha especificado un paciente para este informe.",
        variant: "destructive",
      });
      return;
    }

    if (!sessionType) {
      toast({
        title: "Error",
        description: "Debe seleccionar un tipo de sesión antes de guardar el informe.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    
    try {
      const result = await saveReport(patientId, content, sessionType);
      
      toast({
        title: "Informe guardado en Google Drive",
        description: "El informe se ha guardado correctamente en su Google Drive.",
      });

      // Opcional: Abrir el documento en Google Drive
      if (result.report?.gdrive_file_url) {
        window.open(result.report.gdrive_file_url, '_blank');
      }
      
    } catch (error) {
      console.error("Error al guardar el informe:", error);
      
      // Manejar errores específicos de Google OAuth
      if (error instanceof Error) {
        if (error.message.includes("conectar su cuenta de Google")) {
          toast({
            title: "Conexión de Google requerida",
            description: "Debe conectar su cuenta de Google para guardar informes. Por favor, inicie sesión con Google.",
            variant: "destructive",
          });
        } else if (error.message.includes("sesión de Google ha expirado")) {
          toast({
            title: "Sesión de Google expirada",
            description: "Su sesión de Google ha expirado. Por favor, inicie sesión nuevamente con Google.",
            variant: "destructive",
          });
        } else if (error.message.includes("El paciente especificado no existe")) {
          toast({
            title: "Paciente no encontrado",
            description: "El paciente especificado no existe o no tiene acceso a él.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error al guardar",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Error al guardar",
          description: "No se pudo guardar el informe. Inténtelo de nuevo.",
          variant: "destructive",
        });
      }
      
      throw error; // Re-lanzar el error para que el modal lo maneje
    } finally {
      setIsSaving(false);
    }
  };

  // Si no hay patientId, mostrar mensaje de error
  if (!patientId) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationHeader />
        <main className="container mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-serif font-semibold text-foreground mb-4">
              Paciente no especificado
            </h1>
            <p className="text-muted-foreground mb-6">
              Para crear un informe, debe seleccionar un paciente desde la lista de pacientes.
            </p>
            <Button onClick={() => navigate('/patients')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a la lista de pacientes
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Global Header for consistency */}
      <NavigationHeader />

      {/* Main content - centered single column */}
      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="space-y-8">
          {/* Header Section */}
          <div className="text-center">
            <h1 className="text-3xl font-serif font-semibold text-foreground mb-2">
              Sesión de Trabajo
            </h1>
            <p className="text-muted-foreground font-sans">
              Sesión con {patientName}
            </p>
            <Button 
              variant="outline" 
              onClick={() => navigate(`/patients/${patientId}`)}
              className="mt-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Ficha del Paciente
            </Button>
          </div>

          {/* Session Type Selection */}
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="session-type" className="text-base font-medium">
                  Tipo de Sesión *
                </Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Seleccione el tipo de sesión para generar el informe con la nomenclatura correcta.
                </p>
                <Select value={sessionType} onValueChange={setSessionType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo de sesión" />
                  </SelectTrigger>
                  <SelectContent>
                    {sessionTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Recording Section */}
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Grabación de Sesión</h2>
                <div className="text-2xl font-mono">{timer}</div>
              </div>
              
              <div className="flex gap-4">
                {!isRecording ? (
                  <Button onClick={handleStartRecording} className="flex items-center gap-2">
                    <Play className="h-4 w-4" />
                    Iniciar Grabación
                  </Button>
                ) : (
                  <Button onClick={handleStopRecording} variant="destructive" className="flex items-center gap-2">
                    <Square className="h-4 w-4" />
                    Detener Grabación
                  </Button>
                )}
                
                {hasFinishedRecording && (
                  <Button onClick={handleDeleteRecording} variant="outline" className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4" />
                    Eliminar Grabación
                  </Button>
                )}
              </div>

              {hasFinishedRecording && (
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FileAudio className="h-4 w-4" />
                    <span className="font-medium">Grabación completada</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Duración: {finalDuration} | Archivo: session_recording.mp3
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Transcription Section */}
          {transcription && (
            <Card className="p-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Volume2 className="h-5 w-5" />
                  Transcripción
                </h2>
                <Textarea
                  value={transcription}
                  onChange={(e) => setTranscription(e.target.value)}
                  placeholder="Transcripción de la sesión..."
                  className="min-h-[120px]"
                />
              </div>
            </Card>
          )}

          {/* Notes Section */}
          <Card className="p-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Notas de la Sesión *</h2>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Escriba las notas de la sesión aquí. Estas notas se utilizarán para generar el informe con IA..."
                className="min-h-[200px]"
              />
            </div>
          </Card>

          {/* Generate Report Button */}
          <div className="flex justify-center">
            <Button 
              onClick={handleGenerateReport} 
              disabled={isGenerating || !notes.trim() || !sessionType}
              size="lg"
              className="px-8"
            >
              {isGenerating ? "Generando..." : "Generar Informe con IA"}
            </Button>
          </div>
        </div>
      </main>

      {/* Report Display Modal */}
      <ReportDisplayModal
        isOpen={isReportModalOpen}
        onClose={handleCloseReportModal}
        reportContent={generatedReport}
        onSave={handleSaveReport}
        isSaving={isSaving}
      />
    </div>
  );
};

export default SessionWorkspace;