export default function LoginPage() {
  // Initialize form after render
  setTimeout(() => {
    initializeLoginForm()
  }, 0)

  return `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div>
          <div class="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100">
            <span class="text-2xl">💡</span>
          </div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to Innovation Platform
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Welcome back! Please sign in to continue.
          </p>
        </div>
        
        <form class="mt-8 space-y-6" data-form="login" id="loginForm">
          <div id="loginError" class="hidden bg-danger-50 border border-danger-200 rounded-md p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <span class="text-danger-400">⚠️</span>
              </div>
              <div class="ml-3">
                <p class="text-sm text-danger-800" id="loginErrorMessage"></p>
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input 
                id="email" 
                name="email" 
                type="email" 
                required 
                class="input mt-1"
                placeholder="your.email@company.com"
                autocomplete="email"
              >
              <div class="text-sm text-danger-600 mt-1 hidden" id="emailError"></div>
            </div>
          </div>

          <div>
            <button 
              type="submit" 
              class="btn-primary w-full" 
              id="loginButton"
            >
              <span id="loginButtonText">Sign in</span>
              <div class="hidden animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2" id="loginSpinner"></div>
            </button>
          </div>

          <div class="text-center">
            <p class="text-sm text-gray-600">
              Don't have an account? 
              <a href="#/register" class="font-medium text-primary-600 hover:text-primary-500 transition-colors">
                Register here
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  `
}

function initializeLoginForm() {
  const form = document.getElementById('loginForm')
  const emailInput = document.getElementById('email')
  const loginButton = document.getElementById('loginButton')
  const loginButtonText = document.getElementById('loginButtonText')
  const loginSpinner = document.getElementById('loginSpinner')
  const loginError = document.getElementById('loginError')
  const loginErrorMessage = document.getElementById('loginErrorMessage')
  const emailError = document.getElementById('emailError')

  if (!form) return

  // Real-time email validation
  emailInput.addEventListener('blur', () => {
    validateEmail(emailInput.value)
  })

  emailInput.addEventListener('input', () => {
    if (emailError.textContent) {
      validateEmail(emailInput.value)
    }
  })

  function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!email) {
      showFieldError('email', 'Email is required')
      return false
    } else if (!emailRegex.test(email)) {
      showFieldError('email', 'Please enter a valid email address')
      return false
    } else {
      hideFieldError('email')
      return true
    }
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

  function showLoginError(message) {
    loginErrorMessage.textContent = message
    loginError.classList.remove('hidden')
  }

  function hideLoginError() {
    loginError.classList.add('hidden')
  }

  function setLoading(loading) {
    if (loading) {
      loginButton.disabled = true
      loginButtonText.textContent = 'Signing in...'
      loginSpinner.classList.remove('hidden')
      loginButton.classList.add('opacity-75')
    } else {
      loginButton.disabled = false
      loginButtonText.textContent = 'Sign in'
      loginSpinner.classList.add('hidden')
      loginButton.classList.remove('opacity-75')
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault()

    hideLoginError()

    const email = emailInput.value.trim()

    // Validate form
    if (!validateEmail(email)) {
      return
    }

    setLoading(true)

    try {
      const user = await window.app.api.users.authenticateUser(email)

      // Store user in state
      window.app.state.setState('user', {
        currentUser: user,
        isAuthenticated: true,
        loading: false
      })

      // Store in localStorage
      localStorage.setItem('innovation_user', JSON.stringify(user))

      window.app.state.addNotification({
        type: 'success',
        message: `Welcome back, ${user.fullName}!`
      })

      // Check if there's a redirect destination stored
      const redirectTo = sessionStorage.getItem('redirectAfterLogin');
      sessionStorage.removeItem('redirectAfterLogin');
      
      // Redirect to stored destination or landing page
      window.location.hash = redirectTo ? `#${redirectTo}` : '#/'

    } catch (error) {
      console.error('Login error:', error)
      showLoginError(error.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  })
}