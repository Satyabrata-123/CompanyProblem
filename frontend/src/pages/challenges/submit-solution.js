import { apiClient } from '../../services/api-client.js';

export class SubmitSolutionPage {
    constructor(challengeId) {
        this.challengeId = challengeId;
        this.challenge = null;
    }

    async render() {
        return `
            <div class="submit-solution-page">
                <div id="solutionContent">
                    <div class="loading">Loading challenge details...</div>
                </div>
            </div>
        `;
    }

    async afterRender() {
        await this.loadChallenge();
    }

    async loadChallenge() {
        try {
            const response = await apiClient.get(`/api/challenges/${this.challengeId}`);
            this.challenge = response.data;
            this.renderForm();
        } catch (error) {
            console.error('Error loading challenge:', error);
            document.getElementById('solutionContent').innerHTML = 
                '<div class="error">Failed to load challenge details</div>';
        }
    }

    renderForm() {
        const content = document.getElementById('solutionContent');
        const isDeadlinePassed = new Date(this.challenge.submissionDeadline) < new Date();
        
        if (isDeadlinePassed) {
            content.innerHTML = `
                <div class="deadline-passed-message">
                    <h2>Submission Deadline Passed</h2>
                    <p>The deadline for this challenge has passed. No new submissions are accepted.</p>
                    <button class="btn-back" onclick="window.router.navigate('/challenges/${this.challengeId}')">
                        Back to Challenge
                    </button>
                </div>
            `;
            return;
        }

        content.innerHTML = `
            <div class="submit-solution-header">
                <button class="back-btn" onclick="window.router.navigate('/challenges/${this.challengeId}')">
                    ← Back to Challenge
                </button>
                <h1>Submit Your Solution</h1>
                <div class="challenge-info">
                    <h2>${this.challenge.title}</h2>
                    <p>by ${this.challenge.companyName}</p>
                </div>
            </div>

            <div class="solution-form-container">
                <form id="solutionForm" class="solution-form">
                    <div class="form-group">
                        <label for="title">Solution Title *</label>
                        <input type="text" id="title" name="title" required 
                               placeholder="Give your solution a descriptive title">
                        <small>Choose a clear, descriptive title for your solution</small>
                    </div>

                    <div class="form-group">
                        <label for="description">Solution Description *</label>
                        <textarea id="description" name="description" required rows="6"
                                  placeholder="Describe your approach and how it solves the problem..."></textarea>
                        <small>Explain your solution approach, key features, and how it addresses the challenge requirements</small>
                    </div>

                    <div class="form-group">
                        <label for="implementation">Implementation Details</label>
                        <textarea id="implementation" name="implementation" rows="8"
                                  placeholder="Provide technical implementation details, architecture, algorithms used..."></textarea>
                        <small>Include technical details, architecture decisions, algorithms, and any special considerations</small>
                    </div>

                    <div class="form-group">
                        <label for="technologies">Technologies Used</label>
                        <input type="text" id="technologies" name="technologies"
                               placeholder="e.g., React, Node.js, MongoDB, Docker, AWS">
                        <small>List the main technologies, frameworks, and tools used in your solution</small>
                    </div>

                    <div class="form-group">
                        <label for="githubUrl">GitHub Repository URL</label>
                        <input type="url" id="githubUrl" name="githubUrl"
                               placeholder="https://github.com/username/repository">
                        <small>Link to your source code repository (recommended)</small>
                    </div>

                    <div class="form-group">
                        <label for="demoUrl">Demo/Live URL</label>
                        <input type="url" id="demoUrl" name="demoUrl"
                               placeholder="https://your-demo-site.com">
                        <small>Link to a live demo or deployed version of your solution</small>
                    </div>

                    <div class="form-actions">
                        <button type="button" class="btn-cancel" onclick="window.router.navigate('/challenges/${this.challengeId}')">
                            Cancel
                        </button>
                        <button type="submit" class="btn-submit" id="submitBtn">
                            Submit Solution
                        </button>
                    </div>
                </form>

                <div class="submission-guidelines">
                    <h3>Submission Guidelines</h3>
                    <ul>
                        <li><strong>Be Original:</strong> Submit your own work and ideas</li>
                        <li><strong>Address Requirements:</strong> Make sure your solution meets all stated requirements</li>
                        <li><strong>Provide Details:</strong> Include enough detail for evaluators to understand your approach</li>
                        <li><strong>Test Your Solution:</strong> Ensure your solution works as described</li>
                        <li><strong>One Submission:</strong> You can only submit one solution per challenge</li>
                    </ul>
                    
                    <div class="deadline-reminder">
                        <strong>Deadline:</strong> ${new Date(this.challenge.submissionDeadline).toLocaleDateString()} at ${new Date(this.challenge.submissionDeadline).toLocaleTimeString()}
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
    }

    setupEventListeners() {
        const form = document.getElementById('solutionForm');
        form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const submitBtn = document.getElementById('submitBtn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Submitting...';
        submitBtn.disabled = true;

        try {
            const formData = new FormData(e.target);
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            
            if (!currentUser) {
                throw new Error('Please log in to submit a solution');
            }

            const solutionData = {
                challengeId: this.challengeId,
                submittedBy: currentUser.id,
                title: formData.get('title'),
                description: formData.get('description'),
                implementation: formData.get('implementation') || null,
                technologies: formData.get('technologies') || null,
                githubUrl: formData.get('githubUrl') || null,
                demoUrl: formData.get('demoUrl') || null
            };

            const response = await apiClient.post('/api/solutions', solutionData);
            
            // Update challenge submission count
            await apiClient.put(`/api/challenges/${this.challengeId}/increment-submissions`);
            
            // Show success message and redirect
            this.showSuccessMessage();
            
            setTimeout(() => {
                window.router.navigate(`/challenges/${this.challengeId}`);
            }, 2000);

        } catch (error) {
            console.error('Error submitting solution:', error);
            this.showErrorMessage(error.message || 'Failed to submit solution');
            
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    showSuccessMessage() {
        const content = document.getElementById('solutionContent');
        content.innerHTML = `
            <div class="success-message">
                <div class="success-icon">✅</div>
                <h2>Solution Submitted Successfully!</h2>
                <p>Your solution has been submitted and is now under review.</p>
                <p>You will be notified when the evaluation is complete.</p>
                <div class="success-actions">
                    <button class="btn-primary" onclick="window.router.navigate('/challenges/${this.challengeId}')">
                        View Challenge
                    </button>
                    <button class="btn-secondary" onclick="window.router.navigate('/challenges')">
                        Browse More Challenges
                    </button>
                </div>
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
        
        document.querySelector('.solution-form-container').prepend(errorDiv);
    }
}

// CSS for submit solution page
const submitSolutionCSS = `
.submit-solution-page {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
}

.back-btn {
    background: none;
    border: none;
    color: #007bff;
    cursor: pointer;
    font-size: 16px;
    margin-bottom: 20px;
    padding: 8px 0;
}

.back-btn:hover {
    text-decoration: underline;
}

.submit-solution-header {
    margin-bottom: 30px;
}

.submit-solution-header h1 {
    color: #2c3e50;
    margin-bottom: 15px;
}

.challenge-info h2 {
    color: #495057;
    margin-bottom: 5px;
}

.challenge-info p {
    color: #6c757d;
    font-style: italic;
}

.solution-form-container {
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 30px;
}

.solution-form {
    background: white;
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.form-group {
    margin-bottom: 25px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #2c3e50;
}

.form-group input,
.form-group textarea {
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    font-family: inherit;
    transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
}

.form-group small {
    display: block;
    margin-top: 5px;
    color: #6c757d;
    font-size: 12px;
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

.submission-guidelines {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 8px;
    border-left: 4px solid #007bff;
}

.submission-guidelines h3 {
    color: #2c3e50;
    margin-bottom: 15px;
}

.submission-guidelines ul {
    margin-bottom: 20px;
    padding-left: 20px;
}

.submission-guidelines li {
    margin-bottom: 8px;
    line-height: 1.5;
}

.deadline-reminder {
    background: #fff3cd;
    padding: 12px;
    border-radius: 4px;
    border-left: 4px solid #ffc107;
    color: #856404;
}

.success-message {
    text-align: center;
    padding: 60px 40px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
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
    margin-bottom: 10px;
    line-height: 1.5;
}

.success-actions {
    margin-top: 30px;
    display: flex;
    gap: 15px;
    justify-content: center;
}

.btn-primary {
    background: #007bff;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 6px;
    cursor: pointer;
    text-decoration: none;
    display: inline-block;
}

.btn-secondary {
    background: #6c757d;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 6px;
    cursor: pointer;
    text-decoration: none;
    display: inline-block;
}

.deadline-passed-message {
    text-align: center;
    padding: 60px 40px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.deadline-passed-message h2 {
    color: #dc3545;
    margin-bottom: 15px;
}

.btn-back {
    background: #007bff;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 6px;
    cursor: pointer;
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
    .solution-form-container {
        grid-template-columns: 1fr;
    }
    
    .form-actions {
        flex-direction: column;
    }
    
    .success-actions {
        flex-direction: column;
    }
}
`;

// Inject CSS
if (!document.getElementById('submit-solution-css')) {
    const style = document.createElement('style');
    style.id = 'submit-solution-css';
    style.textContent = submitSolutionCSS;
    document.head.appendChild(style);
}