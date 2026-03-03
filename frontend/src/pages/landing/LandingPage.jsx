import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function LandingPage() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6">
            Innovation Platform
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto">
            Transform your ideas into reality. Collaborate, innovate, and make an impact.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="px-8 py-4 bg-white text-purple-600 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="px-8 py-4 bg-white text-purple-600 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl"
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-full font-semibold text-lg hover:bg-white/10 transition-all"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>

          {/* Company Section */}
          {!isAuthenticated && (
            <div className="mt-8 mb-12">
              <div className="inline-block bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <p className="text-white/90 text-lg mb-4 font-medium">
                  🏢 Are you a company looking to post challenges?
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    to="/company/register"
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-semibold hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-105 shadow-lg"
                  >
                    Register Company
                  </Link>
                  <Link
                    to="/company/login"
                    className="px-6 py-3 bg-white/20 text-white rounded-full font-semibold hover:bg-white/30 transition-all border border-white/30"
                  >
                    Company Login
                  </Link>
                </div>
              </div>
            </div>
          )}

          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-white">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8">
              <div className="text-4xl mb-4">💡</div>
              <h3 className="text-xl font-bold mb-2">Share Ideas</h3>
              <p className="text-white/80">Submit your innovative ideas and get feedback from the community</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-xl font-bold mb-2">Earn Rewards</h3>
              <p className="text-white/80">Get points and badges for your contributions</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-bold mb-2">Make Impact</h3>
              <p className="text-white/80">See your ideas come to life and drive change</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
