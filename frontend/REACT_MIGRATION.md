# React Migration Guide

## What's Been Done

Your frontend has been converted from vanilla JavaScript to React + Vite:

### Core Setup
- ✅ Updated `package.json` with React dependencies
- ✅ Updated `vite.config.js` with React plugin
- ✅ Updated `index.html` to use React root
- ✅ Created `main.jsx` as React entry point
- ✅ Created `App.jsx` with React Router setup

### Context Providers
- ✅ `AuthContext` - Handles authentication state
- ✅ `NotificationContext` - Handles toast notifications

### Pages Converted
- ✅ LoginPage
- ✅ RegisterPage
- ✅ LandingPage
- ✅ DashboardPage
- ✅ IdeasListPage (placeholder)
- ✅ IdeaDetailPage (placeholder)
- ✅ SubmitIdeaPage (placeholder)
- ✅ ChallengesListPage (placeholder)
- ✅ ChallengeDetailPage (placeholder)
- ✅ LeaderboardPage (placeholder)
- ✅ ProfilePage (placeholder)
- ✅ CompanyRegisterPage (placeholder)
- ✅ CompanyDashboardPage (placeholder)
- ✅ CreateChallengePage (placeholder)

### Components
- ✅ Layout component with navigation

### Services
- ✅ API client (kept as is)
- ✅ Service exports configured for React

## Installation

```bash
cd frontend
npm install
```

## Running the App

```bash
npm run dev
```

The app will run on http://localhost:3000

## Next Steps

### 1. Complete Page Implementations
The following pages have placeholder implementations and need to be fully converted:

- `IdeasListPage` - Convert from `frontend/src/pages/ideas/ideas-list.js`
- `IdeaDetailPage` - Convert from `frontend/src/pages/ideas/idea-detail.js`
- `SubmitIdeaPage` - Convert from `frontend/src/pages/ideas/submit-idea.js`
- `ChallengesListPage` - Convert from `frontend/src/pages/challenges/challenges-list.js`
- `ChallengeDetailPage` - Convert from `frontend/src/pages/challenges/challenge-detail.js`
- `LeaderboardPage` - Convert from `frontend/src/pages/leaderboard/leaderboard.js`
- `ProfilePage` - Convert from `frontend/src/pages/profile/profile.js`
- Company pages

### 2. Convert Remaining Services
Update these service files to work without `window.app`:

- `idea-service.js`
- `voting-service.js`
- `gamification-service.js`

### 3. Create Reusable Components
Extract common UI elements:

- Button component
- Input component
- Card component
- Modal component
- Badge component

### 4. Add State Management (Optional)
Consider adding Redux or Zustand if you need more complex state management beyond Context API.

## Key Differences from Vanilla JS

### Routing
**Before (Vanilla):**
```javascript
window.app.router.navigate('/dashboard')
```

**After (React):**
```javascript
import { useNavigate } from 'react-router-dom'
const navigate = useNavigate()
navigate('/dashboard')
```

### Authentication
**Before (Vanilla):**
```javascript
const user = window.app.state.getState('user').currentUser
```

**After (React):**
```javascript
import { useAuth } from '../context/AuthContext'
const { currentUser } = useAuth()
```

### Notifications
**Before (Vanilla):**
```javascript
window.app.state.addNotification({ type: 'success', message: 'Done!' })
```

**After (React):**
```javascript
import { useNotification } from '../context/NotificationContext'
const { addNotification } = useNotification()
addNotification({ type: 'success', message: 'Done!' })
```

### API Calls
**Before (Vanilla):**
```javascript
const ideas = await window.app.api.getAllIdeas()
```

**After (React):**
```javascript
import { api } from '../services'
const ideas = await api.getAllIdeas()
```

## File Structure

```
frontend/src/
├── App.jsx                 # Main app with routing
├── main.jsx               # React entry point
├── context/
│   ├── AuthContext.jsx    # Authentication state
│   └── NotificationContext.jsx  # Notifications
├── pages/
│   ├── auth/
│   │   ├── LoginPage.jsx
│   │   └── RegisterPage.jsx
│   ├── dashboard/
│   │   └── DashboardPage.jsx
│   ├── ideas/
│   ├── challenges/
│   ├── leaderboard/
│   ├── profile/
│   └── company/
├── components/
│   └── layout/
│       └── Layout.jsx
├── services/
│   ├── index.js           # Service exports
│   ├── api-client.js
│   └── user-service.js
└── styles/
    └── main.css
```

## Tips for Converting Pages

1. **Import React and hooks:**
```javascript
import React, { useState, useEffect } from 'react'
```

2. **Use hooks for state:**
```javascript
const [data, setData] = useState([])
```

3. **Use useEffect for data loading:**
```javascript
useEffect(() => {
  loadData()
}, [])
```

4. **Replace template strings with JSX:**
```javascript
// Before
return `<div class="card">${content}</div>`

// After
return <div className="card">{content}</div>
```

5. **Use event handlers:**
```javascript
// Before
element.addEventListener('click', handleClick)

// After
<button onClick={handleClick}>Click</button>
```

## Testing

After converting each page, test:
- Navigation works
- Data loads correctly
- Forms submit properly
- Authentication flow works
- Notifications appear

## Cleanup

Once migration is complete, you can remove:
- Old vanilla JS files in `src/pages/`
- `src/utils/router.js`
- `src/utils/state-manager.js`
- Old `src/main.js`
