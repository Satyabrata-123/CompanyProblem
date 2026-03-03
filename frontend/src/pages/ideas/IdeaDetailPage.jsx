import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useNotification } from '../../context/NotificationContext'
import Layout from '../../components/layout/Layout'
import { api } from '../../services'

export default function IdeaDetailPage() {
  const { id } = useParams()
  const { currentUser } = useAuth()
  const { addNotification } = useNotification()
  const navigate = useNavigate()
  
  const [idea, setIdea] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userVote, setUserVote] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')

  useEffect(() => {
    loadIdeaDetails()
  }, [id])

  const loadIdeaDetails = async () => {
    try {
      setLoading(true)
      console.log('🔍 Loading idea details for ID:', id)
      
      const [ideaData, commentsData] = await Promise.all([
        api.getIdeaById(id),
        api.getCommentsForIdea(id).catch((err) => {
          console.warn('⚠️ Failed to load comments:', err)
          return []
        })
      ])

      console.log('✅ Idea loaded:', ideaData)
      console.log('💬 Comments loaded:', commentsData.length)
      
      setIdea(ideaData)
      setComments(commentsData)

      // Check if user has voted
      if (currentUser) {
        try {
          console.log('🗳️ Checking user vote...')
          const vote = await api.getUserVoteForIdea(id, currentUser.id)
          console.log('✅ User vote found:', vote)
          setUserVote(vote)
        } catch (error) {
          console.log('ℹ️ No existing vote found')
          setUserVote(null)
        }
      }
    } catch (error) {
      console.error('❌ Failed to load idea:', error)
      addNotification({
        type: 'error',
        message: 'Failed to load idea details'
      })
      navigate('/ideas')
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (voteType) => {
    if (!currentUser) {
      addNotification({
        type: 'warning',
        message: 'Please login to vote'
      })
      return
    }

    try {
      console.log('🗳️ Voting action:', { voteType, ideaId: id, userId: currentUser.id, hasExistingVote: !!userVote })
      
      if (userVote) {
        // Remove vote
        console.log('🗑️ Removing existing vote...')
        await api.removeVote(id, currentUser.id)
        setUserVote(null)
        setIdea(prev => ({ ...prev, voteCount: (prev.voteCount || 0) - 1 }))
        console.log('✅ Vote removed successfully')
        
        addNotification({
          type: 'success',
          message: 'Vote removed'
        })
      } else {
        // Cast vote
        console.log('➕ Casting new vote...')
        const voteData = {
          ideaId: id,
          userId: currentUser.id,
          voteType: 1  // 1 for upvote (integer, not string)
        }
        console.log('Vote data:', voteData)
        
        await api.castVote(voteData)
        setUserVote({ voteType: 1 })
        setIdea(prev => ({ ...prev, voteCount: (prev.voteCount || 0) + 1 }))
        console.log('✅ Vote cast successfully')
        
        addNotification({
          type: 'success',
          message: 'Vote recorded'
        })

        // Award points
        try {
          console.log('🎁 Awarding points for vote...')
          await api.awardPointsForVote(currentUser.id)
          console.log('✅ Points awarded')
        } catch (error) {
          console.warn('⚠️ Failed to award points:', error)
        }
      }
    } catch (error) {
      console.error('❌ Vote failed:', error)
      addNotification({
        type: 'error',
        message: error.message || 'Failed to vote. Please try again.'
      })
    }
  }

  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    
    if (!currentUser) {
      addNotification({
        type: 'warning',
        message: 'Please login to comment'
      })
      return
    }
    
    if (!newComment.trim()) {
      addNotification({
        type: 'warning',
        message: 'Comment cannot be empty'
      })
      return
    }

    try {
      const commentData = {
        ideaId: id,
        userId: currentUser.id,
        userName: currentUser.fullName,
        content: newComment.trim()
      }

      console.log('💬 Submitting comment:', commentData)
      await api.addComment(commentData)
      console.log('✅ Comment added successfully')
      
      setNewComment('')
      
      // Reload comments
      console.log('🔄 Reloading comments...')
      const updatedComments = await api.getCommentsForIdea(id)
      setComments(updatedComments)
      console.log('✅ Comments reloaded:', updatedComments.length)

      addNotification({
        type: 'success',
        message: 'Comment added successfully'
      })

      // Award points
      try {
        console.log('🎁 Awarding points for comment...')
        await api.awardPointsForComment(currentUser.id)
        console.log('✅ Points awarded')
      } catch (error) {
        console.warn('⚠️ Failed to award points:', error)
      }
    } catch (error) {
      console.error('❌ Comment submission failed:', error)
      addNotification({
        type: 'error',
        message: error.message || 'Failed to add comment. Please try again.'
      })
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    )
  }

  if (!idea) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <p>Idea not found</p>
        </div>
      </Layout>
    )
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800'
      case 'implemented': return 'bg-blue-100 text-blue-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-yellow-100 text-yellow-800'
    }
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Idea Header */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-bold text-gray-900">{idea.title}</h1>
              <span className={`badge ${getStatusColor(idea.status)}`}>
                {idea.status}
              </span>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
              <span>👤 {idea.submittedBy}</span>
              <span>📅 {new Date(idea.createdAt).toLocaleDateString()}</span>
              {idea.category && <span className="badge badge-secondary">{idea.category}</span>}
            </div>

            <p className="text-gray-700 whitespace-pre-wrap mb-6">{idea.description}</p>

            {/* Vote Section */}
            <div className="flex items-center gap-4 pt-4 border-t">
              <button
                onClick={() => handleVote('upvote')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  userVote ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>👍</span>
                <span>{idea.voteCount || 0} votes</span>
              </button>
              <span className="text-gray-500">
                {userVote ? 'You voted for this idea' : 'Vote for this idea'}
              </span>
            </div>
          </div>

          {/* Comments Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Comments ({comments.length})
            </h2>

            {/* Add Comment Form */}
            {currentUser && (
              <form onSubmit={handleCommentSubmit} className="mb-6">
                <textarea
                  className="input mb-2"
                  rows="3"
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button type="submit" className="btn-primary" disabled={!newComment.trim()}>
                  Post Comment
                </button>
              </form>
            )}

            {/* Comments List */}
            <div className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No comments yet</p>
              ) : (
                comments.map((comment, index) => (
                  <div key={index} className="border-b pb-4 last:border-b-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-gray-900">{comment.userName}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700">{comment.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
