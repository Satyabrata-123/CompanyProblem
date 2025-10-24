export default async function ProfilePage() {
  const currentUser = window.app.state.getState('user').currentUser
  
  if (!currentUser) {
    window.app.router.navigate('/login')
    return ''
  }

  // Load user data
  let userStats = {}
  let userBadges = []
  let userIdeas = []
  
  try {
    const [stats, badges, ideas] = await Promise.all([
      window.app.api.gamification.getUserStats(currentUser.id),
      window.app.api.gamification.getUserBadges(currentUser.id),
      window.app.api.getIdeasByUser(currentUser.id)
    ])
    
    userStats = stats
    userBadges = badges
    userIdeas = ideas
  } catch (error) {
    console.error('Failed to load profile data:', error)
  }

  // Initialize profile interactions after render
  setTimeout(() => {
    initializeProfilePage(currentUser, userStats, userBadges, userIdeas)
  }, 0)

  return `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <div class="bg-white shadow">
        <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
                  <span class="text-2xl font-semibold text-primary-600">
                    ${currentUser.fullName.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div class="ml-4">
                <h1 class="text-2xl font-bold text-gray-900">${currentUser.fullName}</h1>
                <p class="text-sm text-gray-500">${currentUser.department} • ${currentUser.role}</p>
              </div>
            </div>
            <div class="flex items-center space-x-4">
              <button class="btn-secondary" onclick="editProfile()">
                Edit Profile
              </button>
              <button class="btn-danger" onclick="logout()">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
          <!-- Stats Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="card">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-primary-100 rounded-md flex items-center justify-center">
                    <span class="text-lg">⭐</span>
                  </div>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Total Points</p>
                  <p class="text-2xl font-semibold text-gray-900">${userStats.totalPoints || 0}</p>
                </div>
              </div>
            </div>
            
            <div class="card">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                    <span class="text-lg">💡</span>
                  </div>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Ideas Submitted</p>
                  <p class="text-2xl font-semibold text-gray-900">${userStats.totalIdeas || 0}</p>
                </div>
              </div>
            </div>
            
            <div class="card">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                    <span class="text-lg">✅</span>
                  </div>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Implemented</p>
                  <p class="text-2xl font-semibold text-gray-900">${userStats.implementedIdeas || 0}</p>
                </div>
              </div>
            </div>
            
            <div class="card">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                    <span class="text-lg">🏆</span>
                  </div>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Rank</p>
                  <p class="text-2xl font-semibold text-gray-900">${userStats.rank ? `#${userStats.rank}` : '--'}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Badges Section -->
            <div class="lg:col-span-1">
              <div class="card">
                <h2 class="text-lg font-medium text-gray-900 mb-4">Badges & Achievements</h2>
                <div id="badgesContainer">
                  ${userBadges.length > 0 ? 
                    userBadges.map(badge => `
                      <div class="flex items-center p-3 bg-gray-50 rounded-lg mb-3">
                        <div class="flex-shrink-0">
                          <span class="text-2xl">${getBadgeIcon(badge.type)}</span>
                        </div>
                        <div class="ml-3">
                          <p class="text-sm font-medium text-gray-900">${badge.name}</p>
                          <p class="text-xs text-gray-500">${badge.description}</p>
                        </div>
                      </div>
                    `).join('') :
                    '<p class="text-gray-500 text-center py-8">No badges earned yet. Keep contributing!</p>'
                  }
                </div>
              </div>
            </div>

            <!-- Recent Ideas Section -->
            <div class="lg:col-span-2">
              <div class="card">
                <div class="flex items-center justify-between mb-4">
                  <h2 class="text-lg font-medium text-gray-900">My Ideas</h2>
                  <a href="#/ideas/new" class="btn-primary">
                    Submit New Idea
                  </a>
                </div>
                <div id="ideasContainer">
                  ${userIdeas.length > 0 ? 
                    userIdeas.slice(0, 5).map(idea => `
                      <div class="border-b border-gray-200 pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0">
                        <div class="flex items-start justify-between">
                          <div class="flex-1">
                            <h3 class="text-sm font-medium text-gray-900 mb-1">
                              <a href="#/ideas/${idea.id}" class="hover:text-primary-600 transition-colors">
                                ${idea.title}
                              </a>
                            </h3>
                            <p class="text-sm text-gray-600 mb-2">${truncateText(idea.description, 100)}</p>
                            <div class="flex items-center space-x-4 text-xs text-gray-500">
                              <span class="badge ${getStatusBadgeClass(idea.status)}">${idea.status}</span>
                              <span>👍 ${idea.voteCount || 0}</span>
                              <span>💬 ${idea.commentCount || 0}</span>
                              <span>${formatDate(idea.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    `).join('') :
                    '<p class="text-gray-500 text-center py-8">No ideas submitted yet. <a href="#/ideas/new" class="text-primary-600 hover:text-primary-500">Submit your first idea!</a></p>'
                  }
                </div>
                ${userIdeas.length > 5 ? `
                  <div class="mt-4 text-center">
                    <a href="#/ideas?user=${currentUser.id}" class="text-primary-600 hover:text-primary-500 text-sm font-medium">
                      View all ${userIdeas.length} ideas →
                    </a>
                  </div>
                ` : ''}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Profile Modal -->
    <div id="editProfileModal" class="modal fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full hidden">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Edit Profile</h3>
          <form id="editProfileForm" class="space-y-4">
            <div>
              <label for="editFullName" class="block text-sm font-medium text-gray-700">Full Name</label>
              <input 
                type="text" 
                id="editFullName" 
                name="fullName" 
                value="${currentUser.fullName}"
                class="input mt-1"
                required
              >
            </div>
            <div>
              <label for="editDepartment" class="block text-sm font-medium text-gray-700">Department</label>
              <select id="editDepartment" name="department" class="input mt-1" required>
                <option value="Engineering" ${currentUser.department === 'Engineering' ? 'selected' : ''}>Engineering</option>
                <option value="Product" ${currentUser.department === 'Product' ? 'selected' : ''}>Product</option>
                <option value="Design" ${currentUser.department === 'Design' ? 'selected' : ''}>Design</option>
                <option value="Marketing" ${currentUser.department === 'Marketing' ? 'selected' : ''}>Marketing</option>
                <option value="Sales" ${currentUser.department === 'Sales' ? 'selected' : ''}>Sales</option>
                <option value="HR" ${currentUser.department === 'HR' ? 'selected' : ''}>Human Resources</option>
                <option value="Finance" ${currentUser.department === 'Finance' ? 'selected' : ''}>Finance</option>
                <option value="Operations" ${currentUser.department === 'Operations' ? 'selected' : ''}>Operations</option>
                <option value="Legal" ${currentUser.department === 'Legal' ? 'selected' : ''}>Legal</option>
                <option value="Other" ${currentUser.department === 'Other' ? 'selected' : ''}>Other</option>
              </select>
            </div>
            <div class="flex items-center justify-end space-x-3 pt-4">
              <button type="button" data-modal-close class="btn-secondary">Cancel</button>
              <button type="submit" class="btn-primary">Save Changes</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
}

function initializeProfilePage(currentUser, userStats, userBadges, userIdeas) {
  // Initialize modal functionality
  window.editProfile = () => {
    const modal = document.getElementById('editProfileModal')
    if (modal) {
      modal.classList.remove('hidden')
      modal.classList.add('flex')
    }
  }

  window.logout = () => {
    if (confirm('Are you sure you want to logout?')) {
      window.app.api.users.logout()
    }
  }

  // Handle edit profile form
  const editForm = document.getElementById('editProfileForm')
  if (editForm) {
    editForm.addEventListener('submit', async (e) => {
      e.preventDefault()
      
      const formData = new FormData(editForm)
      const updates = {
        fullName: formData.get('fullName'),
        department: formData.get('department')
      }
      
      try {
        // Note: This would require a backend endpoint for updating user profiles
        // For now, we'll just update the local state
        const updatedUser = { ...currentUser, ...updates }
        window.app.state.setUser(updatedUser)
        
        window.app.state.addNotification({
          type: 'success',
          message: 'Profile updated successfully!'
        })
        
        // Close modal
        const modal = document.getElementById('editProfileModal')
        if (modal) {
          modal.classList.add('hidden')
          modal.classList.remove('flex')
        }
        
        // Refresh page
        window.app.router.handleRoute()
        
      } catch (error) {
        window.app.state.addNotification({
          type: 'error',
          message: 'Failed to update profile. Please try again.'
        })
      }
    })
  }

  // Initialize modal close functionality
  const modalCloses = document.querySelectorAll('[data-modal-close]')
  modalCloses.forEach(close => {
    close.addEventListener('click', () => {
      const modal = document.getElementById('editProfileModal')
      if (modal) {
        modal.classList.add('hidden')
        modal.classList.remove('flex')
      }
    })
  })
}

function getBadgeIcon(badgeType) {
  const badgeIcons = {
    'first-idea': '💡',
    'idea-machine': '⚡',
    'implementer': '✅',
    'innovation-leader': '👑',
    'century-club': '💯',
    'point-master': '🏆',
    'collaborator': '🤝',
    'mentor': '🎓',
    'trendsetter': '🔥'
  }
  
  return badgeIcons[badgeType] || '🏅'
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

function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}