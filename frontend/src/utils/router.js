export class Router {
  constructor() {
    this.routes = {}
    this.currentRoute = null
    this.previousRoute = null
    this.beforeEachHook = null
    this.afterEachHook = null
    this.appContainer = null
    this.isNavigating = false
    this.routeHistory = []
  }

  configure(routes) {
    this.routes = routes
    this.appContainer = document.getElementById('app')
  }

  beforeEach(hook) {
    this.beforeEachHook = hook
  }

  afterEach(hook) {
    this.afterEachHook = hook
  }

  start() {
    // Listen for hash changes
    window.addEventListener('hashchange', () => this.handleRoute())
    window.addEventListener('load', () => this.handleRoute())
    
    // Handle browser back/forward buttons
    window.addEventListener('popstate', () => this.handleRoute())
    
    // Handle initial route
    this.handleRoute()
  }

  async handleRoute() {
    if (this.isNavigating) return
    
    const hash = window.location.hash.slice(1) || '/'
    const route = this.matchRoute(hash)
    
    // Prevent duplicate navigation
    if (hash === this.currentRoute) return
    
    this.isNavigating = true
    
    try {
      // Run beforeEach hook
      if (this.beforeEachHook) {
        let shouldProceed = false
        let redirectPath = null
        
        const next = (path) => {
          if (path && path !== hash) {
            redirectPath = path
          } else {
            shouldProceed = true
          }
        }
        
        await this.beforeEachHook(hash, this.currentRoute, next)
        
        if (redirectPath) {
          this.isNavigating = false
          this.navigate(redirectPath)
          return
        }
        
        if (!shouldProceed) {
          this.isNavigating = false
          return
        }
      }

      if (route) {
        try {
          // Show loading state with transition
          this.showLoading()
          
          // Load the route component
          const module = await route.handler()
          const component = module.default || module
          
          if (typeof component === 'function') {
            // Store previous route for history
            this.previousRoute = this.currentRoute
            this.currentRoute = hash
            
            // Add to history
            this.routeHistory.push({
              path: hash,
              timestamp: Date.now(),
              params: route.params
            })
            
            // Keep history limited
            if (this.routeHistory.length > 50) {
              this.routeHistory = this.routeHistory.slice(-25)
            }
            
            // Render component with transition
            await this.renderComponent(component, route.params)
            
            // Run afterEach hook
            if (this.afterEachHook) {
              this.afterEachHook(hash, this.previousRoute)
            }
            
            // Update page title
            this.updatePageTitle(hash)
            
          } else {
            console.error('Route handler must export a function')
            this.showError('Invalid route configuration')
          }
          
        } catch (error) {
          console.error('Error loading route:', error)
          this.showError('Failed to load page. Please try again.')
        }
      } else {
        this.show404()
      }
    } finally {
      this.isNavigating = false
    }
  }

  matchRoute(path) {
    // Simple route matching with parameters
    for (const [pattern, handler] of Object.entries(this.routes)) {
      const regex = pattern.replace(/:\w+/g, '([^/]+)')
      const match = path.match(new RegExp(`^${regex}$`))
      
      if (match) {
        const paramNames = pattern.match(/:(\w+)/g) || []
        const params = {}
        
        paramNames.forEach((param, index) => {
          const paramName = param.slice(1)
          params[paramName] = match[index + 1]
        })
        
        return { handler, params }
      }
    }
    
    return null
  }

  async renderComponent(component, params = {}) {
    if (this.appContainer) {
      // Add fade out transition
      this.appContainer.style.opacity = '0'
      this.appContainer.style.transition = 'opacity 0.15s ease-out'
      
      // Small delay for smooth transition
      await new Promise(resolve => setTimeout(resolve, 150))
      
      try {
        const content = await component(params)
        this.appContainer.innerHTML = content
        
        // Fade in new content
        this.appContainer.style.opacity = '1'
        
        // Trigger any post-render initialization
        const event = new CustomEvent('routeRendered', { 
          detail: { 
            params, 
            route: this.currentRoute,
            previousRoute: this.previousRoute 
          } 
        })
        document.dispatchEvent(event)
        
        // Initialize any interactive elements
        this.initializePageInteractions()
        
      } catch (error) {
        console.error('Error rendering component:', error)
        this.showError('Failed to render page content')
      }
    }
  }

  navigate(path, replace = false) {
    if (replace) {
      window.location.replace(`#${path}`)
    } else {
      window.location.hash = path
    }
  }

  back() {
    if (this.routeHistory.length > 1) {
      // Remove current route
      this.routeHistory.pop()
      // Get previous route
      const previousRoute = this.routeHistory[this.routeHistory.length - 1]
      if (previousRoute) {
        this.navigate(previousRoute.path, true)
      } else {
        window.history.back()
      }
    } else {
      window.history.back()
    }
  }

  forward() {
    window.history.forward()
  }

  getCurrentRoute() {
    return this.currentRoute
  }

  getPreviousRoute() {
    return this.previousRoute
  }

  getRouteHistory() {
    return [...this.routeHistory]
  }

  updatePageTitle(route) {
    const routeTitles = {
      '/': 'Dashboard - Innovation Platform',
      '/login': 'Login - Innovation Platform',
      '/register': 'Register - Innovation Platform',
      '/ideas': 'Ideas - Innovation Platform',
      '/ideas/new': 'Submit Idea - Innovation Platform',
      '/profile': 'Profile - Innovation Platform',
      '/leaderboard': 'Leaderboard - Innovation Platform',
      '/admin': 'Admin Dashboard - Innovation Platform'
    }
    
    document.title = routeTitles[route] || 'Innovation Platform'
  }

  initializePageInteractions() {
    // Initialize any common page interactions
    // This will be called after each route render
    
    // Initialize tooltips, dropdowns, etc.
    this.initializeDropdowns()
    this.initializeModals()
    this.initializeForms()
  }

  initializeDropdowns() {
    const dropdowns = document.querySelectorAll('[data-dropdown]')
    dropdowns.forEach(dropdown => {
      const trigger = dropdown.querySelector('[data-dropdown-trigger]')
      const menu = dropdown.querySelector('[data-dropdown-menu]')
      
      if (trigger && menu) {
        trigger.addEventListener('click', (e) => {
          e.stopPropagation()
          menu.classList.toggle('hidden')
        })
        
        // Close on outside click
        document.addEventListener('click', () => {
          menu.classList.add('hidden')
        })
      }
    })
  }

  initializeModals() {
    const modalTriggers = document.querySelectorAll('[data-modal-trigger]')
    modalTriggers.forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault()
        const modalId = trigger.getAttribute('data-modal-trigger')
        const modal = document.getElementById(modalId)
        if (modal) {
          modal.classList.remove('hidden')
          modal.classList.add('flex')
        }
      })
    })

    const modalCloses = document.querySelectorAll('[data-modal-close]')
    modalCloses.forEach(close => {
      close.addEventListener('click', (e) => {
        e.preventDefault()
        const modal = close.closest('.modal')
        if (modal) {
          modal.classList.add('hidden')
          modal.classList.remove('flex')
        }
      })
    })
  }

  initializeForms() {
    const forms = document.querySelectorAll('form[data-form]')
    forms.forEach(form => {
      form.addEventListener('submit', async (e) => {
        e.preventDefault()
        const formType = form.getAttribute('data-form')
        
        // Handle different form types
        switch (formType) {
          case 'login':
            await this.handleLoginForm(form)
            break
          case 'register':
            await this.handleRegisterForm(form)
            break
          case 'idea-submit':
            await this.handleIdeaSubmitForm(form)
            break
          case 'comment':
            await this.handleCommentForm(form)
            break
        }
      })
    })
  }

  async handleLoginForm(form) {
    const formData = new FormData(form)
    const email = formData.get('email')
    
    try {
      const user = await window.app.api.getUserByEmail(email)
      window.app.state.setUser(user)
      window.app.state.addNotification({
        type: 'success',
        message: 'Welcome back!'
      })
      this.navigate('/')
    } catch (error) {
      window.app.state.addNotification({
        type: 'error',
        message: 'Login failed. Please check your email.'
      })
    }
  }

  async handleRegisterForm(form) {
    const formData = new FormData(form)
    const userData = {
      email: formData.get('email'),
      fullName: formData.get('fullName'),
      department: formData.get('department'),
      role: formData.get('role')
    }
    
    try {
      const user = await window.app.api.createUser(userData)
      window.app.state.setUser(user)
      window.app.state.addNotification({
        type: 'success',
        message: 'Account created successfully!'
      })
      this.navigate('/')
    } catch (error) {
      window.app.state.addNotification({
        type: 'error',
        message: 'Registration failed. Please try again.'
      })
    }
  }

  async handleIdeaSubmitForm(form) {
    const formData = new FormData(form)
    const currentUser = window.app.state.getState('user').currentUser
    
    const ideaData = {
      title: formData.get('title'),
      description: formData.get('description'),
      submittedBy: currentUser.id
    }
    
    try {
      const idea = await window.app.api.createIdea(ideaData)
      
      // Award points for idea submission
      await window.app.api.awardPointsForIdeaSubmission(currentUser.id)
      
      // Trigger AI categorization
      await window.app.api.categorizeIdea(ideaData)
      
      window.app.state.addIdea(idea)
      window.app.state.addNotification({
        type: 'success',
        message: 'Idea submitted successfully!'
      })
      this.navigate('/ideas')
    } catch (error) {
      window.app.state.addNotification({
        type: 'error',
        message: 'Failed to submit idea. Please try again.'
      })
    }
  }

  async handleCommentForm(form) {
    const formData = new FormData(form)
    const currentUser = window.app.state.getState('user').currentUser
    const ideaId = form.getAttribute('data-idea-id')
    
    const commentData = {
      ideaId: ideaId,
      userId: currentUser.id,
      userName: currentUser.fullName,
      content: formData.get('content')
    }
    
    try {
      await window.app.api.addComment(commentData)
      
      // Award points for comment
      await window.app.api.awardPointsForComment(currentUser.id)
      
      window.app.state.addNotification({
        type: 'success',
        message: 'Comment added successfully!'
      })
      
      // Refresh the current page to show new comment
      this.handleRoute()
    } catch (error) {
      window.app.state.addNotification({
        type: 'error',
        message: 'Failed to add comment. Please try again.'
      })
    }
  }

  showLoading() {
    if (this.appContainer) {
      this.appContainer.innerHTML = `
        <div class="flex items-center justify-center min-h-screen bg-gray-50">
          <div class="text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p class="text-gray-600">Loading...</p>
          </div>
        </div>
      `
    }
  }

  showError(message) {
    if (this.appContainer) {
      this.appContainer.innerHTML = `
        <div class="flex items-center justify-center min-h-screen">
          <div class="text-center">
            <div class="text-danger-600 text-xl mb-4">⚠️</div>
            <h2 class="text-xl font-semibold text-gray-900 mb-2">Error</h2>
            <p class="text-gray-600 mb-4">${message}</p>
            <button onclick="window.location.reload()" class="btn-primary">
              Reload Page
            </button>
          </div>
        </div>
      `
    }
  }

  show404() {
    if (this.appContainer) {
      this.appContainer.innerHTML = `
        <div class="flex items-center justify-center min-h-screen">
          <div class="text-center">
            <div class="text-6xl mb-4">404</div>
            <h2 class="text-xl font-semibold text-gray-900 mb-2">Page Not Found</h2>
            <p class="text-gray-600 mb-4">The page you're looking for doesn't exist.</p>
            <button onclick="window.app.router.navigate('/')" class="btn-primary">
              Go Home
            </button>
          </div>
        </div>
      `
    }
  }
}