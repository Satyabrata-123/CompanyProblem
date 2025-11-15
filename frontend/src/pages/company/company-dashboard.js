import { apiClient } from '../../services/api-client.js';

export class CompanyDashboardPage {
    constructor() {
        this.company = null;
        this.challenges = [];
    }

    async render() {
        return `
            <div class="company-dashboard">
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
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (!currentUser || !currentUser.companyId) {
                this.renderNoCompany();
                return;
            }

            // Load company details
            const companyResponse = await apiClient.get(`/api/companies/${currentUser.companyId}`);
            this.company = companyResponse.data;

            // Load company challenges
            const challengesResponse = await apiClient.get(`/api/challenges/company/${currentUser.companyId}`);
            this.challenges = challengesResponse.data;

            this.renderDashboard();
        } catch (error) {
            console.error('Error loading company data:', error);
            document.getElementById('dashboardContent').innerHTML = 
                '<div class="error">Failed to load company dashboard</div>';
        }
    }

    renderNoCompany() {
        document.getElementById('dashboardContent').innerHTML = `
            <div class="no-company-message">
                <h2>Company Registration Required</h2>
                <p>To post challenges and manage your company profile, you need to register your company first.</p>
                <button class="btn-primary" onclick="window.router.navigate('/company/register')">
                    Register Company
                </button>
            </div>
        `;
    }

    renderDashboard() {
        const content = document.getElementById('dashboardContent');
        
        content.innerHTML = `
            <div class="dashboard-header">
                <div class="company-info">
                    <h1>${this.company.name}</h1>
                    <div class="company-status">
                        <span class="status-badge ${this.company.isVerified ? 'verified' : 'pending'}">
                            ${this.company.isVerified ? '✓ Verified' : '⏳ Pending Verification'}
                        </span>
                    </div>
                </div>
                <div class="dashboard-actions">
                    <button class="btn-primary" onclick="window.router.navigate('/company/challenges/create')">
                        Create New Challenge
                    </button>
                    <button class="btn-secondary" onclick="window.router.navigate('/company/profile')">
                        Edit Profile
                    </button>
                </div>
            </div>

            <div class="dashboard-stats">
                <div class="stat-card">
                    <div class="stat-number">${this.challenges.length}</div>
                    <div class="stat-label">Total Challenges</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${this.challenges.filter(c => c.isActive).length}</div>
                    <div class="stat-label">Active Challenges</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${this.challenges.reduce((sum, c) => sum + (c.currentSubmissions || 0), 0)}</div>
                    <div class="stat-label">Total Submissions</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">$${this.challenges.reduce((sum, c) => sum + (c.rewardAmount || 0), 0)}</div>
                    <div class="stat-label">Total Rewards</div>
                </div>
            </div>

            <div class="challenges-section">
                <div class="section-header">
                    <h2>Your Challenges</h2>
                    <div class="section-actions">
                        <select id="statusFilter">
                            <option value="all">All Challenges</option>
                            <option value="active">Active Only</option>
                            <option value="inactive">Inactive Only</option>
                        </select>
                    </div>
                </div>
                
                <div class="challenges-list" id="challengesList">
                    ${this.renderChallengesList()}
                </div>
            </div>
        `;

        this.setupEventListeners();
    }

    renderChallengesList() {
        if (this.challenges.length === 0) {
            return `
                <div class="no-challenges">
                    <h3>No Challenges Yet</h3>
                    <p>Create your first challenge to start receiving solutions from our community.</p>
                    <button class="btn-primary" onclick="window.router.navigate('/company/challenges/create')">
                        Create Your First Challenge
                    </button>
                </div>
            `;
        }

        return this.challenges.map(challenge => `
            <div class="challenge-item" data-challenge-id="${challenge.id}">
                <div class="challenge-main">
                    <div class="challenge-header">
                        <h3>${challenge.title}</h3>
                        <div class="challenge-badges">
                            <span class="difficulty-badge ${challenge.difficulty.toLowerCase()}">
                                ${challenge.difficulty}
                            </span>
                            <span class="status-badge ${challenge.isActive ? 'active' : 'inactive'}">
                                ${challenge.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>
                    
                    <p class="challenge-description">
                        ${this.truncateText(challenge.description, 150)}
                    </p>
                    
                    <div class="challenge-stats">
                        <div class="stat">
                            <span class="stat-value">${challenge.currentSubmissions || 0}</span>
                            <span class="stat-label">Submissions</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${challenge.rewardAmount ? `$${challenge.rewardAmount}` : 'No reward'}</span>
                            <span class="stat-label">Reward</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${new Date(challenge.submissionDeadline).toLocaleDateString()}</span>
                            <span class="stat-label">Deadline</span>
                        </div>
                    </div>
                </div>
                
                <div class="challenge-actions">
                    <button class="btn-view" onclick="window.router.navigate('/challenges/${challenge.id}')">
                        View Public
                    </button>
                    <button class="btn-manage" onclick="window.router.navigate('/company/challenges/${challenge.id}/manage')">
                        Manage
                    </button>
                    <button class="btn-solutions" onclick="window.router.navigate('/company/challenges/${challenge.id}/solutions')">
                        View Solutions (${challenge.currentSubmissions || 0})
                    </button>
                </div>
            </div>
        `).join('');
    }

    setupEventListeners() {
        // Status filter
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.filterChallenges(e.target.value);
            });
        }
    }

    filterChallenges(status) {
        let filteredChallenges = [...this.challenges];
        
        if (status === 'active') {
            filteredChallenges = this.challenges.filter(c => c.isActive);
        } else if (status === 'inactive') {
            filteredChallenges = this.challenges.filter(c => !c.isActive);
        }

        const challengesList = document.getElementById('challengesList');
        challengesList.innerHTML = this.renderFilteredChallenges(filteredChallenges);
    }

    renderFilteredChallenges(challenges) {
        if (challenges.length === 0) {
            return '<div class="no-challenges">No challenges match the selected filter.</div>';
        }

        return challenges.map(challenge => `
            <div class="challenge-item" data-challenge-id="${challenge.id}">
                <div class="challenge-main">
                    <div class="challenge-header">
                        <h3>${challenge.title}</h3>
                        <div class="challenge-badges">
                            <span class="difficulty-badge ${challenge.difficulty.toLowerCase()}">
                                ${challenge.difficulty}
                            </span>
                            <span class="status-badge ${challenge.isActive ? 'active' : 'inactive'}">
                                ${challenge.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>
                    
                    <p class="challenge-description">
                        ${this.truncateText(challenge.description, 150)}
                    </p>
                    
                    <div class="challenge-stats">
                        <div class="stat">
                            <span class="stat-value">${challenge.currentSubmissions || 0}</span>
                            <span class="stat-label">Submissions</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${challenge.rewardAmount ? `$${challenge.rewardAmount}` : 'No reward'}</span>
                            <span class="stat-label">Reward</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${new Date(challenge.submissionDeadline).toLocaleDateString()}</span>
                            <span class="stat-label">Deadline</span>
                        </div>
                    </div>
                </div>
                
                <div class="challenge-actions">
                    <button class="btn-view" onclick="window.router.navigate('/challenges/${challenge.id}')">
                        View Public
                    </button>
                    <button class="btn-manage" onclick="window.router.navigate('/company/challenges/${challenge.id}/manage')">
                        Manage
                    </button>
                    <button class="btn-solutions" onclick="window.router.navigate('/company/challenges/${challenge.id}/solutions')">
                        View Solutions (${challenge.currentSubmissions || 0})
                    </button>
                </div>
            </div>
        `).join('');
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
}

// CSS for company dashboard
const companyDashboardCSS = `
.company-dashboard {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 30px;
    padding: 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.company-info h1 {
    color: #2c3e50;
    margin-bottom: 10px;
}

.status-badge {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
}

.status-badge.verified {
    background: #d4edda;
    color: #155724;
}

.status-badge.pending {
    background: #fff3cd;
    color: #856404;
}

.dashboard-actions {
    display: flex;
    gap: 10px;
}

.btn-primary, .btn-secondary {
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    text-decoration: none;
    display: inline-block;
}

.btn-primary {
    background: #007bff;
    color: white;
}

.btn-secondary {
    background: #6c757d;
    color: white;
}

.dashboard-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}

.stat-card {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    text-align: center;
}

.stat-number {
    font-size: 32px;
    font-weight: bold;
    color: #007bff;
    margin-bottom: 5px;
}

.stat-label {
    color: #6c757d;
    font-size: 14px;
}

.challenges-section {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    padding: 20px;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid #e9ecef;
}

.section-header h2 {
    color: #2c3e50;
    margin: 0;
}

.section-actions select {
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
}

.challenge-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    margin-bottom: 15px;
    transition: box-shadow 0.2s;
}

.challenge-item:hover {
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.challenge-main {
    flex: 1;
}

.challenge-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.challenge-header h3 {
    color: #2c3e50;
    margin: 0;
}

.challenge-badges {
    display: flex;
    gap: 8px;
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

.status-badge.active {
    background: #d4edda;
    color: #155724;
}

.status-badge.inactive {
    background: #f8d7da;
    color: #721c24;
}

.challenge-description {
    color: #495057;
    margin-bottom: 15px;
    line-height: 1.5;
}

.challenge-stats {
    display: flex;
    gap: 20px;
}

.stat {
    text-align: center;
}

.stat-value {
    display: block;
    font-weight: 600;
    color: #2c3e50;
}

.stat-label {
    font-size: 12px;
    color: #6c757d;
}

.challenge-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-left: 20px;
}

.challenge-actions button {
    padding: 6px 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    white-space: nowrap;
}

.btn-view {
    background: #17a2b8;
    color: white;
}

.btn-manage {
    background: #ffc107;
    color: #212529;
}

.btn-solutions {
    background: #28a745;
    color: white;
}

.no-company-message, .no-challenges {
    text-align: center;
    padding: 40px;
    color: #6c757d;
}

.no-company-message h2, .no-challenges h3 {
    color: #2c3e50;
    margin-bottom: 15px;
}

@media (max-width: 768px) {
    .dashboard-header {
        flex-direction: column;
        gap: 15px;
    }
    
    .challenge-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
    }
    
    .challenge-actions {
        flex-direction: row;
        margin-left: 0;
    }
    
    .challenge-stats {
        flex-wrap: wrap;
    }
}
`;

// Inject CSS
if (!document.getElementById('company-dashboard-css')) {
    const style = document.createElement('style');
    style.id = 'company-dashboard-css';
    style.textContent = companyDashboardCSS;
    document.head.appendChild(style);
}