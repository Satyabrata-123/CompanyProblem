import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useNotification } from '../../context/NotificationContext'
import Layout from '../../components/layout/Layout'
import { api } from '../../services'

export default function IdeasListPage() {
  const { currentUser } = useAuth()
  const { addNotification } = useNotification()
  const [searchParams] = useSearchParams()

  const [ideas, setIdeas] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || 'all',
    category: searchParams.get('category') || 'all',
    search: searchParams.get('search') || '',
    user: searchParams.get('user') || '',
    sort: searchParams.get('sort') || 'newest'
  })

  const isUserIdeas = filters.user === currentUser?.id
  const pageTitle = isUserIdeas ? 'My Ideas' : 'All Ideas'

  useEffect(() => {
    loadIdeas()
  }, [filters, currentUser])

  const loadIdeas = async () => {
    try {
      setLoading(true)
      let data = []

      if (isUserIdeas) {
        data = await api.getIdeasByUser(currentUser.id)
      } else if (filters.status !== 'all') {
        data = await api.getIdeasByStatus(filters.status)
      } else {
        data = await api.getAllIdeas()
      }

      // Apply filters
      data = applyFilters(data, filters)
      setIdeas(data)
    } catch (error) {
      console.error('Failed to load ideas:', error)
      addNotification({
        type: 'error',
        message: 'Failed to load ideas'
      })
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = (ideas, filters) => {
    let filtered = [...ideas]

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(idea =>
        idea.title?.toLowerCase().includes(searchLower) ||
        idea.description?.toLowerCase().includes(searchLower)
      )
    }

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(idea => idea.category === filters.category)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (filters.sort) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt)
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt)
        case 'votes':
          return (b.voteCount || 0) - (a.voteCount || 0)
        default:
          return 0
      }
    })

    return filtered
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
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
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{pageTitle}</h1>
              <p className="mt-2 text-gray-600">{ideas.length} ideas found</p>
            </div>
            <Link to="/ideas/new" className="btn-primary">
              Submit New Idea
            </Link>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Search ideas..."
                className="input"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />

              <select
                className="input"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="implemented">Implemented</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                className="input"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="technology">Technology</option>
                <option value="process">Process</option>
                <option value="product">Product</option>
                <option value="other">Other</option>
              </select>

              <select
                className="input"
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="votes">Most Votes</option>
              </select>
            </div>
          </div>

          {/* Ideas Grid */}
          {ideas.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No ideas found</p>
              <Link to="/ideas/new" className="btn-primary mt-4 inline-block">
                Submit the first idea
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ideas.map(idea => (
                <IdeaCard key={idea.id} idea={idea} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

function IdeaCard({ idea }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800'
      case 'implemented': return 'bg-blue-100 text-blue-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-yellow-100 text-yellow-800'
    }
  }

  return (
    <Link
      to={`/ideas/${idea.id}`}
      className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
          {idea.title}
        </h3>
        <span className={`badge ${getStatusColor(idea.status)}`}>
          {idea.status}
        </span>
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
        {idea.description}
      </p>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>👤 {idea.submittedBy}</span>
        <span>👍 {idea.voteCount || 0} votes</span>
      </div>

      {idea.category && (
        <div className="mt-3">
          <span className="badge badge-secondary">{idea.category}</span>
        </div>
      )}
    </Link>
  )
}
