# ReportDisplayModal - Componente de Visualización de Informes

## Descripción
El componente `ReportDisplayModal` es un modal profesional diseñado para mostrar informes generados por IA en formato Markdown. Proporciona una experiencia de usuario completa con funcionalidades de copia, descarga y visualización optimizada.

## Características

### ✅ Funcionalidades Principales
- **Visualización de Markdown**: Renderiza contenido Markdown con estilos personalizados
- **Copiar al Portapapeles**: Copia todo el contenido del informe con feedback visual
- **Descargar Archivo**: Descarga el informe como archivo .md con fecha automática
- **Modal Responsivo**: Se adapta a diferentes tamaños de pantalla
- **Scroll Optimizado**: Área de scroll para informes largos
- **Feedback Visual**: Toasts de confirmación para acciones del usuario

### 🎨 Diseño
- **Tema Consistente**: Usa los componentes de shadcn/ui
- **Tipografía Optimizada**: Estilos personalizados para Markdown
- **Iconos Intuitivos**: Iconos de Lucide React para mejor UX
- **Animaciones Suaves**: Transiciones fluidas

## Uso

### Importación
```tsx
import ReportDisplayModal from "@/src/components/ReportDisplayModal";
```

### Props
```tsx
interface ReportDisplayModalProps {
  isOpen: boolean;           // Controla la visibilidad del modal
  onClose: () => void;       // Función para cerrar el modal
  reportContent: string;      // Contenido del informe en formato Markdown
}
```

### Ejemplo de Implementación
```tsx
const [isModalOpen, setIsModalOpen] = useState(false);
const [reportContent, setReportContent] = useState("");

// En tu función de generación de informe
const handleGenerateReport = async () => {
  try {
    const { report } = await generateIntelligentReport(transcription, notes);
    setReportContent(report);
    setIsModalOpen(true);
  } catch (error) {
    // Manejo de errores
  }
};

// En tu JSX
<ReportDisplayModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  reportContent={reportContent}
/>
```

## Estructura del Modal

### Header
- Título: "Informe Generado por IA"
- Botón de cerrar (X) en la esquina superior derecha

### Contenido
- **Área de Scroll**: Contenido del informe con altura fija (60vh)
- **Renderizado Markdown**: Componentes personalizados para cada elemento:
  - `h1`, `h2`, `h3`: Títulos con estilos diferenciados
  - `p`: Párrafos con espaciado optimizado
  - `ul`, `ol`: Listas con bullets y numeración
  - `strong`, `em`: Texto en negrita e itálica
  - `code`: Código inline con fondo diferenciado
  - `blockquote`: Citas con borde izquierdo

### Footer
- **Botón Descargar**: Descarga el archivo como .md
- **Botón Copiar**: Copia al portapapeles con feedback
- **Botón Cerrar**: Cierra el modal

## Funcionalidades Detalladas

### Copiar al Portapapeles
```tsx
const handleCopyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(reportContent);
    setHasCopied(true);
    toast({
      title: "Copiado",
      description: "El informe se ha copiado al portapapeles.",
    });
    
    setTimeout(() => setHasCopied(false), 2000);
  } catch (error) {
    toast({
      title: "Error",
      description: "No se pudo copiar el informe al portapapeles.",
      variant: "destructive",
    });
  }
};
```

### Descargar Archivo
```tsx
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
};
```

## Estilos Markdown Personalizados

### Títulos
- `h1`: `text-2xl font-bold text-foreground mb-4`
- `h2`: `text-xl font-semibold text-foreground mb-3 mt-6`
- `h3`: `text-lg font-medium text-foreground mb-2 mt-4`

### Párrafos y Listas
- `p`: `text-foreground mb-3 leading-relaxed`
- `ul`: `list-disc list-inside text-foreground mb-3 space-y-1`
- `ol`: `list-decimal list-inside text-foreground mb-3 space-y-1`

### Elementos Especiales
- `strong`: `font-semibold text-foreground`
- `em`: `italic text-foreground`
- `code`: `bg-muted px-1 py-0.5 rounded text-sm font-mono`
- `blockquote`: `border-l-4 border-primary pl-4 italic text-muted-foreground my-4`

## Integración en SessionWorkspace

### Estados Añadidos
```tsx
const [generatedReport, setGeneratedReport] = useState<string>("");
const [isReportModalOpen, setReportModalOpen] = useState<boolean>(false);
```

### Modificación de handleGenerateReport
```tsx
const handleGenerateReport = async () => {
  // ... validaciones existentes
  
  try {
    const { report } = await generateIntelligentReport(transcription, notes);
    setGeneratedReport(report);
    setReportModalOpen(true);
    toast({ title: "Informe generado", description: "El informe se ha generado correctamente." });
  } catch (error) {
    // ... manejo de errores
  } finally {
    setIsGenerating(false);
  }
};
```

### Renderizado del Modal
```tsx
<ReportDisplayModal
  isOpen={isReportModalOpen}
  onClose={handleCloseReportModal}
  reportContent={generatedReport}
/>
```

## Dependencias

### Librerías Requeridas
- `react-markdown`: Para renderizar contenido Markdown
- `@radix-ui/react-dialog`: Para el modal (incluido en shadcn/ui)
- `@radix-ui/react-scroll-area`: Para el área de scroll
- `lucide-react`: Para iconos
- `@/hooks/use-toast`: Para notificaciones

### Instalación
```bash
npm install react-markdown
```

## Consideraciones de Accesibilidad

- **Navegación por Teclado**: El modal se puede cerrar con Escape
- **Screen Readers**: Textos alternativos para iconos
- **Focus Management**: El foco se maneja automáticamente
- **Contraste**: Colores optimizados para legibilidad

## Personalización

### Modificar Estilos Markdown
Edita los componentes en la prop `components` del `ReactMarkdown`:

```tsx
components={{
  h1: ({ children }) => (
    <h1 className="tu-clase-personalizada">
      {children}
    </h1>
  ),
  // ... otros componentes
}}
```

### Cambiar Comportamiento de Botones
Modifica las funciones `handleCopyToClipboard` y `handleDownloadReport` según tus necesidades.

## Troubleshooting

### Error: "Cannot find module 'react-markdown'"
```bash
npm install react-markdown
```

### Error: "Dialog component not found"
Verifica que `@/components/ui/dialog` esté disponible en tu proyecto.

### El modal no se abre
Verifica que `isOpen` sea `true` y que `onClose` esté definida correctamente.

### El contenido no se renderiza
Verifica que `reportContent` contenga texto válido en formato Markdown. 