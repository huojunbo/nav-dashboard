# Navigation Dashboard

A feature-rich, modern personal navigation dashboard application that integrates clock, search, bookmarks, weather, todos, and user authentication. Built with React 19 + TypeScript + Express + SQLite.
[中文](./README.md)
## ✨ Main Features

- 🕐 **Clock Widget** - Real-time clock display
- 🔍 **Search Bar** - Quick search support
- 🔗 **Link Management** - Customizable bookmark grid with add, edit, delete functionality
- 🌤️ **Weather Widget** - Current location weather information
- ✅ **Todo List** - Task management
- 🔐 **User Authentication** - Login/Registration system
- 🌍 **Multi-language Support** - Chinese and English switching
- 💾 **Data Persistence** - SQLite database with localStorage backup
- 🛡️ **Secure Authentication** - JWT token authentication

## 🛠️ Technology Stack

### Frontend
- **React 19.2.0** - Modern React framework
- **TypeScript 5.9.3** - Type-safe JavaScript superset
- **Vite 7.2.4** - Fast build tool
- **Tailwind CSS 4.1.18** - Utility-first CSS framework
- **i18next** - Internationalization framework
- **lucide-react** - Beautiful icon library

### Backend
- **Express 5.2.1** - Node.js web framework
- **better-sqlite3** - Synchronous SQLite database
- **CORS** - Cross-origin resource sharing
- **jsonwebtoken** - JWT authentication

### Development Tools
- **ESLint** - Code quality checking
- **PostCSS** - CSS processing
- **Docker** - Containerized deployment

### Security
- **bcryptjs** - Password hashing

## 📁 Project Structure

```
nav-dashboard/
├── src/                      # Frontend source code
│   ├── components/           # React components
│   │   ├── ClockWidget.tsx   # Clock component
│   │   ├── SearchBar.tsx     # Search bar
│   │   ├── LinkGrid.tsx      # Link grid
│   │   ├── WeatherWidget.tsx # Weather component
│   │   ├── TodoWidget.tsx    # Todo component
│   │   ├── Layout.tsx        # Layout component
│   │   └── LanguageSwitcher.tsx # Language switcher
│   ├── i18n/                 # Internationalization config
│   │   ├── config.ts         # i18n config
│   │   └── locales/          # Language files
│   │       ├── en.json       # English translations
│   │       └── zh.json       # Chinese translations
│   ├── App.tsx               # Main app component
│   └── main.tsx              # App entry
├── server/                   # Backend server
│   ├── index.js              # Server entry
│   ├── database.js           # SQLite database config
│   └── routes/               # API routes
│       ├── links.js          # Bookmarks API
│       └── todos.js          # Todos API
├── public/                   # Static assets
├── dist/                     # Build output
├── Dockerfile                # Docker config
├── docker-compose.yml        # Docker Compose config
├── DOCKER.md                 # Docker deployment docs
├── tsconfig.json             # TypeScript config
├── vite.config.ts            # Vite config
└── package.json              # Project dependencies
```

## 🚀 Quick Start

### Requirements

- Node.js 18.0 or higher
- npm package manager

### Installation

```bash
# Clone the project
git clone <repository-url>
cd nav-dashboard

# Install dependencies
npm install
```

### Development Mode

```bash
# Start both frontend and backend
npm run dev

# Or start separately
npm run dev:server  # Start backend server (port 3001)
npm run dev:client  # Start frontend dev server
```

Access http://localhost:5173 to view the application

### Build for Production

```bash
# Build the project
npm run build

# Preview production version
npm run preview
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file (refer to `.env.example`):

```env
# API server address (optional, default: http://localhost:3001/api)
VITE_API_URL=http://localhost:3001/api

# Server port (optional, default: 3001)
PORT=3001
```

### Port Information

- **Frontend dev server**: http://localhost:5173
- **Backend API server**: http://localhost:3001
- **After production build**: http://localhost:3001 (backend serves static files)

## 📦 Docker Deployment

The project supports Docker containerized deployment. See [DOCKER.md](./DOCKER.md) for detailed deployment instructions.

### Quick Start

```bash
# Use Docker Compose
docker-compose up -d

# Access the application at http://localhost:3001
```

## 🔐 User Authentication

### Login/Registration

- User registration and login support
- JWT token authentication
- Password hashing storage

### API Authentication

```bash
POST   /api/auth/register  # User registration
POST   /api/auth/login    # User login
POST   /api/auth/logout   # User logout
GET    /api/auth/profile  # Get user info
```

## 🌐 API Endpoints

### Bookmark Management

```bash
GET    /api/links       # Get all bookmarks
POST   /api/links       # Create bookmark
PUT    /api/links/:id   # Update bookmark
DELETE /api/links/:id   # Delete bookmark
```

### Todo List

```bash
GET    /api/todos       # Get all todos
POST   /api/todos       # Create todo
PUT    /api/todos/:id   # Update todo
DELETE /api/todos/:id   # Delete todo
```

### Health Check

```bash
GET    /api/health      # Service health status
```

## 🌍 Internationalization

The application supports Chinese and English switching. Language files are located in `src/i18n/locales/`.

### Language Switching

Users can switch between Chinese and English using the language switcher in the top-right corner of the interface.

### Adding New Languages

1. Create a new language JSON file in `src/i18n/locales/`
2. Add language configuration in `src/i18n/config.ts`
3. Add language switching options in `LanguageSwitcher.tsx`

### Example

```typescript
// In LanguageSwitcher.tsx
const languages = [
  { code: 'zh', name: '中文' },
  { code: 'en', name: 'English' }
];
```

## 💾 Data Storage

- **Primary storage**: SQLite database (`server/data/dashboard.db`)
- **Fallback storage**: localStorage (auto-downgrades when API is unavailable)
- **Data backup**: Supports backup and restore via database files

## 🎨 Customization

### Modify Default Links

Edit the `DEFAULT_LINKS` array in `src/components/LinkGrid.tsx`:

```typescript
const DEFAULT_LINKS = [
    { id: '1', name: 'GitHub', url: 'https://github.com' },
    { id: '2', name: 'YouTube', url: 'https://youtube.com' },
    // Add more links...
];
```

### Modify Theme Colors

Edit the `vite.config.ts` configuration file to customize the theme.

## 🐛 Troubleshooting

### Database Connection Error

Ensure the `server/data/` directory exists and has write permissions:

```bash
mkdir -p server/data
chmod 755 server/data
```

### Port Conflict

Modify the `PORT` environment variable in the `.env` file.

### API Request Failure

Check if the backend service is running and confirm firewall settings.

## 📄 License

MIT License

## 📦 Version Information

- **Version**: 0.1.0
- **Build Time**: January 22, 2026
- **Last Updated**: January 22, 2026

## 🤝 Contribution

Welcome to submit Issues and Pull Requests! Please ensure your code follows the project's coding standards.

## 📧 Contact

For questions or suggestions, please contact via Issue.

---

