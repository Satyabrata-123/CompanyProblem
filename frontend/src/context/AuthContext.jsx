import { createContext, useContext, useState, useEffect } from 'react'
import { userService, companyService } from '../services'

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
  const [currentCompany, setCurrentCompany] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userType, setUserType] = useState(null) // 'user' or 'company'
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem('innovation_user')
    const storedCompany = localStorage.getItem('innovation_company')

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        setCurrentUser(user)
        setIsAuthenticated(true)
        setUserType('user')
      } catch (error) {
        console.error('Failed to parse stored user:', error)
        localStorage.removeItem('innovation_user')
      }
    } else if (storedCompany) {
      try {
        const company = JSON.parse(storedCompany)
        setCurrentCompany(company)
        setIsAuthenticated(true)
        setUserType('company')
      } catch (error) {
        console.error('Failed to parse stored company:', error)
        localStorage.removeItem('innovation_company')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email) => {
    try {
      const user = await userService.authenticateUser(email)
      setCurrentUser(user)
      setCurrentCompany(null)
      setIsAuthenticated(true)
      setUserType('user')
      localStorage.setItem('innovation_user', JSON.stringify(user))
      localStorage.removeItem('innovation_company')
      return user
    } catch (error) {
      throw error
    }
  }

  const loginCompany = async (email) => {
    try {
      const company = await companyService.authenticateCompany(email)
      setCurrentCompany(company)
      setCurrentUser(null)
      setIsAuthenticated(true)
      setUserType('company')
      localStorage.setItem('innovation_company', JSON.stringify(company))
      localStorage.removeItem('innovation_user')
      return company
    } catch (error) {
      throw error
    }
  }

  const register = async (userData) => {
    try {
      const user = await userService.createUser(userData)
      setCurrentUser(user)
      setCurrentCompany(null)
      setIsAuthenticated(true)
      setUserType('user')
      localStorage.setItem('innovation_user', JSON.stringify(user))
      localStorage.removeItem('innovation_company')
      return user
    } catch (error) {
      throw error
    }
  }

  const registerCompany = async (companyData) => {
    try {
      const company = await companyService.createCompany(companyData)
      setCurrentCompany(company)
      setCurrentUser(null)
      setIsAuthenticated(true)
      setUserType('company')
      localStorage.setItem('innovation_company', JSON.stringify(company))
      localStorage.removeItem('innovation_user')
      return company
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    setCurrentUser(null)
    setCurrentCompany(null)
    setIsAuthenticated(false)
    setUserType(null)
    localStorage.removeItem('innovation_user')
    localStorage.removeItem('innovation_company')
  }

  const value = {
    currentUser,
    currentCompany,
    isAuthenticated,
    userType,
    loading,
    login,
    loginCompany,
    register,
    registerCompany,
    logout
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
