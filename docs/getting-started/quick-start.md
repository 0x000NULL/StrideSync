# Quick Start Guide

This guide will help you get started with StrideSync in just a few minutes.

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v16 or later)
- npm (v7 or later)
- Git
- MongoDB (for local development)
- For mobile development: Xcode (iOS) or Android Studio (Android)

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/stride-sync.git
   cd stride-sync
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file with your configuration.

## Running the Applications

### Web Application
```bash
cd apps/web
npm run dev
```

### API Server
```bash
cd apps/api
npm run dev
```

### Mobile App (iOS)
```bash
cd apps/mobile
npm run ios
```

### Mobile App (Android)
```bash
cd apps/mobile
npm run android
```

### Desktop App
```bash
cd apps/desktop
npm start
```

## Creating Your First Run

1. Open the web app at `http://localhost:3000` or launch the mobile/desktop app
2. Create a new account or sign in
3. Click the "+" button to start a new run
4. Grant location permissions when prompted
5. Press "Start Run" to begin tracking
6. Press "Stop" when finished to save your run

## Next Steps

- [Explore the User Guide](../user-guides/web.md) for detailed usage instructions
- [Set up your development environment](../development/setup.md) for contributing
- [Read the API documentation](../development/api/README.md) for integration options

## Need Help?

If you encounter any issues:
1. Check the [Troubleshooting Guide](../resources/troubleshooting.md)
2. Search [GitHub Issues](https://github.com/yourusername/stride-sync/issues)
3. Open a new issue if your problem isn't listed
