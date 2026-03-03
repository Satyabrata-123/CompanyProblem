import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useNotification } from '../../context/NotificationContext'
import Layout from '../../components/layout/Layout'
import { api } from '../../services'

export default function SubmitIdeaForChallengePage() {
  const { challengeId } = useParams()
  const { currentUser } = useAuth()
  const { addNotification } = useNotification()
  const navigate = useNavigate()

  const [challenge, setChallenge] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    approach: '',
    expectedImpact: ''
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    loadChallenge()
  }, [challengeId])

  const loadChallenge = async () => {
    try {
      setLoading(true)
      const challengeData = await api.getChallengeById(challengeId)
      setChallenge(challengeData)
    } catch (error) {
      console.error('Failed to load challenge:', error)
      addNotification({
        type: 'error',
        message: 'Failed to load challenge'
      })
      navigate('/challenges')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.title || formData.title.trim().length < 10) {
      newErrors.title = 'Title must be at least 10 characters'
    }

    if (!formData.description || formData.description.trim().length < 50) {
      newErrors.description = 'Description must be at least 50 characters'
    }

    if (!formData.approach || formData.approach.trim().length < 20) {
      newErrors.approach = 'Approach must be at least 20 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) return

    setSubmitting(true)

    try {
      const ideaData = {
        challengeId,
        userId: currentUser.id,
        userName: currentUser.fullName,
        ...formData,
        status: 'SUBMITTED'
      }

      await api.submitIdeaForChallenge(ideaData)

      addNotification({
        type: 'success',
        message: 'Idea submitted successfully!'
      })

      navigate(`/challenges/${challengeId}`)
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to submit idea. Please try again.' })
    } finally {
      setSubmitting(false)
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

  if (!challenge) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-12 px-4">
          <p className="text-center text-gray-500">Challenge not found</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={() => navigate(`/challenges/${challengeId}`)}
            className="text-primary-600 hover:text-primary-700 mb-4"
          >
            ← Back to Challenge
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Submit Your Idea</h1>
          <p className="mt-2 text-gray-600">
            Submit your innovative idea for: <strong>{challenge.title}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8 space-y-6">
          {errors.submit && (
            <div className="bg-danger-50 border border-danger-200 rounded-md p-4">
              <p className="text-sm text-danger-800">{errors.submit}</p>
            </div>
          )}

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Idea Title *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              className={`input ${errors.title ? 'input-error' : ''}`}
              placeholder="Enter a clear, descriptive title for your idea"
              value={formData.title}
              onChange={handleChange}
            />
            {errors.title && <p className="text-sm text-danger-600 mt-1">{errors.title}</p>}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Idea Description *
            </label>
            <textarea
              id="description"
              name="description"
              rows="6"
              required
              className={`input ${errors.description ? 'input-error' : ''}`}
              placeholder="Describe your idea in detail. What problem does it solve?"
              value={formData.description}
              onChange={handleChange}
            />
            {errors.description && <p className="text-sm text-danger-600 mt-1">{errors.description}</p>}
            <p className="text-sm text-gray-500 mt-1">{formData.description.length} characters</p>
          </div>

          <div>
            <label htmlFor="approach" className="block text-sm font-medium text-gray-700 mb-2">
              Proposed Approach *
            </label>
            <textarea
              id="approach"
              name="approach"
              rows="4"
              required
              className={`input ${errors.approach ? 'input-error' : ''}`}
              placeholder="How would you implement this idea? What steps would you take?"
              value={formData.approach}
              onChange={handleChange}
            />
            {errors.approach && <p className="text-sm text-danger-600 mt-1">{errors.approach}</p>}
          </div>

          <div>
            <label htmlFor="expectedImpact" className="block text-sm font-medium text-gray-700 mb-2">
              Expected Impact
            </label>
            <textarea
              id="expectedImpact"
              name="expectedImpact"
              rows="3"
              className="input"
              placeholder="What impact do you expect this idea to have?"
              value={formData.expectedImpact}
              onChange={handleChange}
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">💡 Submission Tips:</h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Clearly explain how your idea addresses the challenge</li>
              <li>Be specific about your proposed approach</li>
              <li>Consider feasibility and implementation</li>
              <li>Highlight the potential impact and benefits</li>
            </ul>
          </div>

          <div className="flex gap-4 justify-end pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate(`/challenges/${challengeId}`)}
              className="btn-secondary"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Idea'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}
