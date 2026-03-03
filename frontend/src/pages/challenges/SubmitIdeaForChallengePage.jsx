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
  const [analyzing, setAnalyzing] = useState(false)
  const [aiResult, setAiResult] = useState(null)
  const [showResults, setShowResults] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    loadChallenge()
  }, [challengeId])

  const loadChallenge = async () => {
    try {
      setLoading(true)
      let challengeData = null
      
      // Try difficulty-based endpoints first
      try {
        challengeData = await api.getChallengeByIdAndDifficulty('BEGINNER', challengeId)
      } catch (e) {
        try {
          challengeData = await api.getChallengeByIdAndDifficulty('INTERMEDIATE', challengeId)
        } catch (e2) {
          try {
            challengeData = await api.getChallengeByIdAndDifficulty('EXPERT', challengeId)
          } catch (e3) {
            // Try generic endpoint as fallback
            challengeData = await api.getChallengeById(challengeId)
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
    setAnalyzing(true)
    setShowResults(false)

    try {
      const ideaData = {
        challengeId,
        challengeDifficulty: challenge.difficulty,
        userId: currentUser.id,
        userName: currentUser.fullName,
        ...formData,
        status: 'SUBMITTED'
      }

      // Submit the idea
      const submittedIdea = await api.submitIdeaForChallenge(ideaData)

      // Show analyzing message
      addNotification({
        type: 'info',
        message: 'Analyzing your submission with AI...'
      })

      // Wait a bit for backend AI processing (it happens via Kafka)
      await new Promise(resolve => setTimeout(resolve, 3000))

      // Try to get AI comparison result
      try {
        // The AI comparison should have been triggered by backend
        // For now, we'll call it directly from frontend
        const comparisonRequest = {
          ideaId: submittedIdea.id,
          ideaTitle: formData.title,
          ideaDescription: formData.description + '\n\nApproach: ' + formData.approach,
          challengeId: challengeId,
          challengeTitle: challenge.title,
          challengeDescription: challenge.description,
          companySolution: challenge.internalSolutionBrief || 'No solution brief available'
        }

        const aiComparison = await api.post('/ai/compare-solution', comparisonRequest)
        setAiResult(aiComparison)
        setShowResults(true)
        setAnalyzing(false)

        addNotification({
          type: 'success',
          message: 'Idea submitted and analyzed successfully!'
        })
      } catch (aiError) {
        console.error('AI comparison failed:', aiError)
        setAnalyzing(false)
        setShowResults(false)
        
        addNotification({
          type: 'success',
          message: 'Idea submitted successfully! AI analysis pending.'
        })
        
        // Still navigate after a delay
        setTimeout(() => {
          navigate(`/challenges/${challengeId}`)
        }, 2000)
      }

    } catch (error) {
      setAnalyzing(false)
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
              disabled={submitting || analyzing}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting || analyzing}
            >
              {submitting ? 'Submitting...' : 'Submit Idea'}
            </button>
          </div>
        </form>

        {/* AI Analysis Progress */}
        {analyzing && (
          <div className="mt-6 bg-white rounded-lg shadow p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Analyzing Your Submission...</h3>
              <p className="text-gray-600 mb-4">Our AI is comparing your idea with the company's solution</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div className="bg-primary-600 h-2 rounded-full animate-pulse" style={{width: '75%'}}></div>
              </div>
              <p className="text-sm text-gray-500">This may take a few moments...</p>
            </div>
          </div>
        )}

        {/* AI Results Display */}
        {showResults && aiResult && (
          <div className="mt-6 bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
              <h2 className="text-2xl font-bold mb-2">🤖 AI Analysis Results</h2>
              <p className="text-purple-100">Your submission has been analyzed and scored</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Match Score */}
              <div className="text-center py-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
                <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
                  {aiResult.matchScore}%
                </div>
                <div className={`inline-block px-4 py-2 rounded-full text-white font-semibold ${
                  aiResult.matchLevel === 'EXCELLENT' ? 'bg-green-500' :
                  aiResult.matchLevel === 'GOOD' ? 'bg-blue-500' :
                  aiResult.matchLevel === 'PARTIAL' ? 'bg-yellow-500' : 'bg-red-500'
                }`}>
                  {aiResult.matchLevel} Match
                </div>
              </div>

              {/* AI Detection Warning */}
              {aiResult.aiDetected && (
                <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                  <div className="flex items-start">
                    <span className="text-3xl mr-3">⚠️</span>
                    <div>
                      <h3 className="text-lg font-bold text-red-900 mb-2">AI-Generated Content Detected</h3>
                      <p className="text-red-800 mb-2">{aiResult.aiDetectionReason}</p>
                      {aiResult.penaltyApplied && (
                        <p className="text-sm text-red-700 font-semibold">
                          ⚡ Score penalty applied for AI-generated content
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Feedback */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">📝 Feedback</h3>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{aiResult.feedback}</p>
              </div>

              {/* Strengths */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">💪 Strengths</h3>
                <p className="text-gray-700 bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                  {aiResult.strengths}
                </p>
              </div>

              {/* Improvements */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">🎯 Areas for Improvement</h3>
                <p className="text-gray-700 bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                  {aiResult.improvements}
                </p>
              </div>

              {/* Qualification Status */}
              <div className={`p-4 rounded-lg ${
                aiResult.isCorrectSolution ? 'bg-green-50 border-2 border-green-300' : 'bg-gray-50 border-2 border-gray-300'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {aiResult.isCorrectSolution ? '✅ Qualifies for Reward' : '❌ Does Not Qualify for Reward'}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {aiResult.isCorrectSolution 
                        ? 'Your solution meets the minimum threshold (70%) for rewards!' 
                        : 'Score must be 70% or higher to qualify for rewards'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex justify-center pt-4">
                <button
                  onClick={() => navigate(`/challenges/${challengeId}`)}
                  className="btn-primary px-8"
                >
                  View Challenge Details
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
