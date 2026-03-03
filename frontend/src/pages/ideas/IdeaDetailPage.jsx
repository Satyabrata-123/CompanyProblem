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
      const ideaData = await api.getIdeaById(id)
      setIdea(ideaData)

      // Comments and voting are not implemented in backend yet
      setComments([])
      setUserVote(null)
    } catch (error) {
      console.error('Failed to load idea:', error)
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

    addNotification({
      type: 'info',
      message: 'Voting feature is not yet available'
    })

    // TODO: Implement when backend supports voting
    /*
    try {
      if (userVote) {
        // Remove vote
        await api.removeVote(id, currentUser.id)
        setUserVote(null)
        setIdea(prev => ({ ...prev, voteCount: (prev.voteCount || 0) - 1 }))
      } else {
        // Cast vote
        await api.castVote({
          ideaId: id,
          userId: currentUser.id,
          voteType
        })
        setUserVote({ voteType })
        setIdea(prev => ({ ...prev, voteCount: (prev.voteCount || 0) + 1 }))

        // Award points
        try {
          await api.awardPointsForVote(currentUser.id)
        } catch (error) {
          console.warn('Failed to award points:', error)
        }
      }
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Failed to vote'
      })
    }
    */
  }

  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    addNotification({
      type: 'info',
      message: 'Comments feature is not yet available'
    })

    // TODO: Implement when backend supports comments
    /*
    try {
      const commentData = {
        ideaId: id,
        userId: currentUser.id,
        userName: currentUser.fullName,
        content: newComment
      }

      await api.addComment(commentData)
      setNewComment('')
      
      // Reload comments
      const updatedComments = await api.getCommentsForIdea(id)
      setComments(updatedComments)

      addNotification({
        type: 'success',
        message: 'Comment added'
      })

      // Award points
      try {
        await api.awardPointsForComment(currentUser.id)
      } catch (error) {
        console.warn('Failed to award points:', error)
      }
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Failed to add comment'
      })
    }
    */
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

            {/* Vote Section - Disabled until backend implements it */}
            <div className="flex items-center gap-4 pt-4 border-t">
              <button
                onClick={() => handleVote('upvote')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed opacity-60"
                disabled
              >
                <span>👍</span>
                <span>{idea.voteCount || 0} votes</span>
              </button>
              <span className="text-gray-500 text-sm">
                Voting feature coming soon
              </span>
            </div>
          </div>

          {/* Comments Section - Disabled until backend implements it */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Comments
            </h2>
            <p className="text-gray-500 text-center py-8">
              💬 Comments feature coming soon!
            </p>
          </div>
        </div>
      </div>
    </Layout>
  )
}
