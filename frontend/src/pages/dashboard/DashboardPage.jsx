import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services'
import Layout from '../../components/layout/Layout'

export default function DashboardPage() {
    const { currentUser, userType } = useAuth()
    const [stats, setStats] = useState({
        totalIdeas: 0,
        userPoints: 0,
        userRank: '--',
        implementedIdeas: 0,
        totalChallenges: 0,
        activeChallenges: 0
    })
    const [loading, setLoading] = useState(true)

    // Access control - only users can access this dashboard
    if (userType !== 'user' || !currentUser) {
        return (
            <Layout>
                <div className="max-w-2xl mx-auto py-12 px-4 text-center">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-8">
                        <div className="text-6xl mb-4">👤</div>
                        <h2 className="text-2xl font-bold text-blue-800 mb-4">User Dashboard</h2>
                        <p className="text-blue-600 mb-6">
                            This dashboard is for registered users. Companies have their own dashboard.
                        </p>
                        <div className="space-x-4">
                            <Link to="/login" className="btn-primary">
                                User Login
                            </Link>
                            <Link to="/company/dashboard" className="btn-secondary">
                                Company Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </Layout>
        )
    }

    useEffect(() => {
        loadDashboardData()
    }, [currentUser])

    const loadDashboardData = async () => {
        try {
            const [allIdeas, allChallenges] = await Promise.all([
                api.getAllIdeas().catch(() => []),
                api.getAllChallenges().catch(() => [])
            ])

            setStats({
                totalIdeas: allIdeas.length,
                userPoints: currentUser?.totalPoints || 0,
                userRank: '--',
                implementedIdeas: 0,
                totalChallenges: allChallenges.length,
                activeChallenges: allChallenges.filter(c => c.isActive).length
            })
        } catch (error) {
            console.error('Failed to load dashboard data:', error)
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
                        <h1 className="text-3xl font-bold text-gray-900">
                            Welcome back, {currentUser?.fullName?.split(' ')[0]}! 👋
                        </h1>
                        <p className="mt-2 text-gray-600">
                            Here's what's happening in the innovation community
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="text-sm font-medium text-gray-500">Total Ideas</div>
                            <div className="mt-2 text-3xl font-bold text-gray-900">{stats.totalIdeas}</div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="text-sm font-medium text-gray-500">Your Points</div>
                            <div className="mt-2 text-3xl font-bold text-purple-600">{stats.userPoints}</div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="text-sm font-medium text-gray-500">Your Rank</div>
                            <div className="mt-2 text-3xl font-bold text-blue-600">#{stats.userRank}</div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="text-sm font-medium text-gray-500">Active Challenges</div>
                            <div className="mt-2 text-3xl font-bold text-green-600">{stats.activeChallenges}</div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Link
                            to="/ideas/new"
                            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all transform hover:scale-105"
                        >
                            <div className="text-3xl mb-2">💡</div>
                            <h3 className="text-xl font-bold mb-2">Submit New Idea</h3>
                            <p className="text-white/90">Share your innovative ideas with the community</p>
                        </Link>

                        <Link
                            to="/challenges"
                            className="bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all transform hover:scale-105"
                        >
                            <div className="text-3xl mb-2">🎯</div>
                            <h3 className="text-xl font-bold mb-2">Browse Challenges</h3>
                            <p className="text-white/90">Find challenges to solve and earn rewards</p>
                        </Link>

                        <Link
                            to="/leaderboard"
                            className="bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all transform hover:scale-105"
                        >
                            <div className="text-3xl mb-2">🏆</div>
                            <h3 className="text-xl font-bold mb-2">View Leaderboard</h3>
                            <p className="text-white/90">See top contributors and your ranking</p>
                        </Link>
                    </div>
                </div>
            </div>
        </Layout>
    )
}
