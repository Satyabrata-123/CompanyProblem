export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validateRequired(value) {
  return value && value.toString().trim().length > 0
}

export function validateMinLength(value, minLength) {
  return value && value.toString().length >= minLength
}

export function validateMaxLength(value, maxLength) {
  return !value || value.toString().length <= maxLength
}

export function validateIdeaTitle(title) {
  const errors = []
  
  if (!validateRequired(title)) {
    errors.push('Title is required')
  } else {
    if (!validateMinLength(title, 5)) {
      errors.push('Title must be at least 5 characters long')
    }
    if (!validateMaxLength(title, 100)) {
      errors.push('Title must be less than 100 characters')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validateIdeaDescription(description) {
  const errors = []
  
  if (!validateRequired(description)) {
    errors.push('Description is required')
  } else {
    if (!validateMinLength(description, 20)) {
      errors.push('Description must be at least 20 characters long')
    }
    if (!validateMaxLength(description, 2000)) {
      errors.push('Description must be less than 2000 characters')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validateUserRegistration(userData) {
  const errors = {}
  
  if (!validateRequired(userData.email)) {
    errors.email = ['Email is required']
  } else if (!validateEmail(userData.email)) {
    errors.email = ['Please enter a valid email address']
  }
  
  if (!validateRequired(userData.fullName)) {
    errors.fullName = ['Full name is required']
  } else if (!validateMinLength(userData.fullName, 2)) {
    errors.fullName = ['Full name must be at least 2 characters long']
  }
  
  if (!validateRequired(userData.department)) {
    errors.department = ['Department is required']
  }
  
  if (!validateRequired(userData.role)) {
    errors.role = ['Role is required']
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

export function validateComment(content) {
  const errors = []
  
  if (!validateRequired(content)) {
    errors.push('Comment cannot be empty')
  } else {
    if (!validateMinLength(content, 3)) {
      errors.push('Comment must be at least 3 characters long')
    }
    if (!validateMaxLength(content, 500)) {
      errors.push('Comment must be less than 500 characters')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export function sanitizeInput(input) {
  if (typeof input !== 'string') return input
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

export function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}