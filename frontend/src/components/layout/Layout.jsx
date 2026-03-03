import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Layout({ children }) {
  const { currentUser, currentCompany, userType, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Get the display name based on user type
  const displayName = userType === 'company' ? currentCompany?.name : currentUser?.fullName
  
  // Determine dashboard link based on user type and role
  let dashboardLink = '/dashboard'
  if (userType === 'company') {
    dashboardLink = '/company/dashboard'
  } else if (currentUser?.role === 'admin') {
    dashboardLink = '/admin'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex items-center">
                <span className="text-2xl font-bold text-purple-600">💡 Innovation Platform</span>
              </Link>

              {isAuthenticated && (
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <Link
                    to={dashboardLink}
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-purple-600"
                  >
                    Dashboard
                  </Link>
                  {userType === 'user' && (
                    <>
                      <Link
                        to="/ideas"
                        className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
                      >
                        Ideas
                      </Link>
                      <Link
                        to="/leaderboard"
                        className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
                      >
                        Leaderboard
                      </Link>
                      {currentUser?.role === 'admin' && (
                        <Link
                          to="/admin"
                          className="inline-flex items-center px-1 pt-1 text-sm font-medium text-orange-600 hover:text-orange-900"
                        >
                          🔧 Admin
                        </Link>
                      )}
                    </>
                  )}
                  <Link
                    to="/challenges"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
                  >
                    Challenges
                  </Link>
                  {userType === 'company' && (
                    <Link
                      to="/company/challenges/create"
                      className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
                    >
                      Create Challenge
                    </Link>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <Link
                    to={userType === 'company' ? '/company/dashboard' : '/profile'}
                    className="text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    {displayName}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="btn-secondary"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-gray-900">
                    Sign in
                  </Link>
                  <Link to="/register" className="btn-primary">
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  )
}
