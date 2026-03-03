export class IdeaService {
  constructor(apiClient) {
    this.api = apiClient
  }

  async createIdea(ideaData) {
    const response = await this.api.post('/ideas', ideaData)
    
    // Trigger AI categorization in background
    try {
      await this.api.categorizeIdea(ideaData)
    } catch (error) {
      console.warn('AI categorization failed:', error)
    }
    
    return response
  }

  async getAllIdeas(filters = {}) {
    const params = {}
    
    if (filters.status && filters.status !== 'all') {
      return this.getIdeasByStatus(filters.status)
    }
    
    if (filters.search) {
      params.search = filters.search
    }
    
    if (filters.category && filters.category !== 'all') {
      params.category = filters.category
    }
    
    return this.api.get('/ideas', params)
  }

  async getIdeaById(id) {
    return this.api.get(`/ideas/${id}`)
  }

  async getIdeasByUser(userId) {
    return this.api.get(`/ideas/user/${userId}`)
  }

  async getIdeasByStatus(status) {
    return this.api.get(`/ideas/status/${status}`)
  }

  async getTopIdeas() {
    return this.api.get('/ideas/top')
  }

  async updateIdeaStatus(id, status) {
    const response = await this.api.put(`/ideas/${id}/status?status=${status}`)
    
    // Award points if idea is implemented
    if (status === 'IMPLEMENTED') {
      try {
        const idea = await this.getIdeaById(id)
        await this.api.awardPointsForImplementation(idea.submittedBy)
      } catch (error) {
        console.warn('Failed to award implementation points:', error)
      }
    }
    
    return response
  }

  async searchIdeas(query) {
    const allIdeas = await this.getAllIdeas()
    
    if (!query || query.trim() === '') {
      return allIdeas
    }
    
    const searchTerm = query.toLowerCase()
    return allIdeas.filter(idea => 
      idea.title.toLowerCase().includes(searchTerm) ||
      idea.description.toLowerCase().includes(searchTerm) ||
      (idea.tags && idea.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
    )
  }

  async getIdeaStats() {
    try {
      const allIdeas = await this.getAllIdeas()
      
      const stats = {
        total: allIdeas.length,
        byStatus: {},
        byCategory: {},
        recent: allIdeas.filter(idea => {
          const createdAt = new Date(idea.createdAt)
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          return createdAt >= weekAgo
        }).length
      }
      
      // Count by status
      allIdeas.forEach(idea => {
        stats.byStatus[idea.status] = (stats.byStatus[idea.status] || 0) + 1
      })
      
      // Count by category
      allIdeas.forEach(idea => {
        if (idea.category) {
          stats.byCategory[idea.category] = (stats.byCategory[idea.category] || 0) + 1
        }
      })
      
      return stats
    } catch (error) {
      console.error('Failed to get idea stats:', error)
      return {
        total: 0,
        byStatus: {},
        byCategory: {},
        recent: 0
      }
    }
  }
}