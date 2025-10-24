export class StateManager {
  constructor() {
    this.state = {
      user: {
        currentUser: null,
        isAuthenticated: false,
        loading: false
      },
      ideas: {
        list: [],
        currentIdea: null,
        filters: {
          status: 'all',
          category: 'all',
          search: ''
        },
        pagination: {
          page: 1,
          limit: 12,
          total: 0
        },
        loading: false
      },
      votes: {
        userVotes: new Map(),
        loading: false
      },
      gamification: {
        leaderboard: [],
        userBadges: [],
        loading: false
      },
      ui: {
        sidebarOpen: false,
        notifications: [],
        modals: {
          submitIdea: false,
          confirmAction: false
        }
      }
    }
    
    this.listeners = new Map()
  }

  getState(key) {
    if (key) {
      return this.state[key] || {}
    }
    return this.state
  }

  setState(key, value) {
    if (typeof key === 'object') {
      // Merge multiple state updates
      Object.keys(key).forEach(k => {
        this.state[k] = { ...this.state[k], ...key[k] }
      })
    } else {
      // Single state update
      this.state[key] = { ...this.state[key], ...value }
    }
    
    // Notify listeners
    this.notifyListeners(key)
  }

  updateState(key, updater) {
    if (typeof updater === 'function') {
      this.state[key] = updater(this.state[key])
      this.notifyListeners(key)
    }
  }

  subscribe(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set())
    }
    
    this.listeners.get(key).add(callback)
    
    // Return unsubscribe function
    return () => {
      const keyListeners = this.listeners.get(key)
      if (keyListeners) {
        keyListeners.delete(callback)
      }
    }
  }

  notifyListeners(key) {
    const keyListeners = this.listeners.get(key)
    if (keyListeners) {
      keyListeners.forEach(callback => {
        try {
          callback(this.state[key])
        } catch (error) {
          console.error('Error in state listener:', error)
        }
      })
    }
    
    // Also notify global listeners
    const globalListeners = this.listeners.get('*')
    if (globalListeners) {
      globalListeners.forEach(callback => {
        try {
          callback(this.state, key)
        } catch (error) {
          console.error('Error in global state listener:', error)
        }
      })
    }
  }

  // Utility methods for common state operations
  setLoading(key, loading = true) {
    this.setState(key, { loading })
  }

  addNotification(notification) {
    const notifications = [...this.state.ui.notifications, {
      id: Date.now() + Math.random(),
      timestamp: new Date(),
      ...notification
    }]
    
    this.setState('ui', { notifications })
    
    // Auto-remove notification after delay
    if (notification.autoRemove !== false) {
      setTimeout(() => {
        this.removeNotification(notifications[notifications.length - 1].id)
      }, notification.duration || 5000)
    }
  }

  removeNotification(id) {
    const notifications = this.state.ui.notifications.filter(n => n.id !== id)
    this.setState('ui', { notifications })
  }

  clearNotifications() {
    this.setState('ui', { notifications: [] })
  }

  // User-specific state methods
  setUser(user) {
    this.setState('user', {
      currentUser: user,
      isAuthenticated: !!user,
      loading: false
    })
    
    // Persist user to localStorage
    if (user) {
      localStorage.setItem('innovation_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('innovation_user')
    }
  }

  logout() {
    this.setState('user', {
      currentUser: null,
      isAuthenticated: false,
      loading: false
    })
    
    // Clear persisted data
    localStorage.removeItem('innovation_user')
    
    // Clear other user-specific state
    this.setState('votes', { userVotes: new Map() })
    this.setState('gamification', { userBadges: [] })
  }

  // Ideas-specific state methods
  setIdeas(ideas, total = null) {
    const updates = { list: ideas, loading: false }
    if (total !== null) {
      updates.pagination = { ...this.state.ideas.pagination, total }
    }
    this.setState('ideas', updates)
  }

  addIdea(idea) {
    const ideas = [idea, ...this.state.ideas.list]
    this.setState('ideas', { list: ideas })
  }

  updateIdea(ideaId, updates) {
    const ideas = this.state.ideas.list.map(idea => 
      idea.id === ideaId ? { ...idea, ...updates } : idea
    )
    this.setState('ideas', { list: ideas })
    
    // Also update current idea if it matches
    if (this.state.ideas.currentIdea?.id === ideaId) {
      this.setState('ideas', { 
        currentIdea: { ...this.state.ideas.currentIdea, ...updates }
      })
    }
  }

  setCurrentIdea(idea) {
    this.setState('ideas', { currentIdea: idea })
  }

  // Voting-specific state methods
  setUserVote(ideaId, voteType) {
    const userVotes = new Map(this.state.votes.userVotes)
    if (voteType === null) {
      userVotes.delete(ideaId)
    } else {
      userVotes.set(ideaId, voteType)
    }
    this.setState('votes', { userVotes })
  }

  getUserVote(ideaId) {
    return this.state.votes.userVotes.get(ideaId) || null
  }
}