import React, { useState, useEffect, useMemo } from "react";
import { Calendar as BigCalendar } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { es } from "date-fns/locale";
import dateFnsLocalizer from "react-big-calendar/lib/localizers/date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  MapPin,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAppointments, Appointment } from "@/services/appointmentApi";
import NewAppointmentModal from "@/containers/NewAppointmentModal";

// Configurar localización para español
const locales = {
  'es': es,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource?: any;
  appointment: Appointment;
}

const CalendarView = () => {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<{ start: Date; end: Date } | undefined>();

  // Cargar citas al montar el componente
  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const data = await getAppointments();
      setAppointments(data);
    } catch (error) {
      console.error('Error loading appointments:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudieron cargar las citas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Transformar citas a formato de react-big-calendar
  const events: CalendarEvent[] = useMemo(() => {
    return appointments.map(appointment => ({
      id: appointment.id,
      title: appointment.title,
      start: new Date(appointment.start_time),
      end: new Date(appointment.end_time),
      appointment: appointment
    }));
  }, [appointments]);

  // Manejar clic en slot vacío
  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setSelectedTime({ start, end });
    setSelectedDate(undefined);
    setIsModalOpen(true);
  };

  // Manejar clic en evento existente
  const handleSelectEvent = (event: CalendarEvent) => {
    // TODO: Implementar modal de edición de cita
    console.log('Evento seleccionado:', event);
    toast({
      title: "Cita seleccionada",
      description: `${event.title} - ${format(event.start, 'PPp', { locale: es })}`,
    });
  };

  // Manejar clic en fecha específica
  const handleNavigate = (newDate: Date) => {
    setSelectedDate(newDate);
    setSelectedTime(undefined);
    setIsModalOpen(true);
  };

  // Componente personalizado para eventos
  const EventComponent = ({ event }: { event: CalendarEvent }) => {
    const getStatusColor = (status: string) => {
      switch (status) {
        case "completed":
          return "bg-green-500";
        case "cancelled":
          return "bg-red-500";
        case "no_show":
          return "bg-yellow-500";
        default:
          return "bg-blue-500";
      }
    };

    return (
      <div className="h-full w-full p-1">
        <div className={`h-full w-full rounded p-1 text-xs text-white ${getStatusColor(event.appointment.status)}`}>
          <div className="font-medium truncate">{event.title}</div>
          <div className="text-xs opacity-90">
            {format(event.start, 'HH:mm', { locale: es })} - {format(event.end, 'HH:mm', { locale: es })}
          </div>
        </div>
      </div>
    );
  };

  // Componente personalizado para la barra de herramientas
  const ToolbarComponent = (toolbar: any) => {
    const goToToday = () => {
      toolbar.onNavigate('TODAY');
    };

    const goToPrevious = () => {
      toolbar.onNavigate('PREV');
    };

    const goToNext = () => {
      toolbar.onNavigate('NEXT');
    };

    const viewNames = {
      month: 'Mes',
      week: 'Semana',
      day: 'Día',
      agenda: 'Agenda'
    };

    return (
      <div className="flex items-center justify-between p-4 bg-card border-b">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            <CalendarIcon className="h-4 w-4 mr-1" />
            Hoy
          </Button>
          <Button variant="outline" size="sm" onClick={goToPrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold ml-4">
            {toolbar.label}
          </h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            {Object.entries(viewNames).map(([view, label]) => (
              <Button
                key={view}
                variant={toolbar.view === view ? "default" : "outline"}
                size="sm"
                onClick={() => toolbar.onView(view)}
              >
                {label}
              </Button>
            ))}
          </div>
          
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Cita
          </Button>
        </div>
      </div>
    );
  };

  // Estadísticas del calendario
  const getCalendarStats = () => {
    const today = new Date();
    const todayAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.start_time);
      return aptDate.toDateString() === today.toDateString();
    });

    const upcomingAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.start_time);
      return aptDate > today;
    });

    const completedAppointments = appointments.filter(apt => apt.status === 'completed');
    const cancelledAppointments = appointments.filter(apt => apt.status === 'cancelled');

    return {
      today: todayAppointments.length,
      upcoming: upcomingAppointments.length,
      completed: completedAppointments.length,
      cancelled: cancelledAppointments.length,
      total: appointments.length
    };
  };

  const stats = getCalendarStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Cargando calendario...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      
      <main className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif font-semibold text-foreground mb-2">
              Calendario de Citas
            </h1>
            <p className="text-muted-foreground font-sans">
              Gestiona tu agenda y organiza tus sesiones terapéuticas
            </p>
          </div>
          
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Cita
          </Button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Citas</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <CalendarIcon className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Hoy</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.today}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Próximas</p>
                  <p className="text-2xl font-bold text-green-600">{stats.upcoming}</p>
                </div>
                <User className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completadas</p>
                  <p className="text-2xl font-bold text-green-500">{stats.completed}</p>
                </div>
                <Badge className="h-8 w-8 bg-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Canceladas</p>
                  <p className="text-2xl font-bold text-red-500">{stats.cancelled}</p>
                </div>
                <Badge className="h-8 w-8 bg-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calendario */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-xl font-medium text-foreground">
              Agenda de Citas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[600px]">
              <BigCalendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
                selectable
                popup
                views={['month', 'week', 'day', 'agenda']}
                defaultView="week"
                step={30}
                timeslots={2}
                components={{
                  toolbar: ToolbarComponent,
                  event: EventComponent
                }}
                messages={{
                  next: "Siguiente",
                  previous: "Anterior",
                  today: "Hoy",
                  month: "Mes",
                  week: "Semana",
                  day: "Día",
                  agenda: "Agenda",
                  date: "Fecha",
                  time: "Hora",
                  event: "Evento",
                  noEventsInRange: "No hay eventos en este rango.",
                  showMore: total => `+ Ver más (${total})`
                }}
                formats={{
                  dayFormat: 'dddd DD/MM',
                  dayHeaderFormat: 'dddd DD/MM',
                  dayRangeHeaderFormat: ({ start, end }) => 
                    `${format(start, 'DD/MM', { locale: es })} - ${format(end, 'DD/MM', { locale: es })}`,
                  monthHeaderFormat: 'MMMM yyyy',
                  weekHeaderFormat: 'DD/MM',
                  timeGutterFormat: 'HH:mm'
                }}
              />
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Modal para nueva cita */}
      <NewAppointmentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedDate(undefined);
          setSelectedTime(undefined);
        }}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        onAppointmentCreated={loadAppointments}
      />
    </div>
  );
};

export default CalendarView; 