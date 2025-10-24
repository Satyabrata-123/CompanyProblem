export function Sidebar() {
  const userState = window.app.state.getState('user')
  const currentUser = userState.currentUser
  const isAuthenticated = userState.isAuthenticated
  const currentRoute = window.app.router.getCurrentRoute()

  if (!isAuthenticated) {
    return ''
  }

  // Initialize sidebar interactions after render
  setTimeout(() => {
    initializeSidebar()
  }, 0)

  return `
    <aside class="hidden lg:flex lg:flex-shrink-0">
      <div class="flex flex-col w-64">
        <div class="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
          <!-- User Stats Summary -->
          <div class="px-4 mb-6">
            <div class="bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg p-4">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <span class="text-sm font-semibold text-primary-600">
                      ${currentUser ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                </div>
                <div class="ml-3 flex-1">
                  <p class="text-sm font-medium text-gray-900 truncate">
                    ${currentUser ? currentUser.fullName : 'User'}
                  </p>
                  <div class="flex items-center text-xs text-gray-500">
                    <span class="mr-2">⭐ <span id="userPoints">--</span></span>
                    <span>🏆 #<span id="userRank">--</span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Navigation -->
          <nav class="flex-1 px-2 space-y-1">
            <a href="#/" class="nav-link ${currentRoute === '/' ? 'nav-link-active' : ''}">
              <span class="nav-icon">📊</span>
              Dashboard
            </a>
            
            <a href="#/ideas" class="nav-link ${currentRoute === '/ideas' ? 'nav-link-active' : ''}">
              <span class="nav-icon">💡</span>
              Browse Ideas
            </a>
            
            <a href="#/ideas/new" class="nav-link ${currentRoute === '/ideas/new' ? 'nav-link-active' : ''}">
              <span class="nav-icon">➕</span>
              Submit Idea
            </a>
            
            <a href="#/leaderboard" class="nav-link ${currentRoute === '/leaderboard' ? 'nav-link-active' : ''}">
              <span class="nav-icon">🏆</span>
              Leaderboard
            </a>
            
            <a href="#/profile" class="nav-link ${currentRoute === '/profile' ? 'nav-link-active' : ''}">
              <span class="nav-icon">👤</span>
              My Profile
            </a>

            ${currentUser && currentUser.role === 'admin' ? `
              <div class="pt-4 mt-4 border-t border-gray-200">
                <p class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Administration
                </p>
                <a href="#/admin" class="nav-link ${currentRoute === '/admin' ? 'nav-link-active' : ''} mt-2">
                  <span class="nav-icon">⚙️</span>
                  Admin Dashboard
                </a>
              </div>
            ` : ''}
          </nav>

          <!-- Quick Actions -->
          <div class="px-4 mt-6">
            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="text-sm font-medium text-gray-900 mb-3">Quick Actions</h3>
              <div class="space-y-2">
                <button onclick="quickSubmitIdea()" class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-white hover:shadow-sm rounded-md transition-all">
                  <span class="inline-block w-4 mr-2">⚡</span>
                  Quick Submit
                </button>
                <a href="#/ideas?status=UNDER_REVIEW" class="block px-3 py-2 text-sm text-gray-700 hover:bg-white hover:shadow-sm rounded-md transition-all">
                  <span class="inline-block w-4 mr-2">👀</span>
                  Review Queue
                </a>
                <a href="#/ideas?user=${currentUser ? currentUser.id : ''}" class="block px-3 py-2 text-sm text-gray-700 hover:bg-white hover:shadow-sm rounded-md transition-all">
                  <span class="inline-block w-4 mr-2">📝</span>
                  My Ideas
                </a>
              </div>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="px-4 mt-4">
            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="text-sm font-medium text-gray-900 mb-3">Recent Activity</h3>
              <div id="recentActivity" class="space-y-2 text-xs text-gray-600">
                <div class="animate-pulse">Loading...</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  `
}

function initializeSidebar() {
  // Load user stats
  loadUserStats()
  
  // Load recent activity
  loadRecentActivity()
  
  // Quick submit idea functionality
  window.quickSubmitIdea = () => {
    window.app.router.navigate('/ideas/new')
  }
  
  // Update stats periodically
  setInterval(loadUserStats, 30000) // Every 30 seconds
}

async function loadUserStats() {
  const currentUser = window.app.state.getState('user').currentUser
  if (!currentUser) return
  
  try {
    const [userStats, userRank] = await Promise.all([
      window.app.api.gamification.getUserStats(currentUser.id),
      window.app.api.gamification.getUserRank(currentUser.id)
    ])
    
    const userPointsElement = document.getElementById('userPoints')
    const userRankElement = document.getElementById('userRank')
    
    if (userPointsElement) {
      userPointsElement.textContent = userStats.totalPoints || 0
    }
    
    if (userRankElement) {
      userRankElement.textContent = userRank || '--'
    }
    
  } catch (error) {
    console.warn('Failed to load user stats:', error)
  }
}

async function loadRecentActivity() {
  const currentUser = window.app.state.getState('user').currentUser
  if (!currentUser) return
  
  const recentActivityElement = document.getElementById('recentActivity')
  if (!recentActivityElement) return
  
  try {
    // Get user's recent ideas and activity
    const [userIdeas, allIdeas] = await Promise.all([
      window.app.api.getIdeasByUser(currentUser.id),
      window.app.api.getAllIdeas()
    ])
    
    const recentUserIdeas = userIdeas
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3)
    
    const recentActivity = []
    
    // Add recent idea submissions
    recentUserIdeas.forEach(idea => {
      recentActivity.push({
        type: 'idea_submitted',
        message: `You submitted "${truncateText(idea.title, 30)}"`,
        timestamp: new Date(idea.createdAt),
        link: `#/ideas/${idea.id}`
      })
    })
    
    // Add recent ideas from others (for engagement)
    const othersIdeas = allIdeas
      .filter(idea => idea.submittedBy !== currentUser.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 2)
    
    othersIdeas.forEach(idea => {
      recentActivity.push({
        type: 'new_idea',
        message: `New idea: "${truncateText(idea.title, 30)}"`,
        timestamp: new Date(idea.createdAt),
        link: `#/ideas/${idea.id}`
      })
    })
    
    // Sort by timestamp
    recentActivity.sort((a, b) => b.timestamp - a.timestamp)
    
    if (recentActivity.length > 0) {
      recentActivityElement.innerHTML = recentActivity.slice(0, 5).map(activity => `
        <div class="flex items-start space-x-2">
          <span class="flex-shrink-0 mt-0.5">
            ${activity.type === 'idea_submitted' ? '📝' : 
              activity.type === 'new_idea' ? '💡' : '📊'}
          </span>
          <div class="flex-1 min-w-0">
            <p class="text-xs text-gray-600 truncate">
              ${activity.link ? `<a href="${activity.link}" class="hover:text-primary-600">${activity.message}</a>` : activity.message}
            </p>
            <p class="text-xs text-gray-400">${formatRelativeTime(activity.timestamp)}</p>
          </div>
        </div>
      `).join('')
    } else {
      recentActivityElement.innerHTML = `
        <div class="text-center py-2">
          <p class="text-xs text-gray-500">No recent activity</p>
          <a href="#/ideas/new" class="text-xs text-primary-600 hover:text-primary-500">Submit your first idea!</a>
        </div>
      `
    }
    
  } catch (error) {
    console.warn('Failed to load recent activity:', error)
    recentActivityElement.innerHTML = `
      <div class="text-center py-2">
        <p class="text-xs text-gray-500">Unable to load activity</p>
      </div>
    `
  }
}

function truncateText(text, maxLength = 30) {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

function formatRelativeTime(timestamp) {
  const now = new Date()
  const diffInMinutes = Math.floor((now - timestamp) / (1000 * 60))
  
  if (diffInMinutes < 1) {
    return 'Just now'
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`
  } else if (diffInMinutes < 1440) {
    return `${Math.floor(diffInMinutes / 60)}h ago`
  } else {
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }
}