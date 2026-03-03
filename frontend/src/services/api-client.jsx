export class ApiClient {
  constructor() {
    this.baseURL = '/api'
    this.defaultHeaders = {
      'Content-Type': 'application/json'
    }
    this.retryAttempts = 3
    this.retryDelay = 1000
    this.requestQueue = []
    this.isOnline = navigator.onLine
    this.pendingRequests = new Map() // Track pending requests to prevent duplicates
    
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true
      this.processQueue()
    })
    
    window.addEventListener('offline', () => {
      this.isOnline = false
    })
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const config = {
      headers: { ...this.defaultHeaders, ...options.headers },
      ...options
    }

    console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`)

    // Create unique request key for deduplication (for POST requests)
    const requestKey = options.method === 'POST' ? 
      `${endpoint}-${JSON.stringify(options.body)}` : 
      `${endpoint}-${options.method || 'GET'}`
    
    // Check if this exact request is already pending (for POST requests)
    if (options.method === 'POST' && this.pendingRequests.has(requestKey)) {
      console.warn('🚫 Duplicate POST request detected, returning existing promise')
      return this.pendingRequests.get(requestKey)
    }

    // Add request ID for tracking
    const requestId = Date.now() + Math.random()
    
    // Create the request promise
    const requestPromise = (async () => {
      try {
        // Check if online
        if (!this.isOnline && options.method !== 'GET') {
          return this.queueRequest(endpoint, options)
        }

        const response = await this.makeRequestWithRetry(url, config, this.retryAttempts)
        
        console.log(`✅ API Response: ${response.status} ${response.statusText}`)
        
        // Handle different response types
        if (!response.ok) {
          const error = await this.handleErrorResponse(response)
          console.error(`❌ API Error: ${error.message}`)
          throw error
        }

        // Handle empty responses
        if (response.status === 204) {
          return null 
        }

        // Try to parse JSON, fallback to text
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json()
          console.log(`📦 API Data:`, data)
          return data
        } else {
          return await response.text()
        }
      } catch (error) {
        console.error(`❌ API Request Failed: ${error.message}`)
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
          // Network error
          if (!this.isOnline) {
            throw new Error('You are offline. Please check your connection.')
          }
          throw new Error('Network error. Please check your connection.')
        }
        throw error
      } finally {
        // Remove from pending requests when done
        if (options.method === 'POST') {
          this.pendingRequests.delete(requestKey)
        }
      }
    })()

    // Store the promise for POST requests to prevent duplicates
    if (options.method === 'POST') {
      this.pendingRequests.set(requestKey, requestPromise)
    }

    return requestPromise
  }

  async makeRequestWithRetry(url, config, attemptsLeft) {
    try {
      const response = await fetch(url, config)
      return response
    } catch (error) {
      if (attemptsLeft > 0 && this.shouldRetry(error)) {
        await this.delay(this.retryDelay)
        return this.makeRequestWithRetry(url, config, attemptsLeft - 1)
      }
      throw error
    }
  }

  shouldRetry(error) {
    // Retry on network errors or 5xx server errors
    return error.name === 'TypeError' || 
           (error.status >= 500 && error.status < 600)
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  queueRequest(endpoint, options) {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({
        endpoint,
        options,
        resolve,
        reject,
        timestamp: Date.now()
      })
    })
  }

  async processQueue() {
    while (this.requestQueue.length > 0 && this.isOnline) {
      const queuedRequest = this.requestQueue.shift()
      try {
        const result = await this.request(queuedRequest.endpoint, queuedRequest.options)
        queuedRequest.resolve(result)
      } catch (error) {
        queuedRequest.reject(error)
      }
    }
  }

  async handleErrorResponse(response) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`
    
    try {
      const errorData = await response.json()
      if (errorData.message) {
        errorMessage = errorData.message
      } else if (errorData.error) {
        errorMessage = errorData.error
      }
    } catch (e) {
      // If we can't parse the error response, use the default message
    }

    const error = new Error(errorMessage)
    error.status = response.status
    error.response = response
    return error
  }

  // HTTP method helpers
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const url = queryString ? `${endpoint}?${queryString}` : endpoint
    return this.request(url, { method: 'GET' })
  }

  async post(endpoint, data = null) {
    return this.request(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : null
    })
  }

  async put(endpoint, data = null) {
    return this.request(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : null
    })
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' })
  }

  // Service-specific methods

  // User Service Methods
  async createUser(userData) {
    return this.post('/users', userData)
  }

  async getUserById(id) {
    return this.get(`/users/${id}`)
  }

  async getUserByEmail(email) {
    return this.get(`/users/email/${email}`)
  }

  async getAllUsers() {
    return this.get('/users')
  }

  async getLeaderboard() {
    return this.get('/users/leaderboard')
  }

  // Idea Service Methods
  async createIdea(ideaData) {
    return this.post('/ideas', ideaData)
  }

  async getAllIdeas() {
    return this.get('/ideas')
  }

  async getIdeaById(id) {
    console.log('🔍 API: Getting idea by ID:', id)
    try {
      const result = await this.get(`/ideas/${id}`)
      console.log('✅ API: Idea retrieved:', result)
      return result
    } catch (error) {
      console.error('❌ API: Failed to get idea by ID:', id, error)
      throw error
    }
  }

  async getIdeasByUser(userId) {
    return this.get(`/ideas/user/${userId}`)
  }

  async getIdeasByStatus(status) {
    return this.get(`/ideas/status/${status}`)
  }

  async getTopIdeas() {
    return this.get('/ideas/top')
  }

  async updateIdeaStatus(id, status) {
    return this.put(`/ideas/${id}/status?status=${status}`)
  }

  // Voting Service Methods
  async castVote(voteData) {
    return this.post('/votes', voteData)
  }

  async getVotesForIdea(ideaId) {
    return this.get(`/votes/idea/${ideaId}`)
  }

  async getUserVoteForIdea(ideaId, userId) {
    return this.get(`/votes/idea/${ideaId}/user/${userId}`)
  }

  async removeVote(ideaId, userId) {
    return this.delete(`/votes/idea/${ideaId}/user/${userId}`)
  }

  // Comments Methods
  async addComment(commentData) {
    return this.post('/comments', commentData)
  }

  async getCommentsForIdea(ideaId) {
    return this.get(`/comments/idea/${ideaId}`)
  }

  async deleteComment(commentId) {
    return this.delete(`/comments/${commentId}`)
  }

  // Gamification Service Methods
  async awardPointsForIdeaSubmission(userId) {
    return this.post(`/gamification/points/idea-submitted/${userId}`)
  }

  async awardPointsForVote(userId) {
    return this.post(`/gamification/points/vote/${userId}`)
  }

  async awardPointsForImplementation(userId) {
    return this.post(`/gamification/points/implemented/${userId}`)
  }

  async awardPointsForComment(userId) {
    return this.post(`/gamification/points/comment/${userId}`)
  }

  async getAllBadges() {
    return this.get('/gamification/badges')
  }

  async getUserBadges(userId) {
    return this.get(`/gamification/badges/user/${userId}`)
  }

  // AI Service Methods
  async categorizeIdea(ideaData) {
    return this.post('/ai/categorize', ideaData)
  }

  async compareIdeaWithSolution(comparisonData) {
    return this.post('/ai/compare-solution', comparisonData)
  }

  async findDuplicates(title, description) {
    return this.post(`/ai/duplicates?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}`)
  }

  // Company Service Methods
  async createCompany(companyData) {
    return this.post('/companies', companyData)
  }

  async getAllCompanies() {
    return this.get('/companies')
  }

  async getVerifiedCompanies() {
    return this.get('/companies/verified')
  }

  async getCompanyById(id) {
    return this.get(`/companies/${id}`)
  }

  async updateCompany(id, companyData) {
    return this.put(`/companies/${id}`, companyData)
  }

  async verifyCompany(id) {
    return this.put(`/companies/${id}/verify`)
  }

  // Challenge Service Methods
  async createChallenge(challengeData, internalSolutionBrief) {
    return this.post('/challenges', {
      challenge: challengeData,
      internalSolutionBrief: internalSolutionBrief
    })
  }

  async getAllChallenges() {
    return this.get('/challenges')
  }

  async getChallengesByDifficulty(difficulty) {
    return this.get(`/challenges/difficulty/${difficulty}`)
  }

  async getChallengesByCompany(companyId) {
    return this.get(`/challenges/company/${companyId}`)
  }

  async getChallengeById(id) {
    return this.get(`/challenges/${id}`)
  }

  async getChallengeByIdAndDifficulty(difficulty, id) {
    return this.get(`/challenges/${difficulty}/${id}`)
  }

  async getFeaturedChallenges() {
    return this.get('/challenges/featured')
  }

  async updateChallengeStatus(id, isActive) {
    return this.put(`/challenges/${id}/status?isActive=${isActive}`)
  }

  async incrementChallengeSubmissions(id) {
    return this.put(`/challenges/${id}/increment-submissions`)
  }

  // Challenge Ideas Methods
  async submitIdeaForChallenge(ideaData) {
    return this.post('/challenges/ideas', ideaData)
  }

  async getIdeasForChallenge(challengeId) {
    return this.get(`/challenges/${challengeId}/ideas`)
  }

  async getChallengeIdeasByUser(userId) {
    return this.get(`/challenges/ideas/user/${userId}`)
  }

  // Solution Service Methods
  async submitSolution(solutionData) {
    return this.post('/solutions', solutionData)
  }

  async getSolutionsByChallenge(challengeId) {
    return this.get(`/solutions/challenge/${challengeId}`)
  }

  async getTopSolutionsByChallenge(challengeId) {
    return this.get(`/solutions/challenge/${challengeId}/top`)
  }

  async getSolutionsByUser(userId) {
    return this.get(`/solutions/user/${userId}`)
  }

  async getSolutionById(id) {
    return this.get(`/solutions/${id}`)
  }

  async getSolutionCountByChallenge(challengeId) {
    return this.get(`/solutions/challenge/${challengeId}/count`)
  }

  async updateSolutionStatus(id, status, score = null, feedback = null) {
    let url = `/solutions/${id}/status?status=${status}`
    if (score !== null) url += `&score=${score}`
    if (feedback !== null) url += `&feedback=${encodeURIComponent(feedback)}`
    return this.put(url)
  }

  async updateSolutionVoteCount(id, change) {
    return this.put(`/solutions/${id}/vote-count?change=${change}`)
  }

  // Initialize service modules
  initializeServices() {
    // Import service modules dynamically to avoid circular dependencies
    import('./idea-service').then(module => {
      this.ideas = new module.IdeaService(this)
    })
    
    import('./user-service').then(module => {
      this.users = new module.UserService(this)
    })
    
    import('./voting-service').then(module => {
      this.voting = new module.VotingService(this)
    })
    
    import('./gamification-service').then(module => {
      this.gamification = new module.GamificationService(this)
    })
  }
}