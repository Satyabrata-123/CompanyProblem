export class CompanyService {
  constructor(apiClient) {
    this.api = apiClient
  }

  async createCompany(companyData) {
    try {
      console.log('🏢 Creating company with data:', companyData)
      const company = await this.api.createCompany(companyData)
      console.log('✅ Company created successfully:', company)
      return company
    } catch (error) {
      console.error('❌ Company creation failed:', error)
      throw new Error(error.message || 'Failed to create company')
    }
  }

  async authenticateCompany(email) {
    try {
      console.log('🔍 Attempting to authenticate company:', email)
      // Get all companies and find by email
      const companies = await this.api.getAllCompanies()
      console.log('📋 Retrieved companies:', companies.length)
      
      const company = companies.find(c => c.email === email)
      
      if (!company) {
        console.log('❌ Company not found with email:', email)
        throw new Error('Company not found with this email')
      }

      console.log('✅ Company authentication successful:', company)
      return company
    } catch (error) {
      console.error('❌ Company authentication failed:', error)
      throw new Error(error.message || 'Company authentication failed')
    }
  }

  async getCompanyById(id) {
    try {
      return await this.api.getCompanyById(id)
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch company')
    }
  }

  async getAllCompanies() {
    try {
      return await this.api.getAllCompanies()
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch companies')
    }
  }

  async getVerifiedCompanies() {
    try {
      return await this.api.getVerifiedCompanies()
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch verified companies')
    }
  }

  async updateCompany(id, companyData) {
    try {
      return await this.api.updateCompany(id, companyData)
    } catch (error) {
      throw new Error(error.message || 'Failed to update company')
    }
  }

  async verifyCompany(id) {
    try {
      return await this.api.verifyCompany(id)
    } catch (error) {
      throw new Error(error.message || 'Failed to verify company')
    }
  }
}
