import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useNotification } from '../../context/NotificationContext'
import Layout from '../../components/layout/Layout.jsx'
import { api } from '../../services'

export default function ChallengesListPage() {
  const { addNotification } = useNotification()
  const [beginnerChallenges, setBeginnerChallenges] = useState([])
  const [intermediateChallenges, setIntermediateChallenges] = useState([])
  const [expertChallenges, setExpertChallenges] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadChallenges()
  }, [])

  const loadChallenges = async () => {
    try {
      setLoading(true)
      
      // Load all difficulty levels in parallel
      const [beginnerData, intermediateData, expertData] = await Promise.all([
        api.getChallengesByDifficulty('BEGINNER').catch(() => []),
        api.getChallengesByDifficulty('INTERMEDIATE').catch(() => []),
        api.getChallengesByDifficulty('EXPERT').catch(() => [])
      ])

      setBeginnerChallenges(beginnerData)
      setIntermediateChallenges(intermediateData)
      setExpertChallenges(expertData)
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

  const maxRows = Math.max(
    beginnerChallenges.length,
    intermediateChallenges.length,
    expertChallenges.length
  )

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

          {/* Three Column Table */}
          <div className="rounded-lg overflow-hidden">
            <div className="grid grid-cols-3 gap-1">
              {/* Beginner Column Header */}
              <div className="bg-green-600 text-white p-4 text-center font-bold text-lg rounded-t-lg">
                🌱 Beginner
                <div className="text-sm font-normal mt-1 opacity-90">
                  {beginnerChallenges.length} challenges
                </div>
              </div>

              {/* Intermediate Column Header */}
              <div className="bg-yellow-600 text-white p-4 text-center font-bold text-lg rounded-t-lg">
                ⚡ Intermediate
                <div className="text-sm font-normal mt-1 opacity-90">
                  {intermediateChallenges.length} challenges
                </div>
              </div>

              {/* Expert Column Header */}
              <div className="bg-red-600 text-white p-4 text-center font-bold text-lg rounded-t-lg">
                🔥 Expert
                <div className="text-sm font-normal mt-1 opacity-90">
                  {expertChallenges.length} challenges
                </div>
              </div>
            </div>

            {/* Table Body */}
            {maxRows === 0 ? (
              <div className="text-center py-12 col-span-3 bg-white rounded-b-lg">
                <p className="text-gray-500 text-lg">No challenges available</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1">
                {/* Beginner Column */}
                <div className="bg-white rounded-b-lg shadow p-1">
                  {beginnerChallenges.map((challenge) => (
                    <ChallengeCard 
                      key={challenge.id} 
                      challenge={challenge} 
                      difficulty="BEGINNER"
                    />
                  ))}
                </div>

                {/* Intermediate Column */}
                <div className="bg-white rounded-b-lg shadow p-1">
                  {intermediateChallenges.map((challenge) => (
                    <ChallengeCard 
                      key={challenge.id} 
                      challenge={challenge} 
                      difficulty="INTERMEDIATE"
                    />
                  ))}
                </div>

                {/* Expert Column */}
                <div className="bg-white rounded-b-lg shadow p-1">
                  {expertChallenges.map((challenge) => (
                    <ChallengeCard 
                      key={challenge.id} 
                      challenge={challenge} 
                      difficulty="EXPERT"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

function ChallengeCard({ challenge, difficulty }) {
  const getDifficultyColor = (diff) => {
    switch (diff?.toUpperCase()) {
      case 'BEGINNER':
        return 'bg-green-50 hover:bg-green-100'
      case 'INTERMEDIATE':
        return 'bg-yellow-50 hover:bg-yellow-100'
      case 'EXPERT':
        return 'bg-red-50 hover:bg-red-100'
      default:
        return 'bg-gray-50 hover:bg-gray-100'
    }
  }

  const getBadgeColor = (diff) => {
    switch (diff?.toUpperCase()) {
      case 'BEGINNER':
        return 'bg-green-100 text-green-800'
      case 'INTERMEDIATE':
        return 'bg-yellow-100 text-yellow-800'
      case 'EXPERT':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Link
      to={`/challenges/${challenge.id}`}
      className={`block p-4 my-1 rounded transition-colors ${getDifficultyColor(difficulty)}`}
    >
      <div className="mb-2">
        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">
          {challenge.title}
        </h3>
        <span className={`inline-block text-xs px-2 py-1 rounded ${getBadgeColor(difficulty)}`}>
          {difficulty}
        </span>
      </div>

      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
        {challenge.description}
      </p>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>🏆 {challenge.rewardPoints || 0} pts</span>
        <span>📝 {challenge.submissionCount || 0}</span>
      </div>

      {challenge.companyName && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <span className="text-xs text-gray-600">
            By {challenge.companyName}
          </span>
        </div>
      )}
    </Link>
  )
}
