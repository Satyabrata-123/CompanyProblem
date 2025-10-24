# Innovation Platform Frontend

A modern, responsive frontend application for the Employee Innovation Management Platform built with Vite, JavaScript, and Tailwind CSS.

## Features

- 🚀 Modern development with Vite
- 🎨 Beautiful UI with Tailwind CSS
- 📱 Responsive design for all devices
- 🔐 User authentication and authorization
- 💡 Idea submission and management
- 🗳️ Voting and commenting system
- 🏆 Gamification with points and badges
- 📊 Leaderboard and analytics
- ⚡ Real-time updates
- 🎯 Admin dashboard for management

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend services running (see main README)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Generic components (Button, Modal, etc.)
│   ├── forms/          # Form-specific components
│   └── layout/         # Layout components (Header, Sidebar, etc.)
├── pages/              # Page-level components
│   ├── auth/           # Authentication pages
│   ├── ideas/          # Idea-related pages
│   ├── profile/        # User profile pages
│   └── admin/          # Administrative pages
├── services/           # API communication layer
├── utils/              # Utility functions and helpers
├── styles/             # Global styles and Tailwind config
└── main.js             # Application entry point
```

## API Integration

The frontend connects to the backend microservices through the API Gateway at `http://localhost:8080/api`. The development server is configured with a proxy to handle API requests.

### Available Endpoints

- **Ideas**: `/api/ideas/*`
- **Users**: `/api/users/*`
- **Voting**: `/api/votes/*`
- **Comments**: `/api/comments/*`
- **Gamification**: `/api/gamification/*`
- **AI Services**: `/api/ai/*`

## Development

### Code Style

- Use ES6+ features
- Follow functional programming patterns
- Use Tailwind CSS utility classes
- Implement responsive design first
- Add proper error handling

### State Management

The application uses a custom lightweight state management system located in `src/utils/state-manager.js`. State is organized into modules:

- `user`: Authentication and user data
- `ideas`: Ideas list and current idea
- `votes`: User voting state
- `gamification`: Points, badges, and leaderboard
- `ui`: UI state (modals, notifications, etc.)

### Routing

Client-side routing is handled by a custom router in `src/utils/router.js`. Routes are defined in `src/main.js` and support:

- Dynamic parameters (e.g., `/ideas/:id`)
- Route guards for authentication
- Lazy loading of page components

## Contributing

1. Follow the existing code style
2. Add proper error handling
3. Test on multiple devices and browsers
4. Update documentation as needed

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

This project is part of the Employee Innovation Management Platform.