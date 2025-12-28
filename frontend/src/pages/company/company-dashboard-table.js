// Company Dashboard with Table Layout - Challenges organized by difficulty

export class CompanyDashboardTablePage {
    constructor() {
        this.company = null;
        this.challenges = [];
    }

    async render() {
        return `
            <div class="company-dashboard-table">
                <div id="dashboardContent">
                    <div class="loading">Loading dashboard...</div>
                </div>
            </div>
        `;
    }

    async afterRender() {
        await this.loadCompanyData();
    }

    async loadCompanyData() {
        try {
            // Load all companies first
            const allCompanies = await window.app.api.getAllCompanies();
            const activeCompanies = allCompanies.filter(c => c.isActive && c.isVerified);
            
            // Check if user has a selected company in localStorage
            let selectedCompanyId = localStorage.getItem('selectedCompanyId');
            
            // If no company selected, show company selector
            if (!selectedCompanyId && activeCompanies.length > 0) {
                this.renderCompanySelector(activeCompanies);
                return;
            }
            
            if (!selectedCompanyId) {
                this.renderNoCompany();
                return;
            }

            // Load company details
            const companyResponse = await window.app.api.get(`/companies/${selectedCompanyId}`);
            this.company = companyResponse.data || companyResponse;

            // Load company challenges
            const challengesResponse = await window.app.api.get(`/challenges/company/${selectedCompanyId}`);
            this.challenges = challengesResponse.data || challengesResponse || [];

            this.renderDashboard();
            this.setupGlobalFunctions();
        } catch (error) {
            console.error('Error loading company data:', error);
            document.getElementById('dashboardContent').innerHTML = 
                '<div class="error">Failed to load company dashboard. Please check if services are running.</div>';
        }
    }

    setupGlobalFunctions() {
        // Make submitIdeaForChallenge available globally for onclick handlers
        window.submitIdeaForChallenge = (challengeId, difficulty, title) => {
            this.submitIdeaForChallenge(challengeId, difficulty, title);
        };
    }

    renderNoCompany() {
        document.getElementById('dashboardContent').innerHTML = `
            <div class="no-company-message">
                <h2>Company Registration Required</h2>
                <p>To post challenges and manage your company profile, you need to register your company first.</p>
                <button class="btn-primary" onclick="window.app.router.navigate('/company/register')">
                    Register Company
                </button>
            </div>
        `;
    }

    renderCompanySelector(companies) {
        document.getElementById('dashboardContent').innerHTML = `
            <div class="company-selector-container">
                <div class="selector-card">
                    <h2>Select Company to Manage</h2>
                    <p>Choose which company dashboard you want to access</p>
                    
                    <div class="company-select-wrapper">
                        <label for="companySelect">Select Company:</label>
                        <select id="companySelect" class="company-dropdown">
                            <option value="">-- Select a company --</option>
                            ${companies.map(company => `
                                <option value="${company.id}">
                                    ${company.name} - ${company.industry}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <button class="btn-primary" id="selectCompanyBtn" disabled>
                        Access Dashboard
                    </button>
                    
                    <div class="or-divider">
                        <span>OR</span>
                    </div>
                    
                    <button class="btn-secondary" onclick="window.app.router.navigate('/company/register')">
                        Register New Company
                    </button>
                </div>
            </div>
            
            <style>
                .company-selector-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 60vh;
                    padding: 2rem;
                }
                
                .selector-card {
                    background: white;
                    border-radius: 12px;
                    padding: 3rem;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    max-width: 500px;
                    width: 100%;
                    text-align: center;
                }
                
                .selector-card h2 {
                    font-size: 1.75rem;
                    margin-bottom: 0.5rem;
                    color: #1f2937;
                }
                
                .selector-card p {
                    color: #6b7280;
                    margin-bottom: 2rem;
                }
                
                .company-select-wrapper {
                    margin-bottom: 1.5rem;
                    text-align: left;
                }
                
                .company-select-wrapper label {
                    display: block;
                    font-weight: 500;
                    margin-bottom: 0.5rem;
                    color: #374151;
                }
                
                .company-dropdown {
                    width: 100%;
                    padding: 0.75rem;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                    font-size: 1rem;
                    background: white;
                }
                
                .company-dropdown:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }
                
                .or-divider {
                    margin: 1.5rem 0;
                    position: relative;
                }
                
                .or-divider::before {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 0;
                    right: 0;
                    height: 1px;
                    background: #e5e7eb;
                }
                
                .or-divider span {
                    position: relative;
                    background: white;
                    padding: 0 1rem;
                    color: #9ca3af;
                    font-size: 0.875rem;
                }
            </style>
        `;
        
        // Setup event listeners
        const companySelect = document.getElementById('companySelect');
        const selectBtn = document.getElementById('selectCompanyBtn');
        
        companySelect.addEventListener('change', () => {
            selectBtn.disabled = !companySelect.value;
        });
        
        selectBtn.addEventListener('click', () => {
            const selectedCompanyId = companySelect.value;
            if (selectedCompanyId) {
                localStorage.setItem('selectedCompanyId', selectedCompanyId);
                this.loadCompanyData();
            }
        });
    }

    renderDashboard() {
        const content = document.getElementById('dashboardContent');
        
        if (!this.company || !this.company.name) {
            content.innerHTML = '<div class="error">Company data not available.</div>';
            return;
        }

        if (!Array.isArray(this.challenges)) {
            this.challenges = [];
        }

        // Separate challenges by difficulty (max 10 each)
        const beginnerChallenges = this.challenges.filter(c => c.difficulty === 'BEGINNER').slice(0, 10);
        const intermediateChallenges = this.challenges.filter(c => c.difficulty === 'INTERMEDIATE').slice(0, 10);
        const expertChallenges = this.challenges.filter(c => c.difficulty === 'EXPERT').slice(0, 10);
        
        content.innerHTML = `
            <div class="dashboard-header">
                <div class="header-left">
                    <h1>${this.company.name} - Challenge Dashboard</h1>
                    <button class="btn-switch-company" onclick="localStorage.removeItem('selectedCompanyId'); window.location.reload();">
                        🔄 Switch Company
                    </button>
                </div>
                <button class="btn-create" onclick="window.app.router.navigate('/company/challenges/create')">
                    ➕ Create New Challenge
                </button>
            </div>

            <div class="stats-row">
                <div class="stat-box total">
                    <div class="stat-number">${this.challenges.length}</div>
                    <div class="stat-label">Total</div>
                </div>
                <div class="stat-box beginner">
                    <div class="stat-number">${beginnerChallenges.length}</div>
                    <div class="stat-label">🟢 Beginner</div>
                </div>
                <div class="stat-box intermediate">
                    <div class="stat-number">${intermediateChallenges.length}</div>
                    <div class="stat-label">🟡 Intermediate</div>
                </div>
                <div class="stat-box expert">
                    <div class="stat-number">${expertChallenges.length}</div>
                    <div class="stat-label">🔴 Expert</div>
                </div>
            </div>

            <div class="challenges-table">
                <!-- Beginner Column -->
                <div class="difficulty-column beginner-column">
                    <div class="column-header beginner-bg">
                        <span class="icon">🟢</span>
                        <h3>BEGINNER</h3>
                        <span class="count">${beginnerChallenges.length}/10</span>
                    </div>
                    <div class="column-body">
                        ${this.renderChallengeColumn(beginnerChallenges, 'BEGINNER')}
                    </div>
                </div>

                <!-- Intermediate Column -->
                <div class="difficulty-column intermediate-column">
                    <div class="column-header intermediate-bg">
                        <span class="icon">🟡</span>
                        <h3>INTERMEDIATE</h3>
                        <span class="count">${intermediateChallenges.length}/10</span>
                    </div>
                    <div class="column-body">
                        ${this.renderChallengeColumn(intermediateChallenges, 'INTERMEDIATE')}
                    </div>
                </div>

                <!-- Expert Column -->
                <div class="difficulty-column expert-column">
                    <div class="column-header expert-bg">
                        <span class="icon">🔴</span>
                        <h3>EXPERT</h3>
                        <span class="count">${expertChallenges.length}/10</span>
                    </div>
                    <div class="column-body">
                        ${this.renderChallengeColumn(expertChallenges, 'EXPERT')}
                    </div>
                </div>
            </div>
        `;
    }

    renderChallengeColumn(challenges, difficulty) {
        if (challenges.length === 0) {
            return `
                <div class="empty-column">
                    <p>No ${difficulty.toLowerCase()} challenges yet</p>
                    <button class="btn-add-challenge" onclick="window.app.router.navigate('/company/challenges/create')">
                        ➕ Add Challenge
                    </button>
                </div>
            `;
        }

        return challenges.map((challenge, index) => `
            <div class="challenge-card">
                <div class="challenge-number">#${index + 1}</div>
                <div class="challenge-content" onclick="window.app.router.navigate('/challenges/${challenge.id}')">
                    <h4 class="challenge-title">${this.truncateText(challenge.title, 50)}</h4>
                    <div class="challenge-meta">
                        <span class="badge difficulty-badge ${difficulty.toLowerCase()}">${difficulty}</span>
                        <span class="badge status-badge ${challenge.isActive ? 'active' : 'inactive'}">
                            ${challenge.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                    <div class="challenge-stats">
                        <div class="stat-item">
                            <span class="label">Submissions:</span>
                            <span class="value">${challenge.currentSubmissions || 0}</span>
                        </div>
                        <div class="stat-item">
                            <span class="label">Reward:</span>
                            <span class="value">${challenge.rewardAmount ? '$' + challenge.rewardAmount : 'None'}</span>
                        </div>
                    </div>
                    <div class="challenge-deadline">
                        📅 ${new Date(challenge.submissionDeadline).toLocaleDateString()}
                    </div>
                </div>
                <button class="btn-submit-idea" 
                        onclick="event.stopPropagation(); window.submitIdeaForChallenge('${challenge.id}', '${difficulty}', '${challenge.title.replace(/'/g, "\\'")}')">
                    💡 Submit Idea
                </button>
            </div>
        `).join('');
    }

    submitIdeaForChallenge(challengeId, difficulty, title) {
        // Store challenge context for the submission form
        localStorage.setItem('challengeContext', JSON.stringify({
            challengeId: challengeId,
            difficulty: difficulty,
            challengeTitle: title,
            timestamp: new Date().toISOString(),
            type: 'challenge'
        }));
        
        // Navigate to the challenge idea submission page
        window.app.router.navigate(`/challenges/${difficulty}/${challengeId}/submit-idea`);
    }

    truncateText(text, maxLength) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
}

// CSS for table layout dashboard
const dashboardTableCSS = `
.company-dashboard-table {
    max-width: 1400px;
    margin: 0 auto;
    padding: 20px;
}

.dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    padding: 20px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.dashboard-header h1 {
    color: #2c3e50;
    margin: 0;
    font-size: 24px;
}

.btn-create {
    background: #28a745;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;
    font-weight: 600;
    transition: background 0.2s;
}

.btn-create:hover {
    background: #218838;
}

.stats-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 15px;
    margin-bottom: 30px;
}

.stat-box {
    background: white;
    padding: 20px;
    border-radius: 12px;
    text-align: center;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.stat-box.total {
    border-left: 4px solid #007bff;
}

.stat-box.beginner {
    border-left: 4px solid #28a745;
}

.stat-box.intermediate {
    border-left: 4px solid #ffc107;
}

.stat-box.expert {
    border-left: 4px solid #dc3545;
}

.stat-number {
    font-size: 32px;
    font-weight: bold;
    color: #2c3e50;
    margin-bottom: 5px;
}

.stat-label {
    font-size: 14px;
    color: #6c757d;
    font-weight: 500;
}

.challenges-table {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
}

.difficulty-column {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    overflow: hidden;
}

.column-header {
    padding: 20px;
    text-align: center;
    color: white;
}

.column-header .icon {
    font-size: 24px;
    display: block;
    margin-bottom: 8px;
}

.column-header h3 {
    margin: 0 0 8px 0;
    font-size: 18px;
    font-weight: 700;
    letter-spacing: 1px;
}

.column-header .count {
    font-size: 14px;
    opacity: 0.9;
}

.beginner-bg {
    background: linear-gradient(135deg, #28a745, #20c997);
}

.intermediate-bg {
    background: linear-gradient(135deg, #ffc107, #ff9800);
}

.expert-bg {
    background: linear-gradient(135deg, #dc3545, #c82333);
}

.column-body {
    padding: 15px;
    max-height: 800px;
    overflow-y: auto;
}

.challenge-card {
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 12px;
    transition: all 0.2s;
    position: relative;
}

.challenge-card:hover {
    background: white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    transform: translateY(-2px);
}

.challenge-content {
    cursor: pointer;
}

.challenge-number {
    display: inline-block;
    background: #007bff;
    color: white;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    text-align: center;
    line-height: 28px;
    font-size: 12px;
    font-weight: bold;
    margin-bottom: 10px;
}

.challenge-title {
    color: #2c3e50;
    margin: 0 0 10px 0;
    font-size: 14px;
    font-weight: 600;
    line-height: 1.4;
}

.challenge-meta {
    display: flex;
    gap: 6px;
    margin-bottom: 10px;
    flex-wrap: wrap;
}

.badge {
    padding: 3px 8px;
    border-radius: 12px;
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
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

.status-badge.active {
    background: #d1ecf1;
    color: #0c5460;
}

.status-badge.inactive {
    background: #f8d7da;
    color: #721c24;
}

.challenge-stats {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 12px;
}

.stat-item {
    display: flex;
    gap: 4px;
}

.stat-item .label {
    color: #6c757d;
}

.stat-item .value {
    color: #2c3e50;
    font-weight: 600;
}

.challenge-deadline {
    font-size: 11px;
    color: #6c757d;
    text-align: right;
}

.empty-column {
    text-align: center;
    padding: 40px 20px;
    color: #6c757d;
}

.empty-column p {
    margin-bottom: 15px;
}

.btn-add-challenge {
    background: #007bff;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
}

.btn-add-challenge:hover {
    background: #0056b3;
}

.btn-submit-idea {
    width: 100%;
    background: #28a745;
    color: white;
    border: none;
    padding: 8px 12px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
    margin-top: 10px;
    transition: background 0.2s;
}

.btn-submit-idea:hover {
    background: #218838;
}

.no-company-message {
    text-align: center;
    padding: 60px 20px;
}

.btn-primary {
    background: #007bff;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;
}

@media (max-width: 1200px) {
    .challenges-table {
        grid-template-columns: 1fr;
    }
    
    .stats-row {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 768px) {
    .dashboard-header {
        flex-direction: column;
        gap: 15px;
    }
    
    .stats-row {
        grid-template-columns: 1fr;
    }
}
`;

// Inject CSS
if (!document.getElementById('dashboard-table-css')) {
    const style = document.createElement('style');
    style.id = 'dashboard-table-css';
    style.textContent = dashboardTableCSS;
    document.head.appendChild(style);
}

export default (params) => {
    const page = new CompanyDashboardTablePage();
    return page.render().then(html => {
        setTimeout(() => page.afterRender(), 0);
        return html;
    });
};
