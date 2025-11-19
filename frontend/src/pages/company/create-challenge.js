// API client is available as window.app.api

export class CreateChallengePage {
    constructor() {
        this.isSubmitting = false;
    }

    async render() {
        return `
            <div class="create-challenge-page">
                <div class="create-container">
                    <div class="create-header">
                        <button class="back-btn" onclick="window.app.router.navigate('/company/dashboard')">
                            ← Back to Dashboard
                        </button>
                        <h1>Create New Challenge</h1>
                        <p>Post a problem for the community to solve</p>
                    </div>

                    <form id="createChallengeForm" class="create-form">
                        <div class="form-section">
                            <h2>Challenge Details</h2>
                            
                            <div class="form-group">
                                <label for="title">Challenge Title *</label>
                                <input type="text" id="title" name="title" required 
                                       placeholder="e.g., Build a Real-time Chat Application">
                                <small>Choose a clear, descriptive title for your challenge</small>
                            </div>

                            <div class="form-group">
                                <label for="description">Problem Description *</label>
                                <textarea id="description" name="description" required rows="6"
                                          placeholder="Describe the problem you need solved in detail..."></textarea>
                                <small>Explain the problem, context, and what you're looking for</small>
                            </div>

                            <div class="form-group">
                                <label for="requirements">Requirements *</label>
                                <textarea id="requirements" name="requirements" required rows="6"
                                          placeholder="List specific requirements and constraints..."></textarea>
                                <small>Be specific about technical requirements, constraints, and deliverables</small>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="difficulty">Difficulty Level *</label>
                                    <select id="difficulty" name="difficulty" required>
                                        <option value="">Select Difficulty</option>
                                        <option value="BEGINNER">Beginner - Simple problems, basic concepts</option>
                                        <option value="INTERMEDIATE">Intermediate - Moderate complexity</option>
                                        <option value="EXPERT">Expert - Complex systems, advanced architecture</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="category">Category</label>
                                    <select id="category" name="category">
                                        <option value="">Select Category</option>
                                        <option value="Web Development">Web Development</option>
                                        <option value="Mobile Development">Mobile Development</option>
                                        <option value="Data Science">Data Science</option>
                                        <option value="Machine Learning">Machine Learning</option>
                                        <option value="DevOps">DevOps</option>
                                        <option value="UI/UX Design">UI/UX Design</option>
                                        <option value="Backend Development">Backend Development</option>
                                        <option value="Database Design">Database Design</option>
                                        <option value="Security">Security</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div class="form-section">
                            <h2>Reward & Timeline</h2>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="rewardAmount">Reward Amount</label>
                                    <input type="number" id="rewardAmount" name="rewardAmount" min="0" step="100"
                                           placeholder="e.g., 5000">
                                    <small>Monetary reward in USD (optional)</small>
                                </div>
                                <div class="form-group">
                                    <label for="submissionDeadline">Submission Deadline *</label>
                                    <input type="datetime-local" id="submissionDeadline" name="submissionDeadline" required>
                                    <small>When should submissions close?</small>
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="maxSubmissions">Maximum Submissions</label>
                                    <input type="number" id="maxSubmissions" name="maxSubmissions" min="1" 
                                           placeholder="e.g., 50">
                                    <small>Limit number of submissions (optional)</small>
                                </div>
                                <div class="form-group">
                                    <label for="tags">Tags</label>
                                    <input type="text" id="tags" name="tags" 
                                           placeholder="e.g., react, nodejs, api, websockets">
                                    <small>Comma-separated tags for better discovery</small>
                                </div>
                            </div>
                        </div>

                        <div class="form-section">
                            <h2>Evaluation</h2>
                            
                            <div class="form-group">
                                <label for="evaluationCriteria">Evaluation Criteria</label>
                                <textarea id="evaluationCriteria" name="evaluationCriteria" rows="4"
                                          placeholder="How will solutions be evaluated? e.g., Code quality (30%), Performance (30%), Innovation (20%), Documentation (20%)"></textarea>
                                <small>Help participants understand how their solutions will be judged</small>
                            </div>

                            <div class="form-group">
                                <label for="internalSolutionBrief">Internal Solution Brief *</label>
                                <textarea id="internalSolutionBrief" name="internalSolutionBrief" required rows="6"
                                          placeholder="Describe your internal solution approach, technologies, and key implementation details..."></textarea>
                                <small class="security-note">🔒 This will NOT be visible to participants - used only for fair evaluation</small>
                            </div>
                        </div>

                        <div class="form-actions">
                            <button type="button" class="btn-cancel" onclick="window.app.router.navigate('/company/dashboard')">
                                Cancel
                            </button>
                            <button type="submit" class="btn-submit" id="submitBtn">
                                Create Challenge
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }

    async afterRender() {
        this.setupEventListeners();
        this.setMinDeadline();
    }

    setupEventListeners() {
        const form = document.getElementById('createChallengeForm');
        form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    setMinDeadline() {
        // Set minimum deadline to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const minDateTime = tomorrow.toISOString().slice(0, 16);
        document.getElementById('submissionDeadline').min = minDateTime;
    }

    async handleSubmit(e) {
        e.preventDefault();

        if (this.isSubmitting) return;

        const submitBtn = document.getElementById('submitBtn');
        const originalText = submitBtn.textContent;

        try {
            this.isSubmitting = true;
            submitBtn.textContent = 'Creating Challenge...';
            submitBtn.disabled = true;

            const formData = new FormData(e.target);
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));

            if (!currentUser || !currentUser.companyId) {
                throw new Error('Company information not found. Please register your company first.');
            }

            const challengeData = {
                companyId: currentUser.companyId,
                title: formData.get('title'),
                description: formData.get('description'),
                requirements: formData.get('requirements'),
                difficulty: formData.get('difficulty'),
                category: formData.get('category') || null,
                rewardAmount: formData.get('rewardAmount') ? parseFloat(formData.get('rewardAmount')) : null,
                rewardCurrency: 'USD',
                submissionDeadline: formData.get('submissionDeadline'),
                maxSubmissions: formData.get('maxSubmissions') ? parseInt(formData.get('maxSubmissions')) : null,
                tags: formData.get('tags') || null,
                evaluationCriteria: formData.get('evaluationCriteria') || null
            };

            const internalSolutionBrief = formData.get('internalSolutionBrief');

            const response = await window.app.api.post('/challenges', {
                challenge: challengeData,
                internalSolutionBrief: internalSolutionBrief
            });

            this.showSuccessMessage();

            setTimeout(() => {
                window.app.router.navigate('/company/dashboard');
            }, 3000);

        } catch (error) {
            console.error('Error creating challenge:', error);
            
            let errorMessage = error.message || 'Failed to create challenge';
            
            // Provide specific guidance for common errors
            if (errorMessage.includes('Only verified companies can create challenges')) {
                errorMessage = `
                    <strong>Company Not Verified</strong><br>
                    Your company needs to be verified before creating challenges.<br><br>
                    <strong>To fix this:</strong><br>
                    1. Run the setup-verified-company.ps1 script<br>
                    2. Or contact support to verify your company<br>
                    3. Make sure you're logged in with the correct company ID
                `;
            } else if (errorMessage.includes('Company not found')) {
                errorMessage = `
                    <strong>Company Not Found</strong><br>
                    The company ID in your profile doesn't exist in the database.<br><br>
                    <strong>To fix this:</strong><br>
                    1. Register your company first<br>
                    2. Or run the setup-verified-company.ps1 script for testing<br>
                    3. Check that your company ID is correct: ${currentUser.companyId}
                `;
            }
            
            this.showErrorMessage(errorMessage);

            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            this.isSubmitting = false;
        }
    }

    showSuccessMessage() {
        const container = document.querySelector('.create-container');
        container.innerHTML = `
            <div class="success-message">
                <div class="success-icon">🎉</div>
                <h2>Challenge Created Successfully!</h2>
                <p>Your challenge has been posted and is now live for the community to see.</p>
                <div class="next-steps">
                    <h3>What's Next:</h3>
                    <ul>
                        <li>✅ Challenge is now visible to all users</li>
                        <li>📧 You'll receive notifications when solutions are submitted</li>
                        <li>⭐ Review and score submissions from your dashboard</li>
                        <li>🏆 Select the winning solution when ready</li>
                    </ul>
                </div>
                <p class="redirect-notice">Redirecting to your dashboard...</p>
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
            ${message}
            <button class="close-error" onclick="this.parentElement.remove()">×</button>
        `;

        document.querySelector('.create-form').prepend(errorDiv);
        
        // Scroll to error message
        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// CSS for create challenge page
const createChallengeCSS = `
.create-challenge-page {
    max-width: 900px;
    margin: 0 auto;
    padding: 20px;
}

.create-container {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    overflow: hidden;
}

.create-header {
    background: linear-gradient(135deg, #28a745, #20c997);
    color: white;
    padding: 30px 40px;
}

.back-btn {
    background: rgba(255,255,255,0.2);
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    margin-bottom: 20px;
    transition: background 0.2s;
}

.back-btn:hover {
    background: rgba(255,255,255,0.3);
}

.create-header h1 {
    margin: 0 0 10px 0;
    font-size: 28px;
}

.create-header p {
    margin: 0;
    opacity: 0.9;
    font-size: 16px;
}

.create-form {
    padding: 40px;
}

.form-section {
    margin-bottom: 40px;
    padding-bottom: 30px;
    border-bottom: 1px solid #e9ecef;
}

.form-section:last-of-type {
    border-bottom: none;
}

.form-section h2 {
    color: #2c3e50;
    margin-bottom: 20px;
    font-size: 20px;
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
    border-color: #28a745;
    box-shadow: 0 0 0 2px rgba(40,167,69,0.25);
}

.form-group small {
    display: block;
    margin-top: 5px;
    color: #6c757d;
    font-size: 12px;
}

.security-note {
    color: #28a745 !important;
    font-weight: 500;
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
    color: #28a745;
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
    
    .create-header {
        padding: 20px;
    }
    
    .create-form {
        padding: 20px;
    }
}
`;

// Inject CSS
if (!document.getElementById('create-challenge-css')) {
    const style = document.createElement('style');
    style.id = 'create-challenge-css';
    style.textContent = createChallengeCSS;
    document.head.appendChild(style);
}

export default (params) => {
    const page = new CreateChallengePage();
    return page.render().then(html => {
        setTimeout(() => page.afterRender(), 0);
        return html;
    });
};