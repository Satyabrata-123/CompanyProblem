# Vite Latest Setup Guide

## ✅ Updated to Latest Versions

Your project has been updated to use the latest stable versions:

### Package Versions

```json
{
  "dependencies": {
    "react": "^18.3.1",           // Latest React
    "react-dom": "^18.3.1",       // Latest React DOM
    "react-router-dom": "^6.26.0", // Latest React Router
    "axios": "^1.7.7"             // Latest Axios
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1", // Latest Vite React Plugin
    "vite": "^5.4.6",                  // Latest Vite
    "tailwindcss": "^3.4.11",          // Latest Tailwind
    "autoprefixer": "^10.4.20",        // Latest Autoprefixer
    "postcss": "^8.4.47"               // Latest PostCSS
  }
}
```

## 🚀 Installation

```bash
cd frontend
npm install
```

## 📝 Configuration Files

### vite.config.js
- ✅ React plugin configured
- ✅ Build optimizations
- ✅ Code splitting for React vendors
- ✅ API proxy to backend (port 8080)
- ✅ Dev server on port 3000
- ✅ Preview server configured

### tailwind.config.js
- ✅ Content paths configured
- ✅ Custom color palette (primary, success, warning, danger)
- ✅ Custom animations (slide-in, fade-in, bounce-in)
- ✅ Inter font family

### postcss.config.js
- ✅ Tailwind CSS plugin
- ✅ Autoprefixer plugin

## 🎯 Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔧 Vite Features Enabled

### Development
- ⚡ Lightning-fast HMR (Hot Module Replacement)
- 🔥 Instant server start
- 🎨 CSS hot reload
- 🔍 Source maps

### Build
- 📦 Optimized bundle size
- 🗜️ Code splitting
- 🌳 Tree shaking
- 💾 Asset optimization
- 📊 Build analysis

### Performance
- ⚡ Native ES modules
- 🚀 Fast refresh
- 💨 Optimized dependencies
- 🎯 Lazy loading

## 📊 Build Optimizations

### Code Splitting
React vendor libraries are split into a separate chunk:
- react
- react-dom
- react-router-dom

This improves caching and reduces initial load time.

### Asset Optimization
- Images optimized automatically
- CSS minified and purged
- JavaScript minified with terser
- Source maps for debugging

## 🌐 Proxy Configuration

API requests to `/api/*` are proxied to `http://localhost:8080`

Example:
```javascript
// Frontend makes request to:
fetch('/api/users')

// Vite proxies to:
http://localhost:8080/api/users
```

## 🎨 Tailwind CSS

### Custom Colors
- **Primary**: Blue shades (50-900)
- **Success**: Green shades (50-900)
- **Warning**: Yellow/Orange shades (50-900)
- **Danger**: Red shades (50-900)

### Custom Animations
```css
/* Slide in from right */
.animate-slide-in

/* Fade in */
.animate-fade-in

/* Bounce in */
.animate-bounce-in
```

## 🔍 Environment Variables

Create `.env` file in frontend directory:

```env
# API Base URL (optional, defaults to /api)
VITE_API_BASE_URL=http://localhost:8080/api

# App Title
VITE_APP_TITLE=Innovation Platform

# Enable Debug Mode
VITE_DEBUG=false
```

Access in code:
```javascript
const apiUrl = import.meta.env.VITE_API_BASE_URL
const appTitle = import.meta.env.VITE_APP_TITLE
```

## 📱 Browser Support

Vite targets modern browsers by default:
- Chrome >=87
- Firefox >=78
- Safari >=14
- Edge >=88

For legacy browser support, add `@vitejs/plugin-legacy`:
```bash
npm install -D @vitejs/plugin-legacy
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Change port in vite.config.js
server: {
  port: 3001  // Use different port
}
```

### Module Not Found
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build Errors
```bash
# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

### HMR Not Working
```bash
# Check if using WSL, may need:
server: {
  watch: {
    usePolling: true
  }
}
```

## 📚 Documentation

- [Vite Documentation](https://vitejs.dev)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [React Router](https://reactrouter.com)

## ✨ What's New in Vite 5.4

- Improved build performance
- Better error messages
- Enhanced HMR stability
- Optimized dependency pre-bundling
- Better TypeScript support
- Improved CSS handling

## 🎉 Ready to Go!

Your project is now using the latest Vite and all dependencies are up to date!

```bash
npm run dev
```

Visit: http://localhost:3000

Happy coding! 🚀
