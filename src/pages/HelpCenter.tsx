import React, { useState, useEffect } from "react";
import { NavigationHeader } from "@/components/NavigationHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  HelpCircle, 
  Play, 
  Clock, 
  Search, 
  BookOpen,
  Video,
  Users,
  FileText,
  Calendar,
  Settings,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  getFAQs, 
  getTutorials, 
  searchFAQs, 
  searchTutorials,
  formatDuration,
  FAQCategory,
  TutorialCategory,
  FAQ,
  Tutorial
} from "@/services/supportApi";
import VideoPlayerModal from "@/components/VideoPlayerModal";
import ReactMarkdown from "react-markdown";

const HelpCenter = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("faqs");
  const [faqCategories, setFaqCategories] = useState<FAQCategory[]>([]);
  const [tutorialCategories, setTutorialCategories] = useState<TutorialCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<{ faqs: FAQ[], tutorials: Tutorial[] }>({ faqs: [], tutorials: [] });
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [faqs, tutorials] = await Promise.all([
        getFAQs(),
        getTutorials()
      ]);
      setFaqCategories(faqs);
      setTutorialCategories(tutorials);
    } catch (error) {
      console.error('Error loading help data:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo cargar el contenido de ayuda.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Búsqueda en tiempo real
  useEffect(() => {
    const performSearch = async () => {
      if (!searchTerm.trim()) {
        setSearchResults({ faqs: [], tutorials: [] });
        return;
      }

      try {
        setSearchLoading(true);
        const [faqResults, tutorialResults] = await Promise.all([
          searchFAQs(searchTerm),
          searchTutorials(searchTerm)
        ]);
        setSearchResults({ faqs: faqResults, tutorials: tutorialResults });
      } catch (error) {
        console.error('Search error:', error);
        toast({
          title: "Error en búsqueda",
          description: "No se pudo realizar la búsqueda.",
          variant: "destructive",
        });
      } finally {
        setSearchLoading(false);
      }
    };

    const timeoutId = setTimeout(performSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleTutorialClick = (tutorial: Tutorial) => {
    setSelectedTutorial(tutorial);
    setIsVideoModalOpen(true);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Pacientes":
        return <Users className="h-4 w-4" />;
      case "Informes":
        return <FileText className="h-4 w-4" />;
      case "Calendario":
        return <Calendar className="h-4 w-4" />;
      case "Búsqueda":
        return <Search className="h-4 w-4" />;
      case "Facturación":
        return <Settings className="h-4 w-4" />;
      case "Seguridad":
        return <Settings className="h-4 w-4" />;
      case "Primeros Pasos":
        return <BookOpen className="h-4 w-4" />;
      case "Funciones Avanzadas":
        return <Settings className="h-4 w-4" />;
      default:
        return <HelpCircle className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Pacientes":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Informes":
        return "bg-green-100 text-green-800 border-green-200";
      case "Calendario":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Búsqueda":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Facturación":
        return "bg-red-100 text-red-800 border-red-200";
      case "Seguridad":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "Primeros Pasos":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "Funciones Avanzadas":
        return "bg-pink-100 text-pink-800 border-pink-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const renderFAQs = (categories: FAQCategory[]) => {
    if (categories.length === 0) {
      return (
        <div className="text-center py-8">
          <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No se encontraron FAQs.</p>
        </div>
      );
    }

    return (
      <Accordion type="multiple" className="w-full">
        {categories.map((category) => (
          <AccordionItem key={category.category} value={category.category}>
            <AccordionTrigger className="flex items-center space-x-2 hover:no-underline">
              <div className="flex items-center space-x-2">
                {getCategoryIcon(category.category)}
                <span className="font-medium">{category.category}</span>
                <Badge variant="secondary" className="ml-2">
                  {category.faqs.length}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                {category.faqs.map((faq) => (
                  <div key={faq.id} className="border-l-2 border-primary/20 pl-4">
                    <h4 className="font-medium text-foreground mb-2">
                      {faq.question}
                    </h4>
                    <div className="prose prose-sm max-w-none text-muted-foreground">
                      <ReactMarkdown>{faq.answer}</ReactMarkdown>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    );
  };

  const renderTutorials = (categories: TutorialCategory[]) => {
    if (categories.length === 0) {
      return (
        <div className="text-center py-8">
          <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No se encontraron tutoriales.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {categories.map((category) => (
          <div key={category.category}>
            <div className="flex items-center space-x-2 mb-4">
              {getCategoryIcon(category.category)}
              <h3 className="text-lg font-semibold">{category.category}</h3>
              <Badge variant="secondary">{category.tutorials.length}</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.tutorials.map((tutorial) => (
                <Card 
                  key={tutorial.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleTutorialClick(tutorial)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base font-medium line-clamp-2">
                          {tutorial.title}
                        </CardTitle>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge className={getCategoryColor(tutorial.category)}>
                            {tutorial.category}
                          </Badge>
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{formatDuration(tutorial.duration_minutes)}</span>
                          </div>
                        </div>
                      </div>
                      <Play className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    </div>
                  </CardHeader>
                  {tutorial.description && (
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {tutorial.description}
                      </p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderSearchResults = () => {
    const hasResults = searchResults.faqs.length > 0 || searchResults.tutorials.length > 0;

    if (!hasResults && searchTerm.trim()) {
      return (
        <div className="text-center py-8">
          <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            No se encontraron resultados para "{searchTerm}"
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Intenta con otros términos de búsqueda
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {searchResults.faqs.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <HelpCircle className="h-5 w-5" />
              <span>Preguntas Frecuentes ({searchResults.faqs.length})</span>
            </h3>
            <div className="space-y-4">
              {searchResults.faqs.map((faq) => (
                <Card key={faq.id}>
                  <CardHeader>
                    <CardTitle className="text-base">{faq.question}</CardTitle>
                    <Badge className={getCategoryColor(faq.category)}>
                      {faq.category}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none text-muted-foreground">
                      <ReactMarkdown>{faq.answer}</ReactMarkdown>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {searchResults.tutorials.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <Video className="h-5 w-5" />
              <span>Tutoriales ({searchResults.tutorials.length})</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.tutorials.map((tutorial) => (
                <Card 
                  key={tutorial.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleTutorialClick(tutorial)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base font-medium line-clamp-2">
                          {tutorial.title}
                        </CardTitle>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge className={getCategoryColor(tutorial.category)}>
                            {tutorial.category}
                          </Badge>
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{formatDuration(tutorial.duration_minutes)}</span>
                          </div>
                        </div>
                      </div>
                      <Play className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    </div>
                  </CardHeader>
                  {tutorial.description && (
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {tutorial.description}
                      </p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationHeader />
        <main className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Cargando centro de ayuda...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader />
      
      <main className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <HelpCircle className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-serif font-semibold text-foreground">
              Centro de Ayuda
            </h1>
          </div>
          <p className="text-muted-foreground font-sans max-w-2xl mx-auto">
            Encuentra respuestas a tus preguntas y aprende a usar INFORIA con nuestros tutoriales en vídeo
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar en FAQs y tutoriales..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            {searchLoading && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Content */}
        {searchTerm.trim() ? (
          <ScrollArea className="h-[600px]">
            {renderSearchResults()}
          </ScrollArea>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="faqs" className="flex items-center space-x-2">
                <HelpCircle className="h-4 w-4" />
                <span>Preguntas Frecuentes</span>
              </TabsTrigger>
              <TabsTrigger value="tutorials" className="flex items-center space-x-2">
                <Video className="h-4 w-4" />
                <span>Vídeo Tutoriales</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="faqs" className="mt-6">
              <ScrollArea className="h-[600px]">
                {renderFAQs(faqCategories)}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="tutorials" className="mt-6">
              <ScrollArea className="h-[600px]">
                {renderTutorials(tutorialCategories)}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        )}
      </main>

      {/* Video Player Modal */}
      <VideoPlayerModal
        isOpen={isVideoModalOpen}
        onClose={() => {
          setIsVideoModalOpen(false);
          setSelectedTutorial(null);
        }}
        tutorial={selectedTutorial}
      />
    </div>
  );
};

export default HelpCenter; 