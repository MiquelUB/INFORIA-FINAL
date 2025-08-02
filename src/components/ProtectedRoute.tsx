import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

const ProtectedRoute = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Obtener la sesión inicial
    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error obteniendo sesión:', error);
          toast({
            title: "Error de conexión",
            description: "No se pudo verificar tu sesión",
            variant: "destructive",
          });
        }
        
        console.log('Initial session:', initialSession);
        
        // Si no hay sesión y no estamos en login, redirigir inmediatamente
        if (!initialSession && location.pathname !== '/login') {
          console.log('No session found, redirecting to login immediately');
          navigate('/login', { replace: true });
          return;
        }
        
        setSession(initialSession);
        setIsLoading(false);
      } catch (error) {
        console.error('Error inesperado:', error);
        setIsLoading(false);
        navigate('/login', { replace: true });
      }
    };

    getInitialSession();

    // Suscribirse a los cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        setIsLoading(false);

        // Manejar eventos específicos
        if (event === 'SIGNED_IN' && session) {
          // Si el usuario acaba de iniciar sesión, redirigir al dashboard
          if (location.pathname === '/login') {
            toast({
              title: "¡Bienvenido!",
              description: "Has iniciado sesión exitosamente",
            });
            navigate('/', { replace: true });
          }
        } else if (event === 'SIGNED_OUT') {
          // Si el usuario cerró sesión, redirigir al login
          toast({
            title: "Sesión cerrada",
            description: "Has cerrado sesión exitosamente",
          });
          navigate('/login', { replace: true });
        } else if (event === 'TOKEN_REFRESHED' && session) {
          // Token refrescado exitosamente
          console.log('Token refreshed successfully');
        }
      }
    );

    // Cleanup de la suscripción
    return () => subscription.unsubscribe();
  }, [navigate, location.pathname, toast]);

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 font-sans">Verificando autenticación...</p>
          <p className="text-sm text-muted-foreground mt-2">Esto puede tomar unos segundos</p>
        </div>
      </div>
    );
  }

  // Redirigir a login si no hay sesión
  if (!session) {
    console.log('No session found, redirecting to login');
    navigate('/login', { replace: true });
    return null;
  }

  // Renderizar el contenido protegido si hay sesión
  console.log('Session found, rendering protected content');
  return <Outlet />;
};

export default ProtectedRoute; 