import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useNotification } from '../../context/NotificationContext'
import Layout from '../../components/layout/Layout'
import { api } from '../../services'

export default function SubmitSolutionPage() {
  const { id } = useParams()
  const { currentUser } = useAuth()
  const { addNotification } = useNotification()
  const navigate = useNavigate()

  const [challenge, setChallenge] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    technologies: '',
    githubUrl: '',
    demoUrl: '',
    additionalNotes: ''
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    loadChallenge()
  }, [id])

  const loadChallenge = async () => {
    try {
      setLoading(true)
      let challengeData = null

      // Try difficulty-based endpoints first
      try {
        challengeData = await api.getChallengeByIdAndDifficulty('BEGINNER', id)
      } catch (e) {
        try {
          challengeData = await api.getChallengeByIdAndDifficulty('INTERMEDIATE', id)
        } catch (e2) {
          try {
            challengeData = await api.getChallengeByIdAndDifficulty('EXPERT', id)
          } catch (e3) {
            // Try generic endpoint as fallback
            challengeData = await api.getChallengeById(id)
          }
        }
      }

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

    if (!formData.technologies || formData.technologies.trim().length < 3) {
      newErrors.technologies = 'Please list the technologies used'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) return

    setSubmitting(true)

    try {
      const solutionData = {
        challengeId: id,
        submittedBy: currentUser.id,
        submittedByName: currentUser.fullName,
        ...formData,
        status: 'SUBMITTED',
        voteCount: 0
      }

      await api.submitSolution(solutionData)

      addNotification({
        type: 'success',
        message: 'Solution submitted successfully!'
      })

      navigate(`/challenges/${id}`)
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to submit solution. Please try again.' })
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
            onClick={() => navigate(`/challenges/${id}`)}
            className="text-primary-600 hover:text-primary-700 mb-4"
          >
            ← Back to Challenge
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Submit Solution</h1>
          <p className="mt-2 text-gray-600">
            Submit your solution for: <strong>{challenge.title}</strong>
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
              Solution Title *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              className={`input ${errors.title ? 'input-error' : ''}`}
              placeholder="Enter a clear, descriptive title for your solution"
              value={formData.title}
              onChange={handleChange}
            />
            {errors.title && <p className="text-sm text-danger-600 mt-1">{errors.title}</p>}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Solution Description *
            </label>
            <textarea
              id="description"
              name="description"
              rows="8"
              required
              className={`input ${errors.description ? 'input-error' : ''}`}
              placeholder="Describe your solution in detail. How does it solve the problem? What are the key features?"
              value={formData.description}
              onChange={handleChange}
            />
            {errors.description && <p className="text-sm text-danger-600 mt-1">{errors.description}</p>}
            <p className="text-sm text-gray-500 mt-1">{formData.description.length} characters</p>
          </div>

          <div>
            <label htmlFor="technologies" className="block text-sm font-medium text-gray-700 mb-2">
              Technologies Used *
            </label>
            <input
              id="technologies"
              name="technologies"
              type="text"
              required
              className={`input ${errors.technologies ? 'input-error' : ''}`}
              placeholder="e.g., React, Node.js, MongoDB, AWS"
              value={formData.technologies}
              onChange={handleChange}
            />
            {errors.technologies && <p className="text-sm text-danger-600 mt-1">{errors.technologies}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="githubUrl" className="block text-sm font-medium text-gray-700 mb-2">
                GitHub Repository URL
              </label>
              <input
                id="githubUrl"
                name="githubUrl"
                type="url"
                className="input"
                placeholder="https://github.com/username/repo"
                value={formData.githubUrl}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="demoUrl" className="block text-sm font-medium text-gray-700 mb-2">
                Demo URL
              </label>
              <input
                id="demoUrl"
                name="demoUrl"
                type="url"
                className="input"
                placeholder="https://demo.example.com"
                value={formData.demoUrl}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label htmlFor="additionalNotes" className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              id="additionalNotes"
              name="additionalNotes"
              rows="4"
              className="input"
              placeholder="Any additional information, setup instructions, or notes for reviewers"
              value={formData.additionalNotes}
              onChange={handleChange}
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">💡 Submission Tips:</h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Clearly explain how your solution addresses the challenge requirements</li>
              <li>Include links to working demos or repositories when possible</li>
              <li>Mention any unique features or innovations in your approach</li>
              <li>Be specific about the technologies and methodologies used</li>
            </ul>
          </div>

          <div className="flex gap-4 justify-end pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate(`/challenges/${id}`)}
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
              {submitting ? 'Submitting...' : 'Submit Solution'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}
