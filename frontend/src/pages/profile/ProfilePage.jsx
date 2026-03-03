import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Layout from '../../components/layout/Layout'
import { api } from '../../services'

export default function ProfilePage() {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  
  const [stats, setStats] = useState({
    totalPoints: 0,
    ideasSubmitted: 0,
    ideasImplemented: 0,
    totalVotes: 0
  })
  const [badges, setBadges] = useState([])
  const [ideas, setIdeas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfileData()
  }, [currentUser])

  const loadProfileData = async () => {
    try {
      setLoading(true)
      
      const [userStats, userBadges, userIdeas] = await Promise.all([
        api.gamification.getUserStats(currentUser.id).catch(() => ({
          totalPoints: 0,
          ideasSubmitted: 0,
          ideasImplemented: 0,
          totalVotes: 0
        })),
        api.getUserBadges(currentUser.id).catch(() => []),
        api.getIdeasByUser(currentUser.id).catch(() => [])
      ])

      setStats(userStats)
      setBadges(userBadges)
      setIdeas(userIdeas)
    } catch (error) {
      console.error('Failed to load profile data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
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
      {/* Profile Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-2xl font-semibold text-primary-600">
                  {currentUser.fullName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-900">{currentUser.fullName}</h1>
                <p className="text-sm text-gray-500">
                  {currentUser.department} • {currentUser.role}
                </p>
                <p className="text-sm text-gray-500">{currentUser.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="btn-secondary">Edit Profile</button>
              <button onClick={handleLogout} className="btn-danger">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">⭐</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Points</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalPoints || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">💡</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Ideas Submitted</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.ideasSubmitted || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">✅</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Implemented</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.ideasImplemented || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">👍</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Votes</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalVotes || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Badges Section */}
          {badges.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Badges & Achievements</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {badges.map((badge, index) => (
                  <div key={index} className="text-center">
                    <div className="w-16 h-16 mx-auto bg-yellow-100 rounded-full flex items-center justify-center mb-2">
                      <span className="text-3xl">{badge.icon || '🏆'}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">{badge.name}</p>
                    <p className="text-xs text-gray-500">{badge.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* My Ideas Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">My Ideas ({ideas.length})</h2>
              <button
                onClick={() => navigate('/ideas/new')}
                className="btn-primary"
              >
                Submit New Idea
              </button>
            </div>

            {ideas.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">You haven't submitted any ideas yet</p>
                <button
                  onClick={() => navigate('/ideas/new')}
                  className="btn-primary"
                >
                  Submit Your First Idea
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {ideas.map(idea => (
                  <div
                    key={idea.id}
                    onClick={() => navigate(`/ideas/${idea.id}`)}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{idea.title}</h3>
                      <span className={`badge ${getStatusColor(idea.status)}`}>
                        {idea.status}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{idea.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>👍 {idea.voteCount || 0} votes</span>
                      <span>📅 {new Date(idea.createdAt).toLocaleDateString()}</span>
                      {idea.category && <span className="badge badge-secondary">{idea.category}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

function getStatusColor(status) {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-800'
    case 'implemented':
      return 'bg-blue-100 text-blue-800'
    case 'rejected':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-yellow-100 text-yellow-800'
  }
}
