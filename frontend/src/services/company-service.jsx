export class CompanyService {
  constructor(apiClient) {
    this.api = apiClient
  }

  async createCompany(companyData) {
    try {
      const company = await this.api.createCompany(companyData)
      return company
    } catch (error) {
      throw new Error(error.message || 'Failed to create company')
    }
  }

  async authenticateCompany(email) {
    try {
      // Get all companies and find by email
      const companies = await this.api.getAllCompanies()
      const company = companies.find(c => c.email === email)
      
      if (!company) {
        throw new Error('Company not found with this email')
      }

      return company
    } catch (error) {
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
