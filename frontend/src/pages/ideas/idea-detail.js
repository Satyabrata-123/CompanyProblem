import { Layout } from '../../components/layout/layout.js'

export default async function IdeaDetailPage(params) {
  const currentUser = window.app.state.getState('user').currentUser

  if (!currentUser) {
    window.app.router.navigate('/login')
    return ''
  }

  const ideaId = params.id

  // Load idea data
  let idea = null
  let comments = []
  let votes = []
  let userVote = null
  let isOwner = false

  try {
    // Load idea details and engagement data
    const [ideaData, commentsData, votesData, userVoteData] = await Promise.all([
      window.app.api.getIdeaById(ideaId),
      window.app.api.getCommentsForIdea(ideaId),
      window.app.api.getVotesForIdea(ideaId),
      window.app.api.getUserVoteForIdea(ideaId, currentUser.id).catch(() => null)
    ])

    idea = ideaData
    comments = commentsData || []
    votes = votesData || []
    userVote = userVoteData
    isOwner = idea.submittedBy === currentUser.id

    // Update state
    window.app.state.setCurrentIdea(idea)
    if (userVote) {
      window.app.state.setUserVote(ideaId, userVote.voteType)
    }

  } catch (error) {
    console.error('Failed to load idea:', error)
    return Layout(`
      <div class="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0 text-center">
          <div class="text-6xl mb-4">❌</div>
          <h1 class="text-2xl font-bold text-gray-900 mb-4">Idea Not Found</h1>
          <p class="text-gray-600 mb-6">The idea you're looking for doesn't exist or has been removed.</p>
          <a href="#/ideas" class="btn-primary">← Back to Ideas</a>
        </div>
      </div>
    `)
  }

  // Initialize page interactions after render
  setTimeout(() => {
    initializeIdeaDetailPage(idea, comments, votes, userVote, isOwner, currentUser)
  }, 0)

  const voteCount = votes.reduce((sum, vote) => sum + vote.voteType, 0)
  const upvotes = votes.filter(vote => vote.voteType === 1).length
  const downvotes = votes.filter(vote => vote.voteType === -1).length

  const content = `
    <div class="max-w-6xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <!-- Breadcrumb -->
        <nav class="flex mb-6" aria-label="Breadcrumb">
          <ol class="flex items-center space-x-4">
            <li>
              <a href="#/ideas" class="text-gray-500 hover:text-gray-700">Ideas</a>
            </li>
            <li>
              <svg class="flex-shrink-0 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
              </svg>
            </li>
            <li>
              <span class="text-gray-900 font-medium truncate">${truncateText(idea.title, 50)}</span>
            </li>
          </ol>
        </nav>

        <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <!-- Main Content -->
          <div class="lg:col-span-3">
            <!-- Idea Header -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div class="flex items-start justify-between mb-4">
                <div class="flex-1">
                  <h1 class="text-3xl font-bold text-gray-900 mb-3">${idea.title}</h1>
                  <div class="flex items-center space-x-4 text-sm text-gray-500">
                    <span class="flex items-center">
                      <div class="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center mr-2">
                        <span class="text-sm font-medium text-primary-600">
                          ${idea.submitterName ? idea.submitterName.charAt(0).toUpperCase() : 'U'}
                        </span>
                      </div>
                      by ${isOwner ? 'You' : idea.submitterName}
                    </span>
                    <span>•</span>
                    <span>${formatDateTime(idea.createdAt)}</span>
                    ${idea.updatedAt !== idea.createdAt ? `
                      <span>•</span>
                      <span>Updated ${formatRelativeTime(idea.updatedAt)}</span>
                    ` : ''}
                  </div>
                </div>
                
                <!-- Status Badge -->
                <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(idea.status)}">
                  ${idea.status.replace('_', ' ')}
                </span>
              </div>

              <!-- Tags and Category -->
              <div class="flex flex-wrap gap-2 mb-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                  ${idea.category || 'General'}
                </span>
                ${(idea.tags || []).map(tag => `
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    ${tag}
                  </span>
                `).join('')}
              </div>

              <!-- AI Score -->
              ${idea.aiScore ? `
                <div class="flex items-center mb-4 p-3 bg-blue-50 rounded-lg">
                  <span class="text-blue-600 mr-2">🤖</span>
                  <span class="text-sm text-blue-800 mr-3">AI Quality Score:</span>
                  <div class="flex-1 bg-blue-200 rounded-full h-2">
                    <div class="bg-blue-600 h-2 rounded-full" style="width: ${idea.aiScore}%"></div>
                  </div>
                  <span class="text-sm font-medium text-blue-800 ml-3">${Math.round(idea.aiScore)}/100</span>
                </div>
              ` : ''}

              <!-- Description -->
              <div class="prose max-w-none">
                <p class="text-gray-700 whitespace-pre-wrap leading-relaxed">${idea.description}</p>
              </div>
            </div>

            <!-- Status Timeline -->
            ${idea.status !== 'SUBMITTED' ? `
              <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <h2 class="text-lg font-medium text-gray-900 mb-4">Progress Timeline</h2>
                <div class="flow-root">
                  <ul class="-mb-8">
                    ${generateStatusTimeline(idea.status).map((step, index, array) => `
                      <li>
                        <div class="relative pb-8 ${index === array.length - 1 ? 'pb-0' : ''}">
                          ${index !== array.length - 1 ? '<span class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"></span>' : ''}
                          <div class="relative flex space-x-3">
                            <div>
                              <span class="h-8 w-8 rounded-full ${step.completed ? 'bg-green-500' : step.current ? 'bg-blue-500' : 'bg-gray-300'} flex items-center justify-center ring-8 ring-white">
                                <span class="text-white text-sm">${step.completed ? '✓' : step.current ? '●' : '○'}</span>
                              </span>
                            </div>
                            <div class="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                              <div>
                                <p class="text-sm text-gray-900 font-medium">${step.title}</p>
                                <p class="text-sm text-gray-500">${step.description}</p>
                              </div>
                              ${step.completed ? `
                                <div class="text-right text-sm whitespace-nowrap text-gray-500">
                                  <time>${formatRelativeTime(idea.updatedAt)}</time>
                                </div>
                              ` : ''}
                            </div>
                          </div>
                        </div>
                      </li>
                    `).join('')}
                  </ul>
                </div>
              </div>
            ` : ''}

            <!-- Comments Section -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-lg font-medium text-gray-900">
                  Discussion (${comments.length})
                </h2>
              </div>

              <!-- Add Comment Form -->
              <form id="commentForm" class="mb-6" data-idea-id="${ideaId}">
                <div class="flex space-x-3">
                  <div class="flex-shrink-0">
                    <div class="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <span class="text-sm font-medium text-primary-600">
                        ${currentUser.fullName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div class="flex-1">
                    <textarea
                      id="commentContent"
                      name="content"
                      rows="3"
                      class="input resize-none"
                      placeholder="Share your thoughts on this idea..."
                      maxlength="500"
                      required
                    ></textarea>
                    <div class="flex items-center justify-between mt-2">
                      <span class="text-sm text-gray-500">
                        <span id="commentCount">0</span>/500 characters
                      </span>
                      <button type="submit" class="btn-primary" id="commentSubmitBtn">
                        Post Comment
                      </button>
                    </div>
                  </div>
                </div>
              </form>

              <!-- Comments List -->
              <div id="commentsList" class="space-y-4">
                ${comments.length > 0 ?
      comments.map(comment => createCommentElement(comment, currentUser)).join('') :
      '<p class="text-gray-500 text-center py-8">No comments yet. Be the first to share your thoughts!</p>'
    }
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="lg:col-span-1">
            <!-- Voting Panel -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Community Feedback</h3>
              
              <!-- Vote Buttons -->
              <div class="flex items-center justify-center space-x-4 mb-4">
                <button 
                  onclick="vote(1)" 
                  class="flex flex-col items-center p-3 rounded-lg transition-colors ${userVote?.voteType === 1 ? 'bg-green-100 text-green-700' : 'hover:bg-gray-50'} ${isOwner ? 'opacity-50 cursor-not-allowed' : ''}"
                  ${isOwner ? 'disabled' : ''}
                  title="${isOwner ? 'Cannot vote on your own idea' : 'Upvote this idea'}"
                >
                  <svg class="h-6 w-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12"></path>
                  </svg>
                  <span class="text-sm font-medium">${upvotes}</span>
                </button>
                
                <div class="text-center">
                  <div class="text-2xl font-bold text-gray-900">${voteCount}</div>
                  <div class="text-sm text-gray-500">net votes</div>
                </div>
                
                <button 
                  onclick="vote(-1)" 
                  class="flex flex-col items-center p-3 rounded-lg transition-colors ${userVote?.voteType === -1 ? 'bg-red-100 text-red-700' : 'hover:bg-gray-50'} ${isOwner ? 'opacity-50 cursor-not-allowed' : ''}"
                  ${isOwner ? 'disabled' : ''}
                  title="${isOwner ? 'Cannot vote on your own idea' : 'Downvote this idea'}"
                >
                  <svg class="h-6 w-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 13l-5 5m0 0l-5-5m5 5V6"></path>
                  </svg>
                  <span class="text-sm font-medium">${downvotes}</span>
                </button>
              </div>

              <!-- Vote Stats -->
              <div class="text-center text-sm text-gray-500">
                ${votes.length} total vote${votes.length !== 1 ? 's' : ''}
                ${votes.length > 0 ? `• ${Math.round((upvotes / votes.length) * 100)}% positive` : ''}
              </div>
            </div>

            <!-- Admin Actions -->
            ${currentUser.role === 'admin' && !isOwner ? `
              <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Admin Actions</h3>
                <div class="space-y-3">
                  <select id="statusSelect" class="input">
                    <option value="SUBMITTED" ${idea.status === 'SUBMITTED' ? 'selected' : ''}>Submitted</option>
                    <option value="UNDER_REVIEW" ${idea.status === 'UNDER_REVIEW' ? 'selected' : ''}>Under Review</option>
                    <option value="APPROVED" ${idea.status === 'APPROVED' ? 'selected' : ''}>Approved</option>
                    <option value="IN_DEVELOPMENT" ${idea.status === 'IN_DEVELOPMENT' ? 'selected' : ''}>In Development</option>
                    <option value="IMPLEMENTED" ${idea.status === 'IMPLEMENTED' ? 'selected' : ''}>Implemented</option>
                    <option value="REJECTED" ${idea.status === 'REJECTED' ? 'selected' : ''}>Rejected</option>
                  </select>
                  <button onclick="updateStatus()" class="btn-primary w-full">
                    Update Status
                  </button>
                </div>
              </div>
            ` : ''}

            <!-- Share -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Share This Idea</h3>
              <div class="space-y-3">
                <button onclick="copyLink()" class="btn-secondary w-full">
                  <span class="mr-2">🔗</span>
                  Copy Link
                </button>
                <button onclick="shareIdea()" class="btn-secondary w-full">
                  <span class="mr-2">📤</span>
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `

  return Layout(content)
}

function initializeIdeaDetailPage(idea, comments, votes, userVote, isOwner, currentUser) {
  const commentForm = document.getElementById('commentForm')
  const commentContent = document.getElementById('commentContent')
  const commentCount = document.getElementById('commentCount')
  const commentSubmitBtn = document.getElementById('commentSubmitBtn')

  // Character counter for comments
  if (commentContent && commentCount) {
    commentContent.addEventListener('input', () => {
      commentCount.textContent = commentContent.value.length
    })
  }

  // Comment form submission
  if (commentForm) {
    commentForm.addEventListener('submit', async (e) => {
      e.preventDefault()
      await submitComment()
    })
  }

  // Global functions
  window.vote = async (voteType) => {
    if (isOwner) {
      window.app.state.addNotification({
        type: 'warning',
        message: 'You cannot vote on your own idea'
      })
      return
    }

    try {
      const currentVote = window.app.state.getUserVote(idea.id)

      if (currentVote === voteType) {
        // Remove vote if clicking same vote type
        await window.app.api.voting.removeVote(idea.id, currentUser.id)
      } else {
        // Cast new vote
        await window.app.api.voting.castVote(idea.id, voteType, currentUser.id)
      }

      // Refresh the page to show updated votes
      window.app.router.handleRoute()

    } catch (error) {
      console.error('Voting failed:', error)
      window.app.state.addNotification({
        type: 'error',
        message: 'Failed to register vote. Please try again.'
      })
    }
  }

  window.updateStatus = async () => {
    const statusSelect = document.getElementById('statusSelect')
    const newStatus = statusSelect.value

    if (newStatus === idea.status) return

    try {
      await window.app.api.updateIdeaStatus(idea.id, newStatus)

      window.app.state.addNotification({
        type: 'success',
        message: `Idea status updated to ${newStatus.replace('_', ' ')}`
      })

      // Refresh the page
      window.app.router.handleRoute()

    } catch (error) {
      console.error('Status update failed:', error)
      window.app.state.addNotification({
        type: 'error',
        message: 'Failed to update status. Please try again.'
      })
    }
  }

  window.copyLink = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url).then(() => {
      window.app.state.addNotification({
        type: 'success',
        message: 'Link copied to clipboard!'
      })
    }).catch(() => {
      window.app.state.addNotification({
        type: 'error',
        message: 'Failed to copy link'
      })
    })
  }

  window.shareIdea = () => {
    if (navigator.share) {
      navigator.share({
        title: idea.title,
        text: truncateText(idea.description, 100),
        url: window.location.href
      })
    } else {
      window.copyLink()
    }
  }

  async function submitComment() {
    const content = commentContent.value.trim()

    if (!content) {
      window.app.state.addNotification({
        type: 'warning',
        message: 'Please enter a comment'
      })
      return
    }

    if (content.length > 500) {
      window.app.state.addNotification({
        type: 'warning',
        message: 'Comment is too long (max 500 characters)'
      })
      return
    }

    // Set loading state
    commentSubmitBtn.disabled = true
    commentSubmitBtn.textContent = 'Posting...'

    try {
      await window.app.api.voting.addComment(idea.id, content, currentUser.id, currentUser.fullName)

      // Clear form
      commentContent.value = ''
      commentCount.textContent = '0'

      window.app.state.addNotification({
        type: 'success',
        message: 'Comment posted successfully! You earned 2 points.'
      })

      // Refresh the page to show new comment
      window.app.router.handleRoute()

    } catch (error) {
      console.error('Comment submission failed:', error)
      window.app.state.addNotification({
        type: 'error',
        message: 'Failed to post comment. Please try again.'
      })
    } finally {
      commentSubmitBtn.disabled = false
      commentSubmitBtn.textContent = 'Post Comment'
    }
  }
}

function createCommentElement(comment, currentUser) {
  const isOwner = comment.userId === currentUser.id
  const timeAgo = formatRelativeTime(comment.createdAt)

  return `
    <div class="flex space-x-3">
      <div class="flex-shrink-0">
        <div class="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
          <span class="text-sm font-medium text-gray-600">
            ${comment.userName ? comment.userName.charAt(0).toUpperCase() : 'U'}
          </span>
        </div>
      </div>
      <div class="flex-1">
        <div class="flex items-center space-x-2">
          <span class="text-sm font-medium text-gray-900">
            ${isOwner ? 'You' : comment.userName}
          </span>
          <span class="text-sm text-gray-500">${timeAgo}</span>
          ${isOwner ? `
            <button onclick="deleteComment('${comment.id}')" class="text-red-400 hover:text-red-600 text-sm">
              Delete
            </button>
          ` : ''}
        </div>
        <p class="text-sm text-gray-700 mt-1 whitespace-pre-wrap">${comment.content}</p>
      </div>
    </div>
  `
}

function generateStatusTimeline(currentStatus) {
  const statuses = [
    { key: 'SUBMITTED', title: 'Submitted', description: 'Idea submitted for review' },
    { key: 'UNDER_REVIEW', title: 'Under Review', description: 'Being evaluated by the team' },
    { key: 'APPROVED', title: 'Approved', description: 'Approved for development' },
    { key: 'IN_DEVELOPMENT', title: 'In Development', description: 'Currently being implemented' },
    { key: 'IMPLEMENTED', title: 'Implemented', description: 'Successfully implemented' }
  ]

  const currentIndex = statuses.findIndex(s => s.key === currentStatus)

  return statuses.map((status, index) => ({
    ...status,
    completed: index < currentIndex,
    current: index === currentIndex
  }))
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

function formatDateTime(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
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