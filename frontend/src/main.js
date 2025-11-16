import './styles/main.css'
import { Router } from './utils/router.js'
import { StateManager } from './utils/state-manager.js'
import { ApiClient } from './services/api-client.js'

// Initialize core application services
const apiClient = new ApiClient()
const stateManager = new StateManager()
const router = new Router()

// Initialize service modules
apiClient.initializeServices()

// Make services globally available
window.app = {
  api: apiClient,
  state: stateManager,
  router: router
}

// Initialize application
class App {
  constructor() {
    this.init()
  }

  async init() {
    try {
      // Initialize state manager
      await this.initializeState()

      // Set up router
      this.setupRouter()

      // Start the application
      this.start()

      console.log('Innovation Platform initialized successfully')
    } catch (error) {
      console.error('Failed to initialize application:', error)
      this.showError('Failed to initialize application. Please refresh the page.')
    }
  }

  async initializeState() {
    // Initialize user session from localStorage
    const savedUser = localStorage.getItem('innovation_user')
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser)
        window.app.state.setState('user', {
          currentUser: user,
          isAuthenticated: true,
          loading: false
        })
      } catch (error) {
        console.warn('Invalid saved user data, clearing localStorage')
        localStorage.removeItem('innovation_user')
      }
    }
  }

  setupRouter() {
    // Define routes
    const routes = {
      '/': () => import('./pages/dashboard/dashboard.js'),
      '/login': () => import('./pages/auth/login.js'),
      '/register': () => import('./pages/auth/register.js'),
      '/ideas': () => import('./pages/ideas/ideas-list.js'),
      '/ideas/new': () => import('./pages/ideas/submit-idea.js'),
      '/ideas/:id': () => import('./pages/ideas/idea-detail.js'),
      '/challenges': () => import('./pages/challenges/challenges-list.js'),
      '/challenges/:id': () => import('./pages/challenges/challenge-detail.js'),
      '/challenges/:id/submit': () => import('./pages/challenges/submit-solution.js'),
      '/challenges/:difficulty/:challengeId/submit-idea': () => import('./pages/challenges/submit-idea.js'),
      '/company/dashboard': () => import('./pages/company/company-dashboard.js'),
      '/company/register': () => import('./pages/company/company-register.js'),
      '/company/challenges/create': () => import('./pages/company/create-challenge.js'),
      '/solutions/:id': () => import('./pages/solutions/solution-detail.js'),
      '/profile': () => import('./pages/profile/profile.js'),
      '/leaderboard': () => import('./pages/leaderboard/leaderboard.js'),
      '/admin': () => import('./pages/admin/admin-dashboard.js')
    }

    // Configure router
    window.app.router.configure(routes)

    // Set up authentication guard
    window.app.router.beforeEach((to, from, next) => {
      const isAuthenticated = window.app.state.getState('user').isAuthenticated
      const publicRoutes = ['/login', '/register']

      if (!isAuthenticated && !publicRoutes.includes(to)) {
        next('/login')
      } else if (isAuthenticated && publicRoutes.includes(to)) {
        next('/')
      } else {
        next()
      }
    })
  }

  start() {
    // Start the router
    window.app.router.start()

    // Set up global error handling
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason)
      this.showError('An unexpected error occurred. Please try again.')
    })

    // Set up online/offline detection
    window.addEventListener('online', () => {
      this.showNotification('Connection restored', 'success')
    })

    window.addEventListener('offline', () => {
      this.showNotification('You are offline. Some features may not work.', 'warning')
    })
  }

  showError(message) {
    // This will be implemented when we create the notification system
    console.error(message)
  }

  showNotification(message, type = 'info') {
    // This will be implemented when we create the notification system
    console.log(`${type.toUpperCase()}: ${message}`)
  }
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new App())
} else {
  new App()
}