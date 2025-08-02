import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Check, X, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReportDisplayModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportContent: string;
  onSave?: (content: string) => Promise<void>;
  isSaving?: boolean;
}

const ReportDisplayModal: React.FC<ReportDisplayModalProps> = ({
  isOpen,
  onClose,
  reportContent,
  onSave,
  isSaving = false,
}) => {
  const { toast } = useToast();
  const [hasCopied, setHasCopied] = useState(false);

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(reportContent);
      setHasCopied(true);
      toast({
        title: "Copiado",
        description: "El informe se ha copiado al portapapeles.",
      });
      
      // Reset the copy state after 2 seconds
      setTimeout(() => {
        setHasCopied(false);
      }, 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo copiar el informe al portapapeles.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadReport = () => {
    const blob = new Blob([reportContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `informe-sesion-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Descargado",
      description: "El informe se ha descargado correctamente.",
    });
  };

  const handleSaveReport = async () => {
    if (!onSave) {
      toast({
        title: "Error",
        description: "La funcionalidad de guardado no está disponible.",
        variant: "destructive",
      });
      return;
    }

    try {
      await onSave(reportContent);
      toast({
        title: "Guardado",
        description: "El informe se ha guardado correctamente en la base de datos.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `No se pudo guardar el informe: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Informe Generado por IA</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0">
          <ScrollArea className="h-[60vh] w-full rounded-md border p-4">
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-2xl font-bold text-foreground mb-4">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-xl font-semibold text-foreground mb-3 mt-6">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-lg font-medium text-foreground mb-2 mt-4">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-foreground mb-3 leading-relaxed">
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside text-foreground mb-3 space-y-1">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside text-foreground mb-3 space-y-1">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-foreground">
                      {children}
                    </li>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-foreground">
                      {children}
                    </strong>
                  ),
                  em: ({ children }) => (
                    <em className="italic text-foreground">
                      {children}
                    </em>
                  ),
                  code: ({ children }) => (
                    <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono">
                      {children}
                    </code>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-4">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {reportContent}
              </ReactMarkdown>
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="flex gap-2 pt-4">
          <Button
            variant="outline"
            onClick={handleDownloadReport}
            className="flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            Descargar
          </Button>
          <Button
            onClick={handleCopyToClipboard}
            className="flex items-center gap-2"
            disabled={hasCopied}
          >
            {hasCopied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {hasCopied ? "Copiado" : "Copiar al Portapapeles"}
          </Button>
          {onSave && (
            <Button
              onClick={handleSaveReport}
              disabled={isSaving}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <Save className="h-4 w-4" />
              {isSaving ? "Guardando..." : "Guardar Informe"}
            </Button>
          )}
          <Button onClick={onClose} variant="secondary">
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReportDisplayModal; 