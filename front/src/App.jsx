import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/layout/ProtectedRoute'

import LandingPage    from './pages/LandingPage'
import LoginPage      from './pages/LoginPage'
import RegisterPage   from './pages/RegisterPage'
import OnboardingPage from './pages/OnboardingPage'
import DashboardPage  from './pages/DashboardPage'
import AnalyzePage    from './pages/AnalyzePage'
import ResultPage     from './pages/ResultPage'
import HistoryPage    from './pages/HistoryPage'
import NotFoundPage   from './pages/NotFoundPage'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route path="/"          element={<LandingPage />} />
        <Route path="/login"     element={<LoginPage />} />
        <Route path="/register"  element={<RegisterPage />} />

        {/* Semi-protected: auth required, onboarding not required */}
        <Route path="/onboarding" element={
          <ProtectedRoute>
            <OnboardingPage />
          </ProtectedRoute>
        } />

        {/* Protected + onboarding complete */}
        <Route path="/dashboard" element={
          <ProtectedRoute requireOnboarding>
            <DashboardPage />
          </ProtectedRoute>
        } />

        <Route path="/analyze" element={
          <ProtectedRoute requireOnboarding>
            <AnalyzePage />
          </ProtectedRoute>
        } />

        <Route path="/result/:id" element={
          <ProtectedRoute requireOnboarding>
            <ResultPage />
          </ProtectedRoute>
        } />

        <Route path="/history" element={
          <ProtectedRoute requireOnboarding>
            <HistoryPage />
          </ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  )
}
