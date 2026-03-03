import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'

// Pages
import LandingPage from './pages/landing/LandingPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import IdeasListPage from './pages/ideas/IdeasListPage'
import IdeaDetailPage from './pages/ideas/IdeaDetailPage'
import SubmitIdeaPage from './pages/ideas/SubmitIdeaPage'
import ChallengesListPage from './pages/challenges/ChallengesListPage'
import ChallengeDetailPage from './pages/challenges/ChallengeDetailPage'
import SubmitSolutionPage from './pages/challenges/SubmitSolutionPage'
import LeaderboardPage from './pages/leaderboard/LeaderboardPage'
import ProfilePage from './pages/profile/ProfilePage'
import CompanyLoginPage from './pages/company/CompanyLoginPage'
import CompanyRegisterPage from './pages/company/CompanyRegisterPage'
import CompanyDashboardPage from './pages/company/CompanyDashboardPage'
import CreateChallengePage from './pages/company/CreateChallengePage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth()
    
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        )
    }
    
    return isAuthenticated ? children : <Navigate to="/login" replace />
}

function App() {
    return (
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AuthProvider>
                <NotificationProvider>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/company/login" element={<CompanyLoginPage />} />
                        <Route path="/company/register" element={<CompanyRegisterPage />} />
                        <Route path="/challenges" element={<ChallengesListPage />} />
                        <Route path="/challenges/:id" element={<ChallengeDetailPage />} />
                        <Route path="/ideas" element={<IdeasListPage />} />
                        <Route path="/leaderboard" element={<LeaderboardPage />} />

                        {/* Protected Routes */}
                        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                        <Route path="/ideas/new" element={<ProtectedRoute><SubmitIdeaPage /></ProtectedRoute>} />
                        <Route path="/ideas/:id" element={<ProtectedRoute><IdeaDetailPage /></ProtectedRoute>} />
                        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                        <Route path="/challenges/:id/submit" element={<ProtectedRoute><SubmitSolutionPage /></ProtectedRoute>} />
                        <Route path="/company/dashboard" element={<ProtectedRoute><CompanyDashboardPage /></ProtectedRoute>} />
                        <Route path="/company/challenges/create" element={<ProtectedRoute><CreateChallengePage /></ProtectedRoute>} />
                        <Route path="/admin" element={<ProtectedRoute><AdminDashboardPage /></ProtectedRoute>} />

                        {/* Fallback */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </NotificationProvider>
            </AuthProvider>
        </Router>
    )
}

export default App
