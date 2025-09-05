# Rei Config Manager

A unified configuration file management tool powered by Tauri and Next.js.

## Features

- 🚀 Cross-platform support (Windows, macOS, Linux)
- 📝 Multi-format support (JSON, YAML, TOML, INI, XML, .env)
- 🎨 Unified editing interface with smart form editor
- 💾 Preset management for quick configuration switching
- 🔄 Version control with history and rollback
- ⚡ Real-time configuration application

## Development

### Prerequisites

- Node.js 18+
- Rust 1.77+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run in development mode
npm run tauri:dev
```

### Development Scripts

```bash
# Run ESLint checks
npm run lint

# Auto-fix linting issues
npm run lint:fix

# TypeScript type checking
npm run typecheck

# Development server
npm run dev

# Build application
npm run build
```

### Build

```bash
# Build for production
npm run tauri:build
```

### Code Quality

This project uses ESLint with TypeScript support to maintain code quality:
- Non-blocking warnings for common issues
- Automatic cleanup of unused imports
- TypeScript strict mode enabled
- React hooks best practices enforced

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture documentation.

## TODO

See [TODO.md](./TODO.md) for the development roadmap and task list.

## License

MIT