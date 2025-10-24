export function Header() {
  const userState = window.app.state.getState('user')
  const currentUser = userState.currentUser
  const isAuthenticated = userState.isAuthenticated

  // Initialize header interactions after render
  setTimeout(() => {
    initializeHeader()
  }, 0)

  return `
    <header class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo and Brand -->
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <a href="#/" class="flex items-center">
                <div class="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center mr-3">
                  <span class="text-white font-bold text-lg">💡</span>
                </div>
                <span class="text-xl font-semibold text-gray-900 hidden sm:block">Innovation Platform</span>
                <span class="text-xl font-semibold text-gray-900 sm:hidden">IP</span>
              </a>
            </div>
          </div>

          <!-- Search Bar (Desktop) -->
          ${isAuthenticated ? `
            <div class="hidden md:block flex-1 max-w-lg mx-8">
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
                <input 
                  type="text" 
                  id="globalSearch"
                  class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-sm"
                  placeholder="Search ideas..."
                >
              </div>
            </div>
          ` : ''}

          <!-- Right Side Navigation -->
          <div class="flex items-center space-x-4">
            ${isAuthenticated ? `
              <!-- Notifications -->
              <div class="relative" data-dropdown>
                <button 
                  type="button" 
                  class="p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 rounded-full"
                  data-dropdown-trigger
                >
                  <span class="sr-only">View notifications</span>
                  <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 0 1 6 6v2.25l2.25 2.25v.75H2.25v-.75L4.5 12V9.75a6 6 0 0 1 6-6z"></path>
                  </svg>
                  <span id="notificationBadge" class="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center hidden">0</span>
                </button>
                
                <!-- Notifications Dropdown -->
                <div class="hidden absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-50" data-dropdown-menu>
                  <div class="px-4 py-2 border-b border-gray-200">
                    <h3 class="text-sm font-medium text-gray-900">Notifications</h3>
                  </div>
                  <div id="notificationsList" class="max-h-64 overflow-y-auto">
                    <div class="px-4 py-8 text-center text-gray-500 text-sm">
                      No new notifications
                    </div>
                  </div>
                </div>
              </div>

              <!-- User Menu -->
              <div class="relative" data-dropdown>
                <button 
                  type="button" 
                  class="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  data-dropdown-trigger
                >
                  <span class="sr-only">Open user menu</span>
                  <div class="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <span class="text-sm font-medium text-primary-600">
                      ${currentUser ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                  <span class="ml-2 text-sm font-medium text-gray-700 hidden sm:block">
                    ${currentUser ? currentUser.fullName : 'User'}
                  </span>
                  <svg class="ml-1 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                
                <!-- User Dropdown Menu -->
                <div class="hidden absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50" data-dropdown-menu>
                  <div class="px-4 py-2 border-b border-gray-200">
                    <p class="text-sm font-medium text-gray-900">${currentUser ? currentUser.fullName : 'User'}</p>
                    <p class="text-xs text-gray-500">${currentUser ? currentUser.email : ''}</p>
                  </div>
                  <a href="#/profile" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <span class="inline-block w-4 mr-2">👤</span>
                    My Profile
                  </a>
                  <a href="#/ideas?user=${currentUser ? currentUser.id : ''}" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <span class="inline-block w-4 mr-2">💡</span>
                    My Ideas
                  </a>
                  <a href="#/leaderboard" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <span class="inline-block w-4 mr-2">🏆</span>
                    Leaderboard
                  </a>
                  ${currentUser && currentUser.role === 'admin' ? `
                    <div class="border-t border-gray-200 my-1"></div>
                    <a href="#/admin" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <span class="inline-block w-4 mr-2">⚙️</span>
                      Admin Dashboard
                    </a>
                  ` : ''}
                  <div class="border-t border-gray-200 my-1"></div>
                  <button onclick="logout()" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <span class="inline-block w-4 mr-2">🚪</span>
                    Sign out
                  </button>
                </div>
              </div>

              <!-- Mobile Menu Button -->
              <button 
                type="button" 
                class="md:hidden p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 rounded-md"
                onclick="toggleMobileMenu()"
              >
                <span class="sr-only">Open main menu</span>
                <svg id="mobileMenuIcon" class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
                <svg id="mobileMenuCloseIcon" class="h-6 w-6 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            ` : `
              <!-- Unauthenticated Navigation -->
              <div class="flex items-center space-x-4">
                <a href="#/login" class="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Sign in
                </a>
                <a href="#/register" class="btn-primary">
                  Get Started
                </a>
              </div>
            `}
          </div>
        </div>
      </div>

      <!-- Mobile Menu -->
      ${isAuthenticated ? `
        <div id="mobileMenu" class="md:hidden hidden border-t border-gray-200 bg-white">
          <div class="px-2 pt-2 pb-3 space-y-1">
            <!-- Mobile Search -->
            <div class="px-3 py-2">
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
                <input 
                  type="text" 
                  id="mobileGlobalSearch"
                  class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-sm"
                  placeholder="Search ideas..."
                >
              </div>
            </div>
            
            <!-- Mobile Navigation Links -->
            <a href="#/" class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md">
              Dashboard
            </a>
            <a href="#/ideas" class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md">
              Browse Ideas
            </a>
            <a href="#/ideas/new" class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md">
              Submit Idea
            </a>
            <a href="#/leaderboard" class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md">
              Leaderboard
            </a>
          </div>
        </div>
      ` : ''}
    </header>
  `
}

function initializeHeader() {
  // Initialize search functionality
  const globalSearch = document.getElementById('globalSearch')
  const mobileGlobalSearch = document.getElementById('mobileGlobalSearch')

  if (globalSearch) {
    globalSearch.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const query = globalSearch.value.trim()
        if (query) {
          window.app.router.navigate('/ideas?search=' + encodeURIComponent(query))
        }
      }
    })
  }

  if (mobileGlobalSearch) {
    mobileGlobalSearch.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const query = mobileGlobalSearch.value.trim()
        if (query) {
          window.app.router.navigate('/ideas?search=' + encodeURIComponent(query))
          toggleMobileMenu() // Close mobile menu
        }
      }
    })
  }

  // Initialize logout functionality
  window.logout = () => {
    if (confirm('Are you sure you want to sign out?')) {
      window.app.api.users.logout()
    }
  }

  // Initialize mobile menu toggle
  window.toggleMobileMenu = () => {
    const mobileMenu = document.getElementById('mobileMenu')
    const menuIcon = document.getElementById('mobileMenuIcon')
    const closeIcon = document.getElementById('mobileMenuCloseIcon')

    if (mobileMenu && menuIcon && closeIcon) {
      const isHidden = mobileMenu.classList.contains('hidden')

      if (isHidden) {
        mobileMenu.classList.remove('hidden')
        menuIcon.classList.add('hidden')
        closeIcon.classList.remove('hidden')
      } else {
        mobileMenu.classList.add('hidden')
        menuIcon.classList.remove('hidden')
        closeIcon.classList.add('hidden')
      }
    }
  }

  // Update notifications
  updateNotifications()

  // Listen for state changes to update notifications
  window.app.state.subscribe('ui', (uiState) => {
    updateNotifications()
  })
}

function updateNotifications() {
  const notifications = window.app.state.getState('ui').notifications
  const notificationBadge = document.getElementById('notificationBadge')
  const notificationsList = document.getElementById('notificationsList')

  if (notificationBadge) {
    if (notifications.length > 0) {
      notificationBadge.textContent = notifications.length
      notificationBadge.classList.remove('hidden')
    } else {
      notificationBadge.classList.add('hidden')
    }
  }

  if (notificationsList) {
    if (notifications.length > 0) {
      notificationsList.innerHTML = notifications.slice(0, 5).map(notification => `
        <div class="px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <span class="text-lg">
                ${notification.type === 'success' ? '✅' :
          notification.type === 'error' ? '❌' :
            notification.type === 'warning' ? '⚠️' : 'ℹ️'}
              </span>
            </div>
            <div class="ml-3 flex-1">
              <p class="text-sm text-gray-900">${notification.message}</p>
              <p class="text-xs text-gray-500 mt-1">${formatNotificationTime(notification.timestamp)}</p>
            </div>
            <button 
              onclick="removeNotification('${notification.id}')"
              class="ml-2 text-gray-400 hover:text-gray-600"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
      `).join('')
    } else {
      notificationsList.innerHTML = `
        <div class="px-4 py-8 text-center text-gray-500 text-sm">
          No new notifications
        </div>
      `
    }
  }

  // Auto-remove old notifications
  window.removeNotification = (id) => {
    window.app.state.removeNotification(id)
  }
}

function formatNotificationTime(timestamp) {
  const now = new Date()
  const notificationTime = new Date(timestamp)
  const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60))

  if (diffInMinutes < 1) {
    return 'Just now'
  } else if (diffInMinutes < 60) {
    return diffInMinutes + 'm ago'
  } else if (diffInMinutes < 1440) {
    return Math.floor(diffInMinutes / 60) + 'h ago'
  } else {
    return notificationTime.toLocaleDateString()
  }
}