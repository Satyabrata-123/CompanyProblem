import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNotification } from '../../context/NotificationContext'
import Layout from '../../components/layout/Layout'
import { api } from '../../services'

export default function AdminDashboardPage() {
  const { currentUser } = useAuth()
  const { addNotification } = useNotification()
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalIdeas: 0,
    totalChallenges: 0,
    totalCompanies: 0
  })
  const [users, setUsers] = useState([])
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAdminData()
  }, [])

  const loadAdminData = async () => {
    try {
      setLoading(true)
      
      const [allUsers, allIdeas, allChallenges, allCompanies] = await Promise.all([
        api.getAllUsers().catch(() => []),
        api.getAllIdeas().catch(() => []),
        api.getAllChallenges().catch(() => []),
        api.getAllCompanies().catch(() => [])
      ])

      setStats({
        totalUsers: allUsers.length,
        totalIdeas: allIdeas.length,
        totalChallenges: allChallenges.length,
        totalCompanies: allCompanies.length
      })

      setUsers(allUsers)
      setCompanies(allCompanies)
    } catch (error) {
      console.error('Failed to load admin data:', error)
      addNotification({
        type: 'error',
        message: 'Failed to load admin data'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCompany = async (companyId) => {
    try {
      await api.verifyCompany(companyId)
      addNotification({
        type: 'success',
        message: 'Company verified successfully'
      })
      loadAdminData()
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Failed to verify company'
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage platform users and companies</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💡</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Ideas</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalIdeas}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
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
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🏢</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Companies</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalCompanies}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Companies */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Pending Company Verifications</h2>
          </div>
          
          {companies.filter(c => !c.verified).length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No pending verifications
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Industry</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {companies.filter(c => !c.verified).map(company => (
                    <tr key={company.id}>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{company.name}</div>
                        <div className="text-sm text-gray-500">{company.contactEmail}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{company.industry}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{company.size}</td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleVerifyCompany(company.id)}
                          className="text-green-600 hover:text-green-900 font-medium"
                        >
                          Verify
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Users</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Points</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.slice(0, 10).map(user => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.fullName}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{user.department}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{user.role}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{user.totalPoints || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  )
}
