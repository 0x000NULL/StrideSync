# Development Setup Guide

This guide will help you set up your development environment for contributing to StrideSync.

## Prerequisites

- **Node.js** (v16 or later)
- **npm** (v7 or later, comes with Node.js)
- **Git**
- **MongoDB** (for local development)
- **For mobile development**:
  - iOS: Xcode (macOS only)
  - Android: Android Studio
- **For desktop development**:
  - Windows: Visual Studio Build Tools
  - macOS: Xcode Command Line Tools
  - Linux: Build essentials (gcc, make, etc.)

## Getting the Source Code

1. **Fork the repository** on GitHub
2. **Clone your fork**
   ```bash
   git clone https://github.com/yourusername/stride-sync.git
   cd stride-sync
   ```
3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/original-owner/stride-sync.git
   ```

## Project Structure

```
stride-sync/
├── apps/
│   ├── api/            # Backend API server
│   ├── web/            # Web application
│   ├── mobile/         # Mobile app (React Native)
│   └── desktop/        # Desktop application (Electron)
├── db/                 # Database models and migrations
├── docs/               # Documentation
└── package.json        # Root package.json with workspace config
```

## Environment Setup

1. **Copy the example environment file**
   ```bash
   cp .env.example .env
   ```

2. **Configure environment variables** in `.env`:
   ```env
   # API
   PORT=3001
   NODE_ENV=development
   
   # Database
   MONGODB_URI=mongodb://localhost:27017/stridesync
   
   # Authentication
   JWT_SECRET=your-secret-key
   JWT_EXPIRES_IN=7d
   
   # API Keys (get your own keys from the respective services)
   MAPBOX_TOKEN=your-mapbox-token
   ```

## Installing Dependencies

From the project root, run:

```bash
# Install root dependencies
npm install

# Install all workspace dependencies
npm run setup
```

## Running the Development Servers

### API Server
```bash
cd apps/api
npm run dev
```

### Web Application
```bash
cd apps/web
npm run dev
```

### Mobile Application
```bash
cd apps/mobile
npm start
```

### Desktop Application
```bash
cd apps/desktop
npm start
```

## Development Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**

3. **Run tests**
   ```bash
   # Run all tests
   npm test
   
   # Run tests for a specific app
   cd apps/api && npm test
   ```

4. **Lint your code**
   ```bash
   npm run lint
   ```

5. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature"
   ```

6. **Push to your fork**
   ```bash
   git push -u origin feature/your-feature-name
   ```

7. **Create a Pull Request**
   - Go to your fork on GitHub
   - Click "New Pull Request"
   - Select the base branch (usually `main`)
   - Write a clear description of your changes
   - Submit the PR

## Debugging

### API Server
```bash
# Debug with Node inspector
cd apps/api
npm run debug
```

### Web Application
- Use React Developer Tools extension
- Use browser's developer tools (F12)

### Mobile Application
```bash
# iOS debug build
cd apps/mobile
npm run ios -- --simulator="iPhone 14"

# Android debug build
npm run android
```

## Testing

### Run all tests
```bash
npm test
```

### Run specific test files
```bash
# For API tests
cd apps/api
npm test -- path/to/test/file.test.js

# For web tests
cd apps/web
npm test -- path/to/test/file.test.js
```

### Watch mode
```bash
npm test -- --watch
```

## Code Style

- **JavaScript/TypeScript**: Follows [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- **React**: Follows [Airbnb React/JSX Style Guide](https://github.com/airbnb/javascript/tree/master/react)
- **CSS**: Use BEM methodology for class naming

## Git Hooks

We use Husky to run pre-commit hooks that will:
- Lint your code
- Run tests on affected files
- Format your code with Prettier

## Need Help?

- Check the [FAQ](../resources/faq.md)
- Look through [GitHub Issues](https://github.com/yourusername/stride-sync/issues)
- Ask in our [Discord/Slack channel] (if available)
