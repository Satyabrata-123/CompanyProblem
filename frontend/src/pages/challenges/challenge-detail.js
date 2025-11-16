// API client is available as window.app.api

export class ChallengeDetailPage {
    constructor(challengeId) {
        this.challengeId = challengeId;
        this.challenge = null;
        this.solutions = [];
        this.userSolution = null;
    }

    async render() {
        return `
            <div class="challenge-detail-page">
                <div id="challengeContent">
                    <div class="loading">Loading challenge details...</div>
                </div>
            </div>
        `;
    }

    async afterRender() {
        await this.loadChallenge();
        await this.loadSolutions();
    }

    async loadChallenge() {
        try {
            const response = await window.app.api.get(`/challenges/${this.challengeId}`);
            this.challenge = response.data;
            this.renderChallenge();
        } catch (error) {
            console.error('Error loading challenge:', error);
            document.getElementById('challengeContent').innerHTML = 
                '<div class="error">Failed to load challenge details</div>';
        }
    }

    async loadSolutions() {
        try {
            const response = await window.app.api.get(`/solutions/challenge/${this.challengeId}`);
            this.solutions = response.data;
            
            // Check if current user has submitted a solution
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (currentUser) {
                this.userSolution = this.solutions.find(s => s.submittedBy === currentUser.id);
            }
            
            this.renderSolutions();
        } catch (error) {
            console.error('Error loading solutions:', error);
        }
    }

    renderChallenge() {
        const content = document.getElementById('challengeContent');
        const isDeadlinePassed = new Date(this.challenge.submissionDeadline) < new Date();
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        content.innerHTML = `
            <div class="challenge-header">
                <button class="back-btn" onclick="window.app.router.navigate('/challenges')">
                    ← Back to Challenges
                </button>
                
                <div class="challenge-title-section">
                    <div class="difficulty-badge ${this.challenge.difficulty.toLowerCase()}">
                        ${this.challenge.difficulty}
                    </div>
                    <h1>${this.challenge.title}</h1>
                    <p class="company-info">
                        Challenge by <strong>${this.challenge.companyName}</strong>
                    </p>
                </div>
            </div>

            <div class="challenge-content">
                <div class="main-content">
                    <div class="challenge-section">
                        <h2>Problem Description</h2>
                        <div class="description-content">
                            ${this.challenge.description.replace(/\n/g, '<br>')}
                        </div>
                    </div>

                    <div class="challenge-section">
                        <h2>Requirements</h2>
                        <div class="requirements-content">
                            ${this.challenge.requirements.replace(/\n/g, '<br>')}
                        </div>
                    </div>

                    ${this.challenge.evaluationCriteria ? `
                        <div class="challenge-section">
                            <h2>Evaluation Criteria</h2>
                            <div class="criteria-content">
                                ${this.challenge.evaluationCriteria.replace(/\n/g, '<br>')}
                            </div>
                        </div>
                    ` : ''}

                    <div class="challenge-section">
                        <h2>Submission Guidelines</h2>
                        <ul class="guidelines">
                            <li>Provide a clear title and description of your solution</li>
                            <li>Include implementation details and technologies used</li>
                            <li>Add GitHub repository link if available</li>
                            <li>Include demo URL if your solution is deployed</li>
                            <li>Make sure your solution addresses all requirements</li>
                        </ul>
                    </div>
                </div>

                <div class="sidebar">
                    <div class="challenge-info-card">
                        <h3>Challenge Info</h3>
                        <div class="info-item">
                            <label>Reward:</label>
                            <span class="reward">
                                ${this.challenge.rewardAmount ? `$${this.challenge.rewardAmount} ${this.challenge.rewardCurrency}` : 'No monetary reward'}
                            </span>
                        </div>
                        <div class="info-item">
                            <label>Category:</label>
                            <span>${this.challenge.category || 'General'}</span>
                        </div>
                        <div class="info-item">
                            <label>Submissions:</label>
                            <span>${this.challenge.currentSubmissions}/${this.challenge.maxSubmissions || '∞'}</span>
                        </div>
                        <div class="info-item">
                            <label>Deadline:</label>
                            <span class="${isDeadlinePassed ? 'deadline-passed' : ''}">
                                ${new Date(this.challenge.submissionDeadline).toLocaleDateString()}
                            </span>
                        </div>
                        <div class="info-item">
                            <label>Status:</label>
                            <span class="status ${isDeadlinePassed ? 'closed' : 'open'}">
                                ${isDeadlinePassed ? 'Closed' : 'Open for Submissions'}
                            </span>
                        </div>
                    </div>

                    ${currentUser && !isDeadlinePassed && !this.userSolution ? `
                        <button class="btn-submit-solution" id="submitSolutionBtn">
                            Submit Your Solution
                        </button>
                    ` : ''}

                    ${this.userSolution ? `
                        <div class="user-solution-status">
                            <h4>Your Submission</h4>
                            <p><strong>${this.userSolution.title}</strong></p>
                            <p class="status">Status: ${this.userSolution.status}</p>
                            ${this.userSolution.score ? `<p class="score">Score: ${this.userSolution.score}/100</p>` : ''}
                        </div>
                    ` : ''}
                </div>
            </div>

            <div class="solutions-section" id="solutionsSection">
                <h2>Submitted Solutions (${this.solutions.length})</h2>
                <div id="solutionsList">
                    <div class="loading">Loading solutions...</div>
                </div>
            </div>
        `;

        this.setupEventListeners();
    }

    renderSolutions() {
        const solutionsList = document.getElementById('solutionsList');
        
        if (this.solutions.length === 0) {
            solutionsList.innerHTML = '<div class="no-solutions">No solutions submitted yet</div>';
            return;
        }

        // Sort solutions by score (if available) then by votes
        const sortedSolutions = [...this.solutions].sort((a, b) => {
            if (a.score && b.score) return b.score - a.score;
            return (b.voteCount || 0) - (a.voteCount || 0);
        });

        solutionsList.innerHTML = sortedSolutions.map((solution, index) => `
            <div class="solution-card" data-solution-id="${solution.id}">
                <div class="solution-header">
                    <div class="solution-rank">#${index + 1}</div>
                    <div class="solution-meta">
                        ${solution.score ? `<span class="score">Score: ${solution.score}</span>` : ''}
                        <span class="votes">👍 ${solution.voteCount || 0}</span>
                        <span class="status status-${solution.status.toLowerCase()}">${solution.status}</span>
                    </div>
                </div>
                
                <h4>${solution.title}</h4>
                <p class="solution-description">${this.truncateText(solution.description, 200)}</p>
                
                ${solution.technologies ? `
                    <div class="technologies">
                        <strong>Technologies:</strong> ${solution.technologies}
                    </div>
                ` : ''}
                
                <div class="solution-links">
                    ${solution.githubUrl ? `<a href="${solution.githubUrl}" target="_blank" class="link-btn">GitHub</a>` : ''}
                    ${solution.demoUrl ? `<a href="${solution.demoUrl}" target="_blank" class="link-btn">Demo</a>` : ''}
                </div>
                
                <div class="solution-footer">
                    <span class="submitted-date">
                        Submitted ${new Date(solution.createdAt).toLocaleDateString()}
                    </span>
                    <button class="btn-view-solution" data-solution-id="${solution.id}">
                        View Details
                    </button>
                </div>
            </div>
        `).join('');
    }

    setupEventListeners() {
        // Submit solution button
        const submitBtn = document.getElementById('submitSolutionBtn');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => {
                window.app.router.navigate(`/challenges/${this.challengeId}/submit`);
            });
        }

        // View solution details
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-view-solution')) {
                const solutionId = e.target.dataset.solutionId;
                window.app.router.navigate(`/solutions/${solutionId}`);
            }
        });
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
}

// CSS for challenge detail
const challengeDetailCSS = `
.challenge-detail-page {
    max-width: 1200px;
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

.challenge-title-section {
    margin-bottom: 30px;
}

.challenge-title-section h1 {
    margin: 10px 0;
    color: #2c3e50;
}

.company-info {
    color: #6c757d;
    font-size: 16px;
}

.challenge-content {
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 30px;
    margin-bottom: 40px;
}

.challenge-section {
    margin-bottom: 30px;
    padding: 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.challenge-section h2 {
    color: #2c3e50;
    margin-bottom: 15px;
    border-bottom: 2px solid #e9ecef;
    padding-bottom: 10px;
}

.description-content, .requirements-content, .criteria-content {
    line-height: 1.6;
    color: #495057;
}

.guidelines {
    padding-left: 20px;
}

.guidelines li {
    margin-bottom: 8px;
    line-height: 1.5;
}

.challenge-info-card {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    margin-bottom: 20px;
}

.challenge-info-card h3 {
    margin-bottom: 15px;
    color: #2c3e50;
}

.info-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid #f8f9fa;
}

.info-item label {
    font-weight: 500;
    color: #6c757d;
}

.reward {
    color: #28a745;
    font-weight: 600;
}

.deadline-passed {
    color: #dc3545;
}

.status.open {
    color: #28a745;
}

.status.closed {
    color: #dc3545;
}

.btn-submit-solution {
    width: 100%;
    background: #28a745;
    color: white;
    border: none;
    padding: 12px;
    border-radius: 6px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
}

.btn-submit-solution:hover {
    background: #218838;
}

.user-solution-status {
    background: #e7f3ff;
    padding: 15px;
    border-radius: 6px;
    border-left: 4px solid #007bff;
}

.user-solution-status h4 {
    margin-bottom: 10px;
    color: #2c3e50;
}

.solutions-section {
    margin-top: 40px;
}

.solutions-section h2 {
    margin-bottom: 20px;
    color: #2c3e50;
}

.solution-card {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    margin-bottom: 15px;
}

.solution-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.solution-rank {
    background: #007bff;
    color: white;
    padding: 4px 12px;
    border-radius: 20px;
    font-weight: 600;
    font-size: 14px;
}

.solution-meta {
    display: flex;
    gap: 15px;
    align-items: center;
}

.score {
    background: #28a745;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
}

.votes {
    font-size: 14px;
}

.status-submitted { color: #6c757d; }
.status-under_review { color: #ffc107; }
.status-accepted { color: #28a745; }
.status-rejected { color: #dc3545; }
.status-winner { color: #ff6b35; font-weight: bold; }

.solution-card h4 {
    margin-bottom: 10px;
    color: #2c3e50;
}

.solution-description {
    color: #495057;
    line-height: 1.5;
    margin-bottom: 15px;
}

.technologies {
    margin-bottom: 15px;
    font-size: 14px;
    color: #6c757d;
}

.solution-links {
    margin-bottom: 15px;
}

.link-btn {
    display: inline-block;
    background: #6c757d;
    color: white;
    padding: 6px 12px;
    border-radius: 4px;
    text-decoration: none;
    font-size: 12px;
    margin-right: 8px;
}

.link-btn:hover {
    background: #5a6268;
}

.solution-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 15px;
    border-top: 1px solid #e9ecef;
}

.submitted-date {
    font-size: 14px;
    color: #6c757d;
}

.btn-view-solution {
    background: #007bff;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
}

.btn-view-solution:hover {
    background: #0056b3;
}

@media (max-width: 768px) {
    .challenge-content {
        grid-template-columns: 1fr;
    }
    
    .solution-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
    }
    
    .solution-meta {
        flex-wrap: wrap;
    }
}
`;

// Inject CSS
if (!document.getElementById('challenge-detail-css')) {
    const style = document.createElement('style');
    style.id = 'challenge-detail-css';
    style.textContent = challengeDetailCSS;
    document.head.appendChild(style);
}

export default (params) => {
    const page = new ChallengeDetailPage(params.id);
    return page.render().then(html => {
        setTimeout(() => page.afterRender(), 0);
        return html;
    });
};
