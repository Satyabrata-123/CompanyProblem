import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useNotification } from '../../context/NotificationContext'
import Layout from '../../components/layout/Layout'
import { api } from '../../services'

export default function ChallengesListPage() {
  const { addNotification } = useNotification()
  const [challenges, setChallenges] = useState({
    BEGINNER: [],
    INTERMEDIATE: [],
    EXPERT: []
  })
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
        data = await api.getChallengesByDifficulty(filter)
      }

      // Group challenges by difficulty
      const grouped = {
        BEGINNER: data.filter(c => c.difficulty === 'BEGINNER' || c.difficulty === 'EASY'),
        INTERMEDIATE: data.filter(c => c.difficulty === 'INTERMEDIATE' || c.difficulty === 'MEDIUM'),
        EXPERT: data.filter(c => c.difficulty === 'EXPERT' || c.difficulty === 'HARD')
      }

      setChallenges(grouped)
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
              {challenges.BEGINNER.length + challenges.INTERMEDIATE.length + challenges.EXPERT.length} challenges available
            </p>
          </div>

          {/* Filter Tabs - Removed */}

          {/* Challenges by Difficulty - 3 Columns */}
          {challenges.BEGINNER.length === 0 && challenges.INTERMEDIATE.length === 0 && challenges.EXPERT.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No challenges available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Beginner Column */}
              <DifficultyColumn
                title="Beginner"
                icon="🟢"
                color="green"
                challenges={challenges.BEGINNER}
              />

              {/* Intermediate Column */}
              <DifficultyColumn
                title="Intermediate"
                icon="🟡"
                color="yellow"
                challenges={challenges.INTERMEDIATE}
              />

              {/* Expert Column */}
              <DifficultyColumn
                title="Expert"
                icon="🔴"
                color="red"
                challenges={challenges.EXPERT}
              />
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

function ChallengeCard({ challenge }) {
  return (
    <Link
      to={`/challenges/${challenge.id}`}
      className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-4 block my-1"
    >
      <h3 className="text-base font-semibold text-gray-900 line-clamp-2 mb-2">
        {challenge.title}
      </h3>

      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
        {challenge.description}
      </p>

      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
        <span>🏆 {challenge.rewardPoints || 0} pts</span>
        <span>📝 {challenge.submissionCount || 0}</span>
      </div>

      {challenge.companyName && (
        <div className="pt-2 border-t">
          <span className="text-xs text-gray-600">
            By {challenge.companyName}
          </span>
        </div>
      )}
    </Link>
  )
}

function DifficultyColumn({ title, icon, color, challenges }) {
  const getColorClasses = (color) => {
    switch (color) {
      case 'green':
        return {
          bg: 'bg-green-100',
          border: 'border-green-400',
          header: 'bg-green-600',
          text: 'text-white'
        }
      case 'yellow':
        return {
          bg: 'bg-yellow-100',
          border: 'border-yellow-400',
          header: 'bg-yellow-600',
          text: 'text-white'
        }
      case 'red':
        return {
          bg: 'bg-red-100',
          border: 'border-red-400',
          header: 'bg-red-600',
          text: 'text-white'
        }
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          header: 'bg-gray-100',
          text: 'text-gray-800'
        }
    }
  }

  const colors = getColorClasses(color)

  return (
    <div className={`${colors.bg} ${colors.border} border-2 rounded-lg overflow-hidden`}>
      <div className={`${colors.header} ${colors.text} p-4 font-semibold text-lg flex items-center justify-between`}>
        <span className="flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          {title}
        </span>
        <span className="text-sm font-normal">({challenges.length})</span>
      </div>
      
      <div className="p-4 max-h-[600px] overflow-y-auto space-y-1">
        {challenges.length === 0 ? (
          <p className="text-gray-500 text-center py-8 text-sm">No {title.toLowerCase()} challenges yet</p>
        ) : (
          challenges.map(challenge => <ChallengeCard key={challenge.id} challenge={challenge} />)
        )}
      </div>
    </div>
  )
}
