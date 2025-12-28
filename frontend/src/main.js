import './styles/main.css'
import './styles/landing-3d-hero.css'
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
    // Define routes (order matters - more specific routes first)
    const routes = {
      '/Dashboard': () => import('./pages/dashboard/dashboard.js'),
      '/3d-guide': () => import('./pages/guide/3d-platform-guide.js'),
      '/login': () => import('./pages/auth/login.js'),
      '/register': () => import('./pages/auth/register.js'),
      '/ideas/new': () => import('./pages/ideas/submit-idea.js'),
      '/ideas/:id': () => import('./pages/ideas/idea-detail.js'),
      '/ideas': () => import('./pages/ideas/ideas-list.js'),
      '/challenges/:difficulty/:challengeId/submit-idea': () => import('./pages/challenges/submit-idea.js'),
      '/challenges/:id/submit': () => import('./pages/challenges/submit-solution.js'),
      '/challenges/:id': () => import('./pages/challenges/challenge-detail.js'),
      '/challenges': () => import('./pages/challenges/challenges-list.js'),
      '/company/Dashboard': () => import('./pages/company/company-dashboard-table.js'),
      '/company/register': () => import('./pages/company/company-register.js'),
      '/company/challenges/create': () => import('./pages/company/create-challenge.js'),
      '/solutions/:id': () => import('./pages/solutions/solution-detail.js'),
      '/profile': () => import('./pages/profile/profile.js'),
      '/leaderboard': () => import('./pages/leaderboard/leaderboard.js'),
      '/admin': () => import('./pages/admin/admin-dashboard.js'),
      '/': () => import('./pages/landing/landing-3d-hero.js')
    }

    // Configure router
    window.app.router.configure(routes)

    // Set up authentication guard
    window.app.router.beforeEach((to, from, next) => {
      const isAuthenticated = window.app.state.getState('user').isAuthenticated
      const publicRoutes = ['/', '/login', '/register', '/company/register', '/challenges', '/ideas', '/leaderboard']

      if (!isAuthenticated && !publicRoutes.includes(to)) {
        // If trying to access protected route, redirect to login
        next('/login')
      } else {
        // Allow navigation
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