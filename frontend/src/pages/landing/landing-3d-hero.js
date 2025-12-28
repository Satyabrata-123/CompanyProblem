// 3D Hero Landing Page Component

export class Landing3DHero {
    constructor() {
        this.mouseX = 0;
        this.mouseY = 0;
        this.animationFrame = null;
    }

    async render() {
        return `
            <!-- Simple Header with Logo Only -->
            <header class="landing-header">
                <div class="landing-logo">
                    <span class="logo-icon">💡</span>
                    <span class="logo-text">Innovation Platform</span>
                </div>
            </header>
            
            <div class="hero-3d-container">
                <!-- Animated Background -->
                <div class="hero-3d-background">
                    <canvas id="particleCanvas"></canvas>
                    <div class="gradient-overlay"></div>
                </div>

                <!-- Main Hero Content -->
                <div class="hero-3d-content">
                    <!-- Left Side: Text Content -->
                    <div class="hero-text-section">
                        <div class="hero-badge">
                            <span class="badge-icon">✨</span>
                            <span>AI-Powered Innovation Platform</span>
                        </div>
                        
                        <h1 class="hero-main-title">
                            <span class="title-word" data-word="1">Transform</span>
                            <span class="title-word" data-word="2">Ideas</span>
                            <span class="title-word" data-word="3">Into</span>
                            <span class="title-word gradient-text" data-word="4">Reality</span>
                        </h1>
                        
                        <p class="hero-subtitle">
                            Connect innovators with companies. Solve real-world challenges. 
                            Get rewarded with AI-powered matching and instant feedback.
                        </p>
                        
                        <div class="hero-cta-buttons">
                            <button class="cta-btn primary" id="dashboardBtn">
                                <span class="btn-content">
                                    <span class="btn-icon">📊</span>
                                    <span class="btn-text">Dashboard</span>
                                </span>
                                <span class="btn-shine"></span>
                            </button>
                            
                            <button class="cta-btn primary" id="registerBtn">
                                <span class="btn-content">
                                    <span class="btn-icon">🚀</span>
                                    <span class="btn-text">Start Innovating</span>
                                </span>
                                <span class="btn-shine"></span>
                            </button>
                            
                            <button class="cta-btn secondary" id="loginBtn">
                                <span class="btn-content">
                                    <span class="btn-icon">🔐</span>
                                    <span class="btn-text">Sign In</span>
                                </span>
                            </button>
                        </div>

                        
                        <!-- Stats Bar -->
                        <div class="hero-stats">
                            <div class="stat-item">
                                <div class="stat-number" data-target="1000">0</div>
                                <div class="stat-label">Innovators</div>
                            </div>
                            <div class="stat-divider"></div>
                            <div class="stat-item">
                                <div class="stat-number" data-target="500">0</div>
                                <div class="stat-label">Challenges</div>
                            </div>
                            <div class="stat-divider"></div>
                            <div class="stat-item">
                                <div class="stat-number" data-target="2">0</div>
                                <div class="stat-label">M+ Rewards</div>
                            </div>
                        </div>
                    </div>

                    <!-- Right Side: 3D Visual -->
                    <div class="hero-visual-section">
                        <div class="floating-3d-scene">
                            <!-- Main 3D Cube -->
                            <div class="cube-3d" id="mainCube">
                                <div class="cube-face front">
                                    <div class="face-content">
                                        <span class="face-icon">💡</span>
                                        <span class="face-text">Ideas</span>
                                    </div>
                                </div>
                                <div class="cube-face back">
                                    <div class="face-content">
                                        <span class="face-icon">🤖</span>
                                        <span class="face-text">AI</span>
                                    </div>
                                </div>
                                <div class="cube-face right">
                                    <div class="face-content">
                                        <span class="face-icon">🏆</span>
                                        <span class="face-text">Rewards</span>
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
                                        <span class="face-icon">🚀</span>
                                        <span class="face-text">Launch</span>
                                    </div>
                                </div>
                                <div class="cube-face bottom">
                                    <div class="face-content">
                                        <span class="face-icon">⚡</span>
                                        <span class="face-text">Fast</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Floating Elements -->
                            <div class="floating-element" style="--delay: 0s; --x: -100px; --y: -50px;">
                                <div class="float-card">
                                    <span class="float-icon">💰</span>
                                    <span class="float-text">$5K</span>
                                </div>
                            </div>
                            <div class="floating-element" style="--delay: 1s; --x: 120px; --y: -80px;">
                                <div class="float-card">
                                    <span class="float-icon">🏢</span>
                                    <span class="float-text">100+ Companies</span>
                                </div>
                            </div>
                            <div class="floating-element" style="--delay: 2s; --x: -80px; --y: 100px;">
                                <div class="float-card">
                                    <span class="float-icon">⚡</span>
                                    <span class="float-text">Instant AI</span>
                                </div>
                            </div>
                            <div class="floating-element" style="--delay: 3s; --x: 100px; --y: 120px;">
                                <div class="float-card">
                                    <span class="float-icon">🎨</span>
                                    <span class="float-text">Creative</span>
                                </div>
                            </div>

                            <!-- Orbiting Rings -->
                            <div class="orbit-ring ring-1"></div>
                            <div class="orbit-ring ring-2"></div>
                            <div class="orbit-ring ring-3"></div>
                        </div>
                    </div>
                </div>

                <!-- For Companies Section -->
                <div class="companies-spotlight">
                    <div class="spotlight-content">
                        <div class="spotlight-icon">🏢</div>
                        <h2>Are You a Company?</h2>
                        <p>Post challenges, discover talent, and innovate faster</p>
                        <button class="spotlight-btn" id="companyRegisterBtn">
                            <span>Register Your Company</span>
                            <span class="btn-arrow">→</span>
                        </button>
                    </div>
                </div>

                <!-- Scroll Indicator -->
                <div class="scroll-indicator">
                    <div class="mouse-icon">
                        <div class="mouse-wheel"></div>
                    </div>
                    <span>Scroll to explore</span>
                </div>
            </div>
        `;
    }


    async afterRender() {
        this.initializeParticles();
        this.initialize3DCube();
        this.setupEventListeners();
        this.animateStats();
        this.setupMouseTracking();
    }

    setupEventListeners() {
        const dashboardBtn = document.getElementById('dashboardBtn');
        const registerBtn = document.getElementById('registerBtn');
        const loginBtn = document.getElementById('loginBtn');
        const companyRegisterBtn = document.getElementById('companyRegisterBtn');

        if (dashboardBtn) {
            dashboardBtn.addEventListener('click', () => {
                // Check if user is authenticated
                const isAuthenticated = window.app?.state?.getState('user')?.isAuthenticated;
                
                if (isAuthenticated) {
                    // User is logged in, go to dashboard
                    window.app.router.navigate('/Dashboard');
                } else {
                    // User not logged in, redirect to sign in
                    // Store the intended destination
                    sessionStorage.setItem('redirectAfterLogin', '/');
                    window.app.router.navigate('/login');
                }
            });
        }

        if (registerBtn) {
            registerBtn.addEventListener('click', () => {
                window.app.router.navigate('/register');
            });
        }

        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                window.app.router.navigate('/login');
            });
        }

        if (companyRegisterBtn) {
            companyRegisterBtn.addEventListener('click', () => {
                window.app.router.navigate('/company/register');
            });
        }
    }

    initializeParticles() {
        const canvas = document.getElementById('particleCanvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles = [];
        const particleCount = 100;

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 3 + 1;
                this.speedX = Math.random() * 2 - 1;
                this.speedY = Math.random() * 2 - 1;
                this.opacity = Math.random() * 0.5 + 0.2;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                if (this.x > canvas.width) this.x = 0;
                if (this.x < 0) this.x = canvas.width;
                if (this.y > canvas.height) this.y = 0;
                if (this.y < 0) this.y = canvas.height;
            }

            draw() {
                ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });

            // Draw connections
            particles.forEach((p1, i) => {
                particles.slice(i + 1).forEach(p2 => {
                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 100) {
                        ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * (1 - distance / 100)})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                });
            });

            this.animationFrame = requestAnimationFrame(animate);
        };

        animate();

        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
    }

    initialize3DCube() {
        const cube = document.getElementById('mainCube');
        if (!cube) return;

        let rotationX = 0;
        let rotationY = 0;

        const rotateCube = () => {
            rotationX += 0.5;
            rotationY += 0.5;
            cube.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;
            requestAnimationFrame(rotateCube);
        };

        rotateCube();
    }

    setupMouseTracking() {
        document.addEventListener('mousemove', (e) => {
            this.mouseX = (e.clientX / window.innerWidth - 0.5) * 20;
            this.mouseY = (e.clientY / window.innerHeight - 0.5) * 20;

            const cube = document.getElementById('mainCube');
            if (cube) {
                cube.style.transform = `
                    perspective(1000px) 
                    rotateX(${this.mouseY}deg) 
                    rotateY(${this.mouseX}deg)
                `;
            }

            // Move floating elements
            document.querySelectorAll('.floating-element').forEach((el, index) => {
                const speed = (index + 1) * 0.5;
                el.style.transform = `
                    translate(
                        calc(var(--x) + ${this.mouseX * speed}px),
                        calc(var(--y) + ${this.mouseY * speed}px)
                    )
                `;
            });
        });
    }

    animateStats() {
        const statNumbers = document.querySelectorAll('.stat-number');
        
        statNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-target'));
            const duration = 2000;
            const increment = target / (duration / 16);
            let current = 0;

            const updateCounter = () => {
                if (current < target) {
                    current += increment;
                    if (stat.textContent.includes('M+')) {
                        stat.textContent = Math.min(Math.ceil(current), target);
                    } else {
                        stat.textContent = Math.min(Math.ceil(current), target);
                    }
                    requestAnimationFrame(updateCounter);
                } else {
                    if (stat.getAttribute('data-target') === '2') {
                        stat.textContent = '2';
                    } else {
                        stat.textContent = target;
                    }
                }
            };

            setTimeout(updateCounter, 500);
        });
    }

    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }
}

export default (params) => {
    const page = new Landing3DHero();
    
    // Store instance for cleanup
    if (window.app && window.app.router) {
        window.app.router.currentPageInstance = page;
    }
    
    return page.render().then(html => {
        setTimeout(() => page.afterRender(), 0);
        return html;
    });
};
