import { Layout } from '../../components/layout/layout.js'

export default async function LeaderboardPage() {
  const currentUser = window.app.state.getState('user').currentUser

  if (!currentUser) {
    window.app.router.navigate('/login')
    return ''
  }

  // Load leaderboard data
  let leaderboard = []
  let userRank = null
  let userStats = {}

  try {
    const [leaderboardData, userRankData, userStatsData] = await Promise.all([
      window.app.api.gamification.getLeaderboard(50),
      window.app.api.gamification.getUserRank(currentUser.id),
      window.app.api.gamification.getUserStats(currentUser.id)
    ])

    leaderboard = leaderboardData || []
    userRank = userRankData
    userStats = userStatsData || {}

  } catch (error) {
    console.error('Failed to load leaderboard:', error)
  }

  // Initialize page interactions after render
  setTimeout(() => {
    initializeLeaderboardPage(leaderboard, userRank, userStats, currentUser)
  }, 0)

  const content = `
    <div class="max-w-6xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">🏆 Leaderboard</h1>
          <p class="text-xl text-gray-600">
            Celebrating our top innovators and contributors
          </p>
        </div>

        <!-- User's Current Position -->
        <div class="bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg p-6 mb-8">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center mr-4">
                <span class="text-xl font-bold text-primary-600">
                  ${currentUser.fullName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h2 class="text-xl font-semibold text-gray-900">${currentUser.fullName}</h2>
                <p class="text-gray-600">${currentUser.department} • ${currentUser.role}</p>
              </div>
            </div>
            <div class="text-right">
              <div class="text-3xl font-bold text-primary-600">
                ${userRank ? `#${userRank}` : '--'}
              </div>
              <div class="text-sm text-gray-600">Your Rank</div>
            </div>
            <div class="text-right">
              <div class="text-3xl font-bold text-primary-600">
                ${userStats.totalPoints || 0}
              </div>
              <div class="text-sm text-gray-600">Total Points</div>
            </div>
          </div>
        </div>

        <!-- Filter Tabs -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div class="border-b border-gray-200">
            <nav class="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              <button 
                onclick="switchTab('all')" 
                class="tab-button active border-primary-500 text-primary-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
                id="tab-all"
              >
                All Time
              </button>
              <button 
                onclick="switchTab('month')" 
                class="tab-button border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
                id="tab-month"
              >
                This Month
              </button>
              <button 
                onclick="switchTab('department')" 
                class="tab-button border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
                id="tab-department"
              >
                My Department
              </button>
            </nav>
          </div>
        </div>

        <!-- Top 3 Podium -->
        ${leaderboard.length >= 3 ? `
          <div class="grid grid-cols-3 gap-4 mb-8">
            <!-- 2nd Place -->
            <div class="text-center">
              <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 transform hover:scale-105 transition-transform">
                <div class="relative">
                  <div class="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <span class="text-2xl font-bold text-gray-600">
                      ${leaderboard[1]?.fullName?.charAt(0).toUpperCase() || '2'}
                    </span>
                  </div>
                  <div class="absolute -top-2 -right-2 bg-gray-400 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                </div>
                <h3 class="font-semibold text-gray-900 mb-1">${leaderboard[1]?.fullName || 'TBD'}</h3>
                <p class="text-sm text-gray-500 mb-2">${leaderboard[1]?.department || ''}</p>
                <p class="text-lg font-bold text-gray-600">${leaderboard[1]?.totalPoints || 0} pts</p>
              </div>
            </div>

            <!-- 1st Place -->
            <div class="text-center">
              <div class="bg-white rounded-lg shadow-lg border-2 border-yellow-300 p-6 transform hover:scale-105 transition-transform">
                <div class="relative">
                  <div class="h-24 w-24 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
                    <span class="text-3xl font-bold text-yellow-600">
                      ${leaderboard[0]?.fullName?.charAt(0).toUpperCase() || '1'}
                    </span>
                  </div>
                  <div class="absolute -top-2 -right-2 bg-yellow-500 text-white rounded-full w-10 h-10 flex items-center justify-center text-lg font-bold">
                    👑
                  </div>
                </div>
                <h3 class="font-semibold text-gray-900 mb-1">${leaderboard[0]?.fullName || 'TBD'}</h3>
                <p class="text-sm text-gray-500 mb-2">${leaderboard[0]?.department || ''}</p>
                <p class="text-xl font-bold text-yellow-600">${leaderboard[0]?.totalPoints || 0} pts</p>
              </div>
            </div>

            <!-- 3rd Place -->
            <div class="text-center">
              <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 transform hover:scale-105 transition-transform">
                <div class="relative">
                  <div class="h-20 w-20 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
                    <span class="text-2xl font-bold text-orange-600">
                      ${leaderboard[2]?.fullName?.charAt(0).toUpperCase() || '3'}
                    </span>
                  </div>
                  <div class="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                </div>
                <h3 class="font-semibold text-gray-900 mb-1">${leaderboard[2]?.fullName || 'TBD'}</h3>
                <p class="text-sm text-gray-500 mb-2">${leaderboard[2]?.department || ''}</p>
                <p class="text-lg font-bold text-orange-600">${leaderboard[2]?.totalPoints || 0} pts</p>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- Full Leaderboard Table -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-medium text-gray-900">Full Rankings</h2>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Points
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ideas
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Implemented
                  </th>
                </tr>
              </thead>
              <tbody id="leaderboardTable" class="bg-white divide-y divide-gray-200">
                ${leaderboard.length > 0 ?
      leaderboard.map((user, index) => createLeaderboardRow(user, index + 1, currentUser)).join('') :
      `<tr><td colspan="6" class="px-6 py-8 text-center text-gray-500">No data available</td></tr>`
    }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Achievement Stats -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                  💡
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Total Ideas Submitted</p>
                <p class="text-2xl font-semibold text-gray-900">
                  ${leaderboard.reduce((sum, user) => sum + (user.ideasSubmitted || 0), 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                  ✅
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Ideas Implemented</p>
                <p class="text-2xl font-semibold text-gray-900">
                  ${leaderboard.reduce((sum, user) => sum + (user.ideasImplemented || 0), 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                  👥
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Active Contributors</p>
                <p class="text-2xl font-semibold text-gray-900">${leaderboard.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `

  return Layout(content)
}

function createLeaderboardRow(user, rank, currentUser) {
  const isCurrentUser = user.id === currentUser.id
  const rankIcon = rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : `#${rank}`

  return `
    <tr class="${isCurrentUser ? 'bg-primary-50' : 'hover:bg-gray-50'}">
      <td class="px-6 py-4 whitespace-nowrap">
        <div class="flex items-center">
          <span class="text-lg font-medium ${rank <= 3 ? 'text-2xl' : 'text-gray-900'}">
            ${rankIcon}
          </span>
        </div>
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
        <div class="flex items-center">
          <div class="flex-shrink-0 h-10 w-10">
            <div class="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
              <span class="text-sm font-medium text-gray-600">
                ${user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
              </span>
            </div>
          </div>
          <div class="ml-4">
            <div class="text-sm font-medium text-gray-900">
              ${isCurrentUser ? 'You' : user.fullName}
              ${isCurrentUser ? '<span class="ml-2 text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full">You</span>' : ''}
            </div>
            <div class="text-sm text-gray-500">${user.email}</div>
          </div>
        </div>
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          ${user.department}
        </span>
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
        <div class="text-sm font-medium text-gray-900">${user.totalPoints || 0}</div>
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
        <div class="text-sm text-gray-900">${user.ideasSubmitted || 0}</div>
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
        <div class="text-sm text-gray-900">${user.ideasImplemented || 0}</div>
      </td>
    </tr>
  `
}

function initializeLeaderboardPage(leaderboard, userRank, userStats, currentUser) {
  let currentTab = 'all'
  let filteredLeaderboard = leaderboard

  // Tab switching
  window.switchTab = (tab) => {
    currentTab = tab

    // Update tab appearance
    document.querySelectorAll('.tab-button').forEach(btn => {
      btn.classList.remove('active', 'border-primary-500', 'text-primary-600')
      btn.classList.add('border-transparent', 'text-gray-500')
    })

    const activeTab = document.getElementById(`tab-${tab}`)
    if (activeTab) {
      activeTab.classList.add('active', 'border-primary-500', 'text-primary-600')
      activeTab.classList.remove('border-transparent', 'text-gray-500')
    }

    // Filter leaderboard based on tab
    switch (tab) {
      case 'month':
        // For demo purposes, show same data
        // In real implementation, this would filter by recent activity
        filteredLeaderboard = leaderboard
        break
      case 'department':
        filteredLeaderboard = leaderboard.filter(user => user.department === currentUser.department)
        break
      case 'all':
      default:
        filteredLeaderboard = leaderboard
        break
    }

    updateLeaderboardTable()
  }

  function updateLeaderboardTable() {
    const tableBody = document.getElementById('leaderboardTable')
    if (tableBody) {
      if (filteredLeaderboard.length > 0) {
        tableBody.innerHTML = filteredLeaderboard
          .map((user, index) => createLeaderboardRow(user, index + 1, currentUser))
          .join('')
      } else {
        tableBody.innerHTML = `
          <tr>
            <td colspan="6" class="px-6 py-8 text-center text-gray-500">
              No users found for the selected filter
            </td>
          </tr>
        `
      }
    }
  }

  // Refresh data periodically
  setInterval(async () => {
    try {
      const newLeaderboard = await window.app.api.gamification.getLeaderboard(50)
      if (newLeaderboard && newLeaderboard.length > 0) {
        filteredLeaderboard = newLeaderboard
        updateLeaderboardTable()
      }
    } catch (error) {
      console.warn('Failed to refresh leaderboard:', error)
    }
  }, 60000) // Every minute
}