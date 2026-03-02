export class UserService {
  constructor(apiClient) {
    this.api = apiClient
  }

  async createUser(userData) {
    // Validate user data before sending
    const validatedData = this.validateUserData(userData)
    return this.api.post('/users', validatedData)
  }

  async getCurrentUser() {
    const userState = window.app.state.getState('user')
    if (userState.currentUser) {
      // Don't try to refresh company accounts from user service
      if (userState.currentUser.accountType === 'company' || userState.currentUser.role === 'company') {
        console.log('ℹ️ Current user is a company, returning cached data')
        return userState.currentUser
      }
      
      // Refresh user data from server for regular users
      try {
        return await this.getUserById(userState.currentUser.id)
      } catch (error) {
        console.warn('Failed to refresh user data:', error)
        return userState.currentUser
      }
    }
    return null
  }

  async getUserById(id) {
    return this.api.get(`/users/${id}`)
  }

  async getUserByEmail(email) {
    return this.api.get(`/users/email/${encodeURIComponent(email)}`)
  }

  async getAllUsers() {
    return this.api.get('/users')
  }

  async getLeaderboard(limit = 10) {
    const leaderboard = await this.api.get('/users/leaderboard')
    return leaderboard.slice(0, limit)
  }

  async updateUserProfile(userId, updates) {
    // Note: This endpoint might need to be added to the backend
    return this.api.put(`/users/${userId}`, updates)
  }

  async getUserStats(userId) {
    try {
      const user = await this.getUserById(userId)
      const userIdeas = await this.api.getIdeasByUser(userId)
      const userVotes = await this.api.get(`/votes/user/${userId}`)
      
      return {
        totalPoints: user.totalPoints || 0,
        ideasSubmitted: user.ideasSubmitted || 0,
        ideasImplemented: user.ideasImplemented || 0,
        totalVotes: userVotes.length || 0,
        recentIdeas: userIdeas.filter(idea => {
          const createdAt = new Date(idea.createdAt)
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          return createdAt >= weekAgo
        }).length
      }
    } catch (error) {
      console.error('Failed to get user stats:', error)
      return {
        totalPoints: 0,
        ideasSubmitted: 0,
        ideasImplemented: 0,
        totalVotes: 0,
        recentIdeas: 0
      }
    }
  }

  async getUserRank(userId) {
    try {
      const leaderboard = await this.getLeaderboard(100) // Get top 100
      const userIndex = leaderboard.findIndex(user => user.id === userId)
      return userIndex >= 0 ? userIndex + 1 : null
    } catch (error) {
      console.error('Failed to get user rank:', error)
      return null
    }
  }

  validateUserData(userData) {
    const required = ['email', 'fullName', 'department', 'role']
    const missing = required.filter(field => !userData[field])
    
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`)
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(userData.email)) {
      throw new Error('Invalid email format')
    }
    
    // Validate role
    const validRoles = ['employee', 'manager', 'admin']
    if (!validRoles.includes(userData.role)) {
      throw new Error('Invalid role')
    }
    
    return {
      email: userData.email.toLowerCase().trim(),
      fullName: userData.fullName.trim(),
      department: userData.department.trim(),
      role: userData.role
    }
  }

  async authenticateUser(email) {
    console.log('🔐 Authenticating user with email:', email)
    
    try {
      // First try to authenticate as a regular user
      try {
        console.log('👤 Trying user authentication...')
        const user = await this.api.getUserByEmail(email)
        console.log('✅ User found:', user)
        
        // Store user in state
        window.app.state.setUser(user)
        
        // Load user's additional data (don't fail if these fail)
        try {
          const userBadges = await this.api.getUserBadges(user.id).catch(err => {
            console.warn('Failed to load user badges:', err)
            return []
          })
          
          // Update gamification state
          window.app.state.setState('gamification', {
            userBadges: userBadges || []
          })
        } catch (error) {
          console.warn('Failed to load additional user data:', error)
          // Continue anyway - authentication succeeded
        }
        
        return { ...user, accountType: 'user' }
      } catch (userError) {
        console.log('❌ User not found, trying company authentication...')
        console.log('User error:', userError.message)
        
        // If user not found, try to authenticate as a company
        try {
          console.log('🏢 Trying company authentication...')
          const company = await this.api.getCompanyByEmail(email)
          console.log('✅ Company found:', company)
          
          // Store company as user in state with company flag
          const companyUser = {
            id: company.id,
            email: company.email,
            fullName: company.name,
            department: company.industry || 'Company',
            role: 'company',
            accountType: 'company',
            companyData: company
          }
          
          window.app.state.setUser(companyUser)
          
          // Don't try to load user badges for company accounts
          console.log('ℹ️ Skipping user badges for company account')
          
          return companyUser
        } catch (companyError) {
          console.log('❌ Company not found:', companyError.message)
          throw new Error('Authentication failed. No account found with this email.')
        }
      }
    } catch (error) {
      console.error('🚫 Authentication failed:', error)
      throw error
    }
  }

  logout() {
    window.app.state.logout()
    window.app.router.navigate('/login')
  }
}