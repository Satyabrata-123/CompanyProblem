export default function RegisterPage() {
  // Initialize form after render
  setTimeout(() => {
    initializeRegisterForm()
  }, 0)

  return `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div>
          <div class="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100">
            <span class="text-2xl">🚀</span>
          </div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Join Innovation Platform
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Create your account to start sharing ideas
          </p>
        </div>
        
        <form class="mt-8 space-y-6" data-form="register" id="registerForm">
          <div id="registerError" class="hidden bg-danger-50 border border-danger-200 rounded-md p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <span class="text-danger-400">⚠️</span>
              </div>
              <div class="ml-3">
                <p class="text-sm text-danger-800" id="registerErrorMessage"></p>
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">
                Email address *
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
            
            <div>
              <label for="fullName" class="block text-sm font-medium text-gray-700">
                Full Name *
              </label>
              <input 
                id="fullName" 
                name="fullName" 
                type="text" 
                required 
                class="input mt-1"
                placeholder="John Doe"
                autocomplete="name"
              >
              <div class="text-sm text-danger-600 mt-1 hidden" id="fullNameError"></div>
            </div>
            
            <div>
              <label for="department" class="block text-sm font-medium text-gray-700">
                Department *
              </label>
              <select id="department" name="department" required class="input mt-1">
                <option value="">Select Department</option>
                <option value="Engineering">Engineering</option>
                <option value="Product">Product</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="HR">Human Resources</option>
                <option value="Finance">Finance</option>
                <option value="Operations">Operations</option>
                <option value="Legal">Legal</option>
                <option value="Customer Success">Customer Success</option>
                <option value="Other">Other</option>
              </select>
              <div class="text-sm text-danger-600 mt-1 hidden" id="departmentError"></div>
            </div>
            
            <div>
              <label for="role" class="block text-sm font-medium text-gray-700">
                Role *
              </label>
              <select id="role" name="role" required class="input mt-1">
                <option value="">Select Role</option>
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
              <div class="text-sm text-danger-600 mt-1 hidden" id="roleError"></div>
              <p class="text-xs text-gray-500 mt-1">
                Choose 'Admin' only if you have administrative privileges
              </p>
            </div>
          </div>

          <div>
            <button 
              type="submit" 
              class="btn-primary w-full" 
              id="registerButton"
            >
              <span id="registerButtonText">Create Account</span>
              <div class="hidden animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2" id="registerSpinner"></div>
            </button>
          </div>

          <div class="text-center">
            <p class="text-sm text-gray-600">
              Already have an account? 
              <a href="#/login" class="font-medium text-primary-600 hover:text-primary-500 transition-colors">
                Sign in here
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  `
}

function initializeRegisterForm() {
  const form = document.getElementById('registerForm')
  const inputs = {
    email: document.getElementById('email'),
    fullName: document.getElementById('fullName'),
    department: document.getElementById('department'),
    role: document.getElementById('role')
  }
  const registerButton = document.getElementById('registerButton')
  const registerButtonText = document.getElementById('registerButtonText')
  const registerSpinner = document.getElementById('registerSpinner')
  const registerError = document.getElementById('registerError')
  const registerErrorMessage = document.getElementById('registerErrorMessage')

  if (!form) return

  // Add real-time validation
  Object.keys(inputs).forEach(fieldName => {
    const input = inputs[fieldName]
    if (input) {
      input.addEventListener('blur', () => {
        validateField(fieldName, input.value)
      })
      
      input.addEventListener('input', () => {
        const errorElement = document.getElementById(`${fieldName}Error`)
        if (errorElement && !errorElement.classList.contains('hidden')) {
          validateField(fieldName, input.value)
        }
      })
    }
  })

  function validateField(fieldName, value) {
    let isValid = true
    let errorMessage = ''

    switch (fieldName) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!value) {
          errorMessage = 'Email is required'
          isValid = false
        } else if (!emailRegex.test(value)) {
          errorMessage = 'Please enter a valid email address'
          isValid = false
        }
        break
        
      case 'fullName':
        if (!value) {
          errorMessage = 'Full name is required'
          isValid = false
        } else if (value.length < 2) {
          errorMessage = 'Full name must be at least 2 characters'
          isValid = false
        } else if (value.length > 100) {
          errorMessage = 'Full name must be less than 100 characters'
          isValid = false
        }
        break
        
      case 'department':
        if (!value) {
          errorMessage = 'Please select a department'
          isValid = false
        }
        break
        
      case 'role':
        if (!value) {
          errorMessage = 'Please select a role'
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
    let isValid = true
    
    Object.keys(inputs).forEach(fieldName => {
      const input = inputs[fieldName]
      if (input && !validateField(fieldName, input.value)) {
        isValid = false
      }
    })
    
    return isValid
  }

  function showFieldError(fieldName, message) {
    const errorElement = document.getElementById(`${fieldName}Error`)
    const inputElement = inputs[fieldName]
    
    if (errorElement && inputElement) {
      errorElement.textContent = message
      errorElement.classList.remove('hidden')
      inputElement.classList.add('input-error')
      inputElement.classList.remove('input')
    }
  }

  function hideFieldError(fieldName) {
    const errorElement = document.getElementById(`${fieldName}Error`)
    const inputElement = inputs[fieldName]
    
    if (errorElement && inputElement) {
      errorElement.textContent = ''
      errorElement.classList.add('hidden')
      inputElement.classList.remove('input-error')
      inputElement.classList.add('input')
    }
  }

  function showRegisterError(message) {
    registerErrorMessage.textContent = message
    registerError.classList.remove('hidden')
  }

  function hideRegisterError() {
    registerError.classList.add('hidden')
  }

  function setLoading(loading) {
    if (loading) {
      registerButton.disabled = true
      registerButtonText.textContent = 'Creating Account...'
      registerSpinner.classList.remove('hidden')
      registerButton.classList.add('opacity-75')
    } else {
      registerButton.disabled = false
      registerButtonText.textContent = 'Create Account'
      registerSpinner.classList.add('hidden')
      registerButton.classList.remove('opacity-75')
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    
    hideRegisterError()
    
    // Validate form
    if (!validateForm()) {
      return
    }

    const userData = {
      email: inputs.email.value.trim(),
      fullName: inputs.fullName.value.trim(),
      department: inputs.department.value,
      role: inputs.role.value
    }

    setLoading(true)

    try {
      const user = await window.app.api.users.createUser(userData)
      
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
        message: `Welcome to Innovation Platform, ${user.fullName}!`
      })
      
      // Redirect to Dashboard after successful registration
      window.app.router.navigate('/Dashboard')
      
    } catch (error) {
      console.error('Registration error:', error)
      showRegisterError(error.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  })
}