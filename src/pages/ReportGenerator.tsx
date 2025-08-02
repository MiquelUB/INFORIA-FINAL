import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, 
  FileText, 
  Brain, 
  Download, 
  Trash2, 
  Play,
  Clock,
  CheckCircle,
  AlertCircle,
  FileAudio,
  Volume2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateIntelligentReport, saveReport } from "@/services/reportApi";
import ReportDisplayModal from "@/containers/ReportDisplayModal";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  status: 'uploading' | 'uploaded' | 'processing' | 'completed' | 'error';
  progress: number;
}

const ReportGenerator = () => {
  const { toast } = useToast();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reportTitle, setReportTitle] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const newFile: UploadedFile = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'uploading',
        progress: 0
      };

      setUploadedFiles(prev => [...prev, newFile]);

      // Simular progreso de carga
      const interval = setInterval(() => {
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === newFile.id 
              ? { ...f, progress: Math.min(f.progress + 10, 100) }
              : f
          )
        );

        if (newFile.progress >= 100) {
          clearInterval(interval);
          setUploadedFiles(prev => 
            prev.map(f => 
              f.id === newFile.id 
                ? { ...f, status: 'uploaded' as const }
                : f
            )
          );
        }
      }, 100);
    });
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleGenerateReport = async () => {
    if (uploadedFiles.length === 0) {
      toast({
        title: "Error",
        description: "Debes subir al menos un archivo de audio.",
        variant: "destructive",
      });
      return;
    }

    if (!reportTitle.trim()) {
      toast({
        title: "Error",
        description: "Debes ingresar un título para el informe.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Simular generación de informe
      await new Promise(resolve => setTimeout(resolve, 3000));

      const mockReport = `
# Informe Inteligente: ${reportTitle}

## Resumen de la Sesión
${reportDescription || 'Análisis automático de la sesión terapéutica basado en el contenido de audio proporcionado.'}

## Puntos Clave Identificados
- **Tema Principal**: Análisis de patrones de comunicación
- **Estado Emocional**: Evaluación del estado emocional del paciente
- **Progreso Terapéutico**: Seguimiento de objetivos establecidos
- **Recomendaciones**: Sugerencias para próximas sesiones

## Análisis Detallado
El sistema de IA ha procesado ${uploadedFiles.length} archivo(s) de audio y ha generado un análisis comprehensivo de la sesión terapéutica. Los patrones identificados incluyen:

### Comunicación Verbal
- **Tono de voz**: Análisis de variaciones emocionales
- **Ritmo del habla**: Evaluación de la fluidez y pausas
- **Contenido temático**: Identificación de temas recurrentes

### Indicadores Emocionales
- **Expresiones emocionales**: Detección de emociones expresadas
- **Cambios de estado**: Seguimiento de transiciones emocionales
- **Patrones de estrés**: Identificación de momentos de tensión

## Recomendaciones Terapéuticas
1. **Continuar con**: [Recomendaciones específicas]
2. **Explorar**: [Nuevas áreas de trabajo]
3. **Monitorear**: [Aspectos a observar]

## Próximos Pasos
- Programar seguimiento en 2 semanas
- Enfocar en objetivos específicos identificados
- Evaluar progreso en próximas sesiones

---
*Informe generado automáticamente por iNFORiA AI*
      `;

      setGeneratedReport(mockReport);
      setIsModalOpen(true);

      toast({
        title: "Informe Generado",
        description: "El informe inteligente ha sido creado exitosamente.",
      });

    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "No se pudo generar el informe. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveReport = async () => {
    if (!generatedReport) return;

    try {
      await saveReport({
        title: reportTitle,
        content: generatedReport,
        files: uploadedFiles.map(f => f.name),
        created_at: new Date().toISOString()
      });

      toast({
        title: "Informe Guardado",
        description: "El informe ha sido guardado en tu biblioteca.",
      });

      // Limpiar formulario
      setUploadedFiles([]);
      setReportTitle("");
      setReportDescription("");
      setGeneratedReport(null);
      setIsModalOpen(false);

    } catch (error) {
      console.error('Error saving report:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar el informe.",
        variant: "destructive",
      });
    }
  };

  const getFileStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'uploaded':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing':
        return <Brain className="h-4 w-4 text-purple-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FileAudio className="h-4 w-4 text-gray-500" />;
    }
  };

  const getFileStatusText = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
        return 'Subiendo...';
      case 'uploaded':
        return 'Subido';
      case 'processing':
        return 'Procesando...';
      case 'completed':
        return 'Completado';
      case 'error':
        return 'Error';
      default:
        return 'Pendiente';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-semibold text-foreground mb-2">
            Generador de Informes Inteligentes
          </h1>
          <p className="text-muted-foreground font-sans">
            Crea informes profesionales basados en tus grabaciones de sesiones
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Panel Izquierdo - Subida de Archivos */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Subir Archivos de Audio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="audio/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="mb-4"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Seleccionar Archivos
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Arrastra archivos de audio aquí o haz clic para seleccionar
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Formatos soportados: MP3, WAV, M4A (máx. 100MB por archivo)
                  </p>
                </div>

                {/* Lista de archivos subidos */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Archivos Subidos</h4>
                    {uploadedFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          {getFileStatusIcon(file.status)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {getFileStatusText(file.status)}
                          </Badge>
                          {file.status === 'uploading' && (
                            <Progress value={file.progress} className="w-16 h-2" />
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(file.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Información del Informe */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Información del Informe
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Título del Informe</label>
                  <Input
                    placeholder="Ej: Sesión de Terapia - María González"
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Descripción (opcional)</label>
                  <Textarea
                    placeholder="Agrega notas o contexto adicional..."
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    className="mt-1"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Panel Derecho - Generación y Vista Previa */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Generación de Informe
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-secondary/50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">¿Qué hace la IA?</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Analiza patrones de comunicación</li>
                    <li>• Identifica estados emocionales</li>
                    <li>• Evalúa progreso terapéutico</li>
                    <li>• Genera recomendaciones personalizadas</li>
                  </ul>
                </div>

                <Button
                  onClick={handleGenerateReport}
                  disabled={isGenerating || uploadedFiles.length === 0}
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generando Informe...
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 h-4 w-4" />
                      Generar Informe con IA
                    </>
                  )}
                </Button>

                {isGenerating && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Procesando archivos...</span>
                      <span>75%</span>
                    </div>
                    <Progress value={75} className="w-full" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Información Adicional */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="h-5 w-5" />
                  Consejos para Mejores Resultados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <p>Usa archivos de audio de alta calidad (mínimo 16kHz)</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <p>Incluye sesiones completas para análisis más precisos</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <p>Proporciona contexto en la descripción del informe</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <p>Revisa y edita el informe antes de guardarlo</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Modal para mostrar el informe generado */}
      {generatedReport && (
        <ReportDisplayModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          report={generatedReport}
          title={reportTitle}
          onSave={handleSaveReport}
        />
      )}
    </div>
  );
};

export default ReportGenerator; 