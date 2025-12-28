// API client is available as window.app.api

export class ChallengesListPage {
    constructor() {
        this.challenges = [];
        this.selectedDifficulty = 'all';
    }

    async render() {
        return `
            <div class="challenges-page-3d">
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
            const challenges = await window.app.api.getAllChallenges();
            console.log('✅ Challenges API response:', challenges);

            this.challenges = Array.isArray(challenges) ? challenges :
                (challenges.data && Array.isArray(challenges.data)) ? challenges.data : [];

            console.log(`✅ Processed ${this.challenges.length} challenges`);
            this.renderChallenges();
        } catch (error) {
            console.error('❌ Error loading challenges:', error);
            this.challenges = [];
            document.getElementById('challengesGrid').innerHTML =
                '<div class="error-3d">Failed to load challenges. Please check if services are running.</div>';
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

            this.challenges = Array.isArray(challenges) ? challenges :
                (challenges.data && Array.isArray(challenges.data)) ? challenges.data : [];

            console.log(`✅ Processed ${this.challenges.length} challenges`);
            this.selectedDifficulty = difficulty;
            this.renderChallenges();
        } catch (error) {
            console.error(`❌ Error loading challenges:`, error);
            this.challenges = [];
            this.selectedDifficulty = difficulty;
            this.renderChallenges();
        }
    }

    renderChallenges() {
        const grid = document.getElementById('challengesGrid');

        if (!Array.isArray(this.challenges)) {
            this.challenges = [];
        }

        this.updateStats();

        if (this.challenges.length === 0) {
            const filterText = this.selectedDifficulty === 'all'
                ? `<div class="no-challenges-3d">
                     <div class="empty-icon">📋</div>
                     <h3>No Challenges Available Yet</h3>
                     <p>There are currently no challenges in the system.</p>
                     <button class="btn-3d primary" onclick="window.location.hash='#/company/Dashboard'">
                       <span>Go to Company Dashboard</span>
                     </button>
                   </div>`
                : `<div class="no-challenges-3d">
                     <div class="empty-icon">🔍</div>
                     <h3>No ${this.selectedDifficulty} Challenges Found</h3>
                     <button class="btn-3d secondary" onclick="document.getElementById('difficultyFilter').value='all'; document.getElementById('difficultyFilter').dispatchEvent(new Event('change'))">
                       <span>View All Challenges</span>
                     </button>
                   </div>`;
            grid.innerHTML = filterText;
            return;
        }

        grid.innerHTML = this.challenges.map((challenge, index) => {
            const difficultyIcon = {
                'BEGINNER': '🟢',
                'INTERMEDIATE': '🟡',
                'EXPERT': '🔴'
            }[challenge.difficulty] || '⚪';

            return `
            <div class="challenge-card-3d" data-challenge-id="${challenge.id}" style="animation-delay: ${index * 0.1}s">
                <div class="card-glow ${challenge.difficulty.toLowerCase()}"></div>
                
                <div class="card-header-3d">
                    <div class="difficulty-badge-3d ${challenge.difficulty.toLowerCase()}">
                        <span class="badge-icon">${difficultyIcon}</span>
                        <span>${challenge.difficulty}</span>
                    </div>
                    <div class="reward-badge-3d">
                        <span class="reward-icon">💰</span>
                        <span class="reward-amount">$${challenge.rewardAmount || 0}</span>
                    </div>
                </div>
                
                <div class="card-body-3d">
                    <h3 class="challenge-title-3d">${challenge.title}</h3>
                    <p class="company-name-3d">
                        <span class="company-icon">🏢</span>
                        ${challenge.companyName}
                    </p>
                    <p class="description-3d">${this.truncateText(challenge.description, 120)}</p>
                    
                    <div class="challenge-meta-3d">
                        <div class="meta-item">
                            <span class="meta-icon">📁</span>
                            <span>${challenge.category || 'General'}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-icon">📊</span>
                            <span>${challenge.currentSubmissions || 0}/${challenge.maxSubmissions || '∞'}</span>
                        </div>
                    </div>
                </div>
                
                <div class="card-footer-3d">
                    <div class="deadline-3d">
                        <span class="deadline-icon">⏰</span>
                        <span>${new Date(challenge.submissionDeadline).toLocaleDateString()}</span>
                    </div>
                    <div class="action-buttons-3d">
                        <button class="btn-3d view" data-challenge-id="${challenge.id}">
                            <span>👁️ View</span>
                        </button>
                        <button class="btn-3d submit" 
                                data-challenge-id="${challenge.id}" 
                                data-difficulty="${challenge.difficulty}"
                                data-title="${challenge.title}">
                            <span>💡 Submit</span>
                        </button>
                    </div>
                </div>
            </div>
            `;
        }).join('');

        this.attachCardEventListeners();
    }

    updateStats() {
        const totalChallenges = this.challenges.length;
        const totalRewards = this.challenges.reduce((sum, c) => sum + (c.rewardAmount || 0), 0);
        const totalSubmissions = this.challenges.reduce((sum, c) => sum + (c.currentSubmissions || 0), 0);

        const totalChallengesEl = document.getElementById('totalChallenges');
        const totalRewardsEl = document.getElementById('totalRewards');
        const totalSubmissionsEl = document.getElementById('totalSubmissions');

        if (totalChallengesEl) this.animateNumber(totalChallengesEl, totalChallenges);
        if (totalRewardsEl) totalRewardsEl.textContent = `$${totalRewards.toLocaleString()}`;
        if (totalSubmissionsEl) this.animateNumber(totalSubmissionsEl, totalSubmissions);
    }

    animateNumber(element, target) {
        const duration = 1000;
        const start = 0;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = Math.floor(start + (target - start) * progress);
            element.textContent = current;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    attachCardEventListeners() {
        document.querySelectorAll('.btn-3d.view').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const challengeId = e.currentTarget.dataset.challengeId;
                window.app.router.navigate(`/challenges/${challengeId}`);
            });
        });

        document.querySelectorAll('.btn-3d.submit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const challengeId = e.currentTarget.dataset.challengeId;
                const difficulty = e.currentTarget.dataset.difficulty;
                const title = e.currentTarget.dataset.title;
                this.submitIdeaForChallenge(challengeId, difficulty, title);
            });
        });
    }

    setupEventListeners() {
        document.getElementById('difficultyFilter').addEventListener('change', (e) => {
            this.selectedDifficulty = e.target.value;
            this.loadChallengesByDifficulty(this.selectedDifficulty);
        });
    }

    submitIdeaForChallenge(challengeId, difficulty, title) {
        localStorage.setItem('challengeContext', JSON.stringify({
            challengeId: challengeId,
            difficulty: difficulty,
            challengeTitle: title,
            timestamp: new Date().toISOString(),
            type: 'challenge'
        }));

        window.app.router.navigate(`/challenges/${difficulty}/${challengeId}/submit-idea`);
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
}

// Enhanced 3D CSS
const challengesCSS = `
/* Base Styles */
.challenges-page-3d {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 20px;
    position: relative;
    overflow-x: hidden;
}

/* Animated Background */
.animated-background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    pointer-events: none;
}

.gradient-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.6;
    animation: float 20s infinite ease-in-out;
}

.orb-1 {
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, #ff6b6b, #ee5a6f);
    top: -100px;
    left: -100px;
    animation-delay: 0s;
}

.orb-2 {
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, #4ecdc4, #44a08d);
    bottom: -150px;
    right: -150px;
    animation-delay: 7s;
}

.orb-3 {
    width: 350px;
    height: 350px;
    background: radial-gradient(circle, #f7b731, #f39c12);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    animation-delay: 14s;
}

@keyframes float {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(50px, -50px) scale(1.1); }
    66% { transform: translate(-50px, 50px) scale(0.9); }
}

/* Header 3D */
.page-header-3d {
    position: relative;
    z-index: 1;
    text-align: center;
    margin-bottom: 40px;
    padding: 60px 20px;
}

.header-content {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    border-radius: 30px;
    padding: 40px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.header-icon {
    font-size: 80px;
    animation: bounce 2s infinite;
    display: inline-block;
}

@keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-20px); }
}

.glowing-title {
    font-size: 56px;
    font-weight: 900;
    background: linear-gradient(45deg, #fff, #f0f0f0);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 0 30px rgba(255, 255, 255, 0.5);
    margin: 20px 0;
    animation: glow 3s ease-in-out infinite;
}

@keyframes glow {
    0%, 100% { filter: brightness(1); }
    50% { filter: brightness(1.2); }
}

.subtitle-3d {
    font-size: 20px;
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 30px;
}

/* Stats Bar */
.stats-bar {
    display: flex;
    justify-content: center;
    gap: 40px;
    flex-wrap: wrap;
    margin-top: 30px;
}

.stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: rgba(255, 255, 255, 0.15);
    padding: 20px 30px;
    border-radius: 20px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    transition: transform 0.3s;
}

.stat-item:hover {
    transform: translateY(-5px) scale(1.05);
}

.stat-icon {
    font-size: 32px;
    margin-bottom: 10px;
}

.stat-value {
    font-size: 32px;
    font-weight: 700;
    color: #fff;
}

.stat-label {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.8);
    text-transform: uppercase;
    letter-spacing: 1px;
}

/* Filters 3D */
.filters-3d {
    position: relative;
    z-index: 1;
    max-width: 1200px;
    margin: 0 auto 40px;
}

.filter-card {
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(20px);
    border-radius: 20px;
    padding: 25px 35px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    display: flex;
    align-items: center;
    gap: 15px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.filter-icon {
    font-size: 28px;
}

.filter-card label {
    color: #fff;
    font-weight: 600;
    font-size: 16px;
}

.select-3d {
    padding: 12px 20px;
    border-radius: 12px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    background: rgba(255, 255, 255, 0.2);
    color: #fff;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    backdrop-filter: blur(10px);
}

.select-3d:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.05);
}

.select-3d option {
    background: #667eea;
    color: #fff;
}

/* Challenges Grid 3D */
.challenges-grid-3d {
    position: relative;
    z-index: 1;
    max-width: 1400px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    gap: 30px;
    padding: 20px;
}

/* Challenge Card 3D */
.challenge-card-3d {
    position: relative;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 25px;
    padding: 30px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    animation: slideUp 0.6s ease-out forwards;
    opacity: 0;
    transform: translateY(50px);
    overflow: hidden;
}

@keyframes slideUp {
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.challenge-card-3d:hover {
    transform: translateY(-15px) scale(1.02);
    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.4);
}

.card-glow {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 5px;
    border-radius: 25px 25px 0 0;
}

.card-glow.beginner {
    background: linear-gradient(90deg, #11998e, #38ef7d);
}

.card-glow.intermediate {
    background: linear-gradient(90deg, #f7b731, #f39c12);
}

.card-glow.expert {
    background: linear-gradient(90deg, #ee0979, #ff6a00);
}

/* Card Header */
.card-header-3d {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.difficulty-badge-3d {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.difficulty-badge-3d.beginner {
    background: linear-gradient(135deg, #11998e, #38ef7d);
    color: #fff;
}

.difficulty-badge-3d.intermediate {
    background: linear-gradient(135deg, #f7b731, #f39c12);
    color: #fff;
}

.difficulty-badge-3d.expert {
    background: linear-gradient(135deg, #ee0979, #ff6a00);
    color: #fff;
}

.reward-badge-3d {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    border-radius: 20px;
    color: #fff;
    font-weight: 700;
    font-size: 16px;
}

/* Card Body */
.card-body-3d {
    margin-bottom: 20px;
}

.challenge-title-3d {
    font-size: 24px;
    font-weight: 800;
    color: #2c3e50;
    margin-bottom: 12px;
    line-height: 1.3;
}

.company-name-3d {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #7f8c8d;
    font-size: 15px;
    margin-bottom: 15px;
    font-weight: 600;
}

.description-3d {
    color: #34495e;
    line-height: 1.6;
    margin-bottom: 20px;
    font-size: 15px;
}

.challenge-meta-3d {
    display: flex;
    gap: 15px;
    flex-wrap: wrap;
}

.meta-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: #f8f9fa;
    border-radius: 10px;
    font-size: 13px;
    color: #495057;
    font-weight: 600;
}

/* Card Footer */
.card-footer-3d {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 20px;
    border-top: 2px solid #e9ecef;
}

.deadline-3d {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #6c757d;
    font-size: 14px;
    font-weight: 600;
}

.action-buttons-3d {
    display: flex;
    gap: 10px;
}

/* 3D Buttons */
.btn-3d {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 18px;
    border: none;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    position: relative;
    overflow: hidden;
}

.btn-3d::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
}

.btn-3d:hover::before {
    width: 300px;
    height: 300px;
}

.btn-3d span {
    position: relative;
    z-index: 1;
}

.btn-3d.view {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: #fff;
}

.btn-3d.submit {
    background: linear-gradient(135deg, #f093fb, #f5576c);
    color: #fff;
}

.btn-3d:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 25px rgba(0, 0, 0, 0.3);
}

.btn-3d:active {
    transform: translateY(-1px);
}

/* Loading 3D */
.loading-3d {
    grid-column: 1 / -1;
    text-align: center;
    padding: 60px;
    color: #fff;
}

.spinner-3d {
    width: 60px;
    height: 60px;
    margin: 0 auto 20px;
    border: 6px solid rgba(255, 255, 255, 0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

/* Empty State */
.no-challenges-3d {
    grid-column: 1 / -1;
    text-align: center;
    padding: 80px 20px;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(20px);
    border-radius: 30px;
    border: 1px solid rgba(255, 255, 255, 0.3);
}

.empty-icon {
    font-size: 100px;
    margin-bottom: 20px;
    animation: bounce 2s infinite;
}

.no-challenges-3d h3 {
    color: #fff;
    font-size: 32px;
    margin-bottom: 15px;
}

.no-challenges-3d p {
    color: rgba(255, 255, 255, 0.9);
    font-size: 18px;
    margin-bottom: 10px;
}

.btn-3d.primary {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: #fff;
    padding: 15px 30px;
    font-size: 16px;
    margin-top: 20px;
}

.btn-3d.secondary {
    background: linear-gradient(135deg, #f093fb, #f5576c);
    color: #fff;
    padding: 15px 30px;
    font-size: 16px;
    margin-top: 20px;
}

/* Responsive */
@media (max-width: 768px) {
    .challenges-grid-3d {
        grid-template-columns: 1fr;
        padding: 10px;
    }
    
    .glowing-title {
        font-size: 36px;
    }
    
    .stats-bar {
        gap: 20px;
    }
}
`;

// Inject CSS
if (!document.getElementById('challenges-3d-css')) {
    const style = document.createElement('style');
    style.id = 'challenges-3d-css';
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
