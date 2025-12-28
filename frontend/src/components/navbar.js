// Navigation Bar Component

export function renderNavbar() {
    const isAuthenticated = window.app?.state?.getState('user')?.isAuthenticated || false;
    const currentUser = window.app?.state?.getState('user')?.currentUser;
    
    return `
        <nav class="navbar">
            <div class="nav-container">
                <div class="nav-brand">
                    <a href="#/" class="brand-link">
                        <span class="brand-icon">💡</span>
                        <span class="brand-text">Innovation Platform</span>
                    </a>
                </div>
                
                <div class="nav-links">
                    <a href="#/challenges" class="nav-link">🎯 Challenges</a>
                    <a href="#/ideas" class="nav-link">💡 Ideas</a>
                    <a href="#/leaderboard" class="nav-link">🏆 Leaderboard</a>
                </div>
                
                <div class="nav-actions">
                    ${!isAuthenticated ? `
                        <a href="#/login" class="btn-nav-secondary">Login</a>
                        <a href="#/register" class="btn-nav-primary">Sign Up</a>
                        <a href="#/company/register" class="btn-nav-company">
                            <span class="btn-icon">🏢</span>
                            For Companies
                        </a>
                    ` : `
                        <a href="#/Dashboard" class="nav-link">Dashboard</a>
                        <a href="#/profile" class="nav-link">
                            <span class="user-avatar">👤</span>
                            ${currentUser?.fullName || 'Profile'}
                        </a>
                        <button onclick="handleLogout()" class="btn-nav-secondary">Logout</button>
                    `}
                </div>
                
                <button class="mobile-menu-btn" onclick="toggleMobileMenu()">
                    <span class="hamburger"></span>
                </button>
            </div>
        </nav>
    `;
}

// Mobile menu toggle
window.toggleMobileMenu = function() {
    const navActions = document.querySelector('.nav-actions');
    const navLinks = document.querySelector('.nav-links');
    navActions?.classList.toggle('mobile-open');
    navLinks?.classList.toggle('mobile-open');
};

// Logout handler
window.handleLogout = function() {
    localStorage.removeItem('innovation_user');
    localStorage.removeItem('currentUser');
    window.app?.state?.setState('user', {
        currentUser: null,
        isAuthenticated: false
    });
    window.app?.router?.navigate('/');
    window.location.reload();
};

// Navbar CSS
export const navbarCSS = `
/* Navbar Styles */
.navbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    padding: 1rem 0;
}

.nav-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
}

.nav-brand {
    flex-shrink: 0;
}

.brand-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    text-decoration: none;
    color: #2d3748;
    font-weight: 700;
    font-size: 1.25rem;
    transition: all 0.3s ease;
}

.brand-link:hover {
    color: #667eea;
    transform: scale(1.05);
}

.brand-icon {
    font-size: 1.5rem;
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
}

.brand-text {
    background: linear-gradient(45deg, #667eea, #764ba2);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.nav-links {
    display: flex;
    align-items: center;
    gap: 2rem;
    flex: 1;
    justify-content: center;
}

.nav-link {
    text-decoration: none;
    color: #4a5568;
    font-weight: 500;
    font-size: 1rem;
    transition: all 0.3s ease;
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

.nav-link::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 0;
    height: 2px;
    background: linear-gradient(45deg, #667eea, #764ba2);
    transition: width 0.3s ease;
}

.nav-link:hover {
    color: #667eea;
}

.nav-link:hover::after {
    width: 100%;
}

.nav-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-shrink: 0;
}

.btn-nav-secondary,
.btn-nav-primary,
.btn-nav-company {
    padding: 0.625rem 1.25rem;
    border-radius: 25px;
    font-weight: 600;
    font-size: 0.9rem;
    text-decoration: none;
    transition: all 0.3s ease;
    border: none;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
}

.btn-nav-secondary {
    background: transparent;
    color: #4a5568;
    border: 2px solid #e2e8f0;
}

.btn-nav-secondary:hover {
    background: #f7fafc;
    border-color: #cbd5e0;
    transform: translateY(-2px);
}

.btn-nav-primary {
    background: linear-gradient(45deg, #667eea, #764ba2);
    color: white;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.btn-nav-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.btn-nav-company {
    background: linear-gradient(45deg, #ff6b6b, #ee5a24);
    color: white;
    box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
}

.btn-nav-company:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 107, 107, 0.6);
}

.btn-icon {
    font-size: 1.1rem;
}

.user-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(45deg, #667eea, #764ba2);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
}

.mobile-menu-btn {
    display: none;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
}

.hamburger {
    display: block;
    width: 25px;
    height: 2px;
    background: #2d3748;
    position: relative;
    transition: all 0.3s ease;
}

.hamburger::before,
.hamburger::after {
    content: '';
    position: absolute;
    width: 25px;
    height: 2px;
    background: #2d3748;
    transition: all 0.3s ease;
}

.hamburger::before {
    top: -8px;
}

.hamburger::after {
    bottom: -8px;
}

/* Mobile Responsive */
@media (max-width: 968px) {
    .nav-links {
        display: none;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        flex-direction: column;
        padding: 1rem;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }
    
    .nav-links.mobile-open {
        display: flex;
    }
    
    .nav-actions {
        display: none;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        flex-direction: column;
        padding: 1rem;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        margin-top: 200px;
    }
    
    .nav-actions.mobile-open {
        display: flex;
    }
    
    .mobile-menu-btn {
        display: block;
    }
    
    .btn-nav-secondary,
    .btn-nav-primary,
    .btn-nav-company {
        width: 100%;
        justify-content: center;
    }
}

/* Add padding to body to account for fixed navbar */
body {
    padding-top: 80px;
}
`;

// Inject CSS
if (!document.getElementById('navbar-css')) {
    const style = document.createElement('style');
    style.id = 'navbar-css';
    style.textContent = navbarCSS;
    document.head.appendChild(style);
}
