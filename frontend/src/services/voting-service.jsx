export class VotingService {
  constructor(apiClient) {
    this.api = apiClient
  }

  async castVote(ideaId, voteType, userId) {
    const voteData = {
      ideaId: ideaId,
      userId: userId,
      voteType: voteType // 1 for upvote, -1 for downvote
    }
    
    try {
      const response = await this.api.post('/votes', voteData)
      
      // Award points for voting
      await this.api.awardPointsForVote(userId)
      
      // Update local state
      window.app.state.setUserVote(ideaId, voteType)
      
      // Update idea vote count in state
      const currentIdea = window.app.state.getState('ideas').currentIdea
      if (currentIdea && currentIdea.id === ideaId) {
        const votes = await this.getVotesForIdea(ideaId)
        const voteCount = this.calculateVoteCount(votes)
        window.app.state.updateIdea(ideaId, { voteCount })
      }
      
      return response
    } catch (error) {
      console.error('Failed to cast vote:', error)
      throw error
    }
  }

  async removeVote(ideaId, userId) {
    try {
      await this.api.delete(`/votes/idea/${ideaId}/user/${userId}`)
      
      // Update local state
      window.app.state.setUserVote(ideaId, null)
      
      // Update idea vote count in state
      const currentIdea = window.app.state.getState('ideas').currentIdea
      if (currentIdea && currentIdea.id === ideaId) {
        const votes = await this.getVotesForIdea(ideaId)
        const voteCount = this.calculateVoteCount(votes)
        window.app.state.updateIdea(ideaId, { voteCount })
      }
      
    } catch (error) {
      console.error('Failed to remove vote:', error)
      throw error
    }
  }

  async toggleVote(ideaId, voteType, userId) {
    const currentVote = window.app.state.getUserVote(ideaId)
    
    if (currentVote === voteType) {
      // Remove vote if clicking same vote type
      await this.removeVote(ideaId, userId)
    } else {
      // Cast new vote
      await this.castVote(ideaId, voteType, userId)
    }
  }

  async getVotesForIdea(ideaId) {
    return this.api.get(`/votes/idea/${ideaId}`)
  }

  async getUserVoteForIdea(ideaId, userId) {
    try {
      const response = await this.api.get(`/votes/idea/${ideaId}/user/${userId}`)
      return response
    } catch (error) {
      if (error.status === 404) {
        return null // No vote found
      }
      throw error
    }
  }

  async loadUserVotes(userId) {
    try {
      // This endpoint might need to be added to the backend
      const userVotes = await this.api.get(`/votes/user/${userId}`)
      
      // Update state with user's votes
      const voteMap = new Map()
      userVotes.forEach(vote => {
        voteMap.set(vote.ideaId, vote.voteType)
      })
      
      window.app.state.setState('votes', { userVotes: voteMap })
      
      return userVotes
    } catch (error) {
      console.warn('Failed to load user votes:', error)
      return []
    }
  }

  calculateVoteCount(votes) {
    return votes.reduce((total, vote) => total + vote.voteType, 0)
  }

  getVoteStats(votes) {
    const upvotes = votes.filter(vote => vote.voteType === 1).length
    const downvotes = votes.filter(vote => vote.voteType === -1).length
    
    return {
      upvotes,
      downvotes,
      total: upvotes - downvotes,
      percentage: votes.length > 0 ? Math.round((upvotes / votes.length) * 100) : 0
    }
  }

  // Comment-related methods
  async addComment(ideaId, content, userId, userName) {
    const commentData = {
      ideaId: ideaId,
      userId: userId,
      userName: userName,
      content: content.trim()
    }
    
    try {
      const response = await this.api.post('/comments', commentData)
      
      // Award points for commenting
      await this.api.awardPointsForComment(userId)
      
      return response
    } catch (error) {
      console.error('Failed to add comment:', error)
      throw error
    }
  }

  async getCommentsForIdea(ideaId) {
    return this.api.get(`/comments/idea/${ideaId}`)
  }

  async deleteComment(commentId) {
    return this.api.delete(`/comments/${commentId}`)
  }

  async loadIdeaEngagement(ideaId, userId) {
    try {
      const [votes, comments, userVote] = await Promise.all([
        this.getVotesForIdea(ideaId),
        this.getCommentsForIdea(ideaId),
        userId ? this.getUserVoteForIdea(ideaId, userId) : null
      ])
      
      // Update state
      if (userVote) {
        window.app.state.setUserVote(ideaId, userVote.voteType)
      }
      
      return {
        votes,
        comments,
        userVote,
        voteStats: this.getVoteStats(votes)
      }
    } catch (error) {
      console.error('Failed to load idea engagement:', error)
      return {
        votes: [],
        comments: [],
        userVote: null,
        voteStats: { upvotes: 0, downvotes: 0, total: 0, percentage: 0 }
      }
    }
  }
}