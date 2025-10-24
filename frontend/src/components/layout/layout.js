import { Header } from './header.js'
import { Sidebar } from './sidebar.js'

export function Layout(content) {
  const userState = window.app.state.getState('user')
  const isAuthenticated = userState.isAuthenticated

  // Initialize layout after render
  setTimeout(() => {
    initializeLayout()
  }, 0)

  return `
    <div class="min-h-screen bg-gray-50">
      ${Header()}
      
      <div class="flex">
        ${isAuthenticated ? Sidebar() : ''}
        
        <!-- Main Content -->
        <div class="flex-1 ${isAuthenticated ? 'lg:pl-0' : ''}">
          <main class="flex-1">
            ${content}
          </main>
        </div>
      </div>
      
      <!-- Toast Notifications -->
      <div id="toastContainer" class="fixed top-4 right-4 z-50 space-y-2">
        <!-- Notifications will be inserted here -->
      </div>
    </div>
  `
}

function initializeLayout() {
  // Initialize toast notifications
  initializeToastNotifications()
  
  // Listen for state changes to update notifications
  window.app.state.subscribe('ui', (uiState) => {
    updateToastNotifications(uiState.notifications)
  })
  
  // Initialize any global keyboard shortcuts
  initializeKeyboardShortcuts()
}

function initializeToastNotifications() {
  const notifications = window.app.state.getState('ui').notifications
  updateToastNotifications(notifications)
}

function updateToastNotifications(notifications) {
  const container = document.getElementById('toastContainer')
  if (!container) return
  
  // Clear existing notifications
  container.innerHTML = ''
  
  // Add current notifications
  notifications.forEach(notification => {
    const toastElement = createToastElement(notification)
    container.appendChild(toastElement)
    
    // Animate in
    setTimeout(() => {
      toastElement.classList.add('animate-slide-in')
    }, 10)
  })
}

function createToastElement(notification) {
  const toast = document.createElement('div')
  toast.className = `transform translate-x-full transition-transform duration-300 ease-out max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden`
  
  const bgColor = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200'
  }[notification.type] || 'bg-gray-50 border-gray-200'
  
  const iconColor = {
    success: 'text-green-400',
    error: 'text-red-400',
    warning: 'text-yellow-400',
    info: 'text-blue-400'
  }[notification.type] || 'text-gray-400'
  
  const icon = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  }[notification.type] || 'ℹ️'
  
  toast.innerHTML = `
    <div class="p-4 ${bgColor} border">
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <span class="text-lg ${iconColor}">${icon}</span>
        </div>
        <div class="ml-3 w-0 flex-1 pt-0.5">
          <p class="text-sm font-medium text-gray-900">
            ${notification.message}
          </p>
        </div>
        <div class="ml-4 flex-shrink-0 flex">
          <button 
            class="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            onclick="removeToastNotification('${notification.id}')"
          >
            <span class="sr-only">Close</span>
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `
  
  // Auto-remove after duration
  if (notification.autoRemove !== false) {
    setTimeout(() => {
      removeToastNotification(notification.id)
    }, notification.duration || 5000)
  }
  
  return toast
}

function initializeKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Only handle shortcuts when not in input fields
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      return
    }
    
    // Cmd/Ctrl + K for search
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      const searchInput = document.getElementById('globalSearch') || document.getElementById('mobileGlobalSearch')
      if (searchInput) {
        searchInput.focus()
      }
    }
    
    // Cmd/Ctrl + N for new idea
    if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
      e.preventDefault()
      window.app.router.navigate('/ideas/new')
    }
    
    // Escape to close modals
    if (e.key === 'Escape') {
      const modals = document.querySelectorAll('.modal:not(.hidden)')
      modals.forEach(modal => {
        modal.classList.add('hidden')
        modal.classList.remove('flex')
      })
    }
  })
}

// Global function to remove toast notifications
window.removeToastNotification = (id) => {
  window.app.state.removeNotification(id)
}