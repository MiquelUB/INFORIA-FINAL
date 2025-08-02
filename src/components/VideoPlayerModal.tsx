import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Play, 
  Clock, 
  X, 
  ExternalLink,
  Calendar,
  FileText
} from "lucide-react";
import { Tutorial, formatDuration, convertToEmbedUrl } from "@/services/supportApi";

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  tutorial: Tutorial | null;
}

const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  isOpen,
  onClose,
  tutorial
}) => {
  const [embedUrl, setEmbedUrl] = useState<string>("");

  useEffect(() => {
    if (tutorial && isOpen) {
      const convertedUrl = convertToEmbedUrl(tutorial.video_url);
      setEmbedUrl(convertedUrl);
    }
  }, [tutorial, isOpen]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Primeros Pasos":
        return <Play className="h-4 w-4" />;
      case "Informes":
        return <FileText className="h-4 w-4" />;
      case "Pacientes":
        return <Calendar className="h-4 w-4" />;
      case "Calendario":
        return <Calendar className="h-4 w-4" />;
      case "Funciones Avanzadas":
        return <Play className="h-4 w-4" />;
      default:
        return <Play className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Primeros Pasos":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Informes":
        return "bg-green-100 text-green-800 border-green-200";
      case "Pacientes":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Calendario":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Funciones Avanzadas":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (!tutorial) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getCategoryIcon(tutorial.category)}
              <div>
                <DialogTitle className="text-xl font-semibold">
                  {tutorial.title}
                </DialogTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge className={getCategoryColor(tutorial.category)}>
                    {tutorial.category}
                  </Badge>
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{formatDuration(tutorial.duration_minutes)}</span>
                  </div>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="p-6 pt-4">
          {/* Video Player */}
          <div className="relative w-full mb-6">
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              {embedUrl && (
                <iframe
                  src={embedUrl}
                  title={tutorial.title}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>
          </div>

          {/* Description */}
          {tutorial.description && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Descripción</h3>
              <ScrollArea className="max-h-32">
                <p className="text-muted-foreground leading-relaxed">
                  {tutorial.description}
                </p>
              </ScrollArea>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>Duración: {formatDuration(tutorial.duration_minutes)}</span>
              <span>•</span>
              <span>Categoría: {tutorial.category}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(tutorial.video_url, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Ver en YouTube
              </Button>
              <Button onClick={onClose}>
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoPlayerModal; 