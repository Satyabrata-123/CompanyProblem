// Button component will be implemented in future tasks
export function Button({ text, type = 'button', variant = 'primary', size = 'medium', onClick, disabled = false }) {
  const baseClasses = 'btn'
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
    ghost: 'btn-ghost'
  }
  
  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-sm',
    large: 'px-6 py-3 text-base'
  }
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`
  
  return `
    <button 
      type="${type}" 
      class="${classes}"
      ${disabled ? 'disabled' : ''}
      onclick="${onClick || ''}"
    >
      ${text}
    </button>
  `
}