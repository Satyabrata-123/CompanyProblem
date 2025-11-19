import { Layout } from '../../components/layout/layout.js'

export default async function IdeasListPage() {
  const currentUser = window.app.state.getState('user').currentUser
  
  if (!currentUser) {
    window.app.router.navigate('/login')
    return ''
  }

  // Parse URL parameters
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '')
  const filters = {
    status: urlParams.get('status') || 'all',
    category: urlParams.get('category') || 'all',
    search: urlParams.get('search') || '',
    user: urlParams.get('user') || '',
    sort: urlParams.get('sort') || 'newest'
  }

  const isUserIdeas = filters.user === currentUser.id
  const pageTitle = isUserIdeas ? 'My Ideas' : 'All Ideas'

  // Load ideas data
  let ideas = []
  let totalIdeas = 0
  let categories = []
  
  try {
    let rawIdeas = []
    
    if (isUserIdeas) {
      rawIdeas = await window.app.api.getIdeasByUser(currentUser.id)
    } else if (filters.status !== 'all') {
      rawIdeas = await window.app.api.getIdeasByStatus(filters.status)
    } else {
      rawIdeas = await window.app.api.getAllIdeas()
    }
    
    // Ensure we have an array
    ideas = Array.isArray(rawIdeas) ? rawIdeas : []
    
    // Apply additional filters
    ideas = applyFilters(ideas, filters)
    totalIdeas = ideas.length
    
    // Get unique categories
    categories = [...new Set(ideas.map(idea => idea.category).filter(Boolean))]
    
  } catch (error) {
    console.error('Failed to load ideas:', error)
    
    // Use empty array as fallback to show empty state instead of error page
    ideas = []
    totalIdeas = 0
    categories = []
    
    // Add a notification about the connection issue
    setTimeout(() => {
      if (window.app && window.app.state) {
        window.app.state.addNotification({
          type: 'warning',
          message: 'Unable to connect to server. Please check if backend services are running.',
          duration: 8000
        })
      }
    }, 1000)
  }

  // Initialize page interactions after render
  setTimeout(() => {
    initializeIdeasListPage(ideas, filters, isUserIdeas)
    
    // Check backend connectivity if no ideas were loaded
    if (ideas.length === 0 && !isUserIdeas) {
      checkBackendConnectivity()
    }
  }, 0)

  const content = `
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <!-- Header -->
        <div class="flex items-center justify-between mb-8">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">${pageTitle} 💡</h1>
            <p class="mt-2 text-gray-600">
              ${isUserIdeas ? 
                'Manage and track your submitted ideas' : 
                'Discover and engage with innovative ideas from the community'
              }
            </p>
          </div>
          <div class="flex items-center space-x-4">
            ${!isUserIdeas ? `
              <button onclick="toggleFilters()" class="btn-secondary">
                <span class="mr-2">🔍</span>
                Filters
              </button>
            ` : ''}
            <a href="#/ideas/new" class="btn-primary">
              <span class="mr-2">➕</span>
              Submit Idea
            </a>
          </div>
        </div>

        <!-- Stats Bar -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-gray-900">${totalIdeas}</div>
              <div class="text-sm text-gray-500">Total Ideas</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-green-600">${ideas.filter(i => i.status === 'IMPLEMENTED').length}</div>
              <div class="text-sm text-gray-500">Implemented</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600">${ideas.filter(i => i.status === 'IN_DEVELOPMENT').length}</div>
              <div class="text-sm text-gray-500">In Development</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-yellow-600">${ideas.filter(i => i.status === 'UNDER_REVIEW').length}</div>
              <div class="text-sm text-gray-500">Under Review</div>
            </div>
          </div>
        </div>

        <!-- Ideas Grid -->
        <div id="ideasContainer">
          ${ideas.length > 0 ? `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              ${ideas.map(idea => createIdeaCard(idea, currentUser, isUserIdeas)).join('')}
            </div>
          ` : `
            <div class="text-center py-12">
              <div class="text-6xl mb-4">💡</div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">
                ${isUserIdeas ? 'No ideas submitted yet' : 'No ideas found'}
              </h3>
              <p class="text-gray-500 mb-6">
                ${isUserIdeas ? 
                  'Start sharing your innovative ideas with the community!' : 
                  'Try adjusting your filters or be the first to submit an idea.'
                }
              </p>
              <div class="space-x-4">
                <a href="#/ideas/new" class="btn-primary">
                  <span class="mr-2">➕</span>
                  Submit First Idea
                </a>
              </div>
            </div>
          `}
        </div>
      </div>
    </div>
  `

  return Layout(content)
}

function createIdeaCard(idea, currentUser, isUserIdeas) {
  // Safety checks for undefined properties
  if (!idea || !currentUser) {
    return '<div class="bg-red-50 p-4 rounded-lg">Error: Invalid idea or user data</div>'
  }
  
  const isOwner = idea.submittedBy === currentUser.id
  const statusColor = getStatusColor(idea.status || 'SUBMITTED')
  const timeAgo = formatRelativeTime(idea.createdAt || new Date().toISOString())
  
  return `
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div class="p-6">
        <div class="flex items-start justify-between mb-3">
          <div class="flex-1">
            <h3 class="text-lg font-medium text-gray-900 mb-2">
              <a href="#/ideas/${idea.id || 'unknown'}" class="hover:text-primary-600 transition-colors">
                ${idea.title || 'Untitled Idea'}
              </a>
            </h3>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}">
              ${(idea.status || 'SUBMITTED').replace('_', ' ')}
            </span>
          </div>
        </div>

        <p class="text-gray-600 text-sm mb-4 line-clamp-3">
          ${truncateText(idea.description || 'No description available', 150)}
        </p>

        <div class="flex items-center justify-between pt-4 border-t border-gray-100">
          <div class="flex items-center space-x-4 text-sm text-gray-500">
            <span>${idea.voteCount || 0} votes</span>
            <span>${idea.commentCount || 0} comments</span>
          </div>
          <div class="flex items-center space-x-2">
            <button onclick="submitIdeaForProblem('${idea.id}', '${idea.title}')" 
                    class="submit-idea-btn text-xs bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1 rounded-full transition-colors">
              💡 Submit Idea
            </button>
            <div class="text-xs text-gray-500">
              ${timeAgo}
            </div>
          </div>
        </div>
      </div>
    </div>
  `
}

function initializeIdeasListPage(ideas, filters, isUserIdeas) {
  try {
    // Global functions
    window.toggleFilters = () => {
      const panel = document.getElementById('filtersPanel')
      if (panel) panel.classList.toggle('hidden')
    }

    // Submit idea for problem function
    window.submitIdeaForProblem = (ideaId, ideaTitle) => {
      // Store the original idea info for context
      localStorage.setItem('originalIdeaContext', JSON.stringify({
        ideaId: ideaId,
        ideaTitle: ideaTitle,
        timestamp: new Date().toISOString()
      }))
      
      // Navigate to the challenge idea submission page
      // We'll treat this as an "INTERMEDIATE" difficulty challenge for now
      window.app.router.navigate(`/challenges/INTERMEDIATE/${ideaId}/submit-idea`)
    }

  } catch (error) {
    console.error('Error initializing ideas list page:', error)
  }
}

function applyFilters(ideas, filters) {
  let filtered = [...ideas]

  // Status filter
  if (filters.status !== 'all') {
    filtered = filtered.filter(idea => idea.status === filters.status)
  }

  // Category filter
  if (filters.category !== 'all') {
    filtered = filtered.filter(idea => idea.category === filters.category)
  }

  // Search filter
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase()
    filtered = filtered.filter(idea => 
      (idea.title && idea.title.toLowerCase().includes(searchTerm)) ||
      (idea.description && idea.description.toLowerCase().includes(searchTerm)) ||
      (idea.tags && Array.isArray(idea.tags) && idea.tags.some(tag => 
        tag && tag.toLowerCase().includes(searchTerm)
      ))
    )
  }

  // Sort
  switch (filters.sort) {
    case 'oldest':
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      break
    case 'votes':
      filtered.sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0))
      break
    case 'comments':
      filtered.sort((a, b) => (b.commentCount || 0) - (a.commentCount || 0))
      break
    case 'score':
      filtered.sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0))
      break
    default: // newest
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  return filtered
}

function getStatusColor(status) {
  const colors = {
    'SUBMITTED': 'bg-blue-100 text-blue-800',
    'UNDER_REVIEW': 'bg-yellow-100 text-yellow-800',
    'APPROVED': 'bg-green-100 text-green-800',
    'IN_DEVELOPMENT': 'bg-purple-100 text-purple-800',
    'IMPLEMENTED': 'bg-green-100 text-green-800',
    'REJECTED': 'bg-red-100 text-red-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

function truncateText(text, maxLength) {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

function formatRelativeTime(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)
  
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  
  return date.toLocaleDateString()
}

async function checkBackendConnectivity() {
  try {
    const response = await fetch('/api/ideas', { 
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
    
    if (!response.ok) {
      showConnectivityMessage('API is responding but returned an error. Backend services may not be fully started.')
    }
  } catch (error) {
    showConnectivityMessage('Cannot connect to backend services. Please start the backend services using the startup script.')
  }
}

function showConnectivityMessage(message) {
  const container = document.getElementById('ideasContainer')
  if (container && container.innerHTML.includes('No ideas found')) {
    container.innerHTML = `
      <div class="text-center py-12">
        <div class="text-6xl mb-4">🔌</div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Backend Services Not Running</h3>
        <p class="text-gray-500 mb-4">${message}</p>
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left max-w-2xl mx-auto">
          <h4 class="font-medium text-blue-900 mb-2">To start the backend services:</h4>
          <ol class="text-sm text-blue-800 space-y-1">
            <li>1. Open PowerShell as Administrator</li>
            <li>2. Navigate to your project directory</li>
            <li>3. Run: <code class="bg-blue-100 px-2 py-1 rounded">./start-services.ps1</code></li>
            <li>4. Wait for all 6 services to start</li>
            <li>5. Refresh this page</li>
          </ol>
        </div>
        <div class="space-x-4">
          <button onclick="window.location.reload()" class="btn-primary">Check Again</button>
          <a href="#/" class="btn-secondary">← Go Home</a>
        </div>
      </div>
    `
  }
}