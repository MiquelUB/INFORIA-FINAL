
import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from '@/components/ProtectedRoute'
import AuthLayout from '@/components/AuthLayout'
import Index from '@/pages/Index'
import Login from '@/pages/Login'
import AuthCallback from '@/pages/AuthCallback'
import AuthRedirect from '@/pages/AuthRedirect'
import PatientList from '@/pages/PatientList'
import PatientProfile from '@/pages/PatientProfile'
import PatientDetailedProfile from '@/pages/PatientDetailedProfile'
import SessionWorkspace from '@/pages/SessionWorkspace'
import MyAccount from '@/pages/MyAccount'
import CalendarView from '@/pages/CalendarView'
import NewPatient from '@/pages/NewPatient'
import HelpCenter from '@/pages/HelpCenter'
import FAQs from '@/pages/FAQs'
import NotFound from '@/pages/NotFound'
import ReportGenerator from '@/pages/ReportGenerator'

export default function App() {
  console.log('🔧 Renderitzant App')

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/auth/redirect" element={<AuthRedirect />} />
        <Route path="/help" element={<HelpCenter />} />
        <Route path="/faqs" element={<FAQs />} />
        
        {/* Ruta protegida principal */}
        <Route element={<ProtectedRoute />}>
          {/* Layout compartido para todas las rutas autenticadas */}
          <Route element={<AuthLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/patients" element={<PatientList />} />
            <Route path="/patients/:id" element={<PatientProfile />} />
            <Route path="/patients/:id/detailed" element={<PatientDetailedProfile />} />
            <Route path="/session/:id" element={<SessionWorkspace />} />
            <Route path="/account" element={<MyAccount />} />
            <Route path="/calendar" element={<CalendarView />} />
            <Route path="/new-patient" element={<NewPatient />} />
            <Route path="/reports" element={<ReportGenerator />} />
          </Route>
        </Route>
        
        {/* Ruta 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
