import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        setMessage('Verificando tu autenticación...');
        
        // Obtener la sesión actual
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error en callback:', error);
          setStatus('error');
          setMessage('Error al verificar la autenticación');
          toast({
            title: "Error de autenticación",
            description: error.message,
            variant: "destructive",
          });
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        if (session) {
          setStatus('success');
          setMessage('¡Autenticación exitosa!');
          toast({
            title: "¡Bienvenido!",
            description: "Has iniciado sesión correctamente",
          });
          
          // Redirigir al dashboard después de mostrar el éxito
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 1500);
        } else {
          setStatus('error');
          setMessage('No se pudo verificar la sesión');
          setTimeout(() => navigate('/login'), 3000);
        }
      } catch (error) {
        console.error('Error inesperado:', error);
        setStatus('error');
        setMessage('Error inesperado durante la autenticación');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-8 w-8 animate-spin text-primary" />;
      case 'success':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-8 w-8 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'text-primary';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-xl shadow-2xl border border-border text-center">
        {/* Logo */}
        <div className="mb-6">
          <h1 className="text-3xl font-serif font-bold text-primary tracking-tight">
            iNFORiA
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Plataforma de Gestión Clínica
          </p>
        </div>

        {/* Status Icon */}
        <div className="flex justify-center mb-4">
          {getStatusIcon()}
        </div>

        {/* Status Message */}
        <div className="space-y-2">
          <h2 className={`text-xl font-semibold ${getStatusColor()}`}>
            {status === 'loading' && 'Verificando autenticación...'}
            {status === 'success' && '¡Autenticación exitosa!'}
            {status === 'error' && 'Error de autenticación'}
          </h2>
          <p className="text-muted-foreground font-sans">
            {message}
          </p>
        </div>

        {/* Progress Bar for Loading */}
        {status === 'loading' && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        )}

        {/* Additional Info */}
        <div className="text-xs text-muted-foreground pt-4 border-t border-border">
          <p>Estás siendo redirigido automáticamente...</p>
          {status === 'error' && (
            <button 
              onClick={() => navigate('/login')}
              className="text-primary hover:underline mt-2"
            >
              Volver al login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthCallback; 