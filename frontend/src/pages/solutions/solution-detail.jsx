// API client is available as window.app.api

export class SolutionDetailPage {
    constructor(solutionId) {
        this.solutionId = solutionId;
        this.solution = null;
        this.challenge = null;
    }

    async render() {
        return `
            <div class="solution-detail-page">
                <div id="solutionContent">
                    <div class="loading">Loading solution details...</div>
                </div>
            </div>
        `;
    }

    async afterRender() {
        await this.loadSolution();
    }

    async loadSolution() {
        try {
            const response = await window.app.api.get(`/solutions/${this.solutionId}`);
            this.solution = response.data;
            
            // Load challenge details
            const challengeResponse = await window.app.api.get(`/challenges/${this.solution.challengeId}`);
            this.challenge = challengeResponse.data;
            
            this.renderSolution();
        } catch (error) {
            console.error('Error loading solution:', error);
            document.getElementById('solutionContent').innerHTML = 
                '<div class="error">Failed to load solution details</div>';
        }
    }

    renderSolution() {
        const content = document.getElementById('solutionContent');
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const isOwner = currentUser && currentUser.id === this.solution.submittedBy;
        
        content.innerHTML = `
            <div class="solution-header">
                <button class="back-btn" onclick="window.app.router.navigate('/challenges/${this.solution.challengeId}')">
                    ← Back to Challenge
                </button>
                
                <div class="solution-title-section">
                    <div class="status-badge status-${this.solution.status.toLowerCase()}">
                        ${this.solution.status.replace('_', ' ')}
                    </div>
                    <h1>${this.solution.title}</h1>
                    <p class="challenge-reference">
                        Solution for: <a href="#/challenges/${this.challenge.id}">${this.challenge.title}</a>
                    </p>
                </div>
            </div>

            <div class="solution-content">
                <div class="main-content">
                    <div class="solution-section">
                        <h2>Solution Overview</h2>
                        <div class="description-content">
                            ${this.solution.description.replace(/\n/g, '<br>')}
                        </div>
                    </div>

                    ${this.solution.implementation ? `
                        <div class="solution-section">
                            <h2>Implementation Details</h2>
                            <div class="implementation-content">
                                ${this.solution.implementation.replace(/\n/g, '<br>')}
                            </div>
                        </div>
                    ` : ''}

                    ${this.solution.technologies ? `
                        <div class="solution-section">
                            <h2>Technologies Used</h2>
                            <div class="technologies-list">
                                ${this.solution.technologies.split(',').map(tech => 
                                    `<span class="tech-badge">${tech.trim()}</span>`
                                ).join('')}
                            </div>
                        </div>
                    ` : ''}

                    ${this.solution.githubUrl || this.solution.demoUrl ? `
                        <div class="solution-section">
                            <h2>Links & Resources</h2>
                            <div class="solution-links">
                                ${this.solution.githubUrl ? `
                                    <a href="${this.solution.githubUrl}" target="_blank" class="resource-link github">
                                        <span class="icon">📁</span>
                                        <span class="link-text">
                                            <strong>GitHub Repository</strong>
                                            <small>${this.solution.githubUrl}</small>
                                        </span>
                                    </a>
                                ` : ''}
                                ${this.solution.demoUrl ? `
                                    <a href="${this.solution.demoUrl}" target="_blank" class="resource-link demo">
                                        <span class="icon">🚀</span>
                                        <span class="link-text">
                                            <strong>Live Demo</strong>
                                            <small>${this.solution.demoUrl}</small>
                                        </span>
                                    </a>
                                ` : ''}
                            </div>
                        </div>
                    ` : ''}

                    ${this.solution.feedback ? `
                        <div class="solution-section feedback-section">
                            <h2>Evaluation Feedback</h2>
                            <div class="feedback-content">
                                ${this.solution.feedback.replace(/\n/g, '<br>')}
                            </div>
                        </div>
                    ` : ''}
                </div>

                <div class="sidebar">
                    <div class="solution-info-card">
                        <h3>Solution Info</h3>
                        
                        ${this.solution.score ? `
                            <div class="score-display">
                                <div class="score-value">${this.solution.score}</div>
                                <div class="score-label">Score</div>
                            </div>
                        ` : ''}
                        
                        <div class="info-item">
                            <label>Status:</label>
                            <span class="status-${this.solution.status.toLowerCase()}">
                                ${this.solution.status.replace('_', ' ')}
                            </span>
                        </div>
                        
                        <div class="info-item">
                            <label>Votes:</label>
                            <span>👍 ${this.solution.voteCount || 0}</span>
                        </div>
                        
                        <div class="info-item">
                            <label>Submitted:</label>
                            <span>${new Date(this.solution.createdAt).toLocaleDateString()}</span>
                        </div>
                        
                        ${this.solution.updatedAt !== this.solution.createdAt ? `
                            <div class="info-item">
                                <label>Last Updated:</label>
                                <span>${new Date(this.solution.updatedAt).toLocaleDateString()}</span>
                            </div>
                        ` : ''}
                    </div>

                    ${!isOwner && currentUser ? `
                        <div class="voting-section">
                            <button class="btn-vote" id="voteBtn">
                                👍 Vote for this Solution
                            </button>
                        </div>
                    ` : ''}

                    <div class="challenge-info-card">
                        <h3>Challenge Details</h3>
                        <h4>${this.challenge.title}</h4>
                        <p class="company-name">by ${this.challenge.companyName}</p>
                        <div class="challenge-meta">
                            <span class="difficulty-badge ${this.challenge.difficulty.toLowerCase()}">
                                ${this.challenge.difficulty}
                            </span>
                            ${this.challenge.rewardAmount ? `
                                <span class="reward">$${this.challenge.rewardAmount}</span>
                            ` : ''}
                        </div>
                        <button class="btn-view-challenge" onclick="window.app.router.navigate('/challenges/${this.challenge.id}')">
                            View Challenge
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
    }

    setupEventListeners() {
        const voteBtn = document.getElementById('voteBtn');
        if (voteBtn) {
            voteBtn.addEventListener('click', () => this.handleVote());
        }
    }

    async handleVote() {
        try {
            await window.app.api.put(`/solutions/${this.solutionId}/vote-count?change=1`);
            this.solution.voteCount = (this.solution.voteCount || 0) + 1;
            
            // Update the display
            const voteDisplay = document.querySelector('.info-item span:contains("👍")');
            if (voteDisplay) {
                voteDisplay.textContent = `👍 ${this.solution.voteCount}`;
            }
            
            // Disable vote button
            const voteBtn = document.getElementById('voteBtn');
            if (voteBtn) {
                voteBtn.disabled = true;
                voteBtn.textContent = '✓ Voted';
            }
        } catch (error) {
            console.error('Error voting:', error);
            alert('Failed to vote. Please try again.');
        }
    }
}

// CSS for solution detail
const solutionDetailCSS = `
.solution-detail-page {
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

.solution-title-section {
    margin-bottom: 30px;
}

.solution-title-section h1 {
    margin: 10px 0;
    color: #2c3e50;
}

.challenge-reference {
    color: #6c757d;
    font-size: 16px;
}

.challenge-reference a {
    color: #007bff;
    text-decoration: none;
}

.challenge-reference a:hover {
    text-decoration: underline;
}

.solution-content {
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 30px;
}

.solution-section {
    margin-bottom: 30px;
    padding: 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.solution-section h2 {
    color: #2c3e50;
    margin-bottom: 15px;
    border-bottom: 2px solid #e9ecef;
    padding-bottom: 10px;
}

.description-content, .implementation-content {
    line-height: 1.6;
    color: #495057;
}

.technologies-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.tech-badge {
    background: #e7f3ff;
    color: #007bff;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 500;
}

.solution-links {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.resource-link {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 8px;
    text-decoration: none;
    color: #2c3e50;
    transition: background 0.2s;
}

.resource-link:hover {
    background: #e9ecef;
}

.resource-link .icon {
    font-size: 24px;
}

.resource-link .link-text {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.resource-link strong {
    color: #2c3e50;
}

.resource-link small {
    color: #6c757d;
    font-size: 12px;
    word-break: break-all;
}

.feedback-section {
    background: #fff3cd;
    border-left: 4px solid #ffc107;
}

.feedback-content {
    color: #856404;
    line-height: 1.6;
}

.solution-info-card, .challenge-info-card {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    margin-bottom: 20px;
}

.solution-info-card h3, .challenge-info-card h3 {
    margin-bottom: 15px;
    color: #2c3e50;
}

.score-display {
    text-align: center;
    padding: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 8px;
    margin-bottom: 15px;
}

.score-value {
    font-size: 48px;
    font-weight: bold;
    color: white;
}

.score-label {
    color: white;
    opacity: 0.9;
    font-size: 14px;
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

.status-submitted { color: #6c757d; }
.status-under_review { color: #ffc107; }
.status-accepted { color: #28a745; }
.status-rejected { color: #dc3545; }
.status-winner { color: #ff6b35; font-weight: bold; }

.voting-section {
    margin-bottom: 20px;
}

.btn-vote {
    width: 100%;
    background: #28a745;
    color: white;
    border: none;
    padding: 12px;
    border-radius: 6px;
    font-size: 16px;
    cursor: pointer;
    transition: background 0.2s;
}

.btn-vote:hover:not(:disabled) {
    background: #218838;
}

.btn-vote:disabled {
    background: #6c757d;
    cursor: not-allowed;
}

.challenge-info-card h4 {
    color: #2c3e50;
    margin-bottom: 5px;
}

.company-name {
    color: #6c757d;
    font-style: italic;
    margin-bottom: 15px;
}

.challenge-meta {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-bottom: 15px;
}

.difficulty-badge {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
}

.difficulty-badge.beginner {
    background: #d4edda;
    color: #155724;
}

.difficulty-badge.intermediate {
    background: #fff3cd;
    color: #856404;
}

.difficulty-badge.expert {
    background: #f8d7da;
    color: #721c24;
}

.reward {
    color: #28a745;
    font-weight: 600;
}

.btn-view-challenge {
    width: 100%;
    background: #007bff;
    color: white;
    border: none;
    padding: 10px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
}

.btn-view-challenge:hover {
    background: #0056b3;
}

@media (max-width: 768px) {
    .solution-content {
        grid-template-columns: 1fr;
    }
}
`;

// Inject CSS
if (!document.getElementById('solution-detail-css')) {
    const style = document.createElement('style');
    style.id = 'solution-detail-css';
    style.textContent = solutionDetailCSS;
    document.head.appendChild(style);
}

export default (params) => {
    const page = new SolutionDetailPage(params.id);
    return page.render().then(html => {
        setTimeout(() => page.afterRender(), 0);
        return html;
    });
};