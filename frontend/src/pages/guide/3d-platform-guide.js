import { Layout } from '../../components/layout/layout.js'

class ThreeDPlatformGuide {
    constructor() {
        this.companies = [];
        this.currentStep = 0;
        this.totalSteps = 4;
        this.animationFrame = null;
    }

    async render() {
        // Load companies data
        await this.loadCompanies();

        const content = `
            <div class="guide-container">
                <!-- Hero Section with 3D Elements -->
                <section class="guide-hero">
                    <div class="hero-background">
                        <div class="floating-particles">
                            ${this.generateParticles()}
                        </div>
                    </div>
                    
                    <div class="hero-content">
                        <div class="guide-header">
                            <h1 class="guide-title">
                                <span class="title-gradient">Interactive Platform Guide</span>
                            </h1>
                            <p class="guide-subtitle">
                                Discover how to maximize your innovation potential with our 3D interactive guide
                            </p>
                            <button class="start-tour-btn" id="startTourBtn">
                                🚀 Start Interactive Tour
                            </button>
                        </div>
                        
                        <div class="guide-visual">
                            <div class="platform-cube">
                                <div class="cube-face front">
                                    <div class="face-content">
                                        <span class="face-icon">💡</span>
                                        <span class="face-text">Ideas</span>
                                    </div>
                                </div>
                                <div class="cube-face back">
                                    <div class="face-content">
                                        <span class="face-icon">🏆</span>
                                        <span class="face-text">Rewards</span>
                                    </div>
                                </div>
                                <div class="cube-face right">
                                    <div class="face-content">
                                        <span class="face-icon">🤖</span>
                                        <span class="face-text">AI Analysis</span>
                                    </div>
                                </div>
                                <div class="cube-face left">
                                    <div class="face-content">
                                        <span class="face-icon">🎯</span>
                                        <span class="face-text">Challenges</span>
                                    </div>
                                </div>
                                <div class="cube-face top">
                                    <div class="face-content">
                                        <span class="face-icon">👥</span>
                                        <span class="face-text">Community</span>
                                    </div>
                                </div>
                                <div class="cube-face bottom">
                                    <div class="face-content">
                                        <span class="face-icon">📊</span>
                                        <span class="face-text">Analytics</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Interactive Steps Section -->
                <section class="interactive-steps" id="interactiveSteps">
                    <div class="steps-container">
                        <div class="step-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" id="progressFill"></div>
                            </div>
                            <div class="step-indicators">
                                ${Array.from({length: this.totalSteps}, (_, i) => `
                                    <div class="step-indicator ${i === 0 ? 'active' : ''}" data-step="${i}">
                                        ${i + 1}
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <div class="step-content" id="stepContent">
                            ${this.renderStep(0)}
                        </div>

                        <div class="step-navigation">
                            <button class="nav-btn prev-btn" id="prevBtn" disabled>
                                ← Previous
                            </button>
                            <button class="nav-btn next-btn" id="nextBtn">
                                Next →
                            </button>
                        </div>
                    </div>
                </section>

                <!-- Companies Showcase -->
                <section class="companies-showcase">
                    <div class="showcase-header">
                        <h2 class="section-title">Trusted Innovation Partners</h2>
                        <p class="section-subtitle">Join ${this.companies.length}+ verified companies driving innovation</p>
                    </div>
                    
                    <div class="companies-3d-grid">
                        ${this.renderCompanies3D()}
                    </div>

                    <div class="companies-stats">
                        <div class="stat-card">
                            <div class="stat-icon">🏢</div>
                            <div class="stat-number">${this.companies.length}+</div>
                            <div class="stat-label">Verified Companies</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">🎯</div>
                            <div class="stat-number">500+</div>
                            <div class="stat-label">Active Challenges</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">💡</div>
                            <div class="stat-number">10K+</div>
                            <div class="stat-label">Innovative Solutions</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">💰</div>
                            <div class="stat-number">$2M+</div>
                            <div class="stat-label">Total Rewards</div>
                        </div>
                    </div>
                </section>

                <!-- Action Section -->
                <section class="action-section">
                    <div class="action-content">
                        <h2>Ready to Start Your Innovation Journey?</h2>
                        <p>Join thousands of innovators solving real-world challenges</p>
                        <div class="action-buttons">
                            <button class="action-btn primary" id="startInnovatingBtn">
                                🚀 Start Innovating
                            </button>
                            <button class="action-btn secondary" id="backToDashboardBtn">
                                📊 Back to Dashboard
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        `;

        return Layout(content);
    }

    generateParticles() {
        const particles = [];
        for (let i = 0; i < 20; i++) {
            particles.push(`
                <div class="particle" style="
                    left: ${Math.random() * 100}%;
                    top: ${Math.random() * 100}%;
                    animation-delay: ${Math.random() * 5}s;
                    animation-duration: ${3 + Math.random() * 4}s;
                "></div>
            `);
        }
        return particles.join('');
    }

    async loadCompanies() {
        try {
            const companies = await window.app.api.getAllCompanies();
            this.companies = companies.filter(company => company.isVerified).slice(0, 12);
            
            if (this.companies.length === 0) {
                // Fallback companies
                this.companies = [
                    { name: 'TechCorp Solutions', industry: 'Technology', description: 'Leading AI solutions' },
                    { name: 'InnovateLab', industry: 'Research', description: 'Innovation laboratory' },
                    { name: 'CyberSecure Inc', industry: 'Security', description: 'Cybersecurity experts' },
                    { name: 'GreenTech Pro', industry: 'Clean Tech', description: 'Sustainable solutions' },
                    { name: 'HealthTech Plus', industry: 'Healthcare', description: 'Digital health' },
                    { name: 'FinanceFlow', industry: 'FinTech', description: 'Financial innovation' },
                    { name: 'DataDriven AI', industry: 'Data Science', description: 'AI & Analytics' },
                    { name: 'CloudFirst Systems', industry: 'Cloud', description: 'Cloud solutions' }
                ];
            }
        } catch (error) {
            console.error('Failed to load companies:', error);
            this.companies = [
                { name: 'TechCorp Solutions', industry: 'Technology', description: 'Leading AI solutions' },
                { name: 'InnovateLab', industry: 'Research', description: 'Innovation laboratory' },
                { name: 'CyberSecure Inc', industry: 'Security', description: 'Cybersecurity experts' },
                { name: 'GreenTech Pro', industry: 'Clean Tech', description: 'Sustainable solutions' }
            ];
        }
    }

    renderStep(stepIndex) {
        const steps = [
            {
                title: "🔍 Discover Challenges",
                content: `
                    <div class="step-visual">
                        <div class="step-icon-3d">🎯</div>
                    </div>
                    <div class="step-description">
                        <h3>Find Your Perfect Challenge</h3>
                        <p>Browse through hundreds of real-world challenges from verified companies. Filter by difficulty, industry, and reward amount to find problems that match your expertise.</p>
                        <ul class="step-features">
                            <li>✨ AI-powered challenge recommendations</li>
                            <li>🏆 Rewards from $100 to $10,000+</li>
                            <li>🎯 Difficulty levels: Beginner to Expert</li>
                            <li>🏢 Challenges from Fortune 500 companies</li>
                        </ul>
                    </div>
                `
            },
            {
                title: "💡 Submit Your Ideas",
                content: `
                    <div class="step-visual">
                        <div class="step-icon-3d">💡</div>
                    </div>
                    <div class="step-description">
                        <h3>Share Your Innovation</h3>
                        <p>Submit your creative solutions with detailed descriptions, technical approaches, and implementation plans. Our intuitive interface makes it easy to showcase your ideas.</p>
                        <ul class="step-features">
                            <li>📝 Rich text editor with media support</li>
                            <li>🔗 Add links, documents, and prototypes</li>
                            <li>👥 Collaborate with team members</li>
                            <li>💾 Save drafts and iterate on ideas</li>
                        </ul>
                    </div>
                `
            },
            {
                title: "🤖 AI-Powered Analysis",
                content: `
                    <div class="step-visual">
                        <div class="step-icon-3d">🤖</div>
                    </div>
                    <div class="step-description">
                        <h3>Get Instant Feedback</h3>
                        <p>Our advanced AI analyzes your solution against company requirements and provides detailed feedback with match scores, strengths, and improvement suggestions.</p>
                        <ul class="step-features">
                            <li>⚡ Instant analysis in seconds</li>
                            <li>📊 Match score from 0-100</li>
                            <li>✅ Detailed strengths analysis</li>
                            <li>🔧 Actionable improvement tips</li>
                        </ul>
                    </div>
                `
            },
            {
                title: "🏆 Earn Rewards & Recognition",
                content: `
                    <div class="step-visual">
                        <div class="step-icon-3d">🏆</div>
                    </div>
                    <div class="step-description">
                        <h3>Get Rewarded for Innovation</h3>
                        <p>Earn credits based on your solution quality, climb the leaderboard, unlock badges, and receive monetary rewards for top solutions.</p>
                        <ul class="step-features">
                            <li>💰 Credits: 25% to 150% based on match score</li>
                            <li>🥇 Leaderboard rankings and badges</li>
                            <li>💵 Cash rewards for winning solutions</li>
                            <li>🌟 Recognition from industry leaders</li>
                        </ul>
                    </div>
                `
            }
        ];

        return `
            <div class="step-card">
                <div class="step-header">
                    <h2>${steps[stepIndex].title}</h2>
                </div>
                <div class="step-body">
                    ${steps[stepIndex].content}
                </div>
            </div>
        `;
    }

    renderCompanies3D() {
        return this.companies.map((company, index) => `
            <div class="company-3d-card" style="animation-delay: ${index * 0.1}s">
                <div class="company-card-inner">
                    <div class="company-card-front">
                        <div class="company-logo-3d">
                            ${this.getCompanyIcon(company.industry)}
                        </div>
                        <h4>${company.name}</h4>
                        <p>${company.industry}</p>
                    </div>
                    <div class="company-card-back">
                        <div class="company-details">
                            <h4>${company.name}</h4>
                            <p>${company.description || 'Innovation partner'}</p>
                            <div class="company-stats">
                                <span>✅ Verified</span>
                                <span>🎯 Active Challenges</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    getCompanyIcon(industry) {
        const icons = {
            'Technology': '💻',
            'Security': '🔒',
            'Healthcare': '🏥',
            'FinTech': '💳',
            'Clean Tech': '🌱',
            'Data Science': '📊',
            'Cloud': '☁️',
            'Research': '🔬'
        };
        return icons[industry] || '🏢';
    }

    async afterRender() {
        this.setupEventListeners();
        this.initializeAnimations();
        this.startParticleAnimation();
    }

    setupEventListeners() {
        const startTourBtn = document.getElementById('startTourBtn');
        const nextBtn = document.getElementById('nextBtn');
        const prevBtn = document.getElementById('prevBtn');
        const startInnovatingBtn = document.getElementById('startInnovatingBtn');
        const backToDashboardBtn = document.getElementById('backToDashboardBtn');

        if (startTourBtn) {
            startTourBtn.addEventListener('click', () => this.startTour());
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextStep());
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.prevStep());
        }

        if (startInnovatingBtn) {
            startInnovatingBtn.addEventListener('click', () => {
                window.app.router.navigate('/challenges');
            });
        }

        if (backToDashboardBtn) {
            backToDashboardBtn.addEventListener('click', () => {
                window.app.router.navigate('/dashboard');
            });
        }
    }

    startTour() {
        document.getElementById('interactiveSteps').scrollIntoView({
            behavior: 'smooth'
        });
    }

    nextStep() {
        if (this.currentStep < this.totalSteps - 1) {
            this.currentStep++;
            this.updateStep();
        }
    }

    prevStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.updateStep();
        }
    }

    updateStep() {
        const stepContent = document.getElementById('stepContent');
        const progressFill = document.getElementById('progressFill');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');

        // Update content
        stepContent.innerHTML = this.renderStep(this.currentStep);

        // Update progress
        const progress = ((this.currentStep + 1) / this.totalSteps) * 100;
        progressFill.style.width = `${progress}%`;

        // Update indicators
        document.querySelectorAll('.step-indicator').forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentStep);
            indicator.classList.toggle('completed', index < this.currentStep);
        });

        // Update navigation buttons
        prevBtn.disabled = this.currentStep === 0;
        nextBtn.textContent = this.currentStep === this.totalSteps - 1 ? 'Complete Tour' : 'Next →';

        if (this.currentStep === this.totalSteps - 1) {
            nextBtn.onclick = () => {
                document.querySelector('.companies-showcase').scrollIntoView({
                    behavior: 'smooth'
                });
            };
        }
    }

    initializeAnimations() {
        // Animate step cards on scroll
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.company-3d-card, .stat-card').forEach(card => {
            observer.observe(card);
        });
    }

    startParticleAnimation() {
        const particles = document.querySelectorAll('.particle');
        particles.forEach(particle => {
            particle.style.animationPlayState = 'running';
        });
    }

    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }
}

// CSS Styles
const guideCSS = `
.guide-container {
    min-height: 100vh;
    overflow-x: hidden;
}

/* Hero Section */
.guide-hero {
    position: relative;
    min-height: 100vh;
    display: flex;
    align-items: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    overflow: hidden;
}

.hero-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
}

.floating-particles {
    position: absolute;
    width: 100%;
    height: 100%;
}

.particle {
    position: absolute;
    width: 4px;
    height: 4px;
    background: rgba(255, 255, 255, 0.6);
    border-radius: 50%;
    animation: float-particle 6s ease-in-out infinite;
}

@keyframes float-particle {
    0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0; }
    50% { transform: translateY(-100px) translateX(50px); opacity: 1; }
}

.hero-content {
    position: relative;
    z-index: 2;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
    align-items: center;
}

.guide-header {
    color: white;
}

.guide-title {
    font-size: 3.5rem;
    font-weight: 800;
    line-height: 1.1;
    margin-bottom: 1.5rem;
}

.title-gradient {
    background: linear-gradient(45deg, #ffd700, #ffed4e);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.guide-subtitle {
    font-size: 1.25rem;
    margin-bottom: 2rem;
    opacity: 0.9;
}

.start-tour-btn {
    background: linear-gradient(45deg, #ff6b6b, #ee5a24);
    color: white;
    border: none;
    padding: 1rem 2rem;
    border-radius: 50px;
    font-weight: 600;
    font-size: 1.1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
}

.start-tour-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(255, 107, 107, 0.6);
}

/* Platform Cube */
.guide-visual {
    display: flex;
    justify-content: center;
    align-items: center;
}

.platform-cube {
    width: 250px;
    height: 250px;
    position: relative;
    transform-style: preserve-3d;
    animation: rotatePlatformCube 15s infinite linear;
}

.cube-face {
    position: absolute;
    width: 250px;
    height: 250px;
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(10px);
    border-radius: 10px;
}

.face-content {
    text-align: center;
    color: white;
}

.face-icon {
    display: block;
    font-size: 3rem;
    margin-bottom: 0.5rem;
}

.face-text {
    font-size: 1.2rem;
    font-weight: 600;
}

.cube-face.front { transform: rotateY(0deg) translateZ(125px); }
.cube-face.back { transform: rotateY(180deg) translateZ(125px); }
.cube-face.right { transform: rotateY(90deg) translateZ(125px); }
.cube-face.left { transform: rotateY(-90deg) translateZ(125px); }
.cube-face.top { transform: rotateX(90deg) translateZ(125px); }
.cube-face.bottom { transform: rotateX(-90deg) translateZ(125px); }

@keyframes rotatePlatformCube {
    0% { transform: rotateX(0deg) rotateY(0deg); }
    100% { transform: rotateX(360deg) rotateY(360deg); }
}

/* Interactive Steps */
.interactive-steps {
    padding: 6rem 0;
    background: #f8fafc;
}

.steps-container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 0 2rem;
}

.step-progress {
    margin-bottom: 3rem;
}

.progress-bar {
    width: 100%;
    height: 4px;
    background: #e2e8f0;
    border-radius: 2px;
    margin-bottom: 2rem;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(45deg, #667eea, #764ba2);
    width: 25%;
    transition: width 0.5s ease;
}

.step-indicators {
    display: flex;
    justify-content: space-between;
    max-width: 400px;
    margin: 0 auto;
}

.step-indicator {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #e2e8f0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    color: #64748b;
    transition: all 0.3s ease;
}

.step-indicator.active {
    background: linear-gradient(45deg, #667eea, #764ba2);
    color: white;
    transform: scale(1.1);
}

.step-indicator.completed {
    background: #10b981;
    color: white;
}

.step-card {
    background: white;
    border-radius: 20px;
    padding: 3rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    margin-bottom: 2rem;
}

.step-header h2 {
    font-size: 2rem;
    margin-bottom: 2rem;
    text-align: center;
    color: #2d3748;
}

.step-body {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 3rem;
    align-items: center;
}

.step-visual {
    display: flex;
    justify-content: center;
    align-items: center;
}

.step-icon-3d {
    font-size: 6rem;
    animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
}

.step-description h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: #2d3748;
}

.step-description p {
    font-size: 1.1rem;
    line-height: 1.6;
    color: #4a5568;
    margin-bottom: 1.5rem;
}

.step-features {
    list-style: none;
    padding: 0;
}

.step-features li {
    padding: 0.5rem 0;
    color: #4a5568;
    font-size: 1rem;
}

.step-navigation {
    display: flex;
    justify-content: space-between;
    margin-top: 2rem;
}

.nav-btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 25px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.prev-btn {
    background: #e2e8f0;
    color: #64748b;
}

.prev-btn:hover:not(:disabled) {
    background: #cbd5e0;
}

.prev-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.next-btn {
    background: linear-gradient(45deg, #667eea, #764ba2);
    color: white;
}

.next-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

/* Companies Showcase */
.companies-showcase {
    padding: 6rem 0;
    background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
    color: white;
}

.showcase-header {
    text-align: center;
    margin-bottom: 4rem;
}

.section-title {
    font-size: 3rem;
    font-weight: 700;
    margin-bottom: 1rem;
}

.section-subtitle {
    font-size: 1.25rem;
    opacity: 0.9;
}

.companies-3d-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto 4rem auto;
    padding: 0 2rem;
}

.company-3d-card {
    height: 200px;
    perspective: 1000px;
    opacity: 0;
    transform: translateY(50px);
    animation: slideInUp 0.6s ease forwards;
}

@keyframes slideInUp {
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.company-card-inner {
    position: relative;
    width: 100%;
    height: 100%;
    text-align: center;
    transition: transform 0.6s;
    transform-style: preserve-3d;
}

.company-3d-card:hover .company-card-inner {
    transform: rotateY(180deg);
}

.company-card-front,
.company-card-back {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    border-radius: 15px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
}

.company-card-front {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
}

.company-card-back {
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(15px);
    transform: rotateY(180deg);
}

.company-logo-3d {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.company-card-front h4,
.company-card-back h4 {
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
}

.company-card-front p {
    opacity: 0.8;
    font-size: 0.9rem;
}

.company-details p {
    font-size: 0.9rem;
    margin-bottom: 1rem;
    opacity: 0.9;
}

.company-stats {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.company-stats span {
    font-size: 0.8rem;
    padding: 0.25rem 0.5rem;
    background: rgba(34, 197, 94, 0.2);
    border-radius: 10px;
    border: 1px solid rgba(34, 197, 94, 0.3);
}

.companies-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 2rem;
    max-width: 800px;
    margin: 0 auto;
    padding: 0 2rem;
}

.stat-card {
    text-align: center;
    padding: 2rem 1rem;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 15px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    transition: transform 0.3s ease;
}

.stat-card:hover {
    transform: translateY(-10px);
}

.stat-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.stat-number {
    font-size: 2.5rem;
    font-weight: 800;
    color: #ffd700;
    margin-bottom: 0.5rem;
}

.stat-label {
    font-size: 1rem;
    opacity: 0.9;
}

/* Action Section */
.action-section {
    padding: 6rem 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    text-align: center;
    color: white;
}

.action-content h2 {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.action-content p {
    font-size: 1.25rem;
    margin-bottom: 2rem;
    opacity: 0.9;
}

.action-buttons {
    display: flex;
    justify-content: center;
    gap: 1rem;
    flex-wrap: wrap;
}

.action-btn {
    padding: 1rem 2rem;
    border: none;
    border-radius: 50px;
    font-weight: 600;
    font-size: 1.1rem;
    cursor: pointer;
    transition: all 0.3s ease;
}

.action-btn.primary {
    background: linear-gradient(45deg, #ff6b6b, #ee5a24);
    color: white;
    box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
}

.action-btn.primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(255, 107, 107, 0.6);
}

.action-btn.secondary {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.3);
}

.action-btn.secondary:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
}

/* Responsive Design */
@media (max-width: 768px) {
    .hero-content {
        grid-template-columns: 1fr;
        text-align: center;
        gap: 2rem;
    }
    
    .guide-title {
        font-size: 2.5rem;
    }
    
    .platform-cube {
        width: 200px;
        height: 200px;
    }
    
    .cube-face {
        width: 200px;
        height: 200px;
    }
    
    .cube-face.front { transform: rotateY(0deg) translateZ(100px); }
    .cube-face.back { transform: rotateY(180deg) translateZ(100px); }
    .cube-face.right { transform: rotateY(90deg) translateZ(100px); }
    .cube-face.left { transform: rotateY(-90deg) translateZ(100px); }
    .cube-face.top { transform: rotateX(90deg) translateZ(100px); }
    .cube-face.bottom { transform: rotateX(-90deg) translateZ(100px); }
    
    .step-body {
        grid-template-columns: 1fr;
        gap: 2rem;
    }
    
    .step-navigation {
        flex-direction: column;
        gap: 1rem;
    }
    
    .action-buttons {
        flex-direction: column;
        align-items: center;
    }
    
    .action-btn {
        width: 100%;
        max-width: 300px;
    }
}
`;

// Add CSS to document
if (!document.getElementById('guide-styles')) {
    const style = document.createElement('style');
    style.id = 'guide-styles';
    style.textContent = guideCSS;
    document.head.appendChild(style);
}

export default (params) => {
    const page = new ThreeDPlatformGuide();
    return page.render().then(html => {
        setTimeout(() => page.afterRender(), 100);
        return html;
    });
};