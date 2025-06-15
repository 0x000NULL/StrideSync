# 🏃‍♂️ StrideSync

A multi-platform running tracker with cloud synchronization and offline support.

## Features

- **Multi-platform Support**: Web, Mobile (iOS/Android), and Desktop (Windows/macOS/Linux)
- **Cloud Sync**: MongoDB for cloud storage
- **Offline First**: SQLite for local storage with sync capabilities
- **Comprehensive Run Tracking**: Distance, pace, duration, heart rate, and more
- **Data Visualization**: Charts and graphs for performance analysis

## Tech Stack

- **Backend**: Node.js, Express, MongoDB, JWT Auth
- **Web**: React, React Query, Vanilla CSS
- **Mobile**: React Native, Expo, SQLite
- **Desktop**: Electron, SQLite
- **Build Tools**: npm workspaces, CommonJS

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm (v7 or later)
- MongoDB (for local development)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/stride-sync.git
   cd stride-sync
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

### Development

Start the development servers:

```bash
# Start API server
npm run start:api

# Start web app
npm run start:web

# Start mobile app (in a new terminal)
# npm run start:mobile

# Start desktop app (in a new terminal)
# npm run start:desktop
```

## Project Structure

```
stride-sync/
├── apps/
│   ├── api/            # Express + MongoDB
│   ├── web/            # React web app
│   ├── mobile/         # React Native app
│   └── desktop/        # Electron app
├── shared/             # Shared code between platforms
├── db/                 # Database models and migrations
├── tests/              # Test files
└── docs/               # Documentation
```

## Scripts

- `npm run start:api` - Start the API server
- `npm run start:web` - Start the web app
- `npm run start:mobile` - Start the mobile app
- `npm run start:desktop` - Start the desktop app
- `npm test` - Run tests
- `npm run lint` - Lint code
- `npm run format` - Format code with Prettier

## License

MIT
