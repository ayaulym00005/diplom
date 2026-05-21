import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { LangProvider } from './context/LangContext'
import ProtectedRoute from './components/layout/ProtectedRoute'

import LandingPage        from './pages/LandingPage'
import LoginPage          from './pages/LoginPage'
import RegisterPage       from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import OnboardingPage     from './pages/OnboardingPage'
import DashboardPage      from './pages/DashboardPage'
import AnalyzePage        from './pages/AnalyzePage'
import ResultPage         from './pages/ResultPage'
import HistoryPage        from './pages/HistoryPage'
import DiaryPage          from './pages/DiaryPage'
import DermatologistPage  from './pages/DermatologistPage'
import CosmeticsPage      from './pages/CosmeticsPage'
import ChatPage           from './pages/ChatPage'
import ProfilePage        from './pages/ProfilePage'
import NotFoundPage       from './pages/NotFoundPage'
import AdminPage          from './pages/AdminPage'

export default function App() {
  return (
    <LangProvider>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/"                element={<LandingPage />} />
          <Route path="/login"           element={<LoginPage />} />
          <Route path="/register"        element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/admin"           element={<AdminPage />} />

          {/* Auth required */}
          <Route path="/onboarding" element={
            <ProtectedRoute><OnboardingPage /></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute><ProfilePage /></ProtectedRoute>
          } />

          {/* Auth + onboarding */}
          <Route path="/dashboard" element={
            <ProtectedRoute requireOnboarding><DashboardPage /></ProtectedRoute>
          } />
          <Route path="/analyze" element={
            <ProtectedRoute requireOnboarding><AnalyzePage /></ProtectedRoute>
          } />
          <Route path="/result/:id" element={
            <ProtectedRoute requireOnboarding><ResultPage /></ProtectedRoute>
          } />
          <Route path="/history" element={
            <ProtectedRoute requireOnboarding><HistoryPage /></ProtectedRoute>
          } />
          <Route path="/diary" element={
            <ProtectedRoute requireOnboarding><DiaryPage /></ProtectedRoute>
          } />
          <Route path="/dermatologist" element={
            <ProtectedRoute requireOnboarding><DermatologistPage /></ProtectedRoute>
          } />
          <Route path="/cosmetics" element={
            <ProtectedRoute requireOnboarding><CosmeticsPage /></ProtectedRoute>
          } />
          <Route path="/chat" element={
            <ProtectedRoute requireOnboarding><ChatPage /></ProtectedRoute>
          } />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </LangProvider>
  )
}