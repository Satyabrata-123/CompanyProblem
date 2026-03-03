import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useNotification } from '../../context/NotificationContext'
import Layout from '../../components/layout/Layout'

export default function CompanyRegisterPage() {
  const navigate = useNavigate()
  const { registerCompany } = useAuth()
  const { addNotification } = useNotification()

  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    size: '',
    website: '',
    description: '',
    email: '',
    phone: '',
    address: '',
    contactPerson: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = 'Company name is required'
    }

    if (!formData.industry) {
      newErrors.industry = 'Industry is required'
    }

    if (!formData.size) {
      newErrors.size = 'Company size is required'
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email || !emailRegex.test(formData.email)) {
      newErrors.email = 'Valid email is required'
    }

    if (!formData.description || formData.description.trim().length < 20) {
      newErrors.description = 'Description must be at least 20 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) return

    setLoading(true)

    try {
      await registerCompany(formData)

      setSuccess(true)
      addNotification({
        type: 'success',
        message: 'Company registered successfully! Redirecting to dashboard...'
      })

      setTimeout(() => {
        navigate('/company/dashboard')
      }, 2000)
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to register company. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto py-12 px-4">
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-6xl mb-6">✅</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Registration Successful!</h2>
            <p className="text-gray-600 mb-6">
              Your company has been registered successfully. Our team will review your application
              and verify your company details within 24-48 hours.
            </p>
            <p className="text-sm text-gray-500 mb-8">
              You will receive an email notification once your company is verified.
            </p>
            <button
              onClick={() => navigate('/challenges')}
              className="btn-primary"
            >
              Browse Challenges
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8 text-center">
            <h1 className="text-3xl font-bold mb-2">Register Your Company</h1>
            <p className="text-blue-100">
              Post challenges and discover innovative solutions from our community
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8">
            {errors.submit && (
              <div className="bg-danger-50 border border-danger-200 rounded-md p-4 mb-6">
                <p className="text-sm text-danger-800">{errors.submit}</p>
              </div>
            )}

            {/* Company Information */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className={`input ${errors.name ? 'input-error' : ''}`}
                    placeholder="Acme Corporation"
                    value={formData.name}
                    onChange={handleChange}
                  />
                  {errors.name && <p className="text-sm text-danger-600 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">
                    Industry *
                  </label>
                  <select
                    id="industry"
                    name="industry"
                    required
                    className={`input ${errors.industry ? 'input-error' : ''}`}
                    value={formData.industry}
                    onChange={handleChange}
                  >
                    <option value="">Select Industry</option>
                    <option value="technology">Technology</option>
                    <option value="finance">Finance</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="retail">Retail</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="education">Education</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.industry && <p className="text-sm text-danger-600 mt-1">{errors.industry}</p>}
                </div>

                <div>
                  <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-2">
                    Company Size *
                  </label>
                  <select
                    id="size"
                    name="size"
                    required
                    className={`input ${errors.size ? 'input-error' : ''}`}
                    value={formData.size}
                    onChange={handleChange}
                  >
                    <option value="">Select Size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="501-1000">501-1000 employees</option>
                    <option value="1000+">1000+ employees</option>
                  </select>
                  {errors.size && <p className="text-sm text-danger-600 mt-1">{errors.size}</p>}
                </div>

                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    id="website"
                    name="website"
                    type="url"
                    className="input"
                    placeholder="https://www.example.com"
                    value={formData.website}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="mt-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Company Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  required
                  className={`input ${errors.description ? 'input-error' : ''}`}
                  placeholder="Tell us about your company..."
                  value={formData.description}
                  onChange={handleChange}
                />
                {errors.description && <p className="text-sm text-danger-600 mt-1">{errors.description}</p>}
              </div>
            </div>

            {/* Contact Information */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Person
                  </label>
                  <input
                    id="contactPerson"
                    name="contactPerson"
                    type="text"
                    className="input"
                    placeholder="John Doe"
                    value={formData.contactPerson}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Email *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className={`input ${errors.email ? 'input-error' : ''}`}
                    placeholder="contact@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  {errors.email && <p className="text-sm text-danger-600 mt-1">{errors.email}</p>}
                </div>
              </div>

              <div className="mt-6">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Phone
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="input"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="mt-6">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  rows="2"
                  className="input"
                  placeholder="Company address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 justify-end pt-6 border-t">
              <button
                type="button"
                onClick={() => navigate('/challenges')}
                className="btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Register Company'}
              </button>
            </div>
          </form>

          {/* Verification Notice */}
          <div className="bg-gray-50 p-8 border-t">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Verification Process</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Your company information will be reviewed by our team</li>
              <li>Verification typically takes 24-48 hours</li>
              <li>You'll receive an email notification once verified</li>
              <li>After verification, you can post challenges and manage submissions</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  )
}
