export class GamificationService {
  constructor(apiClient) {
    this.api = apiClient
  }

  async awardPoints(userId, action) {
    const pointActions = {
      'idea-submitted': () => this.api.awardPointsForIdeaSubmission(userId),
      'vote': () => this.api.awardPointsForVote(userId),
      'comment': () => this.api.awardPointsForComment(userId),
      'implemented': () => this.api.awardPointsForImplementation(userId)
    }
    
    const actionHandler = pointActions[action]
    if (actionHandler) {
      try {
        await actionHandler()
        
        // Refresh user data to get updated points
        const user = await this.api.getUserById(userId)
        window.app.state.setState('user', { currentUser: user })
        
        // Show notification
        const pointValues = {
          'idea-submitted': 10,
          'vote': 5,
          'comment': 2,
          'implemented': 100
        }
        
        window.app.state.addNotification({
          type: 'success',
          message: `+${pointValues[action]} points earned!`,
          duration: 3000
        })
        
      } catch (error) {
        console.warn(`Failed to award points for ${action}:`, error)
      }
    }
  }

  async getUserBadges(userId) {
    try {
      return await this.api.getUserBadges(userId)
    } catch (error) {
      console.error('Failed to get user badges:', error)
      return []
    }
  }

  async getAllBadges() {
    try {
      return await this.api.getAllBadges()
    } catch (error) {
      console.error('Failed to get all badges:', error)
      return []
    }
  }

  async getLeaderboard(limit = 10) {
    try {
      const leaderboard = await this.api.getLeaderboard()
      return leaderboard.slice(0, limit)
    } catch (error) {
      console.error('Failed to get leaderboard:', error)
      return []
    }
  }

  async checkBadgeEligibility(userId) {
    try {
      const [user, userIdeas, allBadges] = await Promise.all([
        this.api.getUserById(userId),
        this.api.getIdeasByUser(userId),
        this.getAllBadges()
      ])
      
      const eligibleBadges = []
      
      // Check various badge criteria
      const implementedIdeas = userIdeas.filter(idea => idea.status === 'IMPLEMENTED')
      
      // First Idea badge
      if (userIdeas.length >= 1) {
        eligibleBadges.push('first-idea')
      }
      
      // Idea Machine badge (10+ ideas)
      if (userIdeas.length >= 10) {
        eligibleBadges.push('idea-machine')
      }
      
      // Implementer badge (first implemented idea)
      if (implementedIdeas.length >= 1) {
        eligibleBadges.push('implementer')
      }
      
      // Innovation Leader badge (5+ implemented ideas)
      if (implementedIdeas.length >= 5) {
        eligibleBadges.push('innovation-leader')
      }
      
      // Point-based badges
      if (user.totalPoints >= 100) {
        eligibleBadges.push('century-club')
      }
      
      if (user.totalPoints >= 500) {
        eligibleBadges.push('point-master')
      }
      
      return eligibleBadges
    } catch (error) {
      console.error('Failed to check badge eligibility:', error)
      return []
    }
  }

  async getUserStats(userId) {
    try {
      const [user, userIdeas, userBadges] = await Promise.all([
        this.api.getUserById(userId),
        this.api.getIdeasByUser(userId),
        this.getUserBadges(userId)
      ])
      
      const implementedIdeas = userIdeas.filter(idea => idea.status === 'IMPLEMENTED')
      const recentIdeas = userIdeas.filter(idea => {
        const createdAt = new Date(idea.createdAt)
        const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        return createdAt >= monthAgo
      })
      
      return {
        totalPoints: user.totalPoints || 0,
        totalIdeas: userIdeas.length,
        implementedIdeas: implementedIdeas.length,
        recentIdeas: recentIdeas.length,
        badges: userBadges.length,
        rank: await this.getUserRank(userId)
      }
    } catch (error) {
      console.error('Failed to get user stats:', error)
      return {
        totalPoints: 0,
        totalIdeas: 0,
        implementedIdeas: 0,
        recentIdeas: 0,
        badges: 0,
        rank: null
      }
    }
  }

  async getUserRank(userId) {
    try {
      const leaderboard = await this.getLeaderboard(100)
      const userIndex = leaderboard.findIndex(user => user.id === userId)
      return userIndex >= 0 ? userIndex + 1 : null
    } catch (error) {
      console.error('Failed to get user rank:', error)
      return null
    }
  }

  getBadgeIcon(badgeType) {
    const badgeIcons = {
      'first-idea': '💡',
      'idea-machine': '⚡',
      'implementer': '✅',
      'innovation-leader': '👑',
      'century-club': '💯',
      'point-master': '🏆',
      'collaborator': '🤝',
      'mentor': '🎓',
      'trendsetter': '🔥'
    }
    
    return badgeIcons[badgeType] || '🏅'
  }

  getBadgeColor(badgeType) {
    const badgeColors = {
      'first-idea': 'bg-blue-100 text-blue-800',
      'idea-machine': 'bg-purple-100 text-purple-800',
      'implementer': 'bg-green-100 text-green-800',
      'innovation-leader': 'bg-yellow-100 text-yellow-800',
      'century-club': 'bg-indigo-100 text-indigo-800',
      'point-master': 'bg-red-100 text-red-800',
      'collaborator': 'bg-pink-100 text-pink-800',
      'mentor': 'bg-gray-100 text-gray-800',
      'trendsetter': 'bg-orange-100 text-orange-800'
    }
    
    return badgeColors[badgeType] || 'bg-gray-100 text-gray-800'
  }

  formatPoints(points) {
    if (points >= 1000000) {
      return `${(points / 1000000).toFixed(1)}M`
    } else if (points >= 1000) {
      return `${(points / 1000).toFixed(1)}K`
    }
    return points.toString()
  }

  getPointsForAction(action) {
    const pointValues = {
      'idea-submitted': 10,
      'vote': 5,
      'comment': 2,
      'implemented': 100
    }
    
    return pointValues[action] || 0
  }
}