import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useNotification } from '../../context/NotificationContext'
import Layout from '../../components/layout/Layout'
import { api } from '../../services'

export default function ChallengesListPage() {
  const { addNotification } = useNotification()
  const [challenges, setChallenges] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadChallenges()
  }, [filter])

  const loadChallenges = async () => {
    try {
      setLoading(true)
      let data = []

      if (filter === 'all') {
        data = await api.getAllChallenges()
      } else {
        // Filter is already in correct format: BEGINNER, INTERMEDIATE, EXPERT
        data = await api.getChallengesByDifficulty(filter)
      }

      setChallenges(data)
    } catch (error) {
      console.error('Failed to load challenges:', error)
      addNotification({
        type: 'error',
        message: 'Failed to load challenges'
      })
    } finally {
      setLoading(false)
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
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Challenges</h1>
            <p className="mt-2 text-gray-600">
              Solve challenges and earn rewards
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6">
            {[
              { value: 'all', label: 'All' },
              { value: 'BEGINNER', label: 'Beginner' },
              { value: 'INTERMEDIATE', label: 'Intermediate' },
              { value: 'EXPERT', label: 'Expert' }
            ].map(level => (
              <button
                key={level.value}
                onClick={() => setFilter(level.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === level.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {level.label}
              </button>
            ))}
          </div>

          {/* Challenges Grid */}
          {challenges.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No challenges available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {challenges.map(challenge => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

function ChallengeCard({ challenge }) {
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

  return (
    <Link
      to={`/challenges/${challenge.id}`}
      className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
          {challenge.title}
        </h3>
        <span className={`badge ${getDifficultyColor(challenge.difficulty)}`}>
          {challenge.difficulty}
        </span>
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
        {challenge.description}
      </p>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">
          🏆 {challenge.rewardPoints || 0} points
        </span>
        <span className="text-gray-500">
          📝 {challenge.submissionCount || 0} submissions
        </span>
      </div>

      {challenge.companyName && (
        <div className="mt-3 pt-3 border-t">
          <span className="text-sm text-gray-600">
            By {challenge.companyName}
          </span>
        </div>
      )}
    </Link>
  )
}
