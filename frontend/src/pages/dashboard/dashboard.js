import { Layout } from '../../components/layout/layout.js'

export default async function DashboardPage() {
  const currentUser = window.app.state.getState('user').currentUser
  
  if (!currentUser) {
    window.app.router.navigate('/login')
    return ''
  }

  // Load dashboard data
  let dashboardStats = {
    totalIdeas: 0,
    userPoints: 0,
    userRank: '--',
    implementedIdeas: 0,
    totalChallenges: 0,
    activeChallenges: 0
  }
  
  let recentIdeas = []
  let topIdeas = []
  let recentChallenges = []
  
  try {
    const [allIdeas, userStats, userRank, topIdeasData, allChallenges] = await Promise.all([
      window.app.api.getAllIdeas(),
      window.app.api.gamification.getUserStats(currentUser.id),
      window.app.api.gamification.getUserRank(currentUser.id),
      window.app.api.getTopIdeas(),
      window.app.api.getAllChallenges().catch(() => []) // Gracefully handle if challenges service is down
    ])
    
    dashboardStats = {
      totalIdeas: allIdeas.length,
      userPoints: userStats.totalPoints || 0,
      userRank: userRank || '--',
      implementedIdeas: userStats.implementedIdeas || 0,
      totalChallenges: allChallenges.length,
      activeChallenges: allChallenges.filter(c => c.isActive).length
    }
    
    recentIdeas = allIdeas
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      
    topIdeas = topIdeasData.slice(0, 5)
    
    recentChallenges = allChallenges
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3)
    
  } catch (error) {
    console.error('Failed to load dashboard data:', error)
  }

  // Initialize dashboard interactions after render
  setTimeout(() => {
    initializeDashboard(dashboardStats, recentIdeas, topIdeas, recentChallenges)
  }, 0)

  const content = `
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <!-- Welcome Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">
            Welcome back, ${currentUser.fullName.split(' ')[0]}! 👋
          </h1>
          <p class="mt-2 text-gray-600">
            Here's what's happening in the innovation community
          </p>
          
          <!-- 3D Guide Button -->
          <div class="mt-4">
            <button id="open3DGuide" class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl">
              <span class="mr-2">🌟</span>
              Interactive 3D Platform Guide
              <span class="ml-2">🚀</span>
            </button>
          </div>
        </div>
        
        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <div class="card hover:shadow-md transition-shadow">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-primary-100 rounded-md flex items-center justify-center">
                  💡
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Total Ideas</p>
                <p class="text-2xl font-semibold text-gray-900" id="totalIdeas">${dashboardStats.totalIdeas}</p>
              </div>
            </div>
          </div>
          
          <div class="card hover:shadow-md transition-shadow">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-success-100 rounded-md flex items-center justify-center">
                  ⭐
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Your Points</p>
                <p class="text-2xl font-semibold text-gray-900" id="userPoints">${dashboardStats.userPoints}</p>
              </div>
            </div>
          </div>
          
          <div class="card hover:shadow-md transition-shadow">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-warning-100 rounded-md flex items-center justify-center">
                  🏆
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Your Rank</p>
                <p class="text-2xl font-semibold text-gray-900" id="userRank">#${dashboardStats.userRank}</p>
              </div>
            </div>
          </div>
          
          <div class="card hover:shadow-md transition-shadow">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                  🎯
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Implemented</p>
                <p class="text-2xl font-semibold text-gray-900" id="implementedIdeas">${dashboardStats.implementedIdeas}</p>
              </div>
            </div>
          </div>
          
          <div class="card hover:shadow-md transition-shadow">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                  🏢
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Total Challenges</p>
                <p class="text-2xl font-semibold text-gray-900" id="totalChallenges">${dashboardStats.totalChallenges}</p>
              </div>
            </div>
          </div>
          
          <div class="card hover:shadow-md transition-shadow">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                  🚀
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Active Challenges</p>
                <p class="text-2xl font-semibold text-gray-900" id="activeChallenges">${dashboardStats.activeChallenges}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Recent Ideas -->
          <div class="lg:col-span-2">
            <div class="card">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-medium text-gray-900">Recent Ideas</h2>
                <a href="#/ideas" class="text-sm text-primary-600 hover:text-primary-500 font-medium">
                  View all →
                </a>
              </div>
              <div id="recentIdeasContainer">
                ${recentIdeas.length > 0 ? 
                  recentIdeas.map(idea => `
                    <div class="border-b border-gray-200 pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0">
                      <div class="flex items-start justify-between">
                        <div class="flex-1">
                          <h3 class="text-sm font-medium text-gray-900 mb-1">
                            <a href="#/ideas/${idea.id}" class="hover:text-primary-600 transition-colors">
                              ${idea.title}
                            </a>
                          </h3>
                          <p class="text-sm text-gray-600 mb-2">${truncateText(idea.description, 120)}</p>
                          <div class="flex items-center space-x-4 text-xs text-gray-500">
                            <span class="badge ${getStatusBadgeClass(idea.status)}">${idea.status}</span>
                            <span>👍 ${idea.voteCount || 0}</span>
                            <span>💬 ${idea.commentCount || 0}</span>
                            <span>by ${idea.submitterName}</span>
                            <span>${formatRelativeTime(idea.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  `).join('') :
                  '<p class="text-gray-500 text-center py-8">No ideas yet. <a href="#/ideas/new" class="text-primary-600 hover:text-primary-500">Be the first to submit one!</a></p>'
                }
              </div>
            </div>
          </div>

          <!-- Quick Actions & Top Ideas -->
          <div class="space-y-6">
            <!-- Quick Actions -->
            <div class="card">
              <h2 class="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
              <div class="space-y-3">
                <a href="#/ideas/new" class="btn-primary w-full flex items-center justify-center">
                  <span class="mr-2">➕</span>
                  Submit New Idea
                </a>
                <a href="#/ideas" class="btn-secondary w-full flex items-center justify-center">
                  <span class="mr-2">🔍</span>
                  Browse Ideas
                </a>
                <a href="#/challenges" class="btn-secondary w-full flex items-center justify-center">
                  <span class="mr-2">🎯</span>
                  Browse Challenges
                </a>
                <a href="#/company/dashboard" class="btn-success w-full flex items-center justify-center">
                  <span class="mr-2">🏢</span>
                  Company Dashboard
                </a>
                <a href="#/leaderboard" class="btn-ghost w-full flex items-center justify-center">
                  <span class="mr-2">🏆</span>
                  View Leaderboard
                </a>
              </div>
            </div>

            <!-- Recent Challenges -->
            <div class="card">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-medium text-gray-900">Recent Challenges</h2>
                <a href="#/challenges" class="text-sm text-primary-600 hover:text-primary-500 font-medium">
                  View all →
                </a>
              </div>
              <div class="space-y-3">
                ${recentChallenges.length > 0 ? 
                  recentChallenges.map(challenge => `
                    <div class="border-b border-gray-200 pb-3 last:border-b-0 last:pb-0">
                      <div class="flex items-start justify-between">
                        <div class="flex-1 min-w-0">
                          <p class="text-sm font-medium text-gray-900 truncate">
                            <a href="#/challenges/${challenge.id}" class="hover:text-primary-600">
                              ${challenge.title}
                            </a>
                          </p>
                          <div class="flex items-center space-x-2 mt-1">
                            <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              challenge.difficulty === 'BEGINNER' ? 'bg-green-100 text-green-800' :
                              challenge.difficulty === 'INTERMEDIATE' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }">
                              ${challenge.difficulty}
                            </span>
                            ${challenge.rewardAmount ? `<span class="text-xs text-green-600 font-medium">$${challenge.rewardAmount}</span>` : ''}
                          </div>
                          <p class="text-xs text-gray-500 mt-1">
                            by ${challenge.companyName} • ${challenge.currentSubmissions || 0} submissions
                          </p>
                        </div>
                      </div>
                    </div>
                  `).join('') :
                  '<p class="text-gray-500 text-sm text-center py-4">No challenges yet. <a href="#/company/dashboard" class="text-primary-600 hover:text-primary-500">Create one as a company!</a></p>'
                }
              </div>
            </div>

            <!-- Top Ideas -->
            <div class="card">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-medium text-gray-900">Top Ideas</h2>
                <a href="#/ideas?sort=votes" class="text-sm text-primary-600 hover:text-primary-500 font-medium">
                  View all →
                </a>
              </div>
              <div class="space-y-3">
                ${topIdeas.length > 0 ? 
                  topIdeas.map((idea, index) => `
                    <div class="flex items-start space-x-3">
                      <div class="flex-shrink-0">
                        <span class="inline-flex items-center justify-center h-6 w-6 rounded-full ${
                          index === 0 ? 'bg-yellow-100 text-yellow-800' :
                          index === 1 ? 'bg-gray-100 text-gray-800' :
                          index === 2 ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        } text-xs font-medium">
                          ${index + 1}
                        </span>
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-gray-900 truncate">
                          <a href="#/ideas/${idea.id}" class="hover:text-primary-600">
                            ${idea.title}
                          </a>
                        </p>
                        <p class="text-xs text-gray-500">
                          👍 ${idea.voteCount || 0} votes • by ${idea.submitterName}
                        </p>
                      </div>
                    </div>
                  `).join('') :
                  '<p class="text-gray-500 text-sm text-center py-4">No top ideas yet</p>'
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `

  return Layout(content)
}

function initializeDashboard(dashboardStats, recentIdeas, topIdeas, recentChallenges) {
  // Setup 3D Guide button
  const guideButton = document.getElementById('open3DGuide')
  if (guideButton) {
    guideButton.addEventListener('click', () => {
      window.app.router.navigate('/3d-guide')
    })
  }

  // Refresh stats periodically
  setInterval(async () => {
    try {
      const currentUser = window.app.state.getState('user').currentUser
      if (!currentUser) return
      
      const [userStats, userRank] = await Promise.all([
        window.app.api.gamification.getUserStats(currentUser.id),
        window.app.api.gamification.getUserRank(currentUser.id)
      ])
      
      // Update displayed stats
      const userPointsElement = document.getElementById('userPoints')
      const userRankElement = document.getElementById('userRank')
      const implementedIdeasElement = document.getElementById('implementedIdeas')
      
      if (userPointsElement) {
        userPointsElement.textContent = userStats.totalPoints || 0
      }
      
      if (userRankElement) {
        userRankElement.textContent = userRank ? `#${userRank}` : '--'
      }
      
      if (implementedIdeasElement) {
        implementedIdeasElement.textContent = userStats.implementedIdeas || 0
      }
      
    } catch (error) {
      console.warn('Failed to refresh dashboard stats:', error)
    }
  }, 60000) // Every minute
}

function truncateText(text, maxLength = 120) {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

function getStatusBadgeClass(status) {
  const statusClasses = {
    'SUBMITTED': 'badge-primary',
    'UNDER_REVIEW': 'badge-warning',
    'APPROVED': 'badge-success',
    'IN_DEVELOPMENT': 'badge-primary',
    'IMPLEMENTED': 'badge-success',
    'REJECTED': 'badge-danger'
  }
  
  return statusClasses[status] || 'badge-primary'
}

function formatRelativeTime(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMinutes = Math.floor((now - date) / (1000 * 60))
  
  if (diffInMinutes < 1) {
    return 'just now'
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`
  } else if (diffInMinutes < 1440) {
    return `${Math.floor(diffInMinutes / 60)}h ago`
  } else {
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }
}