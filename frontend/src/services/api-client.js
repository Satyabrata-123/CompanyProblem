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

    // Add request ID for tracking
    const requestId = Date.now() + Math.random()
    
    try {
      // Check if online
      if (!this.isOnline && options.method !== 'GET') {
        return this.queueRequest(endpoint, options)
      }

      const response = await this.makeRequestWithRetry(url, config, this.retryAttempts)
      
      // Handle different response types
      if (!response.ok) {
        const error = await this.handleErrorResponse(response)
        throw error
      }

      // Handle empty responses
      if (response.status === 204) {
        return null
      }

      // Try to parse JSON, fallback to text
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        return await response.json()
      } else {
        return await response.text()
      }
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        // Network error
        if (!this.isOnline) {
          throw new Error('You are offline. Please check your connection.')
        }
        throw new Error('Network error. Please check your connection.')
      }
      throw error
    }
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
    return this.get(`/ideas/${id}`)
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

  async findDuplicates(title, description) {
    return this.post(`/ai/duplicates?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}`)
  }

  // Initialize service modules
  initializeServices() {
    // Import service modules dynamically to avoid circular dependencies
    import('./idea-service.js').then(module => {
      this.ideas = new module.IdeaService(this)
    })
    
    import('./user-service.js').then(module => {
      this.users = new module.UserService(this)
    })
    
    import('./voting-service.js').then(module => {
      this.voting = new module.VotingService(this)
    })
    
    import('./gamification-service.js').then(module => {
      this.gamification = new module.GamificationService(this)
    })
  }
}