import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Loader2, Shield, Lock } from "lucide-react";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      
      // Mostrar mensaje de seguridad antes de redirigir
      toast({
        title: "🔒 Autenticación Segura",
        description: "Te estamos conectando con Google de forma segura",
      });

      // Redirigir a nuestra página de transición en lugar de directamente a Supabase
      setTimeout(() => {
        navigate('/auth/redirect');
      }, 1000);

    } catch (error) {
      console.error('Error inesperado:', error);
      toast({
        title: "Error inesperado",
        description: "Ocurrió un problema durante el inicio de sesión",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-xl shadow-2xl border border-border">
        {/* Logo y Título */}
        <div className="text-center">
          <div className="mb-6">
            <h1 className="text-4xl font-serif font-bold text-primary tracking-tight">
              iNFORiA
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Plataforma de Gestión Clínica
            </p>
          </div>
          <h2 className="text-2xl font-serif font-semibold text-foreground">
            Bienvenido de vuelta
          </h2>
          <p className="mt-2 text-muted-foreground font-sans">
            Accede a tu cuenta para gestionar tus pacientes y sesiones terapéuticas.
          </p>
        </div>

        {/* Información de Seguridad */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Autenticación Segura</span>
          </div>
          <p className="text-xs text-blue-700">
            Tu sesión será gestionada por Google de forma segura y encriptada.
          </p>
        </div>

        {/* Botón de Google */}
        <div className="space-y-4">
          <Button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full h-12 font-sans text-base bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm"
            variant="outline"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C9.37,19.27 7,17.24 7,14.5C7,11.76 9.37,9.73 12.19,9.73C13.8,9.73 15.09,10.36 15.83,11.05L17.78,9.1C16.16,7.56 14.38,6.83 12.19,6.83C8.43,6.83 5.18,9.75 5.18,14.5C5.18,19.25 8.43,22.17 12.19,22.17C16.22,22.17 21.5,19.33 21.5,14.5C21.5,13.25 21.45,12.13 21.35,11.1Z"
                />
              </svg>
            )}
            {isLoading ? "Conectando de forma segura..." : "Continuar con Google"}
          </Button>

          {/* Información adicional */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Al continuar, aceptas nuestros términos de servicio y política de privacidad.
            </p>
          </div>
        </div>

        {/* Footer con información de seguridad */}
        <div className="text-center pt-4 border-t border-border">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Lock className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Conexión encriptada</span>
          </div>
          <p className="text-xs text-muted-foreground">
            ¿Necesitas ayuda?{" "}
            <a href="/help" className="text-primary hover:underline">
              Contacta con soporte
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
