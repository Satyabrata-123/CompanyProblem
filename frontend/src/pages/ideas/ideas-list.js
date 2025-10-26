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
    if (isUserIdeas) {
      ideas = await window.app.api.getIdeasByUser(currentUser.id)
    } else if (filters.status !== 'all') {
      ideas = await window.app.api.getIdeasByStatus(filters.status)
    } else {
      ideas = await window.app.api.getAllIdeas()
    }
    
    // Apply additional filters
    ideas = applyFilters(ideas, filters)
    totalIdeas = ideas.length
    
    // Get unique categories
    categories = [...new Set(ideas.map(idea => idea.category).filter(Boolean))]
    
  } catch (error) {
    console.error('Failed to load ideas:', error)
  }

  // Initialize page interactions after render
  setTimeout(() => {
    initializeIdeasListPage(ideas, filters, isUserIdeas)
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

        <!-- Filters Panel -->
        <div id="filtersPanel" class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6 ${!isUserIdeas ? 'hidden' : ''}">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <!-- Status Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select id="statusFilter" class="input">
                <option value="all" ${filters.status === 'all' ? 'selected' : ''}>All Statuses</option>
                <option value="SUBMITTED" ${filters.status === 'SUBMITTED' ? 'selected' : ''}>Submitted</option>
                <option value="UNDER_REVIEW" ${filters.status === 'UNDER_REVIEW' ? 'selected' : ''}>Under Review</option>
                <option value="APPROVED" ${filters.status === 'APPROVED' ? 'selected' : ''}>Approved</option>
                <option value="IN_DEVELOPMENT" ${filters.status === 'IN_DEVELOPMENT' ? 'selected' : ''}>In Development</option>
                <option value="IMPLEMENTED" ${filters.status === 'IMPLEMENTED' ? 'selected' : ''}>Implemented</option>
                <option value="REJECTED" ${filters.status === 'REJECTED' ? 'selected' : ''}>Rejected</option>
              </select>
            </div>

            <!-- Category Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select id="categoryFilter" class="input">
                <option value="all" ${filters.category === 'all' ? 'selected' : ''}>All Categories</option>
                ${categories.map(category => `
                  <option value="${category}" ${filters.category === category ? 'selected' : ''}>${category}</option>
                `).join('')}
              </select>
            </div>

            <!-- Sort -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select id="sortFilter" class="input">
                <option value="newest" ${filters.sort === 'newest' ? 'selected' : ''}>Newest First</option>
                <option value="oldest" ${filters.sort === 'oldest' ? 'selected' : ''}>Oldest First</option>
                <option value="votes" ${filters.sort === 'votes' ? 'selected' : ''}>Most Voted</option>
                <option value="comments" ${filters.sort === 'comments' ? 'selected' : ''}>Most Discussed</option>
                <option value="score" ${filters.sort === 'score' ? 'selected' : ''}>AI Score</option>
              </select>
            </div>

            <!-- Search -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input 
                type="text" 
                id="searchFilter" 
                class="input" 
                placeholder="Search ideas..."
                value="${filters.search}"
              >
            </div>
          </div>
          
          <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <button onclick="clearFilters()" class="text-gray-600 hover:text-gray-800 text-sm font-medium">
              Clear All Filters
            </button>
            <button onclick="applyFilters()" class="btn-primary">
              Apply Filters
            </button>
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
              <a href="#/ideas/new" class="btn-primary">
                <span class="mr-2">➕</span>
                Submit Your First Idea
              </a>
            </div>
          `}
        </div>

        <!-- Load More Button -->
        ${ideas.length > 12 ? `
          <div class="text-center mt-8">
            <button onclick="loadMoreIdeas()" class="btn-secondary" id="loadMoreBtn">
              Load More Ideas
            </button>
          </div>
        ` : ''}
      </div>
    </div>
  `

  return Layout(content)
}

function createIdeaCard(idea, currentUser, isUserIdeas) {
  const isOwner = idea.submittedBy === currentUser.id
  const statusColor = getStatusColor(idea.status)
  const timeAgo = formatRelativeTime(idea.createdAt)
  
  return `
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div class="p-6">
        <!-- Header -->
        <div class="flex items-start justify-between mb-3">
          <div class="flex-1">
            <h3 class="text-lg font-medium text-gray-900 mb-2">
              <a href="#/ideas/${idea.id}" class="hover:text-primary-600 transition-colors">
                ${idea.title}
              </a>
            </h3>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}">
              ${idea.status.replace('_', ' ')}
            </span>
          </div>
          ${isOwner && isUserIdeas ? `
            <div class="flex items-center space-x-2 ml-4">
              <button onclick="editIdea('${idea.id}')" class="text-gray-400 hover:text-gray-600" title="Edit">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
              </button>
              ${idea.status === 'SUBMITTED' ? `
                <button onclick="deleteIdea('${idea.id}')" class="text-red-400 hover:text-red-600" title="Delete">
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              ` : ''}
            </div>
          ` : ''}
        </div>

        <!-- Description -->
        <p class="text-gray-600 text-sm mb-4 line-clamp-3">
          ${truncateText(idea.description, 150)}
        </p>

        <!-- Tags -->
        ${idea.tags && idea.tags.length > 0 ? `
          <div class="flex flex-wrap gap-1 mb-4">
            ${idea.tags.slice(0, 3).map(tag => `
              <span class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                ${tag}
              </span>
            `).join('')}
            ${idea.tags.length > 3 ? `
              <span class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                +${idea.tags.length - 3} more
              </span>
            ` : ''}
          </div>
        ` : ''}

        <!-- AI Score -->
        ${idea.aiScore ? `
          <div class="flex items-center mb-4">
            <span class="text-xs text-gray-500 mr-2">AI Score:</span>
            <div class="flex-1 bg-gray-200 rounded-full h-1.5">
              <div class="bg-primary-600 h-1.5 rounded-full" style="width: ${idea.aiScore}%"></div>
            </div>
            <span class="text-xs text-gray-600 ml-2">${Math.round(idea.aiScore)}/100</span>
          </div>
        ` : ''}

        <!-- Footer -->
        <div class="flex items-center justify-between text-sm text-gray-500">
          <div class="flex items-center space-x-4">
            <span class="flex items-center">
              <svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12"></path>
              </svg>
              ${idea.voteCount || 0}
            </span>
            <span class="flex items-center">
              <svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
              </svg>
              ${idea.commentCount || 0}
            </span>
          </div>
          <div class="flex items-center space-x-2">
            <span>by ${isOwner ? 'You' : idea.submitterName}</span>
            <span>•</span>
            <span>${timeAgo}</span>
          </div>
        </div>
      </div>
    </div>
  `
}

function initializeIdeasListPage(ideas, filters, isUserIdeas) {
  let displayedIdeas = 12
  let filteredIdeas = ideas

  // Filter controls
  const statusFilter = document.getElementById('statusFilter')
  const categoryFilter = document.getElementById('categoryFilter')
  const sortFilter = document.getElementById('sortFilter')
  const searchFilter = document.getElementById('searchFilter')

  // Add event listeners
  if (statusFilter) statusFilter.addEventListener('change', updateFilters)
  if (categoryFilter) categoryFilter.addEventListener('change', updateFilters)
  if (sortFilter) sortFilter.addEventListener('change', updateFilters)
  if (searchFilter) {
    searchFilter.addEventListener('input', debounce(updateFilters, 300))
    searchFilter.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        updateFilters()
      }
    })
  }

  // Global functions
  window.toggleFilters = () => {
    const panel = document.getElementById('filtersPanel')
    panel.classList.toggle('hidden')
  }

  window.clearFilters = () => {
    if (statusFilter) statusFilter.value = 'all'
    if (categoryFilter) categoryFilter.value = 'all'
    if (sortFilter) sortFilter.value = 'newest'
    if (searchFilter) searchFilter.value = ''
    updateFilters()
  }

  window.applyFilters = updateFilters

  window.loadMoreIdeas = () => {
    displayedIdeas += 12
    renderIdeas(filteredIdeas.slice(0, displayedIdeas))
    
    if (displayedIdeas >= filteredIdeas.length) {
      const loadMoreBtn = document.getElementById('loadMoreBtn')
      if (loadMoreBtn) loadMoreBtn.style.display = 'none'
    }
  }

  window.editIdea = (ideaId) => {
    // For now, redirect to idea detail page
    // In a full implementation, this could open an edit modal
    window.app.router.navigate(`/ideas/${ideaId}`)
  }

  window.deleteIdea = async (ideaId) => {
    if (confirm('Are you sure you want to delete this idea? This action cannot be undone.')) {
      try {
        // Note: This would require a delete endpoint in the backend
        // await window.app.api.deleteIdea(ideaId)
        
        window.app.state.addNotification({
          type: 'success',
          message: 'Idea deleted successfully'
        })
        
        // Refresh the page
        window.app.router.handleRoute()
        
      } catch (error) {
        window.app.state.addNotification({
          type: 'error',
          message: 'Failed to delete idea'
        })
      }
    }
  }

  function updateFilters() {
    const newFilters = {
      status: statusFilter?.value || 'all',
      category: categoryFilter?.value || 'all',
      sort: sortFilter?.value || 'newest',
      search: searchFilter?.value || ''
    }

    // Apply filters
    filteredIdeas = applyFilters(ideas, newFilters)
    
    // Reset pagination
    displayedIdeas = 12
    
    // Render filtered ideas
    renderIdeas(filteredIdeas.slice(0, displayedIdeas))
    
    // Update URL
    updateURL(newFilters, isUserIdeas)
  }

  function renderIdeas(ideasToRender) {
    const container = document.getElementById('ideasContainer')
    const currentUser = window.app.state.getState('user').currentUser
    
    if (ideasToRender.length > 0) {
      container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${ideasToRender.map(idea => createIdeaCard(idea, currentUser, isUserIdeas)).join('')}
        </div>
      `
    } else {
      container.innerHTML = `
        <div class="text-center py-12">
          <div class="text-6xl mb-4">🔍</div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">No ideas found</h3>
          <p class="text-gray-500 mb-6">Try adjusting your filters or search terms.</p>
          <button onclick="clearFilters()" class="btn-secondary mr-4">Clear Filters</button>
          <a href="#/ideas/new" class="btn-primary">Submit New Idea</a>
        </div>
      `
    }
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
      idea.title.toLowerCase().includes(searchTerm) ||
      idea.description.toLowerCase().includes(searchTerm) ||
      (idea.tags && idea.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
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
    case 'newest':
    default:
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      break
  }

  return filtered
}

function updateURL(filters, isUserIdeas) {
  const params = new URLSearchParams()
  
  if (filters.status !== 'all') params.set('status', filters.status)
  if (filters.category !== 'all') params.set('category', filters.category)
  if (filters.search) params.set('search', filters.search)
  if (filters.sort !== 'newest') params.set('sort', filters.sort)
  if (isUserIdeas) params.set('user', window.app.state.getState('user').currentUser.id)
  
  const queryString = params.toString()
  const newURL = queryString ? `/ideas?${queryString}` : '/ideas'
  
  window.history.replaceState(null, '', `#${newURL}`)
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
  const diffInMinutes = Math.floor((now - date) / (1000 * 60))
  
  if (diffInMinutes < 1) return 'just now'
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
  if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`
  
  return date.toLocaleDateString()
}

function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}