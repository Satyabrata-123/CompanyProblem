import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useNotification } from '../../context/NotificationContext'
import Layout from '../../components/layout/Layout'
import { api } from '../../services'

export default function CreateChallengePage() {
  const { currentCompany, userType } = useAuth()
  const navigate = useNavigate()
  const { addNotification } = useNotification()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    difficulty: 'INTERMEDIATE',
    category: 'technology',
    rewardAmount: '',
    rewardCurrency: 'USD',
    submissionDeadline: '',
    maxSubmissions: '',
    evaluationCriteria: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  // Access control - only companies can create challenges
  if (userType !== 'company' || !currentCompany) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto py-12 px-4 text-center">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-8">
            <div className="text-6xl mb-4">🏢</div>
            <h2 className="text-2xl font-bold text-orange-800 mb-4">Company Access Required</h2>
            <p className="text-orange-600 mb-6">
              Only registered companies can create challenges. Please login with a company account.
            </p>
            <div className="space-x-4">
              <Link to="/company/login" className="btn-primary">
                Company Login
              </Link>
              <Link to="/company/register" className="btn-secondary">
                Register Company
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    )
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

    if (!formData.requirements || formData.requirements.trim().length < 20) {
      newErrors.requirements = 'Requirements must be at least 20 characters'
    }

    if (!formData.submissionDeadline) {
      newErrors.submissionDeadline = 'Deadline is required'
    } else {
      const deadline = new Date(formData.submissionDeadline)
      if (deadline <= new Date()) {
        newErrors.submissionDeadline = 'Deadline must be in the future'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) return

    // Check if user is a company
    if (userType !== 'company' || !currentCompany) {
      setErrors({ submit: 'Only companies can create challenges. Please login with a company account.' })
      return
    }

    setLoading(true)

    try {
      const challengeData = {
        ...formData,
        companyId: currentCompany.id,
        companyName: currentCompany.name,
        isActive: true,
        submissionCount: 0,
        rewardAmount: formData.rewardAmount ? parseFloat(formData.rewardAmount) : null,
        maxSubmissions: formData.maxSubmissions ? parseInt(formData.maxSubmissions) : null,
        // Convert date to ISO string format for backend
        submissionDeadline: formData.submissionDeadline ? `${formData.submissionDeadline}T23:59:59` : null
      }

      console.log('🎯 Creating challenge with data:', challengeData)
      console.log('🏢 Current company:', currentCompany)
      await api.createChallenge(challengeData, formData.evaluationCriteria)

      addNotification({
        type: 'success',
        message: 'Challenge created successfully!'
      })

      navigate('/company/dashboard')
    } catch (error) {
      console.error('❌ Challenge creation failed:', error)
      setErrors({ submit: error.message || 'Failed to create challenge. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Challenge</h1>
          <p className="mt-2 text-gray-600">
            Post a challenge to discover innovative solutions from our community
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8 space-y-6">
          {errors.submit && (
            <div className="bg-danger-50 border border-danger-200 rounded-md p-4">
              <p className="text-sm text-danger-800">{errors.submit}</p>
            </div>
          )}

          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Challenge Title *
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  className={`input ${errors.title ? 'input-error' : ''}`}
                  placeholder="Enter a clear, descriptive title"
                  value={formData.title}
                  onChange={handleChange}
                />
                {errors.title && <p className="text-sm text-danger-600 mt-1">{errors.title}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty *
                  </label>
                  <select
                    id="difficulty"
                    name="difficulty"
                    className="input"
                    value={formData.difficulty}
                    onChange={handleChange}
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="EXPERT">Expert</option>
                  </select>
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
                  <label htmlFor="submissionDeadline" className="block text-sm font-medium text-gray-700 mb-2">
                    Deadline *
                  </label>
                  <input
                    id="submissionDeadline"
                    name="submissionDeadline"
                    type="date"
                    required
                    className={`input ${errors.submissionDeadline ? 'input-error' : ''}`}
                    value={formData.submissionDeadline}
                    onChange={handleChange}
                  />
                  {errors.submissionDeadline && (
                    <p className="text-sm text-danger-600 mt-1">{errors.submissionDeadline}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Problem Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="6"
                  required
                  className={`input ${errors.description ? 'input-error' : ''}`}
                  placeholder="Describe the problem you want to solve..."
                  value={formData.description}
                  onChange={handleChange}
                />
                {errors.description && <p className="text-sm text-danger-600 mt-1">{errors.description}</p>}
                <p className="text-sm text-gray-500 mt-1">{formData.description.length} characters</p>
              </div>

              <div>
                <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-2">
                  Requirements *
                </label>
                <textarea
                  id="requirements"
                  name="requirements"
                  rows="4"
                  required
                  className={`input ${errors.requirements ? 'input-error' : ''}`}
                  placeholder="List the requirements for solutions..."
                  value={formData.requirements}
                  onChange={handleChange}
                />
                {errors.requirements && <p className="text-sm text-danger-600 mt-1">{errors.requirements}</p>}
              </div>

              <div>
                <label htmlFor="evaluationCriteria" className="block text-sm font-medium text-gray-700 mb-2">
                  Evaluation Criteria
                </label>
                <textarea
                  id="evaluationCriteria"
                  name="evaluationCriteria"
                  rows="3"
                  className="input"
                  placeholder="How will solutions be evaluated?"
                  value={formData.evaluationCriteria}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Reward & Limits */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reward & Limits</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="rewardAmount" className="block text-sm font-medium text-gray-700 mb-2">
                  Reward Amount
                </label>
                <input
                  id="rewardAmount"
                  name="rewardAmount"
                  type="number"
                  step="0.01"
                  className="input"
                  placeholder="0.00"
                  value={formData.rewardAmount}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="rewardCurrency" className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  id="rewardCurrency"
                  name="rewardCurrency"
                  className="input"
                  value={formData.rewardCurrency}
                  onChange={handleChange}
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="INR">INR</option>
                </select>
              </div>

              <div>
                <label htmlFor="maxSubmissions" className="block text-sm font-medium text-gray-700 mb-2">
                  Max Submissions
                </label>
                <input
                  id="maxSubmissions"
                  name="maxSubmissions"
                  type="number"
                  className="input"
                  placeholder="Unlimited"
                  value={formData.maxSubmissions}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 justify-end pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate('/company/dashboard')}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Challenge'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}
