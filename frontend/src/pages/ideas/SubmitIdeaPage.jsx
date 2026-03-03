import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useNotification } from '../../context/NotificationContext'
import Layout from '../../components/layout/Layout'
import { api } from '../../services'

export default function SubmitIdeaPage() {
  const { currentUser } = useAuth()
  const { addNotification } = useNotification()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'technology'
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.title || formData.title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters'
    }

    if (!formData.description || formData.description.trim().length < 20) {
      newErrors.description = 'Description must be at least 20 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) return

    setLoading(true)

    try {
      const ideaData = {
        ...formData,
        submittedBy: currentUser.id,
        status: 'pending'
      }

      const idea = await api.createIdea(ideaData)

      // Award points for idea submission
      try {
        await api.awardPointsForIdeaSubmission(currentUser.id)
      } catch (error) {
        console.warn('Failed to award points:', error)
      }

      addNotification({
        type: 'success',
        message: 'Idea submitted successfully!'
      })

      navigate(`/ideas/${idea.id}`)
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to submit idea. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Submit New Idea</h1>
            <p className="mt-2 text-gray-600">
              Share your innovative idea with the community
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
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
                placeholder="Enter a clear, concise title for your idea"
                value={formData.title}
                onChange={handleChange}
              />
              {errors.title && <p className="text-sm text-danger-600 mt-1">{errors.title}</p>}
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                id="category"
                name="category"
                className="input"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="technology">Technology</option>
                <option value="process">Process Improvement</option>
                <option value="product">Product Innovation</option>
                <option value="sustainability">Sustainability</option>
                <option value="customer">Customer Experience</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                rows="8"
                required
                className={`input ${errors.description ? 'input-error' : ''}`}
                placeholder="Describe your idea in detail. What problem does it solve? How would it work?"
                value={formData.description}
                onChange={handleChange}
              />
              {errors.description && <p className="text-sm text-danger-600 mt-1">{errors.description}</p>}
              <p className="text-sm text-gray-500 mt-1">
                {formData.description.length} characters (minimum 20)
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">💡 Tips for a great idea submission:</h3>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Be specific and clear about the problem you're solving</li>
                <li>Explain the benefits and potential impact</li>
                <li>Consider feasibility and implementation</li>
                <li>Include any relevant examples or references</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="btn-primary flex-1"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Idea'}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate('/ideas')}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  )
}
