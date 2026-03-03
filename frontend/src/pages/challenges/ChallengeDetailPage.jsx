import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useNotification } from '../../context/NotificationContext'
import Layout from '../../components/layout/Layout'
import { api } from '../../services'

export default function ChallengeDetailPage() {
  const { id } = useParams()
  const { currentUser } = useAuth()
  const { addNotification } = useNotification()
  const navigate = useNavigate()

  const [challenge, setChallenge] = useState(null)
  const [solutions, setSolutions] = useState([])
  const [userSolution, setUserSolution] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadChallengeData()
  }, [id])

  const loadChallengeData = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('🔍 Loading challenge:', id)

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

      // Load solutions
      try {
        const solutionsData = await api.getSolutionsByChallenge(id)
        console.log('📋 Solutions loaded:', solutionsData?.length || 0)
        setSolutions(solutionsData || [])

        // Check if user has submitted
        if (currentUser && solutionsData) {
          const userSol = solutionsData.find(s => s.submittedBy === currentUser.id)
          if (userSol) {
            console.log('👤 User solution found:', userSol)
            setUserSolution(userSol)
          }
        }
      } catch (err) {
        console.warn('⚠️ Failed to load solutions:', err)
        setSolutions([])
      }
    } catch (err) {
      console.error('❌ Failed to load challenge:', err)
      setError(err.message || 'Challenge not found')
      addNotification({
        type: 'error',
        message: 'Failed to load challenge'
      })
    } finally {
      setLoading(false)
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toUpperCase()) {
      case 'BEGINNER':
      case 'EASY':
        return 'bg-green-100 text-green-800'
      case 'INTERMEDIATE':
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800'
      case 'EXPERT':
      case 'HARD':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
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

  if (error || !challenge) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-12 px-4">
          <div className="text-center bg-gray-50 rounded-lg p-12 border border-gray-200">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-red-600 mb-4">Challenge Not Found</h2>
            <p className="text-gray-600 mb-6">
              The challenge you're looking for doesn't exist or may have been removed.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/challenges" className="btn-primary">
                🔍 Browse All Challenges
              </Link>
              <Link to="/dashboard" className="btn-secondary">
                📊 Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  const isDeadlinePassed = new Date(challenge.submissionDeadline) < new Date()

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <button
          onClick={() => navigate('/challenges')}
          className="text-primary-600 hover:text-primary-700 mb-6 flex items-center gap-2"
        >
          ← Back to Challenges
        </button>

        <div className="mb-6">
          <span className={`badge ${getDifficultyColor(challenge.difficulty)} text-sm px-3 py-1`}>
            {challenge.difficulty}
          </span>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">{challenge.title}</h1>
          <p className="text-gray-600 mt-2">
            Challenge by <strong>{challenge.companyName}</strong>
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left Column - Challenge Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Problem Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{challenge.description}</p>
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Requirements</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{challenge.requirements}</p>
            </div>

            {/* Evaluation Criteria */}
            {challenge.evaluationCriteria && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Evaluation Criteria</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{challenge.evaluationCriteria}</p>
              </div>
            )}

            {/* Guidelines */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Submission Guidelines</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Provide a clear title and description of your solution</li>
                <li>Include implementation details and technologies used</li>
                <li>Add GitHub repository link if available</li>
                <li>Include demo URL if your solution is deployed</li>
                <li>Make sure your solution addresses all requirements</li>
              </ul>
            </div>
          </div>

          {/* Right Column - Info Card */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6 sticky top-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Challenge Info</h3>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Reward:</span>
                  <span className="font-semibold text-green-600">
                    {challenge.rewardAmount
                      ? `${challenge.rewardAmount} ${challenge.rewardCurrency || 'USD'}`
                      : 'No monetary reward'}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium">{challenge.category || 'General'}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Submissions:</span>
                  <span className="font-medium">
                    {challenge.submissionCount || 0}/{challenge.maxSubmissions || '∞'}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Deadline:</span>
                  <span className={`font-medium ${isDeadlinePassed ? 'text-red-600' : ''}`}>
                    {new Date(challenge.submissionDeadline).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-semibold ${isDeadlinePassed ? 'text-red-600' : 'text-green-600'}`}>
                    {isDeadlinePassed ? 'Closed' : 'Open'}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              {currentUser && !isDeadlinePassed && !userSolution && (
                <button
                  onClick={() => navigate(`/challenges/${id}/submit`)}
                  className="btn-primary w-full mt-6"
                >
                  Submit Your Solution
                </button>
              )}

              {/* User Solution Status */}
              {userSolution && (
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Your Submission</h4>
                  <p className="text-sm font-medium text-gray-900">{userSolution.title}</p>
                  <p className="text-sm text-gray-600 mt-1">Status: {userSolution.status}</p>
                  {userSolution.score && (
                    <p className="text-sm text-green-600 font-semibold mt-1">
                      Score: {userSolution.score}/100
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Solutions Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Submitted Solutions ({solutions.length})
          </h2>

          {solutions.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No solutions submitted yet</p>
          ) : (
            <div className="space-y-4">
              {solutions
                .sort((a, b) => {
                  if (a.score && b.score) return b.score - a.score
                  return (b.voteCount || 0) - (a.voteCount || 0)
                })
                .map((solution, index) => (
                  <SolutionCard key={solution.id} solution={solution} rank={index + 1} />
                ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

function SolutionCard({ solution, rank }) {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'accepted':
        return 'text-green-600'
      case 'rejected':
        return 'text-red-600'
      case 'under_review':
        return 'text-yellow-600'
      case 'winner':
        return 'text-orange-600 font-bold'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
            #{rank}
          </span>
          {solution.score && (
            <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
              Score: {solution.score}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span>👍 {solution.voteCount || 0}</span>
          <span className={getStatusColor(solution.status)}>{solution.status}</span>
        </div>
      </div>

      <h4 className="text-lg font-semibold text-gray-900 mb-2">{solution.title}</h4>
      <p className="text-gray-600 mb-4 line-clamp-3">{solution.description}</p>

      {solution.technologies && (
        <p className="text-sm text-gray-500 mb-3">
          <strong>Technologies:</strong> {solution.technologies}
        </p>
      )}

      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex gap-2">
          {solution.githubUrl && (
            <a
              href={solution.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
            >
              GitHub
            </a>
          )}
          {solution.demoUrl && (
            <a
              href={solution.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
            >
              Demo
            </a>
          )}
        </div>
        <span className="text-sm text-gray-500">
          {new Date(solution.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  )
}
