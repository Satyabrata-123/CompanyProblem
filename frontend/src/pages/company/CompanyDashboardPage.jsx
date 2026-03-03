import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useNotification } from '../../context/NotificationContext'
import Layout from '../../components/layout/Layout'
import { api } from '../../services'

export default function CompanyDashboardPage() {
  const { currentCompany, userType } = useAuth()
  const { addNotification } = useNotification()
  
  const [challenges, setChallenges] = useState([])
  const [stats, setStats] = useState({
    totalChallenges: 0,
    activeChallenges: 0,
    totalSubmissions: 0,
    totalSolutions: 0
  })
  const [loading, setLoading] = useState(true)

  // Access control - only companies can access this dashboard
  if (userType !== 'company' || !currentCompany) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto py-12 px-4 text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8">
            <div className="text-6xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-red-800 mb-4">Access Denied</h2>
            <p className="text-red-600 mb-6">
              This dashboard is only accessible to registered companies.
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

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      console.log('🔄 Loading company dashboard data for:', currentCompany?.name)
      
      // Load company challenges
      const allChallenges = currentCompany?.id
        ? await api.getChallengesByCompany(currentCompany.id).catch(() => [])
        : await api.getAllChallenges().catch(() => [])

      console.log('📋 Loaded challenges:', allChallenges.length)
      setChallenges(allChallenges)
      
      // Load solutions for each challenge to get accurate counts
      let totalSubmissionsCount = 0
      const challengesWithSolutions = await Promise.all(
        allChallenges.map(async (challenge) => {
          try {
            const solutions = await api.getSolutionsByChallenge(challenge.id)
            const solutionCount = solutions?.length || 0
            totalSubmissionsCount += solutionCount
            return {
              ...challenge,
              actualSubmissionCount: solutionCount
            }
          } catch (err) {
            console.warn(`Failed to load solutions for challenge ${challenge.id}:`, err)
            return {
              ...challenge,
              actualSubmissionCount: challenge.currentSubmissions || 0
            }
          }
        })
      )

      console.log('✅ Total submissions across all challenges:', totalSubmissionsCount)
      
      // Update challenges with actual submission counts
      setChallenges(challengesWithSolutions)
      
      // Calculate stats
      const activeChallenges = allChallenges.filter(c => c.isActive).length
      
      setStats({
        totalChallenges: allChallenges.length,
        activeChallenges,
        totalSubmissions: totalSubmissionsCount,
        totalSolutions: totalSubmissionsCount
      })
    } catch (error) {
      console.error('❌ Failed to load dashboard data:', error)
      addNotification({
        type: 'error',
        message: 'Failed to load dashboard data'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (challengeId, currentStatus) => {
    try {
      await api.updateChallengeStatus(challengeId, !currentStatus)
      addNotification({
        type: 'success',
        message: 'Challenge status updated'
      })
      loadDashboardData()
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Failed to update challenge status'
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

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome, {currentCompany?.name}
            </h1>
            <p className="mt-2 text-gray-600">Manage your challenges and view submissions</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={loadDashboardData}
              className="btn-secondary flex items-center gap-2"
              disabled={loading}
            >
              🔄 Refresh
            </button>
            <Link to="/company/challenges/create" className="btn-primary">
              Create New Challenge
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Challenges</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalChallenges}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Challenges</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.activeChallenges}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📝</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Submissions</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalSubmissions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💡</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Solutions</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalSolutions}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Challenges Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Your Challenges</h2>
          </div>

          {challenges.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No challenges created yet</p>
              <Link to="/company/challenges/create" className="btn-primary">
                Create Your First Challenge
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Challenge
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Difficulty
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submissions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {challenges.map(challenge => (
                    <tr key={challenge.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{challenge.title}</div>
                          <div className="text-sm text-gray-500 line-clamp-1">{challenge.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`badge ${getDifficultyColor(challenge.difficulty)}`}>
                          {challenge.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {challenge.actualSubmissionCount !== undefined 
                          ? challenge.actualSubmissionCount 
                          : (challenge.currentSubmissions || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`badge ${challenge.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {challenge.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Link
                          to={`/challenges/${challenge.id}`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleToggleStatus(challenge.id, challenge.isActive)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          {challenge.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

function getDifficultyColor(difficulty) {
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
