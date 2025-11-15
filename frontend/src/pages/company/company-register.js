import { apiClient } from '../../services/api-client.js';

export class CompanyRegisterPage {
    constructor() {
        this.isSubmitting = false;
    }

    async render() {
        return `
            <div class="company-register-page">
                <div class="register-container">
                    <div class="register-header">
                        <h1>Register Your Company</h1>
                        <p>Join our platform to post challenges and find innovative solutions</p>
                    </div>

                    <form id="companyRegisterForm" class="register-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="name">Company Name *</label>
                                <input type="text" id="name" name="name" required 
                                       placeholder="Enter your company name">
                            </div>
                            <div class="form-group">
                                <label for="email">Company Email *</label>
                                <input type="email" id="email" name="email" required 
                                       placeholder="company@example.com">
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="description">Company Description</label>
                            <textarea id="description" name="description" rows="4"
                                      placeholder="Brief description of your company and what you do..."></textarea>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="industry">Industry</label>
                                <select id="industry" name="industry">
                                    <option value="">Select Industry</option>
                                    <option value="Technology">Technology</option>
                                    <option value="Healthcare">Healthcare</option>
                                    <option value="Finance">Finance</option>
                                    <option value="Education">Education</option>
                                    <option value="Manufacturing">Manufacturing</option>
                                    <option value="Retail">Retail</option>
                                    <option value="Energy">Energy</option>
                                    <option value="Transportation">Transportation</option>
                                    <option value="Real Estate">Real Estate</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="size">Company Size</label>
                                <select id="size" name="size">
                                    <option value="">Select Size</option>
                                    <option value="STARTUP">Startup (1-10 employees)</option>
                                    <option value="SMALL">Small (11-50 employees)</option>
                                    <option value="MEDIUM">Medium (51-200 employees)</option>
                                    <option value="LARGE">Large (201-1000 employees)</option>
                                    <option value="ENTERPRISE">Enterprise (1000+ employees)</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="website">Website</label>
                                <input type="url" id="website" name="website" 
                                       placeholder="https://www.yourcompany.com">
                            </div>
                            <div class="form-group">
                                <label for="phone">Phone Number</label>
                                <input type="tel" id="phone" name="phone" 
                                       placeholder="+1 (555) 123-4567">
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="contactPerson">Contact Person</label>
                            <input type="text" id="contactPerson" name="contactPerson" 
                                   placeholder="Name of primary contact person">
                        </div>

                        <div class="form-group">
                            <label for="address">Address</label>
                            <textarea id="address" name="address" rows="3"
                                      placeholder="Company address..."></textarea>
                        </div>

                        <div class="form-actions">
                            <button type="button" class="btn-cancel" onclick="window.router.navigate('/')">
                                Cancel
                            </button>
                            <button type="submit" class="btn-submit" id="submitBtn">
                                Register Company
                            </button>
                        </div>
                    </form>

                    <div class="verification-notice">
                        <h3>📋 What happens next?</h3>
                        <ul>
                            <li>Your company registration will be reviewed by our team</li>
                            <li>Verification typically takes 1-2 business days</li>
                            <li>Once verified, you can start posting challenges</li>
                            <li>You'll receive an email notification when verification is complete</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }

    async afterRender() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        const form = document.getElementById('companyRegisterForm');
        form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        if (this.isSubmitting) return;
        
        const submitBtn = document.getElementById('submitBtn');
        const originalText = submitBtn.textContent;
        
        try {
            this.isSubmitting = true;
            submitBtn.textContent = 'Registering...';
            submitBtn.disabled = true;

            const formData = new FormData(e.target);
            const companyData = {
                name: formData.get('name'),
                description: formData.get('description') || null,
                email: formData.get('email'),
                phone: formData.get('phone') || null,
                website: formData.get('website') || null,
                industry: formData.get('industry') || null,
                size: formData.get('size') || null,
                address: formData.get('address') || null,
                contactPerson: formData.get('contactPerson') || null
            };

            const response = await apiClient.post('/api/companies', companyData);
            
            // Update user's company association in localStorage
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            currentUser.companyId = response.id;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            this.showSuccessMessage();
            
            setTimeout(() => {
                window.router.navigate('/company/dashboard');
            }, 3000);

        } catch (error) {
            console.error('Error registering company:', error);
            this.showErrorMessage(error.message || 'Failed to register company');
            
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            this.isSubmitting = false;
        }
    }

    showSuccessMessage() {
        const container = document.querySelector('.register-container');
        container.innerHTML = `
            <div class="success-message">
                <div class="success-icon">✅</div>
                <h2>Company Registered Successfully!</h2>
                <p>Thank you for registering your company with our platform.</p>
                <div class="next-steps">
                    <h3>Next Steps:</h3>
                    <ul>
                        <li>✅ Company registration submitted</li>
                        <li>⏳ Awaiting verification (1-2 business days)</li>
                        <li>📧 You'll receive an email when verified</li>
                        <li>🚀 Start posting challenges once verified</li>
                    </ul>
                </div>
                <p class="redirect-notice">Redirecting to your company dashboard...</p>
            </div>
        `;
    }

    showErrorMessage(message) {
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <strong>Error:</strong> ${message}
            <button class="close-error" onclick="this.parentElement.remove()">×</button>
        `;
        
        document.querySelector('.register-form').prepend(errorDiv);
    }
}

// CSS for company registration
const companyRegisterCSS = `
.company-register-page {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
}

.register-container {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    overflow: hidden;
}

.register-header {
    background: linear-gradient(135deg, #007bff, #0056b3);
    color: white;
    padding: 40px;
    text-align: center;
}

.register-header h1 {
    margin: 0 0 10px 0;
    font-size: 28px;
}

.register-header p {
    margin: 0;
    opacity: 0.9;
    font-size: 16px;
}

.register-form {
    padding: 40px;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 20px;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #2c3e50;
}

.form-group input,
.form-group textarea,
.form-group select {
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    font-family: inherit;
    transition: border-color 0.2s, box-shadow 0.2s;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
}

.form-actions {
    display: flex;
    gap: 15px;
    justify-content: flex-end;
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #e9ecef;
}

.btn-cancel {
    background: #6c757d;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    transition: background 0.2s;
}

.btn-cancel:hover {
    background: #5a6268;
}

.btn-submit {
    background: #28a745;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: background 0.2s;
}

.btn-submit:hover:not(:disabled) {
    background: #218838;
}

.btn-submit:disabled {
    background: #6c757d;
    cursor: not-allowed;
}

.verification-notice {
    background: #f8f9fa;
    padding: 30px 40px;
    border-top: 1px solid #e9ecef;
}

.verification-notice h3 {
    color: #2c3e50;
    margin-bottom: 15px;
}

.verification-notice ul {
    margin: 0;
    padding-left: 20px;
}

.verification-notice li {
    margin-bottom: 8px;
    line-height: 1.5;
    color: #495057;
}

.success-message {
    text-align: center;
    padding: 60px 40px;
}

.success-icon {
    font-size: 48px;
    margin-bottom: 20px;
}

.success-message h2 {
    color: #28a745;
    margin-bottom: 15px;
}

.success-message p {
    color: #6c757d;
    margin-bottom: 20px;
    line-height: 1.5;
}

.next-steps {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 8px;
    margin: 20px 0;
    text-align: left;
}

.next-steps h3 {
    color: #2c3e50;
    margin-bottom: 15px;
}

.next-steps ul {
    margin: 0;
    padding-left: 20px;
}

.next-steps li {
    margin-bottom: 8px;
    line-height: 1.5;
}

.redirect-notice {
    font-style: italic;
    color: #007bff;
    margin-top: 20px;
}

.error-message {
    background: #f8d7da;
    color: #721c24;
    padding: 12px 15px;
    border-radius: 4px;
    margin-bottom: 20px;
    border: 1px solid #f5c6cb;
    position: relative;
}

.close-error {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    color: #721c24;
}

@media (max-width: 768px) {
    .form-row {
        grid-template-columns: 1fr;
    }
    
    .form-actions {
        flex-direction: column;
    }
    
    .register-header {
        padding: 30px 20px;
    }
    
    .register-form {
        padding: 30px 20px;
    }
    
    .verification-notice {
        padding: 20px;
    }
}
`;

// Inject CSS
if (!document.getElementById('company-register-css')) {
    const style = document.createElement('style');
    style.id = 'company-register-css';
    style.textContent = companyRegisterCSS;
    document.head.appendChild(style);
}

export default (params) => {
    const page = new CompanyRegisterPage();
    return page.render().then(html => {
        setTimeout(() => page.afterRender(), 0);
        return html;
    });
};