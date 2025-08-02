import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, 
  User, 
  FileText, 
  Calendar, 
  Clock,
  ExternalLink,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  universalSearch, 
  debouncedSearch, 
  getSearchSuggestions,
  formatSearchResult,
  SearchResult 
} from "@/services/searchApi";

interface UniversalSearchProps {
  className?: string;
  placeholder?: string;
  showSuggestions?: boolean;
}

const UniversalSearch: React.FC<UniversalSearchProps> = ({
  className = "",
  placeholder = "Buscar pacientes, informes, citas...",
  showSuggestions = true
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cargar sugerencias al montar el componente
  useEffect(() => {
    if (showSuggestions) {
      setSuggestions(getSearchSuggestions());
    }
  }, [showSuggestions]);

  // Función de búsqueda con debounce
  const performSearch = async (term: string) => {
    if (!term || term.trim().length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const searchResults = await debouncedSearch(term, 300, {
        minLength: 2,
        maxResults: 15,
        useAdvanced: true
      });
      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Error en la búsqueda",
        description: error instanceof Error ? error.message : "No se pudo realizar la búsqueda.",
        variant: "destructive",
      });
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar cambios en el término de búsqueda
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setIsOpen(true);

    // Limpiar timeout anterior
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Establecer nuevo timeout para debounce
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };

  // Manejar selección de resultado
  const handleResultSelect = (result: SearchResult) => {
    try {
      if (result.type === 'report') {
        // Abrir informe en Google Drive
        window.open(result.url, '_blank');
        toast({
          title: "Informe abierto",
          description: "El informe se ha abierto en Google Drive.",
        });
      } else if (result.type === 'patient') {
        // Navegar a la ficha del paciente
        navigate(result.url);
        toast({
          title: "Navegando a paciente",
          description: `Abriendo ficha de ${result.title}`,
        });
      } else if (result.type === 'appointment') {
        // Navegar al calendario con la fecha seleccionada
        navigate(result.url);
        toast({
          title: "Navegando a cita",
          description: `Abriendo calendario para ${result.title}`,
        });
      }

      // Cerrar popover y limpiar búsqueda
      setIsOpen(false);
      setSearchTerm("");
      setResults([]);
    } catch (error) {
      console.error('Error navigating to result:', error);
      toast({
        title: "Error de navegación",
        description: "No se pudo abrir el elemento seleccionado.",
        variant: "destructive",
      });
    }
  };

  // Manejar selección de sugerencia
  const handleSuggestionSelect = (suggestion: string) => {
    setSearchTerm(suggestion);
    performSearch(suggestion);
  };

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'patient':
        return <User className="h-4 w-4" />;
      case 'report':
        return <FileText className="h-4 w-4" />;
      case 'appointment':
        return <Calendar className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      patient: "bg-blue-100 text-blue-800 border-blue-200",
      report: "bg-green-100 text-green-800 border-green-200",
      appointment: "bg-purple-100 text-purple-800 border-purple-200"
    };

    const labels = {
      patient: "Paciente",
      report: "Informe",
      appointment: "Cita"
    };

    return (
      <Badge className={`text-xs ${colors[type as keyof typeof colors] || ''}`}>
        {labels[type as keyof typeof labels] || type}
      </Badge>
    );
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={placeholder}
            className={`pl-10 pr-4 ${className}`}
            onFocus={() => setIsOpen(true)}
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      </PopoverTrigger>
      
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput 
            placeholder="Buscar..." 
            value={searchTerm}
            onValueChange={handleSearchChange}
          />
          <CommandList>
            <CommandEmpty>
              {searchTerm.length > 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No se encontraron resultados para "{searchTerm}"</p>
                  <p className="text-sm mt-1">Intenta con otros términos</p>
                </div>
              ) : (
                <div className="p-4">
                  <p className="text-sm text-muted-foreground mb-2">Sugerencias populares:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.slice(0, 6).map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSuggestionSelect(suggestion)}
                        className="text-xs"
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </CommandEmpty>
            
            {results.length > 0 && (
              <ScrollArea className="max-h-[300px]">
                <CommandGroup heading="Resultados de búsqueda">
                  {results.map((result) => {
                    const formattedResult = formatSearchResult(result);
                    return (
                      <CommandItem
                        key={`${result.type}-${result.id}`}
                        onSelect={() => handleResultSelect(result)}
                        className="flex items-center space-x-3 p-3 cursor-pointer hover:bg-secondary"
                      >
                        <div className="flex items-center space-x-2 flex-1">
                          <div className="flex-shrink-0">
                            {getTypeIcon(result.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <p className="font-medium truncate">{result.title}</p>
                              {getTypeBadge(result.type)}
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {result.subtitle}
                            </p>
                            {result.search_highlights && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {result.search_highlights}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {result.type === 'report' && (
                            <ExternalLink className="h-4 w-4 text-muted-foreground" />
                          )}
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {formattedResult.formattedDate}
                          </span>
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </ScrollArea>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default UniversalSearch; 