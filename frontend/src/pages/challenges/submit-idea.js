// Submit Idea for Challenge Page

export class SubmitIdeaPage {
    constructor(challengeId, difficulty) {
        this.challengeId = challengeId;
        this.difficulty = difficulty;
        this.challenge = null;
        this.isSubmitting = false;
    }

    async render() {
        // Check if this is an idea-based submission or challenge submission
        const originalIdeaContext = JSON.parse(localStorage.getItem('originalIdeaContext') || 'null');
        const challengeContext = JSON.parse(localStorage.getItem('challengeContext') || 'null');

        const isIdeaBasedSubmission = originalIdeaContext && originalIdeaContext.ideaId === this.challengeId;
        const isChallengeSubmission = challengeContext && challengeContext.challengeId === this.challengeId;

        if (isIdeaBasedSubmission) {
            // This is a submission for an existing idea/problem
            try {
                const originalIdea = await window.app.api.getIdeaById(this.challengeId);
                this.challenge = {
                    id: originalIdea.id,
                    title: `Solution for: ${originalIdea.title}`,
                    description: originalIdea.description,
                    companyName: 'Community Problem',
                    submissionDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
                    rewardAmount: null,
                    currentSubmissions: 0,
                    maxSubmissions: null
                };
            } catch (error) {
                console.error('Failed to load original idea:', error);
                return `
                    <div class="max-w-4xl mx-auto py-6 px-4">
                        <div class="error-message">
                            <h2>Original Idea Not Found</h2>
                            <p>The idea you're trying to submit a solution for doesn't exist or has been removed.</p>
                            <a href="#/ideas" class="btn-primary">← Back to Ideas</a>
                        </div>
                    </div>
                `;
            }
        } else if (isChallengeSubmission) {
            // This is a submission for a company challenge
            try {
                this.challenge = await window.app.api.getChallengeByIdAndDifficulty(this.difficulty, this.challengeId);
            } catch (error) {
                console.error('Failed to load challenge:', error);
                return `
                    <div class="max-w-4xl mx-auto py-6 px-4">
                        <div class="error-message">
                            <h2>Challenge Not Found</h2>
                            <p>The challenge you're looking for doesn't exist or has been removed.</p>
                            <a href="#/challenges" class="btn-primary">← Back to Challenges</a>
                        </div>
                    </div>
                `;
            }
        } else {
            // Fallback: try to load challenge details (original functionality)
            try {
                this.challenge = await window.app.api.getChallengeByIdAndDifficulty(this.difficulty, this.challengeId);
            } catch (error) {
                console.error('Failed to load challenge:', error);
                return `
                    <div class="max-w-4xl mx-auto py-6 px-4">
                        <div class="error-message">
                            <h2>Challenge Not Found</h2>
                            <p>The challenge you're looking for doesn't exist or has been removed.</p>
                            <a href="#/challenges" class="btn-primary">← Back to Challenges</a>
                        </div>
                    </div>
                `;
            }
        }

        // Store for use in template
        this.isIdeaBasedSubmission = isIdeaBasedSubmission;

        return `
            <div class="max-w-4xl mx-auto py-6 px-4">
                <div class="submit-idea-container">
                    <!-- Header -->
                    <div class="page-header">
                        <button class="back-btn" onclick="window.app.router.navigate('${isIdeaBasedSubmission ? '/ideas' : '/challenges/' + this.challengeId}')">
                            ← Back to ${isIdeaBasedSubmission ? 'Ideas' : 'Challenge'}
                        </button>
                        <div class="challenge-info">
                            <div class="difficulty-badge ${isIdeaBasedSubmission ? 'community' : this.difficulty.toLowerCase()}">
                                ${isIdeaBasedSubmission ? 'COMMUNITY' : this.difficulty}
                            </div>
                            <h1>${isIdeaBasedSubmission ? 'Submit Your Solution' : 'Submit Your Idea'}</h1>
                            <h2 class="challenge-title">${this.challenge.title}</h2>
                            <p class="challenge-company">by ${this.challenge.companyName}</p>
                        </div>
                    </div>

                    <!-- Challenge Summary -->
                    <div class="challenge-summary">
                        <h3>${isIdeaBasedSubmission ? 'Original Problem' : 'Challenge Overview'}</h3>
                        <p>${this.challenge.description}</p>
                        <div class="challenge-details">
                            ${!isIdeaBasedSubmission ? `
                                <div class="detail-item">
                                    <strong>Deadline:</strong> ${new Date(this.challenge.submissionDeadline).toLocaleDateString()}
                                </div>
                                <div class="detail-item">
                                    <strong>Reward:</strong> ${this.challenge.rewardAmount ? '$' + this.challenge.rewardAmount : 'No monetary reward'}
                                </div>
                                <div class="detail-item">
                                    <strong>Submissions:</strong> ${this.challenge.currentSubmissions}/${this.challenge.maxSubmissions || '∞'}
                                </div>
                            ` : `
                                <div class="detail-item">
                                    <strong>Type:</strong> Community Problem Solution
                                </div>
                                <div class="detail-item">
                                    <strong>Status:</strong> Open for Solutions
                                </div>
                                <div class="detail-item">
                                    <strong>Reward:</strong> Community Recognition
                                </div>
                            `}
                        </div>
                    </div>

                    <!-- Idea Submission Form -->
                    <form id="submitIdeaForm" class="idea-form">
                        <div class="form-section">
                            <h3>${isIdeaBasedSubmission ? 'Your Solution' : 'Your Solution Idea'}</h3>
                            
                            <div class="form-group">
                                <label for="title">${isIdeaBasedSubmission ? 'Solution Title' : 'Idea Title'} *</label>
                                <input type="text" id="title" name="title" required 
                                       placeholder="${isIdeaBasedSubmission ? 'Give your solution a descriptive title' : 'Give your solution a catchy title'}">
                                <small>${isIdeaBasedSubmission ? 'Choose a clear title that describes your solution to the problem' : 'Choose a clear, descriptive title for your solution approach'}</small>
                            </div>

                            <div class="form-group">
                                <label for="description">${isIdeaBasedSubmission ? 'Solution Description' : 'Idea Description'} *</label>
                                <textarea id="description" name="description" required rows="6"
                                          placeholder="${isIdeaBasedSubmission ? 'Describe how your solution addresses the problem...' : 'Describe your solution idea in detail...'}"></textarea>
                                <small>${isIdeaBasedSubmission ? 'Explain how your solution solves the original problem' : 'Explain what your solution does and how it addresses the challenge'}</small>
                            </div>

                            <div class="form-group">
                                <label for="solutionApproach">Solution Approach *</label>
                                <textarea id="solutionApproach" name="solutionApproach" required rows="6"
                                          placeholder="${isIdeaBasedSubmission ? 'Explain your approach to solving this problem...' : 'Explain your approach to solving this challenge...'}"></textarea>
                                <small>Detail your methodology, algorithms, or strategies</small>
                            </div>
                        </div>

                        <div class="form-section">
                            <h3>Technical Details</h3>
                            
                            <div class="form-group">
                                <label for="technicalDetails">Technical Implementation</label>
                                <textarea id="technicalDetails" name="technicalDetails" rows="6"
                                          placeholder="Describe the technical aspects of your solution..."></textarea>
                                <small>Technologies, frameworks, architecture, APIs, etc.</small>
                            </div>

                            <div class="form-group">
                                <label for="implementationPlan">Implementation Plan</label>
                                <textarea id="implementationPlan" name="implementationPlan" rows="6"
                                          placeholder="Outline your step-by-step implementation plan..."></textarea>
                                <small>Timeline, milestones, development phases</small>
                            </div>
                        </div>

                        <div class="form-section">
                            <h3>Supporting Materials</h3>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="githubRepository">GitHub Repository</label>
                                    <input type="url" id="githubRepository" name="githubRepository"
                                           placeholder="https://github.com/username/repo">
                                    <small>Link to your code repository (if available)</small>
                                </div>
                                <div class="form-group">
                                    <label for="demoUrl">Demo/Prototype URL</label>
                                    <input type="url" id="demoUrl" name="demoUrl"
                                           placeholder="https://your-demo.com">
                                    <small>Link to live demo or prototype</small>
                                </div>
                            </div>

                            <div class="form-group">
                                <label for="attachmentUrls">Additional Resources</label>
                                <textarea id="attachmentUrls" name="attachmentUrls" rows="3"
                                          placeholder="Links to diagrams, documents, or other supporting materials (one per line)"></textarea>
                                <small>Any additional links that support your idea</small>
                            </div>
                        </div>

                        <div class="form-actions">
                            <button type="button" class="btn-secondary" onclick="window.app.router.navigate('${isIdeaBasedSubmission ? '/ideas' : '/challenges/' + this.challengeId}')">
                                Cancel
                            </button>
                            <button type="submit" class="btn-primary" id="submitBtn">
                                ${isIdeaBasedSubmission ? 'Submit My Solution' : 'Submit My Idea'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }

    async afterRender() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        const form = document.getElementById('submitIdeaForm');
        form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    async handleSubmit(e) {
        e.preventDefault();

        if (this.isSubmitting) return;

        // Check both currentUser and innovation_user for authentication
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const innovationUser = JSON.parse(localStorage.getItem('innovation_user') || '{}');

        const user = currentUser.id ? currentUser : innovationUser;

        if (!user.id) {
            this.showLoginRequired();
            return;
        }

        const submitBtn = document.getElementById('submitBtn');
        const originalText = submitBtn.textContent;

        try {
            this.isSubmitting = true;
            submitBtn.textContent = 'Submitting...';
            submitBtn.disabled = true;

            const formData = new FormData(e.target);

            // Process attachment URLs (convert textarea to JSON array)
            const attachmentUrls = formData.get('attachmentUrls');
            const urlsArray = attachmentUrls ?
                attachmentUrls.split('\n').filter(url => url.trim()).map(url => url.trim()) : [];

            const ideaData = {
                challengeId: this.challengeId,
                challengeDifficulty: this.isIdeaBasedSubmission ? 'COMMUNITY' : this.difficulty,
                userId: user.id,
                userName: user.fullName || user.name || 'Anonymous',
                userEmail: user.email || 'no-email@example.com',
                title: formData.get('title'),
                description: formData.get('description'),
                solutionApproach: formData.get('solutionApproach'),
                technicalDetails: formData.get('technicalDetails') || null,
                implementationPlan: formData.get('implementationPlan') || null,
                attachmentUrls: urlsArray.length > 0 ? JSON.stringify(urlsArray) : null,
                githubRepository: formData.get('githubRepository') || null,
                demoUrl: formData.get('demoUrl') || null
            };

            console.log('Submitting idea:', ideaData);

            // Step 1: Submit the idea
            const response = await window.app.api.post('/challenges/ideas', ideaData);
            console.log('✅ Idea submitted:', response);

            // Show pending analysis state immediately
            this.showPendingAnalysis(response);

            // Step 2: If this is a challenge submission (not community), compare with company solution
            let comparisonResult = null;
            let creditsAwarded = 0;

            if (!this.isIdeaBasedSubmission && this.challenge) {
                try {
                    console.log('🤖 Starting AI analysis and comparison...');

                    // Update pending state to show AI analysis is starting
                    this.updatePendingState('🤖 AI is analyzing your idea...');

                    // Step 2a: First, fetch the company's solution
                    console.log('Fetching company solution...');
                    const solutionResponse = await window.app.api.get(
                        `/challenges/${this.difficulty}/${this.challengeId}/solution`
                    );

                    if (!solutionResponse || !solutionResponse.solution) {
                        throw new Error('Company solution not available');
                    }

                    console.log('✅ Company solution retrieved');

                    // Step 2b: Send idea to AI for analysis and comparison with company solution
                    const comparisonRequest = {
                        ideaId: response.id,
                        ideaTitle: ideaData.title,
                        ideaDescription: ideaData.description + '\n\nSolution Approach: ' + ideaData.solutionApproach +
                            (ideaData.technicalDetails ? '\n\nTechnical Details: ' + ideaData.technicalDetails : '') +
                            (ideaData.implementationPlan ? '\n\nImplementation Plan: ' + ideaData.implementationPlan : ''),
                        challengeId: this.challengeId,
                        challengeTitle: this.challenge.title,
                        challengeDescription: this.challenge.description,
                        companySolution: solutionResponse.solution
                    };

                    console.log('Sending comparison request to AI...');

                    // Use the existing compareIdeaWithSolution API method
                    comparisonResult = await window.app.api.compareIdeaWithSolution(comparisonRequest);
                    console.log('✅ AI Comparison complete:', comparisonResult);

                    // Update pending state to show credit calculation
                    this.updatePendingState('💰 Calculating your rewards...');

                    // Step 3: Calculate and award credits based on match score
                    if (comparisonResult.matchScore >= 40) {
                        try {
                            // Calculate credits based on score and difficulty
                            const difficultyMultiplier = {
                                'BEGINNER': 1.0,
                                'INTERMEDIATE': 1.5,
                                'EXPERT': 2.0
                            };

                            const baseCredits = Math.round(comparisonResult.matchScore * 0.5);
                            creditsAwarded = Math.round(baseCredits * (difficultyMultiplier[this.difficulty] || 1.0));

                            console.log('💰 Credits calculated:', creditsAwarded);

                            // TODO: Integrate with gamification service to actually award credits
                            // For now, we'll just log the credits that should be awarded
                            console.log(`💰 Should award ${creditsAwarded} credits to user ${user.id}`);
                        } catch (creditsError) {
                            console.warn('Failed to calculate credits:', creditsError);
                            creditsAwarded = 0;
                        }
                    }
                } catch (error) {
                    console.error('❌ AI comparison failed:', error);

                    // Show error but don't fail the entire submission
                    comparisonResult = {
                        matchScore: 0,
                        matchLevel: 'Analysis Failed',
                        isCorrectSolution: false,
                        feedback: `AI analysis failed: ${error.message}. Your submission has been recorded and will be reviewed manually.`,
                        strengths: 'Your submission has been successfully recorded.',
                        improvements: 'AI analysis will be available when the service is restored.'
                    };
                    creditsAwarded = 10; // Minimal credits for submission
                }
            }

            // Show success message with comparison results
            this.showSuccessMessage(response, comparisonResult, creditsAwarded);

        } catch (error) {
            console.error('Error submitting idea:', error);
            this.showError(error.message || 'Failed to submit idea');

            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            this.isSubmitting = false;
        }
    }

    showPendingAnalysis(idea) {
        const container = document.querySelector('.submit-idea-container');

        container.innerHTML = `
            <div class="pending-analysis">
                <div class="pending-icon">
                    <div class="spinner"></div>
                </div>
                <h2>🎉 Idea Submitted Successfully!</h2>
                <p>Your solution has been submitted and is now being analyzed...</p>
                
                <!-- Progress Bar -->
                <div class="progress-container">
                    <div class="progress-bar">
                        <div class="progress-fill" id="progress-fill"></div>
                    </div>
                    <div class="progress-text" id="progress-text">25% Complete - Idea Submitted</div>
                </div>
                
                <div class="analysis-steps">
                    <div class="step active">
                        <div class="step-icon">✅</div>
                        <div class="step-text">Idea Submitted</div>
                    </div>
                    <div class="step active" id="ai-analysis-step">
                        <div class="step-icon">🤖</div>
                        <div class="step-text">AI Analysis in Progress...</div>
                    </div>
                    <div class="step" id="scoring-step">
                        <div class="step-icon">📊</div>
                        <div class="step-text">Calculating Score</div>
                    </div>
                    <div class="step" id="results-step">
                        <div class="step-icon">🏆</div>
                        <div class="step-text">Showing Results</div>
                    </div>
                </div>
                
                <div class="idea-summary">
                    <h3>Your Submission:</h3>
                    <p><strong>Title:</strong> ${idea.title}</p>
                    <p><strong>Status:</strong> ANALYZING</p>
                    <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
                </div>
                
                <div class="pending-message">
                    <p>Please wait while our AI analyzes your solution and compares it with the company's approach...</p>
                </div>
            </div>
        `;

        // Start progress animation
        this.animateProgress(25);
    }

    updatePendingState(message) {
        const pendingMessage = document.querySelector('.pending-message p');
        if (pendingMessage) {
            pendingMessage.textContent = message;
        }

        // Update step indicators and progress
        if (message.includes('analyzing')) {
            this.activateStep('ai-analysis-step');
            this.updateProgress(50, '50% Complete - AI Analyzing...');
        } else if (message.includes('rewards') || message.includes('credits')) {
            this.activateStep('scoring-step');
            this.updateProgress(75, '75% Complete - Calculating Rewards...');
        }
    }

    animateProgress(targetPercent) {
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');

        if (!progressFill || !progressText) return;

        let currentPercent = 0;
        const increment = targetPercent / 20; // Smooth animation

        const interval = setInterval(() => {
            currentPercent += increment;
            if (currentPercent >= targetPercent) {
                currentPercent = targetPercent;
                clearInterval(interval);
            }

            progressFill.style.width = currentPercent + '%';
        }, 50);
    }

    updateProgress(percent, text) {
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');

        if (progressFill && progressText) {
            this.animateProgress(percent);
            progressText.textContent = text;
        }
    }

    activateStep(stepId) {
        const step = document.getElementById(stepId);
        if (step) {
            step.classList.add('active');
        }
    }

    showSuccessMessage(idea, comparisonResult = null, creditsAwarded = 0) {
        // Activate final steps and complete progress
        this.activateStep('scoring-step');
        this.activateStep('results-step');
        this.updateProgress(100, '100% Complete - Analysis Finished!');

        const container = document.querySelector('.submit-idea-container');
        const isIdeaBasedSubmission = this.isIdeaBasedSubmission;

        // Determine score color
        let scoreColor = '#dc3545';
        if (comparisonResult) {
            if (comparisonResult.matchScore >= 90) scoreColor = '#28a745';
            else if (comparisonResult.matchScore >= 70) scoreColor = '#17a2b8';
            else if (comparisonResult.matchScore >= 40) scoreColor = '#ffc107';
        }

        // Wait a moment to show the final step activation, then show results
        setTimeout(() => {
            container.innerHTML = `
                <div class="success-message">
                    <div class="success-icon">🎉</div>
                    <h2>${isIdeaBasedSubmission ? 'Solution Submitted Successfully!' : 'Idea Submitted Successfully!'}</h2>
                    <p>Your ${isIdeaBasedSubmission ? 'solution' : 'solution idea'} has been submitted and analyzed by AI.</p>
                    
                    ${comparisonResult ? `
                        <div class="ai-comparison-results">
                            <h3>🤖 AI Analysis Results</h3>
                            
                            <div class="match-score-display">
                                <div class="score-circle" style="border-color: ${scoreColor}">
                                    <span class="score-number" style="color: ${scoreColor}">${Math.round(comparisonResult.matchScore)}</span>
                                    <span class="score-label">/100</span>
                                </div>
                                <div class="match-level" style="color: ${scoreColor}">
                                    ${comparisonResult.matchLevel}
                                </div>
                            </div>

                            <div class="comparison-feedback">
                                <div class="feedback-box ${comparisonResult.isCorrectSolution ? 'success-box' : 'warning-box'}">
                                    <h4>${comparisonResult.isCorrectSolution ? '✅ Correct Solution!' : '💡 Partial Match'}</h4>
                                    <p>${comparisonResult.feedback}</p>
                                </div>

                                <div class="feedback-details">
                                    <div class="strengths-box">
                                        <h4>✅ Strengths</h4>
                                        <p>${comparisonResult.strengths}</p>
                                    </div>
                                    <div class="improvements-box">
                                        <h4>🔧 Areas for Improvement</h4>
                                        <p>${comparisonResult.improvements}</p>
                                    </div>
                                </div>
                            </div>

                            ${creditsAwarded > 0 ? `
                                <div class="credits-awarded">
                                    <h3>💰 Credits Awarded</h3>
                                    <div class="credits-amount">${creditsAwarded} Credits</div>
                                    <p>Based on your ${comparisonResult.matchLevel} match with the company solution!</p>
                                </div>
                            ` : comparisonResult.matchScore >= 40 ? `
                                <div class="credits-info">
                                    <p>⚠️ Your score qualifies for ${Math.round(comparisonResult.matchScore * 0.25)} credits, but credit awarding is pending.</p>
                                </div>
                            ` : `
                                <div class="no-credits">
                                    <p>💡 Score below 40 doesn't qualify for credits. Keep improving!</p>
                                </div>
                            `}
                        </div>
                    ` : ''}
                    
                    <div class="idea-summary">
                        <h3>Your Submission:</h3>
                        <p><strong>Title:</strong> ${idea.title}</p>
                        <p><strong>Status:</strong> ${comparisonResult ? 'ANALYZED' : 'SUBMITTED'}</p>
                        ${comparisonResult ? `<p><strong>Match Score:</strong> ${Math.round(comparisonResult.matchScore)}/100</p>` : ''}
                        ${creditsAwarded > 0 ? `<p><strong>Credits Earned:</strong> ${creditsAwarded}</p>` : ''}
                        <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
                    </div>

                    <div class="next-steps">
                        <h3>What's Next:</h3>
                        <ul>
                            ${isIdeaBasedSubmission ? `
                                <li>✅ Your solution is now visible to the community</li>
                                <li>📧 You'll receive notifications about feedback</li>
                                <li>⭐ Other users can vote on your solution</li>
                                <li>🏆 Your solution may help others with similar problems</li>
                            ` : `
                                <li>✅ Your idea has been evaluated by AI</li>
                                ${comparisonResult && comparisonResult.isCorrectSolution ?
                    '<li>🎉 Your solution matches the company\'s approach!</li>' :
                    '<li>💡 Review the feedback to improve your approach</li>'}
                                ${creditsAwarded > 0 ? `<li>💰 ${creditsAwarded} credits have been added to your account</li>` : ''}
                                <li>📧 You'll receive notifications about status updates</li>
                                <li>⭐ Other users can vote on your idea</li>
                            `}
                        </ul>
                    </div>
                    
                    <div class="action-buttons">
                        <button class="btn-dashboard" onclick="window.app.router.navigate('/company/Dashboard')">
                            🏢 Go to Dashboard Now
                        </button>
                    </div>
                </div>
            `;
        }, 1000);
    }

    showLoginRequired() {
        const container = document.querySelector('.submit-idea-container');

        container.innerHTML = `
            <div class="login-required">
                <div class="login-icon">🔐</div>
                <h2>Login Required</h2>
                <p>You need to be logged in to submit ideas and solutions.</p>
                
                <div class="login-actions">
                    <button class="btn-primary" onclick="window.app.router.navigate('/login')">
                        Login Now
                    </button>
                    <button class="btn-secondary" onclick="window.app.router.navigate('/register')">
                        Create Account
                    </button>
                </div>
                
                <p class="login-note">
                    Don't have an account? <a href="#/register">Sign up</a> to start submitting your innovative ideas!
                </p>
            </div>
        `;
    }

    showError(message) {
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <strong>Error:</strong> ${message}
            <button class="close-error" onclick="this.parentElement.remove()">×</button>
        `;

        document.querySelector('.idea-form').prepend(errorDiv);
        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// CSS for submit idea page
const submitIdeaCSS = `
.submit-idea-container {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    overflow: hidden;
}

.page-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 30px 40px;
}

.back-btn {
    background: rgba(255,255,255,0.2);
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    margin-bottom: 20px;
    transition: background 0.2s;
}

.back-btn:hover {
    background: rgba(255,255,255,0.3);
}

.challenge-info h1 {
    margin: 0 0 10px 0;
    font-size: 28px;
}

.challenge-title {
    margin: 10px 0 5px 0;
    font-size: 20px;
    opacity: 0.9;
}

.challenge-company {
    margin: 0;
    opacity: 0.8;
    font-size: 16px;
}

.difficulty-badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: bold;
    text-transform: uppercase;
    margin-bottom: 15px;
}

.difficulty-badge.beginner {
    background: rgba(34, 197, 94, 0.2);
    color: #16a34a;
}

.difficulty-badge.intermediate {
    background: rgba(251, 191, 36, 0.2);
    color: #d97706;
}

.difficulty-badge.expert {
    background: rgba(239, 68, 68, 0.2);
    color: #dc2626;
}

.difficulty-badge.community {
    background: rgba(147, 51, 234, 0.2);
    color: #7c3aed;
}

.challenge-summary {
    padding: 30px 40px;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
}

.challenge-summary h3 {
    margin: 0 0 15px 0;
    color: #1e293b;
}

.challenge-details {
    display: flex;
    gap: 30px;
    margin-top: 15px;
    flex-wrap: wrap;
}

.detail-item {
    font-size: 14px;
    color: #64748b;
}

.idea-form {
    padding: 40px;
}

.form-section {
    margin-bottom: 40px;
    padding-bottom: 30px;
    border-bottom: 1px solid #e2e8f0;
}

.form-section:last-of-type {
    border-bottom: none;
}

.form-section h3 {
    color: #1e293b;
    margin-bottom: 20px;
    font-size: 20px;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 20px;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #374151;
}

.form-group input,
.form-group textarea {
    width: 100%;
    padding: 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
    font-family: inherit;
    transition: border-color 0.2s, box-shadow 0.2s;
}

.form-group input:focus,
.form-group textarea:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 2px rgba(102,126,234,0.25);
}

.form-group small {
    display: block;
    margin-top: 5px;
    color: #6b7280;
    font-size: 12px;
}

.form-actions {
    display: flex;
    gap: 15px;
    justify-content: flex-end;
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #e2e8f0;
}

.btn-secondary {
    background: #6b7280;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    transition: background 0.2s;
}

.btn-secondary:hover {
    background: #4b5563;
}

.btn-primary {
    background: #667eea;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: background 0.2s;
}

.btn-primary:hover:not(:disabled) {
    background: #5a67d8;
}

.btn-primary:disabled {
    background: #9ca3af;
    cursor: not-allowed;
}

.pending-analysis {
    text-align: center;
    padding: 60px 40px;
}

.pending-icon {
    margin-bottom: 30px;
}

.spinner {
    width: 60px;
    height: 60px;
    border: 6px solid #f3f3f3;
    border-top: 6px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.progress-container {
    margin: 30px auto;
    max-width: 600px;
    width: 100%;
}

.progress-bar {
    width: 100%;
    height: 30px;
    background: #e2e8f0;
    border-radius: 15px;
    overflow: hidden;
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
    position: relative;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 50%, #667eea 100%);
    background-size: 200% 100%;
    border-radius: 15px;
    transition: width 0.5s ease;
    animation: shimmer 2s infinite;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
    position: relative;
    overflow: hidden;
}

.progress-fill::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, 
        transparent 0%, 
        rgba(255,255,255,0.3) 50%, 
        transparent 100%);
    animation: progress-shine 1.5s infinite;
}

@keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}

@keyframes progress-shine {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
}

.progress-text {
    text-align: center;
    margin-top: 12px;
    font-size: 14px;
    font-weight: 600;
    color: #667eea;
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
}

.analysis-steps {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
    margin: 40px 0;
    flex-wrap: wrap;
}

.step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 20px;
    border-radius: 12px;
    background: #f8fafc;
    border: 2px solid #e2e8f0;
    transition: all 0.3s ease;
    min-width: 120px;
}

.step.active {
    background: #eff6ff;
    border-color: #3b82f6;
    transform: scale(1.05);
}

.step-icon {
    font-size: 24px;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: white;
    border: 2px solid #e2e8f0;
}

.step.active .step-icon {
    border-color: #3b82f6;
    background: #3b82f6;
    color: white;
}

.step-text {
    font-size: 12px;
    font-weight: 600;
    color: #64748b;
    text-align: center;
}

.step.active .step-text {
    color: #1e40af;
}

.pending-message {
    background: #f0f9ff;
    padding: 20px;
    border-radius: 8px;
    margin: 30px 0;
    border-left: 4px solid #0ea5e9;
}

.login-required {
    text-align: center;
    padding: 60px 40px;
}

.login-icon {
    font-size: 48px;
    margin-bottom: 20px;
}

.login-required h2 {
    color: #1e293b;
    margin-bottom: 15px;
}

.login-actions {
    display: flex;
    gap: 15px;
    justify-content: center;
    margin: 30px 0;
    flex-wrap: wrap;
}

.login-note {
    color: #64748b;
    font-size: 14px;
    margin-top: 20px;
}

.login-note a {
    color: #667eea;
    text-decoration: none;
}

.login-note a:hover {
    text-decoration: underline;
}

.success-message {
    text-align: center;
    padding: 60px 40px;
}

.ai-comparison-results {
    background: #f8f9fa;
    padding: 30px;
    border-radius: 12px;
    margin: 30px 0;
    text-align: center;
}

.match-score-display {
    margin: 30px 0;
}

.score-circle {
    width: 150px;
    height: 150px;
    border: 8px solid;
    border-radius: 50%;
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
}

.score-number {
    font-size: 48px;
    font-weight: bold;
}

.score-label {
    font-size: 18px;
    color: #666;
}

.match-level {
    font-size: 24px;
    font-weight: 600;
    text-transform: uppercase;
    margin-top: 10px;
}

.comparison-feedback {
    text-align: left;
    margin: 30px 0;
}

.feedback-box {
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
}

.success-box {
    background: #d4edda;
    border-left: 4px solid #28a745;
}

.warning-box {
    background: #fff3cd;
    border-left: 4px solid #ffc107;
}

.feedback-details {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-top: 20px;
}

.strengths-box, .improvements-box {
    padding: 20px;
    background: white;
    border-radius: 8px;
    border-left: 4px solid;
}

.strengths-box {
    border-color: #28a745;
}

.improvements-box {
    border-color: #ffc107;
}

.credits-awarded {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 30px;
    border-radius: 12px;
    margin: 30px 0;
}

.credits-amount {
    font-size: 48px;
    font-weight: bold;
    margin: 20px 0;
}

.credits-info {
    background: #fff3cd;
    padding: 15px;
    border-radius: 8px;
    margin: 20px 0;
}

.no-credits {
    background: #f8d7da;
    padding: 15px;
    border-radius: 8px;
    margin: 20px 0;
}

.success-icon {
    font-size: 48px;
    margin-bottom: 20px;
}

.success-message h2 {
    color: #059669;
    margin-bottom: 15px;
}

.idea-summary {
    background: #f0fdf4;
    padding: 20px;
    border-radius: 8px;
    margin: 20px 0;
    text-align: left;
}

.next-steps {
    background: #f8fafc;
    padding: 20px;
    border-radius: 8px;
    margin: 20px 0;
    text-align: left;
}

.next-steps h3 {
    color: #1e293b;
    margin-bottom: 15px;
}

.next-steps ul {
    margin: 0;
    padding-left: 20px;
}

.next-steps li {
    margin-bottom: 8px;
    line-height: 1.5;
}

.action-buttons {
    margin: 30px 0 20px 0;
    text-align: center;
}

.btn-dashboard {
    background: #3b82f6;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 8px;
}

.btn-dashboard:hover {
    background: #2563eb;
}

.error-message {
    background: #fef2f2;
    color: #991b1b;
    padding: 12px 15px;
    border-radius: 4px;
    margin-bottom: 20px;
    border: 1px solid #fecaca;
    position: relative;
}

.close-error {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    color: #991b1b;
}

@media (max-width: 768px) {
    .form-row {
        grid-template-columns: 1fr;
    }
    
    .form-actions {
        flex-direction: column;
    }
    
    .page-header {
        padding: 20px;
    }
    
    .idea-form {
        padding: 20px;
    }
    
    .challenge-details {
        flex-direction: column;
        gap: 10px;
    }
    
    .analysis-steps {
        flex-direction: column;
        gap: 15px;
    }
    
    .step {
        min-width: auto;
        width: 100%;
        max-width: 200px;
    }
    
    .feedback-details {
        grid-template-columns: 1fr;
    }
    
    .login-actions {
        flex-direction: column;
        align-items: center;
    }
    
    .progress-container {
        padding: 0 10px;
    }
    
    .progress-bar {
        height: 25px;
    }
    
    .progress-text {
        font-size: 12px;
    }
    
    .pending-analysis {
        padding: 40px 20px;
    }
    
    .pending-analysis h2 {
        font-size: 22px;
    }
    
    .score-circle {
        width: 120px;
        height: 120px;
        border-width: 6px;
    }
    
    .score-number {
        font-size: 36px;
    }
    
    .score-label {
        font-size: 14px;
    }
    
    .match-level {
        font-size: 18px;
    }
    
    .credits-amount {
        font-size: 36px;
    }
}

@media (max-width: 480px) {
    .progress-bar {
        height: 20px;
    }
    
    .progress-text {
        font-size: 11px;
    }
    
    .step {
        padding: 15px 10px;
    }
    
    .step-icon {
        font-size: 20px;
        width: 35px;
        height: 35px;
    }
    
    .step-text {
        font-size: 11px;
    }
    
    .spinner {
        width: 50px;
        height: 50px;
        border-width: 5px;
    }
}
`;

// Inject CSS
if (!document.getElementById('submit-idea-css')) {
    const style = document.createElement('style');
    style.id = 'submit-idea-css';
    style.textContent = submitIdeaCSS;
    document.head.appendChild(style);
}

export default (params) => {
    const challengeId = params.challengeId;
    const difficulty = params.difficulty || 'INTERMEDIATE'; // Default fallback

    const page = new SubmitIdeaPage(challengeId, difficulty);
    return page.render().then(html => {
        setTimeout(() => page.afterRender(), 0);
        return html;
    });
};