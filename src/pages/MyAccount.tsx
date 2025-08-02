
import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  CreditCard, 
  Calendar, 
  Download, 
  Settings, 
  LogOut,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  FileText,
  Shield,
  Zap
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { getSubscriptionStatus, renewSubscriptionPlan, formatPlanName, formatSubscriptionStatus, getStatusColor, getUsagePercentage, needsRenewal } from "@/services/subscriptionApi";

const MyAccount = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("professional");
  const [loading, setLoading] = useState(true);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [renewalLoading, setRenewalLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    collegiate_number: "",
    clinic_name: "",
    avatar_url: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Manejar redirección después de autenticación exitosa
    const handleAuthRedirect = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Si hay un hash en la URL, limpiarlo (solo después de autenticación)
        if (window.location.hash) {
          window.history.replaceState(null, '', window.location.pathname);
          toast({
            title: "¡Bienvenido!",
            description: "Has iniciado sesión exitosamente.",
          });
        }
      }
    };

    handleAuthRedirect();
  }, [toast]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([
        fetchProfile(),
        fetchSubscription()
      ]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (error) {
        toast({ title: "Error", description: "No se pudo cargar el perfil.", variant: "destructive" });
      } else {
        setProfile(data);
        setFormData({
          full_name: data.full_name || "",
          collegiate_number: data.collegiate_number || "",
          clinic_name: data.clinic_name || "",
          avatar_url: data.avatar_url || "",
        });
      }
    }
  };

  const fetchSubscription = async () => {
    setSubscriptionLoading(true);
    try {
      const result = await getSubscriptionStatus();
      if (result.success && result.subscription) {
        setSubscription(result.subscription);
      } else {
        toast({ 
          title: "Error", 
          description: result.error || "No se pudo cargar la información de suscripción.", 
          variant: "destructive" 
        });
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      toast({ 
        title: "Error", 
        description: "No se pudo cargar la información de suscripción.", 
        variant: "destructive" 
      });
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const handleRenewal = async () => {
    setRenewalLoading(true);
    try {
      const result = await renewSubscriptionPlan();
      if (result.success) {
        toast({ 
          title: "Suscripción Renovada", 
          description: "Tu plan ha sido renovado exitosamente. Ya puedes crear nuevos informes." 
        });
        // Refresh subscription data
        await fetchSubscription();
      } else {
        toast({ 
          title: "Error", 
          description: result.error || "No se pudo renovar la suscripción.", 
          variant: "destructive" 
        });
      }
    } catch (error) {
      console.error('Error renewing subscription:', error);
      toast({ 
        title: "Error", 
        description: "No se pudo renovar la suscripción.", 
        variant: "destructive" 
      });
    } finally {
      setRenewalLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase.from('profiles').update(formData).eq('id', user.id);
      if (error) {
        toast({ title: "Error", description: "No se pudo actualizar el perfil.", variant: "destructive" });
      } else {
        toast({ title: "Éxito", description: "Perfil actualizado correctamente." });
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(data);
      }
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      toast({ title: "Error", description: "El archivo no debe exceder 1MB.", variant: "destructive" });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const filePath = `${user.id}/${Date.now()}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);

      if (uploadError) {
        toast({ title: "Error", description: "No se pudo subir la imagen.", variant: "destructive" });
        return;
      }

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setFormData({ ...formData, avatar_url: publicUrl });

      const { error: updateError } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);
      if (updateError) {
        toast({ title: "Error", description: "No se pudo actualizar el perfil.", variant: "destructive" });
      } else {
        toast({ title: "Éxito", description: "Foto de perfil actualizada." });
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(data);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Cargando información de la cuenta...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      
      <div className="container mx-auto px-6 py-8">
        <h1 className="font-serif text-3xl font-medium text-foreground mb-8">Mi Cuenta</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="professional" className="font-sans">
              Mis Datos Profesionales
            </TabsTrigger>
            <TabsTrigger value="subscription" className="font-sans">
              Mi Suscripción
            </TabsTrigger>
            <TabsTrigger value="security" className="font-sans">
              Cuenta y Seguridad
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Mis Datos Profesionales */}
          <TabsContent value="professional">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Mis Datos Profesionales</CardTitle>
                <CardDescription className="font-sans">
                  Gestiona tu información profesional y de contacto
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleProfileUpdate}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                    className="hidden"
                    accept="image/*"
                  />
                  {/* Avatar Upload */}
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                      <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center overflow-hidden">
                        <img
                          src={formData.avatar_url || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158"}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        size="icon"
                        variant="secondary"
                        className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <User className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="font-sans"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Cambiar Foto de Perfil
                    </Button>
                  </div>

                  {/* Form Fields */}
                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor="full_name" className="font-sans">Nombre Completo</Label>
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        className="font-sans"
                      />
                    </div>

                    <div>
                      <Label htmlFor="collegiate_number" className="font-sans">Nº de Colegiado</Label>
                      <Input
                        id="collegiate_number"
                        value={formData.collegiate_number}
                        onChange={handleInputChange}
                        className="font-sans"
                      />
                    </div>

                    <div>
                      <Label htmlFor="clinic_name" className="font-sans">Nombre de la Consulta</Label>
                      <Input
                        id="clinic_name"
                        value={formData.clinic_name}
                        onChange={handleInputChange}
                        className="font-sans"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full font-sans mt-6">
                    Guardar Cambios
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Mi Suscripción */}
          <TabsContent value="subscription">
            <div className="space-y-6">
              {/* Current Subscription Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Estado de Mi Suscripción
                  </CardTitle>
                  <CardDescription className="font-sans">
                    Información detallada de tu plan actual y uso
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {subscriptionLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      <span className="ml-2 text-muted-foreground">Cargando suscripción...</span>
                    </div>
                  ) : subscription ? (
                    <>
                      {/* Plan Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Plan Actual</Label>
                            <p className="text-lg font-semibold">{formatPlanName(subscription.plan_id)}</p>
                          </div>
                          
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Estado</Label>
                            <Badge className={`${getStatusColor(subscription.status)} border`}>
                              {formatSubscriptionStatus(subscription.status)}
                            </Badge>
                          </div>
                          
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Período Actual</Label>
                            <p className="text-sm">
                              Hasta {formatDate(subscription.current_period_end)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Informes Este Mes</Label>
                            <p className="text-2xl font-bold">
                              {subscription.reports_used} / {subscription.reports_limit}
                            </p>
                          </div>
                          
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Informes Restantes</Label>
                            <p className={`text-lg font-semibold ${
                              subscription.reports_remaining <= 5 ? 'text-orange-600' : 'text-green-600'
                            }`}>
                              {subscription.reports_remaining}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Usage Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Uso de Informes</span>
                          <span className="font-medium">
                            {getUsagePercentage(subscription.reports_used, subscription.reports_limit)}%
                          </span>
                        </div>
                        <Progress 
                          value={getUsagePercentage(subscription.reports_used, subscription.reports_limit)} 
                          className="h-2"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>0</span>
                          <span>{subscription.reports_limit}</span>
                        </div>
                      </div>

                      {/* Renewal Section */}
                      {needsRenewal(subscription) && (
                        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                            <div className="flex-1">
                              <h4 className="font-medium text-orange-800">Límite de Informes Alcanzado</h4>
                              <p className="text-sm text-orange-700 mt-1">
                                Has alcanzado el límite de informes de tu plan actual. 
                                Renueva tu suscripción para continuar creando informes.
                              </p>
                              <Button 
                                onClick={handleRenewal}
                                disabled={renewalLoading}
                                className="mt-3 bg-orange-600 hover:bg-orange-700"
                              >
                                {renewalLoading ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Renovando...
                                  </>
                                ) : (
                                  <>
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Renovar Plan Ahora
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Manual Renewal Option */}
                      {!needsRenewal(subscription) && (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-start gap-3">
                            <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div className="flex-1">
                              <h4 className="font-medium text-blue-800">Renovación Anticipada</h4>
                              <p className="text-sm text-blue-700 mt-1">
                                Puedes renovar tu plan antes de que termine el período actual. 
                                Esto reseteará tu contador de informes a 0.
                              </p>
                              <Button 
                                onClick={handleRenewal}
                                disabled={renewalLoading}
                                variant="outline"
                                className="mt-3"
                              >
                                {renewalLoading ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                                    Renovando...
                                  </>
                                ) : (
                                  <>
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Renovar Plan Ahora
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No se pudo cargar la información de suscripción</p>
                      <Button 
                        onClick={fetchSubscription}
                        disabled={subscriptionLoading}
                        variant="outline"
                        className="mt-4"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reintentar
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Plan Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Planes Disponibles</CardTitle>
                  <CardDescription className="font-sans">
                    Compara los diferentes planes y sus características
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                      { id: 'free', name: 'Gratuito', limit: 10, price: 0 },
                      { id: 'profesional', name: 'Profesional', limit: 100, price: 29 },
                      { id: 'clinica', name: 'Clínica', limit: 500, price: 79 },
                      { id: 'enterprise', name: 'Enterprise', limit: 2000, price: 199 }
                    ].map((plan) => (
                      <div 
                        key={plan.id}
                        className={`p-4 rounded-lg border ${
                          subscription?.plan_id === plan.id 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border'
                        }`}
                      >
                        <h3 className="font-semibold">{plan.name}</h3>
                        <p className="text-2xl font-bold mt-2">
                          {plan.price === 0 ? 'Gratis' : `€${plan.price}/mes`}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {plan.limit} informes/mes
                        </p>
                        {subscription?.plan_id === plan.id && (
                          <Badge className="mt-2" variant="secondary">Plan Actual</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab 3: Cuenta y Seguridad */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Cuenta y Seguridad</CardTitle>
                <CardDescription className="font-sans">
                  Gestiona tu contraseña y configuración de seguridad
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="font-sans">Email de acceso</Label>
                  <Input
                    value={profile?.email || ""}
                    readOnly
                    className="bg-muted font-sans"
                  />
                </div>
                
                <div>
                  <Label htmlFor="currentPassword" className="font-sans">Contraseña Actual</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    className="font-sans"
                  />
                </div>
                
                <div>
                  <Label htmlFor="newPassword" className="font-sans">Nueva Contraseña</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    className="font-sans"
                  />
                </div>
                
                <div>
                  <Label htmlFor="confirmPassword" className="font-sans">Repetir Nueva Contraseña</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    className="font-sans"
                  />
                </div>

                <Button className="w-full font-sans">
                  Cambiar Contraseña
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MyAccount;
