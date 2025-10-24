import { Layout } from '../../components/layout/layout.js'

export default function SubmitIdeaPage() {
  const currentUser = window.app.state.getState('user').currentUser
  
  if (!currentUser) {
    window.app.router.navigate('/login')
    return ''
  }

  // Initialize form after render
  setTimeout(() => {
    initializeSubmitIdeaForm()
  }, 0)

  const content = `
    <div class="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <!-- Header -->
        <div class="mb-8">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-900">Submit New Idea 💡</h1>
              <p class="mt-2 text-gray-600">
                Share your innovative ideas with the community and help drive positive change
              </p>
            </div>
            <button onclick="saveDraft()" class="btn-secondary" id="saveDraftBtn">
              <span class="mr-2">💾</span>
              Save Draft
            </button>
          </div>
        </div>

        <!-- Progress Indicator -->
        <div class="mb-8">
          <div class="flex items-center">
            <div class="flex items-center text-sm">
              <span class="flex items-center justify-center w-8 h-8 bg-primary-600 text-white rounded-full">1</span>
              <span class="ml-2 font-medium text-primary-600">Idea Details</span>
            </div>
            <div class="flex-1 mx-4 h-0.5 bg-gray-200">
              <div class="h-full bg-primary-600 transition-all duration-300" id="progressBar" style="width: 33%"></div>
            </div>
            <div class="flex items-center text-sm">
              <span class="flex items-center justify-center w-8 h-8 bg-gray-200 text-gray-500 rounded-full">2</span>
              <span class="ml-2 text-gray-500">AI Enhancement</span>
            </div>
            <div class="flex-1 mx-4 h-0.5 bg-gray-200"></div>
            <div class="flex items-center text-sm">
              <span class="flex items-center justify-center w-8 h-8 bg-gray-200 text-gray-500 rounded-full">3</span>
              <span class="ml-2 text-gray-500">Review & Submit</span>
            </div>
          </div>
        </div>

        <!-- Main Form -->
        <div class="bg-white shadow-sm rounded-lg">
          <form id="submitIdeaForm" data-form="idea-submit" class="space-y-6 p-6">
            <!-- Error Display -->
            <div id="formError" class="hidden bg-danger-50 border border-danger-200 rounded-md p-4">
              <div class="flex">
                <div class="flex-shrink-0">
                  <span class="text-danger-400">⚠️</span>
                </div>
                <div class="ml-3">
                  <p class="text-sm text-danger-800" id="formErrorMessage"></p>
                </div>
              </div>
            </div>

            <!-- Step 1: Basic Information -->
            <div id="step1" class="space-y-6">
              <div>
                <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
                  Idea Title *
                </label>
                <input 
                  type="text" 
                  id="title" 
                  name="title" 
                  required 
                  class="input"
                  placeholder="Enter a clear, descriptive title for your idea"
                  maxlength="100"
                >
                <div class="flex justify-between mt-1">
                  <div class="text-sm text-danger-600 hidden" id="titleError"></div>
                  <div class="text-sm text-gray-500">
                    <span id="titleCount">0</span>/100 characters
                  </div>
                </div>
              </div>

              <div>
                <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
                  Detailed Description *
                </label>
                <textarea 
                  id="description" 
                  name="description" 
                  required 
                  rows="8" 
                  class="input resize-none"
                  placeholder="Describe your idea in detail. Include:
• What problem does it solve?
• How would it work?
• What benefits would it provide?
• Any implementation considerations?"
                  maxlength="2000"
                ></textarea>
                <div class="flex justify-between mt-1">
                  <div class="text-sm text-danger-600 hidden" id="descriptionError"></div>
                  <div class="text-sm text-gray-500">
                    <span id="descriptionCount">0</span>/2000 characters
                  </div>
                </div>
              </div>

              <div class="flex items-center justify-between pt-4">
                <div class="flex items-center space-x-4">
                  <button type="button" onclick="loadDraft()" class="text-primary-600 hover:text-primary-500 text-sm font-medium">
                    📂 Load Draft
                  </button>
                  <button type="button" onclick="clearForm()" class="text-gray-600 hover:text-gray-500 text-sm font-medium">
                    🗑️ Clear Form
                  </button>
                </div>
                <button type="button" onclick="nextStep()" class="btn-primary" id="nextStepBtn" disabled>
                  Continue to AI Enhancement →
                </button>
              </div>
            </div>

            <!-- Step 2: AI Enhancement -->
            <div id="step2" class="space-y-6 hidden">
              <div class="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div class="flex">
                  <div class="flex-shrink-0">
                    <span class="text-blue-400 text-lg">🤖</span>
                  </div>
                  <div class="ml-3">
                    <h3 class="text-sm font-medium text-blue-800">AI Enhancement</h3>
                    <p class="text-sm text-blue-700 mt-1">
                      Our AI will analyze your idea and suggest improvements, categories, and tags.
                    </p>
                  </div>
                </div>
              </div>

              <div id="aiAnalysis" class="space-y-4">
                <div class="text-center py-8">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                  <p class="text-gray-600">Analyzing your idea...</p>
                </div>
              </div>

              <div class="flex items-center justify-between pt-4">
                <button type="button" onclick="previousStep()" class="btn-secondary">
                  ← Back to Details
                </button>
                <button type="button" onclick="finalStep()" class="btn-primary" id="finalStepBtn" disabled>
                  Review & Submit →
                </button>
              </div>
            </div>

            <!-- Step 3: Review & Submit -->
            <div id="step3" class="space-y-6 hidden">
              <div class="bg-green-50 border border-green-200 rounded-md p-4">
                <div class="flex">
                  <div class="flex-shrink-0">
                    <span class="text-green-400 text-lg">✅</span>
                  </div>
                  <div class="ml-3">
                    <h3 class="text-sm font-medium text-green-800">Ready to Submit</h3>
                    <p class="text-sm text-green-700 mt-1">
                      Review your idea below and submit it to the community for feedback and voting.
                    </p>
                  </div>
                </div>
              </div>

              <div id="ideaPreview" class="bg-gray-50 rounded-lg p-6">
                <!-- Preview will be populated here -->
              </div>

              <div class="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div class="flex">
                  <div class="flex-shrink-0">
                    <span class="text-yellow-400 text-lg">💡</span>
                  </div>
                  <div class="ml-3">
                    <h3 class="text-sm font-medium text-yellow-800">What happens next?</h3>
                    <ul class="text-sm text-yellow-700 mt-1 list-disc list-inside space-y-1">
                      <li>Your idea will be visible to all employees</li>
                      <li>Colleagues can vote and comment on your idea</li>
                      <li>You'll earn 10 points for submitting</li>
                      <li>Admins will review and potentially implement your idea</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div class="flex items-center justify-between pt-4">
                <button type="button" onclick="previousStep()" class="btn-secondary">
                  ← Back to AI Enhancement
                </button>
                <button type="submit" class="btn-primary" id="submitBtn">
                  <span id="submitBtnText">🚀 Submit Idea</span>
                  <div class="hidden animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2" id="submitSpinner"></div>
                </button>
              </div>
            </div>
          </form>
        </div>

        <!-- Tips Sidebar -->
        <div class="mt-8 bg-white shadow-sm rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">💡 Tips for Great Ideas</h3>
          <div class="space-y-3 text-sm text-gray-600">
            <div class="flex items-start">
              <span class="flex-shrink-0 w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-xs font-medium mr-3 mt-0.5">1</span>
              <p><strong>Be specific:</strong> Clearly describe the problem and your proposed solution</p>
            </div>
            <div class="flex items-start">
              <span class="flex-shrink-0 w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-xs font-medium mr-3 mt-0.5">2</span>
              <p><strong>Show impact:</strong> Explain how your idea would benefit the company or customers</p>
            </div>
            <div class="flex items-start">
              <span class="flex-shrink-0 w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-xs font-medium mr-3 mt-0.5">3</span>
              <p><strong>Consider feasibility:</strong> Think about how realistic your idea is to implement</p>
            </div>
            <div class="flex items-start">
              <span class="flex-shrink-0 w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-xs font-medium mr-3 mt-0.5">4</span>
              <p><strong>Be original:</strong> Check if similar ideas already exist before submitting</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `

  return Layout(content)
}

function initializeSubmitIdeaForm() {
  const form = document.getElementById('submitIdeaForm')
  const titleInput = document.getElementById('title')
  const descriptionInput = document.getElementById('description')
  const titleCount = document.getElementById('titleCount')
  const descriptionCount = document.getElementById('descriptionCount')
  const nextStepBtn = document.getElementById('nextStepBtn')
  
  let currentStep = 1
  let aiAnalysisData = null
  let duplicateCheckResults = null

  // Character counters
  titleInput.addEventListener('input', () => {
    const length = titleInput.value.length
    titleCount.textContent = length
    validateField('title', titleInput.value)
    updateNextStepButton()
  })

  descriptionInput.addEventListener('input', () => {
    const length = descriptionInput.value.length
    descriptionCount.textContent = length
    validateField('description', descriptionInput.value)
    updateNextStepButton()
  })

  // Real-time validation
  titleInput.addEventListener('blur', () => validateField('title', titleInput.value))
  descriptionInput.addEventListener('blur', () => validateField('description', descriptionInput.value))

  // Auto-save draft every 30 seconds
  setInterval(() => {
    if (titleInput.value.trim() || descriptionInput.value.trim()) {
      saveDraftSilently()
    }
  }, 30000)

  // Global functions
  window.nextStep = async () => {
    if (currentStep === 1) {
      if (validateForm()) {
        currentStep = 2
        showStep(2)
        updateProgressBar(66)
        await performAIAnalysis()
      }
    }
  }

  window.previousStep = () => {
    if (currentStep === 2) {
      currentStep = 1
      showStep(1)
      updateProgressBar(33)
    } else if (currentStep === 3) {
      currentStep = 2
      showStep(2)
      updateProgressBar(66)
    }
  }

  window.finalStep = () => {
    if (currentStep === 2) {
      currentStep = 3
      showStep(3)
      updateProgressBar(100)
      generatePreview()
    }
  }

  window.saveDraft = () => {
    const draft = {
      title: titleInput.value,
      description: descriptionInput.value,
      timestamp: new Date().toISOString()
    }
    
    localStorage.setItem('idea_draft', JSON.stringify(draft))
    
    window.app.state.addNotification({
      type: 'success',
      message: 'Draft saved successfully!',
      duration: 3000
    })
  }

  window.loadDraft = () => {
    const draft = localStorage.getItem('idea_draft')
    if (draft) {
      try {
        const draftData = JSON.parse(draft)
        titleInput.value = draftData.title || ''
        descriptionInput.value = draftData.description || ''
        
        // Update character counts
        titleCount.textContent = titleInput.value.length
        descriptionCount.textContent = descriptionInput.value.length
        
        updateNextStepButton()
        
        window.app.state.addNotification({
          type: 'success',
          message: 'Draft loaded successfully!',
          duration: 3000
        })
      } catch (error) {
        window.app.state.addNotification({
          type: 'error',
          message: 'Failed to load draft',
          duration: 3000
        })
      }
    } else {
      window.app.state.addNotification({
        type: 'info',
        message: 'No draft found',
        duration: 3000
      })
    }
  }

  window.clearForm = () => {
    if (confirm('Are you sure you want to clear the form? This will remove all entered data.')) {
      titleInput.value = ''
      descriptionInput.value = ''
      titleCount.textContent = '0'
      descriptionCount.textContent = '0'
      hideFieldError('title')
      hideFieldError('description')
      updateNextStepButton()
      
      // Clear draft
      localStorage.removeItem('idea_draft')
    }
  }

  // Form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    await submitIdea()
  })

  function validateField(fieldName, value) {
    let isValid = true
    let errorMessage = ''

    switch (fieldName) {
      case 'title':
        if (!value.trim()) {
          errorMessage = 'Title is required'
          isValid = false
        } else if (value.length < 5) {
          errorMessage = 'Title must be at least 5 characters'
          isValid = false
        } else if (value.length > 100) {
          errorMessage = 'Title must be less than 100 characters'
          isValid = false
        }
        break
        
      case 'description':
        if (!value.trim()) {
          errorMessage = 'Description is required'
          isValid = false
        } else if (value.length < 20) {
          errorMessage = 'Description must be at least 20 characters'
          isValid = false
        } else if (value.length > 2000) {
          errorMessage = 'Description must be less than 2000 characters'
          isValid = false
        }
        break
    }

    if (isValid) {
      hideFieldError(fieldName)
    } else {
      showFieldError(fieldName, errorMessage)
    }

    return isValid
  }

  function validateForm() {
    const titleValid = validateField('title', titleInput.value)
    const descriptionValid = validateField('description', descriptionInput.value)
    return titleValid && descriptionValid
  }

  function updateNextStepButton() {
    const isValid = titleInput.value.trim().length >= 5 && descriptionInput.value.trim().length >= 20
    nextStepBtn.disabled = !isValid
    
    if (isValid) {
      nextStepBtn.classList.remove('opacity-50', 'cursor-not-allowed')
    } else {
      nextStepBtn.classList.add('opacity-50', 'cursor-not-allowed')
    }
  }

  function showStep(step) {
    document.getElementById('step1').classList.toggle('hidden', step !== 1)
    document.getElementById('step2').classList.toggle('hidden', step !== 2)
    document.getElementById('step3').classList.toggle('hidden', step !== 3)
  }

  function updateProgressBar(percentage) {
    const progressBar = document.getElementById('progressBar')
    progressBar.style.width = `${percentage}%`
  }

  async function performAIAnalysis() {
    const aiAnalysisContainer = document.getElementById('aiAnalysis')
    const finalStepBtn = document.getElementById('finalStepBtn')
    
    try {
      // Show loading state
      aiAnalysisContainer.innerHTML = `
        <div class="text-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p class="text-gray-600">Analyzing your idea...</p>
        </div>
      `

      const ideaData = {
        title: titleInput.value,
        description: descriptionInput.value
      }

      // Perform AI analysis and duplicate check
      const [aiResponse, duplicates] = await Promise.all([
        window.app.api.categorizeIdea(ideaData),
        window.app.api.findDuplicates(ideaData.title, ideaData.description)
      ])

      aiAnalysisData = aiResponse
      duplicateCheckResults = duplicates

      // Display results
      aiAnalysisContainer.innerHTML = `
        <div class="space-y-4">
          <div class="bg-white border border-gray-200 rounded-lg p-4">
            <h4 class="font-medium text-gray-900 mb-2">🏷️ Suggested Category</h4>
            <span class="badge badge-primary">${aiResponse.category || 'General'}</span>
          </div>
          
          <div class="bg-white border border-gray-200 rounded-lg p-4">
            <h4 class="font-medium text-gray-900 mb-2">🏷️ AI-Generated Tags</h4>
            <div class="flex flex-wrap gap-2">
              ${(aiResponse.tags || []).map(tag => `
                <span class="badge badge-secondary">${tag}</span>
              `).join('')}
            </div>
          </div>
          
          <div class="bg-white border border-gray-200 rounded-lg p-4">
            <h4 class="font-medium text-gray-900 mb-2">⭐ AI Quality Score</h4>
            <div class="flex items-center">
              <div class="flex-1 bg-gray-200 rounded-full h-2">
                <div class="bg-primary-600 h-2 rounded-full" style="width: ${(aiResponse.score || 0) * 10}%"></div>
              </div>
              <span class="ml-3 text-sm font-medium text-gray-900">${Math.round((aiResponse.score || 0) * 10)}/10</span>
            </div>
          </div>
          
          ${duplicates && duplicates.length > 0 ? `
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 class="font-medium text-yellow-800 mb-2">⚠️ Similar Ideas Found</h4>
              <p class="text-sm text-yellow-700 mb-2">We found ${duplicates.length} similar idea(s). Consider reviewing them before submitting:</p>
              <div class="space-y-2">
                ${duplicates.slice(0, 3).map(duplicate => `
                  <a href="#/ideas/${duplicate}" class="block text-sm text-yellow-700 hover:text-yellow-800 underline">
                    View similar idea →
                  </a>
                `).join('')}
              </div>
            </div>
          ` : `
            <div class="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 class="font-medium text-green-800 mb-2">✅ Originality Check</h4>
              <p class="text-sm text-green-700">Great! No similar ideas found. Your idea appears to be original.</p>
            </div>
          `}
        </div>
      `

      finalStepBtn.disabled = false
      finalStepBtn.classList.remove('opacity-50', 'cursor-not-allowed')

    } catch (error) {
      console.error('AI analysis failed:', error)
      aiAnalysisContainer.innerHTML = `
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 class="font-medium text-red-800 mb-2">❌ Analysis Failed</h4>
          <p class="text-sm text-red-700">AI analysis is temporarily unavailable, but you can still submit your idea.</p>
        </div>
      `
      
      finalStepBtn.disabled = false
      finalStepBtn.classList.remove('opacity-50', 'cursor-not-allowed')
    }
  }

  function generatePreview() {
    const previewContainer = document.getElementById('ideaPreview')
    
    previewContainer.innerHTML = `
      <div class="space-y-4">
        <div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">${titleInput.value}</h3>
          <p class="text-gray-700 whitespace-pre-wrap">${descriptionInput.value}</p>
        </div>
        
        ${aiAnalysisData ? `
          <div class="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
            <span class="badge badge-primary">${aiAnalysisData.category || 'General'}</span>
            ${(aiAnalysisData.tags || []).map(tag => `
              <span class="badge badge-secondary">${tag}</span>
            `).join('')}
          </div>
        ` : ''}
        
        <div class="flex items-center justify-between pt-2 border-t border-gray-200 text-sm text-gray-500">
          <span>By ${window.app.state.getState('user').currentUser.fullName}</span>
          <span>Just now</span>
        </div>
      </div>
    `
  }

  async function submitIdea() {
    const submitBtn = document.getElementById('submitBtn')
    const submitBtnText = document.getElementById('submitBtnText')
    const submitSpinner = document.getElementById('submitSpinner')
    
    // Set loading state
    submitBtn.disabled = true
    submitBtnText.textContent = 'Submitting...'
    submitSpinner.classList.remove('hidden')

    try {
      const currentUser = window.app.state.getState('user').currentUser
      
      const ideaData = {
        title: titleInput.value.trim(),
        description: descriptionInput.value.trim(),
        submittedBy: currentUser.id,
        category: aiAnalysisData?.category || 'General',
        tags: aiAnalysisData?.tags || [],
        aiScore: aiAnalysisData?.score || null
      }

      const newIdea = await window.app.api.createIdea(ideaData)
      
      // Award points for idea submission
      await window.app.api.awardPointsForIdeaSubmission(currentUser.id)
      
      // Clear draft
      localStorage.removeItem('idea_draft')
      
      window.app.state.addNotification({
        type: 'success',
        message: 'Idea submitted successfully! You earned 10 points.',
        duration: 5000
      })
      
      // Redirect to the new idea
      window.app.router.navigate(`/ideas/${newIdea.id}`)
      
    } catch (error) {
      console.error('Failed to submit idea:', error)
      
      window.app.state.addNotification({
        type: 'error',
        message: 'Failed to submit idea. Please try again.',
        duration: 5000
      })
      
      // Reset button state
      submitBtn.disabled = false
      submitBtnText.textContent = '🚀 Submit Idea'
      submitSpinner.classList.add('hidden')
    }
  }

  function saveDraftSilently() {
    const draft = {
      title: titleInput.value,
      description: descriptionInput.value,
      timestamp: new Date().toISOString()
    }
    
    localStorage.setItem('idea_draft', JSON.stringify(draft))
  }

  function showFieldError(fieldName, message) {
    const errorElement = document.getElementById(`${fieldName}Error`)
    const inputElement = document.getElementById(fieldName)
    
    if (errorElement && inputElement) {
      errorElement.textContent = message
      errorElement.classList.remove('hidden')
      inputElement.classList.add('input-error')
      inputElement.classList.remove('input')
    }
  }

  function hideFieldError(fieldName) {
    const errorElement = document.getElementById(`${fieldName}Error`)
    const inputElement = document.getElementById(fieldName)
    
    if (errorElement && inputElement) {
      errorElement.textContent = ''
      errorElement.classList.add('hidden')
      inputElement.classList.remove('input-error')
      inputElement.classList.add('input')
    }
  }

  // Load draft on page load if available
  const existingDraft = localStorage.getItem('idea_draft')
  if (existingDraft) {
    try {
      const draftData = JSON.parse(existingDraft)
      const draftAge = Date.now() - new Date(draftData.timestamp).getTime()
      
      // Only load draft if it's less than 24 hours old
      if (draftAge < 24 * 60 * 60 * 1000) {
        setTimeout(() => {
          if (confirm('You have a saved draft. Would you like to load it?')) {
            window.loadDraft()
          }
        }, 1000)
      }
    } catch (error) {
      console.warn('Failed to parse draft:', error)
    }
  }
}