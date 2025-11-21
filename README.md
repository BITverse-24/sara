# electron-ts

Electron boilerplate with TypeScript, Next.js, and modular IPC mechanism

## Features

- ⚡ **Electron** - Desktop application framework
- 🔷 **TypeScript** - Strict type checking enabled
- ⚛️ **Next.js** - React framework for the renderer process
- 🔒 **Security First** - Context isolation enabled, node integration disabled
- 💅 **Prettier** - Code formatting

## Project Structure

```
electron-ts/
├── src/
│   ├── main/           # Electron main process (TypeScript)
│   │   └── main.ts
│   └── preload/        # Preload scripts (TypeScript)
│       └── preload.ts
├── renderer/           # Next.js application
│   ├── pages/
│   ├── styles/
│   └── next.config.js
├── dist/               # Compiled JavaScript (generated)
└── tsconfig*.json      # TypeScript configurations
```

## Security Configuration

This project follows Electron security best practices:

- ✅ `contextIsolation: true` - Isolates preload scripts from renderer
- ✅ `nodeIntegration: false` - Prevents direct Node.js access from renderer
- ✅ `sandbox: true` - Additional security layer
- ✅ IPC communication via secure contextBridge

## Getting Started

### Install Dependencies

```bash
npm install
```

### Development

```bash
# Build main and preload processes
npm run build:main
npm run build:preload

# Start Next.js dev server (in one terminal)
npm run dev:renderer

# Start Electron (in another terminal, after renderer is running)
npm run dev:electron
```

### Build for Production

```bash
npm run build
```

This will:
1. Compile the main process TypeScript
2. Compile the preload script TypeScript
3. Build the Next.js renderer to static files

### Package

```bash
npm run package
```

### Code Formatting

```bash
# Format all files
npm run format

# Check formatting
npm run format:check
```

## TypeScript Configuration

The project uses strict TypeScript configuration with the following enabled:
- `strict: true`
- `noImplicitAny: true`
- `strictNullChecks: true`
- `strictFunctionTypes: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- And more...

## License

ISC
