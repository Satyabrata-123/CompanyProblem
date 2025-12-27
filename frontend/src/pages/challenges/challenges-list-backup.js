// API client is available as window.app.api

export class ChallengesListPage {
    constructor() {
        this.challenges = [];
        this.selectedDifficulty = 'all';
    }

    async render() {
        return `
            <div class="challenges-page">
                <!-- Animated Background -->
                <div class="animated-background">
                    <div class="gradient-orb orb-1"></div>
                    <div class="gradient-orb orb-2"></div>
                    <div class="gradient-orb orb-3"></div>
                </div>

                <!-- Hero Header with 3D Effect -->
                <div class="page-header-3d">
                    <div class="header-content">
                        <div class="header-icon">🚀</div>
                        <h1 class="glowing-title">Company Challenges</h1>
                        <p class="subtitle-3d">Solve real-world problems from companies and win rewards!</p>
                        <div class="stats-bar">
                            <div class="stat-item">
                                <span class="stat-icon">🎯</span>
                                <span class="stat-value" id="totalChallenges">0</span>
                                <span class="stat-label">Challenges</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-icon">💰</span>
                                <span class="stat-value" id="totalRewards">$0</span>
                                <span class="stat-label">Total Rewards</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-icon">👥</span>
                                <span class="stat-value" id="totalSubmissions">0</span>
                                <span class="stat-label">Submissions</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Filters with Glass Morphism -->
                <div class="filters-3d">
                    <div class="filter-card">
                        <span class="filter-icon">🎚️</span>
                        <label>Filter by Difficulty:</label>
                        <select id="difficultyFilter" class="select-3d">
                            <option value="all">🌟 All Levels</option>
                            <option value="BEGINNER">🟢 Beginner</option>
                            <option value="INTERMEDIATE">🟡 Intermediate</option>
                            <option value="EXPERT">🔴 Expert</option>
                        </select>
                    </div>
                </div>

                <!-- Challenges Grid -->
                <div class="challenges-grid-3d" id="challengesGrid">
                    <div class="loading-3d">
                        <div class="spinner-3d"></div>
                        <p>Loading challenges...</p>
                    </div>
                </div>
            </div>
            `;
    }

    async afterRender() {
        await this.loadChallenges();
        this.setupEventListeners();
    }

    async loadChallenges() {
        try {
            console.log('🔄 Loading all challenges...');
            // Use the API client method instead of direct get
            const challenges = await window.app.api.getAllChallenges();
            console.log('✅ Challenges API response:', challenges);
            console.log('📊 Response type:', typeof challenges, 'Is Array:', Array.isArray(challenges));

            // Handle different response structures
            this.challenges = Array.isArray(challenges) ? challenges :
                (challenges.data && Array.isArray(challenges.data)) ? challenges.data :
                    [];

            console.log(`✅ Processed ${this.challenges.length} challenges:`, this.challenges);
            this.renderChallenges();
        } catch (error) {
            console.error('❌ Error loading challenges:', error);
            console.error('Error details:', error.message, error.stack);
            this.challenges = [];
            document.getElementById('challengesGrid').innerHTML =
                '<div class="error">Failed to load challenges. Please check if services are running.</div>';
        }
    }

    async loadChallengesByDifficulty(difficulty) {
        try {
            console.log(`🔄 Loading challenges for difficulty: ${difficulty}`);
            let challenges;

            if (difficulty === 'all') {
                challenges = await window.app.api.getAllChallenges();
            } else {
                challenges = await window.app.api.getChallengesByDifficulty(difficulty);
            }

            console.log(`✅ API response for difficulty ${difficulty}:`, challenges);
            console.log('📊 Response type:', typeof challenges, 'Is Array:', Array.isArray(challenges));

            // Handle different response structures
            this.challenges = Array.isArray(challenges) ? challenges :
                (challenges.data && Array.isArray(challenges.data)) ? challenges.data :
                    [];

            console.log(`✅ Processed ${this.challenges.length} challenges:`, this.challenges);
            this.selectedDifficulty = difficulty;
            this.renderChallenges();
        } catch (error) {
            console.error(`❌ Error loading challenges by difficulty (${difficulty}):`, error);
            console.error('Error details:', error.message, error.stack);
            this.challenges = [];
            this.selectedDifficulty = difficulty;
            this.renderChallenges();
        }
    }

    renderChallenges() {
        const grid = document.getElementById('challengesGrid');

        // Ensure challenges is an array
        if (!Array.isArray(this.challenges)) {
            console.warn('Challenges is not an array:', this.challenges);
            this.challenges = [];
        }

        if (this.challenges.length === 0) {
            const filterText = this.selectedDifficulty === 'all'
                ? `<div class="no-challenges-container">
                     <div class="no-challenges-icon">📋</div>
                     <h3>No Challenges Available Yet</h3>
                     <p>There are currently no challenges in the system.</p>
                     <p>Companies can create challenges from their dashboard.</p>
                     <button class="btn-primary" onclick="window.location.hash='#/company/dashboard'">
                       Go to Company Dashboard
                     </button>
                   </div>`
                : `<div class="no-challenges-container">
                     <div class="no-challenges-icon">🔍</div>
                     <h3>No ${this.selectedDifficulty} Challenges Found</h3>
                     <p>There are no challenges with ${this.selectedDifficulty} difficulty level.</p>
                     <button class="btn-secondary" onclick="document.getElementById('difficultyFilter').value='all'; document.getElementById('difficultyFilter').dispatchEvent(new Event('change'))">
                       View All Challenges
                     </button>
                   </div>`;
            grid.innerHTML = filterText;
            return;
        }

        grid.innerHTML = this.challenges.map(challenge => `
            <div class="challenge-card" data-challenge-id="${challenge.id}">
                <div class="challenge-header">
                    <div class="difficulty-badge ${challenge.difficulty.toLowerCase()}">
                        ${challenge.difficulty}
                    </div>
                    <div class="reward">
                        ${challenge.rewardAmount ? `$${challenge.rewardAmount}` : 'No reward'}
                    </div>
                </div>
                
                <h3>${challenge.title}</h3>
                <p class="company-name">by ${challenge.companyName}</p>
                <p class="description">${this.truncateText(challenge.description, 150)}</p>
                
                <div class="challenge-meta">
                    <span class="category">${challenge.category || 'General'}</span>
                    <span class="submissions">${challenge.currentSubmissions}/${challenge.maxSubmissions || '∞'} submissions</span>
                </div>
                
                <div class="challenge-footer">
                    <span class="deadline">
                        Deadline: ${new Date(challenge.submissionDeadline).toLocaleDateString()}
                    </span>
                    <div class="challenge-actions">
                        <button class="btn-secondary view-challenge" data-challenge-id="${challenge.id}">
                            View Details
                        </button>
                        <button class="btn-submit-idea" 
                                data-challenge-id="${challenge.id}" 
                                data-difficulty="${challenge.difficulty}"
                                data-title="${challenge.title}">
                            💡 Submit Idea
                        </button>
                    </div>
                </div>
            </div>
            `).join('');
    }

    setupEventListeners() {
        // Difficulty filter
        document.getElementById('difficultyFilter').addEventListener('change', (e) => {
            this.selectedDifficulty = e.target.value;
            this.loadChallengesByDifficulty(this.selectedDifficulty);
        });

        // View challenge buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('view-challenge')) {
                const challengeId = e.target.dataset.challengeId;
                window.app.router.navigate(`/challenges/${challengeId}`);
            }

            // Submit idea buttons
            if (e.target.classList.contains('btn-submit-idea')) {
                const challengeId = e.target.dataset.challengeId;
                const difficulty = e.target.dataset.difficulty;
                const title = e.target.dataset.title;

                this.submitIdeaForChallenge(challengeId, difficulty, title);
            }
        });
    }

    submitIdeaForChallenge(challengeId, difficulty, title) {
        // Store challenge context for the submission form
        localStorage.setItem('challengeContext', JSON.stringify({
            challengeId: challengeId,
            difficulty: difficulty,
            challengeTitle: title,
            timestamp: new Date().toISOString(),
            type: 'challenge' // Distinguish from community ideas
        }));

        // Navigate to the challenge idea submission page
        window.app.router.navigate(`/challenges/${difficulty}/${challengeId}/submit-idea`);
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
}

// CSS for challenges
const challengesCSS = `
.challenges-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.page-header {
    text-align: center;
    margin-bottom: 30px;
}

.page-header h1 {
    color: #2c3e50;
    margin-bottom: 10px;
}

.filters {
    margin-bottom: 30px;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 8px;
}

.difficulty-filter label {
    margin-right: 10px;
    font-weight: 500;
}

.difficulty-filter select {
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
}

.challenges-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 20px;
}

.challenge-card {
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    transition: transform 0.2s, box-shadow 0.2s;
    border: 1px solid #e1e8ed;
}

.challenge-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
}

.challenge-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.difficulty-badge {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
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

.reward {
    font-weight: 600;
    color: #28a745;
}

.challenge-card h3 {
    margin: 0 0 8px 0;
    color: #2c3e50;
    font-size: 18px;
}

.company-name {
    color: #6c757d;
    font-size: 14px;
    margin: 0 0 12px 0;
    font-style: italic;
}

.description {
    color: #495057;
    line-height: 1.5;
    margin-bottom: 15px;
}

.challenge-meta {
    display: flex;
    justify-content: space-between;
    margin-bottom: 15px;
    font-size: 14px;
}

.category {
    background: #e9ecef;
    padding: 4px 8px;
    border-radius: 4px;
    color: #495057;
}

.submissions {
    color: #6c757d;
}

.challenge-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 15px;
    border-top: 1px solid #e9ecef;
}

.deadline {
    font-size: 14px;
    color: #6c757d;
}

.challenge-actions {
    display: flex;
    gap: 8px;
}

.btn-primary {
    background: #007bff;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    transition: background 0.2s;
}

.btn-primary:hover {
    background: #0056b3;
}

.btn-secondary {
    background: #6c757d;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    transition: background 0.2s;
}

.btn-secondary:hover {
    background: #545b62;
}

.btn-submit-idea {
    background: #28a745;
    color: white;
    border: none;
    padding: 8px 12px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    transition: background 0.2s;
}

.btn-submit-idea:hover {
    background: #218838;
}

.loading, .error, .no-challenges {
    text-align: center;
    padding: 40px;
    color: #6c757d;
    grid-column: 1 / -1;
}

.error {
    color: #dc3545;
}

.no-challenges-container {
    text-align: center;
    padding: 60px 20px;
    grid-column: 1 / -1;
}

.no-challenges-icon {
    font-size: 64px;
    margin-bottom: 20px;
}

.no-challenges-container h3 {
    color: #2c3e50;
    margin-bottom: 10px;
}

.no-challenges-container p {
    color: #6c757d;
    margin-bottom: 10px;
}

.no-challenges-container button {
    margin-top: 20px;
}
`;

// Inject CSS
if (!document.getElementById('challenges-css')) {
    const style = document.createElement('style');
    style.id = 'challenges-css';
    style.textContent = challengesCSS;
    document.head.appendChild(style);
}

export default (params) => {
    const page = new ChallengesListPage();
    return page.render().then(html => {
        setTimeout(() => page.afterRender(), 0);
        return html;
    });
};