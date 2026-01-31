# Dictator AI - Frontend

**Dictator AI** is an intelligent PDF reader that turns documents into interactive audio experiences. This frontend is built with React, TypeScript, and Vite.

## 🚀 Key Features
- **Smart Parsing**: Upload PDFs and see them parsed into intelligent segments.
- **Audio Sync**: Click any text to hear it spoken instantly.
- **Micro-Animations**: A premium, fluid user interface.
- **Mobile Ready**: Optimized for touch devices.

## 🛠️ Setup & Development

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```
Runs the app in development mode. Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

### Formatting & Linting
```bash
npm run lint:fix
```

### Path Aliases
We use `@/` to point to the `src/` directory.
- `import Button from '@/components/Button'`
- `import { useDictator } from '@/hooks/useDictator'`

## 📁 Project Structure

```
src/
├── assets/         # Static assets
├── components/     # Reusable UI components
├── context/        # React Context (State)
├── hooks/          # Custom Hooks (Logic)
├── services/       # API Services
├── styles/         # SCSS Variables & Global Styles
├── utils/          # Helper functions
└── App.tsx         # Main entry component
```
