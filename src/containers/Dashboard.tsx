import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import CalendarModule from "@/containers/CalendarModule";
import { ReportModule } from "@/components/ReportModule";
import { SearchModule } from "@/components/SearchModule";
import DayFocus from "@/components/DayFocus";

export const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Puesto de Mando Clínico - Layout principal */}
      <main className="h-[calc(100vh-80px)] flex gap-6 p-6">
        {/* Columna Izquierda - Foco del Día (70% width) */}
        <div className="w-[70%]">
          <DayFocus />
        </div>

        {/* Columna Derecha - Calendario (30% width) */}
        <div className="w-[30%]">
          <CalendarModule />
        </div>
      </main>
    </div>
  );
};