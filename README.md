# CrisisConnect

A full-stack emergency management web application for coordinating crisis response, managing alerts, evacuation procedures, and communication during emergencies.

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run development servers
cd artifacts/api-server && pnpm dev
# In another terminal:
cd artifacts/crisis-connect && pnpm dev
```

## 🔧 Requirements

- **Node.js**: v24+
- **pnpm**: v9+
- **PostgreSQL**: For production database

## 📁 Project Structure

```
├── artifacts/
│   ├── api-server/          # Express.js backend API
│   ├── crisis-connect/     # React frontend application
│   └── mockup-sandbox/     # Mockup preview tool
├── lib/
│   ├── api-client-react/   # React API client (generated)
│   ├── api-spec/          # OpenAPI specifications
│   ├── api-zod/           # Zod schemas for validation
│   └── db/                # Drizzle ORM database layer
└── scripts/               # Build and utility scripts
```

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm install` | Install all dependencies |
| `pnpm build` | Build all packages with type checking |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm --filter @workspace/api-spec run codegen` | Regenerate API hooks and Zod schemas from OpenAPI spec |
| `pnpm --filter @workspace/db run push` | Push DB schema changes (dev only) |
| `pnpm --filter @workspace/api-server run dev` | Run API server locally |

### Individual Packages

**API Server** (`artifacts/api-server`):
- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server

**Frontend** (`artifacts/crisis-connect`):
- `pnpm dev` - Start Vite dev server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build

## 🖥️ Frontend Routes

| Path | Description |
|------|-------------|
| `/` | Home page |
| `/report` | Report an incident |
| `/dashboard` | Dashboard with alerts and stats |
| `/admin` | Admin management panel |

## 🔧 Technology Stack

### Frontend
- **React** with TypeScript
- **Vite** for build tooling
- **TanStack Query** for data fetching
- **Wouter** for routing
- **Shadcn UI** components

### Backend
- **Express.js** with TypeScript
- **Drizzle ORM** for database
- **Pino** for logging

### Shared
- **OpenAPI** specification
- **Zod** (v4) for schema validation
- **Drizzle-zod** for ORM integration
- **Orval** for API code generation
- **esbuild** for CJS bundling
- **pnpm** workspaces

## 🔌 API Endpoints

The API server provides the following main endpoints:

- `/api/alerts` - Alert management
- `/api/chat` - Chat/messaging
- `/api/evacuation` - Evacuation procedures
- `/api/requests` - Request handling
- `/api/health` - Health check

## ✨ Features

- **Role-based Access**: Guest, Staff, and Admin roles (stored in localStorage)
- **Real-time Updates**: React Query polling every 3 seconds for live data
- **Audio Alerts**: WebAudio beep sound on new alerts
- **Toast Notifications**: Instant notifications for new alerts
- **Dark Mode**: System theme support via next-themes
- **Emergency Response**: Coordinate crisis response and evacuation procedures
- **Request Management**: Handle guest requests during emergencies

## ⚙️ Environment Variables

Create `.env` files in the respective packages as needed. Refer to each package's documentation for required variables.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT