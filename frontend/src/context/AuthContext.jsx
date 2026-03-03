import { createContext, useContext, useState, useEffect } from 'react'
import { userService } from '../services'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem('innovation_user')
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        setCurrentUser(user)
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Failed to parse stored user:', error)
        localStorage.removeItem('innovation_user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email) => {
    try {
      const user = await userService.authenticateUser(email)
      setCurrentUser(user)
      setIsAuthenticated(true)
      localStorage.setItem('innovation_user', JSON.stringify(user))
      return user
    } catch (error) {
      throw error
    }
  }

  const register = async (userData) => {
    try {
      const user = await userService.createUser(userData)
      setCurrentUser(user)
      setIsAuthenticated(true)
      localStorage.setItem('innovation_user', JSON.stringify(user))
      return user
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    setCurrentUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('innovation_user')
  }

  const value = {
    currentUser,
    isAuthenticated,
    loading,
    login,
    register,
    logout
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
