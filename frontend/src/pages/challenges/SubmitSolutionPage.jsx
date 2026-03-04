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
  const [analyzing, setAnalyzing] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [aiResult, setAiResult] = useState(null)
  const [showResults, setShowResults] = useState(false)
  const [errors, setErrors] = useState({})

  const steps = [
    { id: 1, name: 'Submit Solution', description: 'Uploading your solution' },
    { id: 2, name: 'AI Analysis', description: 'Analyzing with Gemini AI' },
    { id: 3, name: 'AI Detection', description: 'Checking for AI-generated content' },
    { id: 4, name: 'Results Ready', description: 'Analysis complete' }
  ]

  useEffect(() => {
    loadChallenge()
  }, [id])

  const loadChallenge = async () => {
    try {
      setLoading(true)

      console.log('🔍 Loading challenge for solution submission:', id)

      // First, try to get the challenge from the generic endpoint
      let challengeData = null

      try {
        challengeData = await api.getChallengeById(id)
        console.log('✅ Challenge loaded from generic endpoint:', challengeData)
      } catch (genericError) {
        console.log('⚠️ Generic endpoint failed, trying difficulty-specific endpoints...')

        // If generic fails, try difficulty-specific endpoints
        const difficulties = ['BEGINNER', 'INTERMEDIATE', 'EXPERT']

        for (const diff of difficulties) {
          try {
            challengeData = await api.getChallengeByIdAndDifficulty(diff, id)
            console.log(`✅ Challenge loaded from ${diff} endpoint:`, challengeData)
            break
          } catch (diffError) {
            console.log(`❌ ${diff} endpoint failed`)
          }
        }
      }

      if (!challengeData) {
        throw new Error('Challenge not found in any difficulty level')
      }

      setChallenge(challengeData)
    } catch (error) {
      console.error('❌ Failed to load challenge:', error)
      addNotification({
        type: 'error',
        message: 'Failed to load challenge. Please try again.'
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

    if (!currentUser) {
      addNotification({
        type: 'error',
        message: 'You must be logged in to submit a solution'
      })
      navigate('/login')
      return
    }

    setSubmitting(true)
    setAnalyzing(true)
    setShowResults(false)
    setCurrentStep(1)

    try {
      const solutionData = {
        challengeId: id,
        challengeDifficulty: challenge.difficulty,
        submittedBy: currentUser.id,
        submittedByName: currentUser.fullName,
        ...formData,
        status: 'SUBMITTED',
        voteCount: 0
      }

      console.log('📤 Submitting solution:', solutionData)

      // Step 1: Submit Solution
      await new Promise(resolve => setTimeout(resolve, 1500))
      const submittedSolution = await api.submitSolution(solutionData)
      console.log('✅ Solution submitted successfully')
      setCurrentStep(2)

      // Step 2: AI Analysis
      await new Promise(resolve => setTimeout(resolve, 2000))
      setCurrentStep(3)

      // Step 3: AI Detection
      await new Promise(resolve => setTimeout(resolve, 1500))

      try {
        const comparisonRequest = {
          ideaId: submittedSolution.id,
          ideaTitle: formData.title,
          ideaDescription: formData.description + '\n\nTechnologies: ' + formData.technologies,
          challengeId: id,
          challengeTitle: challenge.title,
          challengeDescription: challenge.description,
          companySolution: challenge.internalSolutionBrief || 'No solution brief available'
        }

        const aiComparison = await api.post('/ai/compare-solution', comparisonRequest)
        setCurrentStep(4)

        // Wait a moment before showing results
        await new Promise(resolve => setTimeout(resolve, 1000))

        setAiResult(aiComparison)
        setShowResults(true)
        setAnalyzing(false)

        addNotification({
          type: 'success',
          message: 'Solution submitted and analyzed successfully!'
        })
      } catch (aiError) {
        console.error('AI comparison failed:', aiError)
        setCurrentStep(4)
        setAnalyzing(false)
        setShowResults(false)

        addNotification({
          type: 'success',
          message: 'Solution submitted successfully! AI analysis pending.'
        })

        // Still navigate after a delay
        setTimeout(() => {
          navigate(`/challenges/${id}`)
        }, 2000)
      }

    } catch (error) {
      console.error('❌ Solution submission failed:', error)
      setAnalyzing(false)
      setCurrentStep(0)
      setErrors({ submit: error.message || 'Failed to submit solution. Please try again.' })
      addNotification({
        type: 'error',
        message: error.message || 'Failed to submit solution'
      })
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
              disabled={submitting || analyzing}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting || analyzing}
            >
              {submitting ? 'Submitting...' : 'Submit Solution'}
            </button>
          </div>
        </form>

        {/* Multi-Step Progress Bar */}
        {analyzing && (
          <div className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Processing Your Submission</h3>
              <p className="text-gray-600">Please wait while we analyze your solution</p>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-between mb-8">
              {steps.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center flex-1">
                  {/* Step Circle */}
                  <div className={`relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-500 ${currentStep > step.id
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : currentStep === step.id
                        ? 'bg-blue-600 border-blue-600 text-white animate-pulse'
                        : 'bg-white border-gray-300 text-gray-400'
                    }`}>
                    {currentStep > step.id ? (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <span className="text-sm font-semibold">{step.id}</span>
                    )}
                  </div>

                  {/* Step Label */}
                  <div className="mt-3 text-center">
                    <p className={`text-sm font-medium ${currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                      }`}>
                      {step.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{step.description}</p>
                  </div>

                  {/* Connection Line */}
                  {index < steps.length - 1 && (
                    <div className="absolute top-6 left-1/2 w-full h-0.5 bg-gray-300 -z-10">
                      <div
                        className={`h-full bg-blue-600 transition-all duration-500 ${currentStep > step.id ? 'w-full' : 'w-0'
                          }`}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Overall Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{Math.round((currentStep / steps.length) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${(currentStep / steps.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Current Step Status */}
            <div className="text-center">
              {currentStep === 1 && (
                <div className="flex items-center justify-center text-blue-600">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                  <span className="font-medium">Uploading your solution...</span>
                </div>
              )}
              {currentStep === 2 && (
                <div className="flex items-center justify-center text-blue-600">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                  <span className="font-medium">AI analyzing solution quality...</span>
                </div>
              )}
              {currentStep === 3 && (
                <div className="flex items-center justify-center text-blue-600">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                  <span className="font-medium">Detecting AI-generated content...</span>
                </div>
              )}
              {currentStep === 4 && (
                <div className="flex items-center justify-center text-green-600">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Analysis complete!</span>
                </div>
              )}
            </div>

            {/* AI Detection Status */}
            {currentStep >= 3 && aiResult && (
              <div className="mt-6 p-4 rounded-lg border-2 border-dashed">
                {aiResult.aiDetected ? (
                  <div className="flex items-center justify-center text-red-600 bg-red-50 p-3 rounded-lg">
                    <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="font-semibold">AI-Generated Content Detected</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center text-green-600 bg-green-50 p-3 rounded-lg">
                    <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="font-semibold">Original Human Content Verified</span>
                  </div>
                )}
              </div>
            )}
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
                <div className={`inline-block px-4 py-2 rounded-full text-white font-semibold ${aiResult.matchLevel === 'EXCELLENT' ? 'bg-green-500' :
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
              <div className={`p-4 rounded-lg ${aiResult.isCorrectSolution ? 'bg-green-50 border-2 border-green-300' : 'bg-gray-50 border-2 border-gray-300'
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
                  onClick={() => navigate(`/challenges/${id}`)}
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
