[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)

<div align="center">
  <img src="public/logo.svg" width="120" alt="GDEX Logo"/>
  <h1>GDEX</h1>
  <p><i>Geometry Dash Level Extractor - Download and export levels in multiple formats</i></p>
</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Project](#running-the-project)
- [Export Formats](#export-formats)
- [Project Structure](#project-structure)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## Overview

**GDEX** is a powerful web application designed for Geometry Dash players, level creators, and researchers who need to extract, analyze, and export level data. Whether you're studying level design patterns, training neural networks, or simply want to backup your favorite levels, GDEX provides a seamless interface for downloading Geometry Dash levels in multiple formats.

The application connects to Geometry Dash servers, retrieves level data, parses object information, and exports it in various formats suitable for different use cases - from importing back into the game to feeding into machine learning models.

**Key highlights:**
- Search and verify levels before downloading
- Batch download multiple levels with queue management
- Beautiful, responsive UI with dark/light theme support
- Real-time server status monitoring
- Optimized for Vercel deployment

---

## Features

- **Multi-format Export** - Export levels as `.gmd`, `.json`, `.csv`, `.xls`, metadata, and `.mp3` audio files
- **Batch Processing** - Queue system for downloading multiple levels sequentially
- **Level Statistics** - Detailed object counts, difficulty ratings, stars, likes, and download metrics
- **Server Selection** - Choose between official and community GD servers for optimal availability
- **Real-time Validation** - Instant level verification before download attempts
- **Theme Support** - Dark and light modes with smooth transitions
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- **Object Analysis** - Preview first 100 objects sorted by X position for quick inspection

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript 5 |
| **Styling** | Tailwind CSS 4, Custom CSS variables |
| **UI Components** | Custom component library with icons |
| **Backend** | Next.js API Routes (Serverless) |
| **Data Processing** | Native Node.js (zlib for decompression) |
| **External API** | GDBrowser API for metadata |
| **Deployment** | Vercel (optimized) |
| **Package Manager** | Bun / npm |

---

## Prerequisites

Before running this project locally, ensure you have:

- **Node.js** >= 18.x or **Bun** >= 1.0
- **npm** or **Bun** package manager
- Modern web browser (Chrome, Firefox, Edge, Safari)
- Git for cloning the repository

No database or external services required for local development!

---

## Installation

```bash
# 1. Clone the repository
git clone https://github.com/mapa3m-dev/gdex.git
cd gdex

# 2. Install dependencies (using npm or bun)
npm install
# OR
bun install

# 3. Copy environment configuration
cp .env.example .env.local
```

---

## Configuration

Environment variables (optional - defaults work out of the box):

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GD_SECRET` | ❌ | `Wmfd2893gb7` (base64 encoded) | Geometry Dash server secret key |
| `MAX_LEVEL_ID` | ❌ | `999999999` | Maximum allowed level ID for validation |

**Note:** Secrets are base64 encoded in the code for obfuscation. Override via environment variables if needed.

---

## Running the Project

### Development Mode

```bash
# Using npm
npm run dev

# Using Bun
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build + Start

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Linting

```bash
npm run lint
```

---

## Export Formats

GDEX supports multiple export formats for different use cases:

| Format | Extension | Use Case |
|--------|-----------|----------|
| **GMD** | `.gmd` | Import directly into Geometry Dash |
| **JSON** | `.json` | Neural networks, data analysis, structured storage |
| **CSV** | `.csv` | Spreadsheet analysis, statistical tools |
| **Excel** | `.xls` | Microsoft Excel compatible format |
| **Metadata** | `_meta.json` | Complete level information (author, stats, etc.) |
| **Audio** | `.mp3` | Background music from the level (if available) |

---

## Project Structure

```
gdex/
├── app/                    # Next.js App Router
│   ├── api/                # API endpoints
│   │   ├── check/          # Level verification endpoint
│   │   └── download/       # Level download endpoint
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Main application page
├── components/             # React components
│   ├── ui/                 # Reusable UI primitives
│   ├── icons/              # SVG icon library
│   ├── DifficultyIcon.tsx  # Dynamic difficulty display
│   ├── DownloadQueue.tsx   # Batch queue component
│   ├── Footer.tsx          # Footer component
│   ├── ServersStatus.tsx   # Server status widget
│   └── ThemeProvider.tsx   # Theme context provider
├── lib/                    # Core utilities
│   ├── constants.ts        # Application constants
│   ├── gd-parser.ts        # GD level parsing logic
│   └── types.ts            # TypeScript type definitions
├── public/                 # Static assets
│   ├── fonts/              # Custom fonts (Pusab)
│   └── logo.svg            # Application logo
├── .env.example            # Environment variable template
├── .gitignore              # Git ignore rules
├── LICENSE                 # MIT License
├── next.config.ts          # Next.js configuration
├── package.json            # Dependencies and scripts
└── tsconfig.json           # TypeScript configuration
```

---

## Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub repository
2. Visit [Vercel](https://vercel.com) and import your repository
3. Framework preset: **Next.js** (auto-detected)
4. Configure environment variables (optional)
5. Click **Deploy**

The application is pre-configured with:
- `output: "standalone"` for optimized builds
- Compression enabled
- Powered-by header removed
- Source maps disabled in production

### Manual Deployment

```bash
# Build standalone production bundle
npm run build

# Deploy .next/standalone folder to any Node.js host
```

### Docker (Optional)

Create a `Dockerfile`:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm ci && npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

For bug reports and feature requests, please open an issue on the [GitHub repository](https://github.com/mapa3m-dev/gdex/issues).

---

## License

Copyright © 2026 mapa3m-dev

This project is licensed under the [MIT License](LICENSE).

```
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software.
```

---

## Contact

**Author:** mapa3m-dev
**GitHub:** [@mapa3m-dev](https://github.com/mapa3m-dev)
**Repository:** [https://github.com/mapa3m-dev/gdex](https://github.com/mapa3m-dev/gdex)

Feel free to open an [issue](https://github.com/mapa3m-dev/gdex/issues) for bug reports or feature requests.