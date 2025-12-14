class LandingPage {
    constructor() {
        this.companies = [];
        this.currentSlide = 0;
        this.animationFrame = null;
    }

    async render() {
        // Load companies data
        await this.loadCompanies();

        return `
            <div class="landing-container">
                <!-- Hero Section with 3D Elements -->
                <section class="hero-section">
                    <div class="hero-background">
                        <div class="floating-shapes">
                            <div class="shape shape-1"></div>
                            <div class="shape shape-2"></div>
                            <div class="shape shape-3"></div>
                            <div class="shape shape-4"></div>
                            <div class="shape shape-5"></div>
                        </div>
                    </div>
                    
                    <div class="hero-content">
                        <div class="hero-text">
                            <h1 class="hero-title">
                                <span class="title-line">Innovation</span>
                                <span class="title-line highlight">Platform</span>
                            </h1>
                            <p class="hero-subtitle">
                                Transform your ideas into reality with AI-powered innovation challenges
                            </p>
                            <div class="hero-buttons">
                                <button class="btn-primary" id="startTourBtn">
                                    🚀 Start Your Journey
                                </button>
                                <button class="btn-secondary" id="learnMoreBtn">
                                    📖 Learn More
                                </button>
                            </div>
                        </div>
                        
                        <div class="hero-visual">
                            <div class="innovation-cube">
                                <div class="cube-face front">💡</div>
                                <div class="cube-face back">🚀</div>
                                <div class="cube-face right">⚡</div>
                                <div class="cube-face left">🎯</div>
                                <div class="cube-face top">🏆</div>
                                <div class="cube-face bottom">💰</div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- How It Works Section -->
                <section class="how-it-works" id="how-it-works">
                    <div class="container">
                        <h2 class="section-title">How It Works</h2>
                        <div class="steps-container">
                            <div class="step-card" data-step="1">
                                <div class="step-icon">🔍</div>
                                <h3>Discover Challenges</h3>
                                <p>Browse innovation challenges from top companies and find problems that match your expertise</p>
                            </div>
                            <div class="step-card" data-step="2">
                                <div class="step-icon">💡</div>
                                <h3>Submit Your Ideas</h3>
                                <p>Share your innovative solutions and let our AI analyze how well they match company needs</p>
                            </div>
                            <div class="step-card" data-step="3">
                                <div class="step-icon">🤖</div>
                                <h3>AI-Powered Analysis</h3>
                                <p>Get instant feedback with match scores, detailed analysis, and improvement suggestions</p>
                            </div>
                            <div class="step-card" data-step="4">
                                <div class="step-icon">💰</div>
                                <h3>Earn Rewards</h3>
                                <p>Receive credits based on your solution quality and compete on the global leaderboard</p>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Companies Section -->
                <section class="companies-section">
                    <div class="container">
                        <h2 class="section-title">Trusted by Leading Companies</h2>
                        <div class="companies-carousel">
                            <div class="companies-track" id="companiesTrack">
                                ${this.renderCompanies()}
                            </div>
                        </div>
                        <div class="companies-stats">
                            <div class="stat-item">
                                <div class="stat-number" data-target="${this.companies.length}">${this.companies.length}+</div>
                                <div class="stat-label">Verified Companies</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-number" data-target="500">500+</div>
                                <div class="stat-label">Active Challenges</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-number" data-target="10000">10K+</div>
                                <div class="stat-label">Innovative Ideas</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-number" data-target="2000000">$2M+</div>
                                <div class="stat-label">Total Rewards</div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Features Section -->
                <section class="features-section">
                    <div class="container">
                        <h2 class="section-title">Why Choose Our Platform?</h2>
                        <div class="features-grid">
                            <div class="feature-card">
                                <div class="feature-icon">🎯</div>
                                <h3>AI-Powered Matching</h3>
                                <p>Advanced algorithms analyze your solutions and provide detailed feedback with match scores</p>
                            </div>
                            <div class="feature-card">
                                <div class="feature-icon">⚡</div>
                                <h3>Instant Feedback</h3>
                                <p>Get immediate analysis of your ideas with strengths, improvements, and credit calculations</p>
                            </div>
                            <div class="feature-card">
                                <div class="feature-icon">🏆</div>
                                <h3>Gamified Experience</h3>
                                <p>Earn credits, unlock badges, and climb the leaderboard as you solve more challenges</p>
                            </div>
                            <div class="feature-card">
                                <div class="feature-icon">🌐</div>
                                <h3>Global Community</h3>
                                <p>Connect with innovators worldwide and collaborate on solving real-world problems</p>
                            </div>
                            <div class="feature-card">
                                <div class="feature-icon">💼</div>
                                <h3>Real Challenges</h3>
                                <p>Work on actual problems from verified companies with real rewards and recognition</p>
                            </div>
                            <div class="feature-card">
                                <div class="feature-icon">📈</div>
                                <h3>Track Progress</h3>
                                <p>Monitor your innovation journey with detailed analytics and performance insights</p>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- CTA Section -->
                <section class="cta-section">
                    <div class="container">
                        <div class="cta-content">
                            <h2>Ready to Start Innovating?</h2>
                            <p>Join thousands of innovators solving real-world challenges</p>
                            <div class="cta-buttons">
                                <button class="btn-primary large" id="getStartedBtn">
                                    🚀 Get Started Free
                                </button>
                                <button class="btn-secondary large" id="tryDemoBtn">
                                    🧪 Try Demo
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        `;
    }

    async loadCompanies() {
        try {
            const companies = await window.app.api.getAllCompanies();
            this.companies = companies.filter(company => company.isVerified).slice(0, 12);
            
            // If we have real companies, enhance them with industry data
            if (this.companies.length > 0) {
                this.companies = this.companies.map(company => ({
                    ...company,
                    industry: company.industry || this.getIndustryFromName(company.name)
                }));
            }
        } catch (error) {
            console.error('Failed to load companies:', error);
            // Enhanced fallback companies for demo
            this.companies = [
                { name: 'TechCorp Solutions', industry: 'Technology', description: 'Leading AI and software solutions' },
                { name: 'InnovateLab', industry: 'Research & Development', description: 'Cutting-edge innovation lab' },
                { name: 'CyberSecure Inc', industry: 'Cybersecurity', description: 'Advanced security solutions' },
                { name: 'GreenTech Innovations', industry: 'Clean Technology', description: 'Sustainable tech solutions' },
                { name: 'HealthTech Pro', industry: 'Healthcare Technology', description: 'Digital health innovations' },
                { name: 'FinanceFlow', industry: 'Financial Technology', description: 'Next-gen fintech solutions' },
                { name: 'DataDriven Analytics', industry: 'Data Science', description: 'Big data and analytics' },
                { name: 'CloudFirst Systems', industry: 'Cloud Computing', description: 'Cloud infrastructure experts' },
                { name: 'MobileMax Apps', industry: 'Mobile Development', description: 'Mobile app specialists' },
                { name: 'RoboTech Industries', industry: 'Robotics', description: 'Automation and robotics' },
                { name: 'VR Visionaries', industry: 'Virtual Reality', description: 'Immersive VR experiences' },
                { name: 'Blockchain Builders', industry: 'Blockchain', description: 'Decentralized solutions' }
            ];
        }
    }

    getIndustryFromName(name) {
        const industryKeywords = {
            'tech': 'Technology',
            'cyber': 'Cybersecurity', 
            'health': 'Healthcare',
            'finance': 'Finance',
            'green': 'Clean Technology',
            'data': 'Data Science',
            'cloud': 'Cloud Computing',
            'mobile': 'Mobile Development',
            'ai': 'Artificial Intelligence',
            'bio': 'Biotechnology'
        };

        const lowerName = name.toLowerCase();
        for (const [keyword, industry] of Object.entries(industryKeywords)) {
            if (lowerName.includes(keyword)) {
                return industry;
            }
        }
        return 'Innovation';
    }

    renderCompanies() {
        // Duplicate companies for seamless loop
        const duplicatedCompanies = [...this.companies, ...this.companies];
        
        return duplicatedCompanies.map((company, index) => `
            <div class="company-card" data-company-index="${index}">
                <div class="company-logo">
                    ${this.getCompanyIcon(company.industry)}
                </div>
                <div class="company-info">
                    <h4>${company.name}</h4>
                    <p>${company.industry || 'Innovation'}</p>
                    ${company.description ? `<span class="company-description">${company.description}</span>` : ''}
                </div>
                <div class="company-status">
                    <span class="status-badge">✅ Verified</span>
                </div>
            </div>
        `).join('');
    }

    getCompanyIcon(industry) {
        const icons = {
            'Technology': '💻',
            'Cybersecurity': '🔒',
            'Healthcare': '🏥',
            'Finance': '💰',
            'Clean Technology': '🌱',
            'Data Science': '📊',
            'Cloud Computing': '☁️',
            'Mobile Development': '📱',
            'Artificial Intelligence': '🤖',
            'Biotechnology': '🧬',
            'Research & Development': '🔬',
            'Financial Technology': '💳',
            'Virtual Reality': '🥽',
            'Blockchain': '⛓️',
            'Robotics': '🤖'
        };
        return icons[industry] || '🏢';
    }

    async afterRender() {
        this.initializeAnimations();
        this.startCompaniesCarousel();
        this.setupScrollEffects();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Hero buttons
        const startTourBtn = document.getElementById('startTourBtn');
        const learnMoreBtn = document.getElementById('learnMoreBtn');
        const getStartedBtn = document.getElementById('getStartedBtn');
        const tryDemoBtn = document.getElementById('tryDemoBtn');

        if (startTourBtn) {
            startTourBtn.addEventListener('click', () => this.startTour());
        }
        if (learnMoreBtn) {
            learnMoreBtn.addEventListener('click', () => this.scrollToHowItWorks());
        }
        if (getStartedBtn) {
            getStartedBtn.addEventListener('click', () => this.goToRegister());
        }
        if (tryDemoBtn) {
            tryDemoBtn.addEventListener('click', () => this.goToDemo());
        }
    }

    initializeAnimations() {
        // Animate floating shapes
        const shapes = document.querySelectorAll('.shape');
        shapes.forEach((shape, index) => {
            shape.style.animationDelay = `${index * 0.5}s`;
        });

        // Animate step cards on scroll
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.step-card, .feature-card').forEach(card => {
            observer.observe(card);
        });

        // Animate statistics when they come into view
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateStats();
                    statsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        const statsSection = document.querySelector('.companies-stats');
        if (statsSection) {
            statsObserver.observe(statsSection);
        }
    }

    startCompaniesCarousel() {
        const track = document.getElementById('companiesTrack');
        if (!track) return;

        let position = 0;
        const speed = 1;

        const animate = () => {
            position -= speed;
            if (position <= -track.scrollWidth / 2) {
                position = 0;
            }
            track.style.transform = `translateX(${position}px)`;
            this.animationFrame = requestAnimationFrame(animate);
        };

        animate();
    }

    setupScrollEffects() {
        // Parallax effect for hero section
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const heroBackground = document.querySelector('.hero-background');
            const innovationCube = document.querySelector('.innovation-cube');
            
            if (heroBackground) {
                heroBackground.style.transform = `translateY(${scrolled * 0.5}px)`;
            }
            
            if (innovationCube) {
                innovationCube.style.transform = `rotateX(${scrolled * 0.1}deg) rotateY(${scrolled * 0.2}deg)`;
            }
        });

        // Add mouse movement effects
        document.addEventListener('mousemove', (e) => {
            const mouseX = e.clientX / window.innerWidth;
            const mouseY = e.clientY / window.innerHeight;
            
            const shapes = document.querySelectorAll('.shape');
            shapes.forEach((shape, index) => {
                const speed = (index + 1) * 0.5;
                const x = (mouseX - 0.5) * speed * 20;
                const y = (mouseY - 0.5) * speed * 20;
                shape.style.transform = `translate(${x}px, ${y}px)`;
            });
        });
    }

    startTour() {
        // Smooth scroll through sections with highlights
        const sections = ['#how-it-works', '.companies-section', '.features-section'];
        let currentSection = 0;

        const tourNext = () => {
            if (currentSection < sections.length) {
                document.querySelector(sections[currentSection]).scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
                currentSection++;
                setTimeout(tourNext, 3000);
            } else {
                this.goToDemo();
            }
        };

        tourNext();
    }

    scrollToHowItWorks() {
        document.getElementById('how-it-works').scrollIntoView({
            behavior: 'smooth'
        });
    }

    goToRegister() {
        window.app.router.navigate('/register');
    }

    goToDemo() {
        window.location.href = 'test-challenges.html';
    }

    animateStats() {
        const statNumbers = document.querySelectorAll('.stat-number');
        
        statNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-target')) || 0;
            const increment = target / 100;
            let current = 0;
            
            const updateCounter = () => {
                if (current < target) {
                    current += increment;
                    if (target >= 1000000) {
                        stat.textContent = '$' + (current / 1000000).toFixed(1) + 'M+';
                    } else if (target >= 1000) {
                        stat.textContent = (current / 1000).toFixed(0) + 'K+';
                    } else {
                        stat.textContent = Math.ceil(current) + '+';
                    }
                    requestAnimationFrame(updateCounter);
                } else {
                    // Final value
                    if (target >= 1000000) {
                        stat.textContent = '$' + (target / 1000000).toFixed(1) + 'M+';
                    } else if (target >= 1000) {
                        stat.textContent = (target / 1000).toFixed(0) + 'K+';
                    } else {
                        stat.textContent = target + '+';
                    }
                }
            };
            
            updateCounter();
        });
    }

    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }
}

// CSS Styles
const landingPageCSS = `
.landing-container {
    min-height: 100vh;
    overflow-x: hidden;
}

/* Hero Section */
.hero-section {
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

.floating-shapes {
    position: absolute;
    width: 100%;
    height: 100%;
}

.shape {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    animation: float 6s ease-in-out infinite;
}

.shape-1 { width: 80px; height: 80px; top: 20%; left: 10%; animation-delay: 0s; }
.shape-2 { width: 120px; height: 120px; top: 60%; left: 80%; animation-delay: 1s; }
.shape-3 { width: 60px; height: 60px; top: 80%; left: 20%; animation-delay: 2s; }
.shape-4 { width: 100px; height: 100px; top: 30%; left: 70%; animation-delay: 3s; }
.shape-5 { width: 140px; height: 140px; top: 10%; left: 60%; animation-delay: 4s; }

@keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(180deg); }
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

.hero-text {
    color: white;
}

.hero-title {
    font-size: 4rem;
    font-weight: 800;
    line-height: 1.1;
    margin-bottom: 1.5rem;
    display: flex;
    flex-direction: column;
}

.title-line {
    display: block;
    animation: slideInLeft 1s ease-out;
}

.title-line.highlight {
    background: linear-gradient(45deg, #ffd700, #ffed4e);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: slideInRight 1s ease-out;
}

.hero-subtitle {
    font-size: 1.25rem;
    margin-bottom: 2rem;
    opacity: 0.9;
    animation: fadeInUp 1s ease-out 0.5s both;
}

.hero-buttons {
    display: flex;
    gap: 1rem;
    animation: fadeInUp 1s ease-out 1s both;
}

.btn-primary, .btn-secondary {
    padding: 1rem 2rem;
    border-radius: 50px;
    font-weight: 600;
    font-size: 1.1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
}

.btn-primary {
    background: linear-gradient(45deg, #ff6b6b, #ee5a24);
    color: white;
    box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(255, 107, 107, 0.6);
}

.btn-secondary {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.3);
}

.btn-secondary:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
}

.btn-primary.large, .btn-secondary.large {
    padding: 1.25rem 2.5rem;
    font-size: 1.2rem;
}

/* Innovation Cube */
.hero-visual {
    display: flex;
    justify-content: center;
    align-items: center;
}

.innovation-cube {
    width: 200px;
    height: 200px;
    position: relative;
    transform-style: preserve-3d;
    animation: rotateCube 10s infinite linear;
}

.cube-face {
    position: absolute;
    width: 200px;
    height: 200px;
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 4rem;
    backdrop-filter: blur(10px);
}

.cube-face.front { transform: rotateY(0deg) translateZ(100px); }
.cube-face.back { transform: rotateY(180deg) translateZ(100px); }
.cube-face.right { transform: rotateY(90deg) translateZ(100px); }
.cube-face.left { transform: rotateY(-90deg) translateZ(100px); }
.cube-face.top { transform: rotateX(90deg) translateZ(100px); }
.cube-face.bottom { transform: rotateX(-90deg) translateZ(100px); }

@keyframes rotateCube {
    0% { transform: rotateX(0deg) rotateY(0deg); }
    100% { transform: rotateX(360deg) rotateY(360deg); }
}

/* Sections */
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
}

.section-title {
    text-align: center;
    font-size: 3rem;
    font-weight: 700;
    margin-bottom: 3rem;
    background: linear-gradient(45deg, #667eea, #764ba2);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

/* How It Works */
.how-it-works {
    padding: 6rem 0;
    background: #f8fafc;
}

.steps-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
}

.step-card {
    background: white;
    padding: 2rem;
    border-radius: 20px;
    text-align: center;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    transform: translateY(50px);
    opacity: 0;
    transition: all 0.6s ease;
    position: relative;
    overflow: hidden;
}

.step-card::before {
    content: attr(data-step);
    position: absolute;
    top: -10px;
    right: -10px;
    width: 40px;
    height: 40px;
    background: linear-gradient(45deg, #ff6b6b, #ee5a24);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 1.2rem;
}

.step-card.animate-in {
    transform: translateY(0);
    opacity: 1;
}

.step-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.step-card h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: #2d3748;
}

.step-card p {
    color: #718096;
    line-height: 1.6;
}

/* Companies Section */
.companies-section {
    padding: 6rem 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.companies-carousel {
    overflow: hidden;
    margin-bottom: 3rem;
}

.companies-track {
    display: flex;
    gap: 2rem;
    width: calc(200% + 2rem);
}

.company-card {
    flex: 0 0 320px;
    background: rgba(255, 255, 255, 0.1);
    padding: 1.5rem;
    border-radius: 15px;
    display: flex;
    align-items: center;
    gap: 1rem;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    transition: all 0.3s ease;
    cursor: pointer;
    position: relative;
    overflow: hidden;
}

.company-card:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.company-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
}

.company-card:hover::before {
    left: 100%;
}

.company-logo {
    width: 60px;
    height: 60px;
    background: linear-gradient(45deg, #ffd700, #ffed4e);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.8rem;
    color: #2d3748;
    box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
    transition: all 0.3s ease;
}

.company-card:hover .company-logo {
    transform: scale(1.1) rotate(10deg);
    box-shadow: 0 6px 20px rgba(255, 215, 0, 0.5);
}

.company-info {
    flex: 1;
    min-width: 0;
}

.company-info h4 {
    margin: 0 0 0.5rem 0;
    font-size: 1.1rem;
    font-weight: 600;
}

.company-info p {
    margin: 0 0 0.25rem 0;
    opacity: 0.8;
    font-size: 0.9rem;
    font-weight: 500;
}

.company-description {
    font-size: 0.8rem;
    opacity: 0.7;
    display: block;
    margin-top: 0.25rem;
}

.company-status {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
}

.status-badge {
    background: rgba(34, 197, 94, 0.2);
    color: #22c55e;
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
    border: 1px solid rgba(34, 197, 94, 0.3);
}

.companies-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 2rem;
    text-align: center;
}

.stat-item {
    padding: 1rem;
}

.stat-number {
    font-size: 3rem;
    font-weight: 800;
    color: #ffd700;
    margin-bottom: 0.5rem;
}

.stat-label {
    font-size: 1.1rem;
    opacity: 0.9;
}

/* Features Section */
.features-section {
    padding: 6rem 0;
    background: white;
}

.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
}

.feature-card {
    padding: 2rem;
    border-radius: 20px;
    text-align: center;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    transition: all 0.3s ease;
    transform: translateY(30px);
    opacity: 0;
}

.feature-card.animate-in {
    transform: translateY(0);
    opacity: 1;
}

.feature-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    background: white;
}

.feature-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.feature-card h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: #2d3748;
}

.feature-card p {
    color: #718096;
    line-height: 1.6;
}

/* CTA Section */
.cta-section {
    padding: 6rem 0;
    background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
    color: white;
    text-align: center;
}

.cta-content h2 {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.cta-content p {
    font-size: 1.25rem;
    margin-bottom: 2rem;
    opacity: 0.9;
}

.cta-buttons {
    display: flex;
    justify-content: center;
    gap: 1rem;
    flex-wrap: wrap;
}

/* Animations */
@keyframes slideInLeft {
    from { transform: translateX(-100px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

@keyframes slideInRight {
    from { transform: translateX(100px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

@keyframes fadeInUp {
    from { transform: translateY(30px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}

/* Responsive Design */
@media (max-width: 768px) {
    .hero-content {
        grid-template-columns: 1fr;
        text-align: center;
        gap: 2rem;
    }
    
    .hero-title {
        font-size: 2.5rem;
    }
    
    .innovation-cube {
        width: 150px;
        height: 150px;
    }
    
    .cube-face {
        width: 150px;
        height: 150px;
        font-size: 3rem;
    }
    
    .cube-face.front { transform: rotateY(0deg) translateZ(75px); }
    .cube-face.back { transform: rotateY(180deg) translateZ(75px); }
    .cube-face.right { transform: rotateY(90deg) translateZ(75px); }
    .cube-face.left { transform: rotateY(-90deg) translateZ(75px); }
    .cube-face.top { transform: rotateX(90deg) translateZ(75px); }
    .cube-face.bottom { transform: rotateX(-90deg) translateZ(75px); }
    
    .section-title {
        font-size: 2rem;
    }
    
    .hero-buttons, .cta-buttons {
        flex-direction: column;
        align-items: center;
    }
    
    .btn-primary, .btn-secondary {
        width: 100%;
        max-width: 300px;
    }
}
`;

// Add CSS to document
if (!document.getElementById('landing-page-styles')) {
    const style = document.createElement('style');
    style.id = 'landing-page-styles';
    style.textContent = landingPageCSS;
    document.head.appendChild(style);
}

export default (params) => {
    const page = new LandingPage();
    return page.render().then(html => {
        setTimeout(() => page.afterRender(), 100);
        return html;
    });
};