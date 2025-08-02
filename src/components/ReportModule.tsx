import { useState, useCallback } from "react";
import { Upload, FileText, Mic, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export const ReportModule = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const { toast } = useToast();

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = droppedFiles.filter(file => 
      file.type.startsWith('audio/') || 
      file.type.startsWith('text/') ||
      file.type === 'application/pdf'
    );

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
      toast({
        title: "Archivos cargados",
        description: `${validFiles.length} archivo(s) añadido(s) correctamente`,
      });
    }
  }, [toast]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);
      toast({
        title: "Archivos seleccionados",
        description: `${selectedFiles.length} archivo(s) añadido(s) correctamente`,
      });
    }
  };

  const generateReport = () => {
    if (files.length === 0) {
      toast({
        title: "Sin archivos",
        description: "Por favor, añade al menos un archivo para generar el informe",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Generando informe...",
      description: "La IA está procesando tus archivos. Esto puede tomar unos momentos.",
    });
  };

  return (
    <Card className="bg-card rounded-lg border border-border p-4 h-full flex flex-col">
      <h2 className="font-serif text-lg font-medium text-foreground mb-4">Redactar Informe</h2>
      
      {/* File Upload Area */}
      <div className="flex-1">
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragging 
              ? 'border-primary bg-primary/5' 
              : 'border-border hover:border-primary/50'
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input
            type="file"
            multiple
            accept="audio/*,text/*,.pdf"
            onChange={handleFileInput}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              Arrastra archivos aquí o haz clic para seleccionar
            </p>
            <p className="text-xs text-muted-foreground">
              Soporta audio, texto y PDF
            </p>
          </label>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            <h3 className="text-sm font-medium text-foreground">Archivos seleccionados:</h3>
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-background rounded border">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{file.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFiles(prev => prev.filter((_, i) => i !== index))}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Generate Button */}
      <Button
        onClick={generateReport}
        disabled={files.length === 0}
        className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        <Sparkles className="mr-2 h-4 w-4" />
        Generar Informe con IA
      </Button>
    </Card>
  );
};