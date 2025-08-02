import { useEffect, useState } from "react";
import { Loader2, Shield, CheckCircle } from "lucide-react";

const AuthRedirect = () => {
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState('Iniciando autenticación segura...');

  useEffect(() => {
    // Simular pasos de autenticación para dar confianza
    const steps = [
      { message: 'Iniciando autenticación segura...', delay: 1000 },
      { message: 'Conectando con Google de forma segura...', delay: 1500 },
      { message: 'Verificando credenciales...', delay: 1000 },
      { message: 'Redirigiendo a tu dashboard...', delay: 1000 },
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setStep(currentStep + 1);
        setMessage(steps[currentStep].message);
        currentStep++;
      } else {
        clearInterval(interval);
        
        // Usar el proxy local que enmascara la URL de Supabase
        // En el navegador, el usuario verá localhost:8080 en lugar de la URL técnica
        const proxyUrl = `${window.location.origin}/auth-proxy/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(window.location.origin + '/auth/callback')}&access_type=offline&prompt=consent`;
        
        console.log('Redirecting to proxy URL:', proxyUrl);
        window.location.href = proxyUrl;
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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

        {/* Security Badge */}
        <div className="flex justify-center mb-4">
          <div className="flex items-center space-x-2 bg-green-50 border border-green-200 rounded-full px-4 py-2">
            <Shield className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">Conexión Segura</span>
          </div>
        </div>

        {/* Loading Animation */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <CheckCircle className="h-4 w-4 text-green-500 absolute -top-1 -right-1" />
          </div>
        </div>

        {/* Progress Steps */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            Autenticación en Progreso
          </h2>
          <p className="text-muted-foreground font-sans">
            {message}
          </p>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-500" 
              style={{ width: `${(step / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Security Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Información de Seguridad</span>
          </div>
          <p className="text-xs text-blue-700">
            Tu autenticación está siendo procesada de forma segura. 
            Serás redirigido a través de nuestro servidor seguro.
          </p>
        </div>

        {/* Additional Info */}
        <div className="text-xs text-muted-foreground pt-4 border-t border-border">
          <p>Estás siendo redirigido automáticamente...</p>
          <p className="mt-1">Si no eres redirigido en 10 segundos, haz clic en continuar</p>
        </div>
      </div>
    </div>
  );
};

export default AuthRedirect; 