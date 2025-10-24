// Input component will be implemented in future tasks
export function Input({ id, name, type = 'text', placeholder, required = false, value = '', error = null }) {
  const inputClasses = error ? 'input-error' : 'input'
  
  return `
    <div class="form-field">
      <input 
        id="${id}"
        name="${name}"
        type="${type}"
        class="${inputClasses}"
        placeholder="${placeholder || ''}"
        value="${value}"
        ${required ? 'required' : ''}
      >
      ${error ? `<p class="mt-1 text-sm text-danger-600">${error}</p>` : ''}
    </div>
  `
}