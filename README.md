<p align="center">
  <img src="https://workfromcoffee.com/metadata/wfcos.png" alt="Work from Coffee OS" width="100%">
</p>

<h1 align="center">Work from Coffee OS</h1>

<p align="center">
 <a href="https://nextjs.org/">
    <img src="https://img.shields.io/badge/Next.js-15.3.1-000000?logo=next.js&logoColor=white" alt="Next.js">
  </a>
  <a href="https://reactjs.org/">
    <img src="https://img.shields.io/badge/React-19.1.0-61DAFB?logo=react&logoColor=white" alt="React">
  </a>
  <a href="https://nodejs.org/">
    <img src="https://img.shields.io/badge/Node.js-18.x+-43853D?logo=node.js&logoColor=white" alt="Node.js Version">
  </a>
  <a href="https://www.typescriptlang.org/">
    <img src="https://img.shields.io/badge/TypeScript-5.8.3-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
  </a>
  <a href="https://tailwindcss.com/">
    <img src="https://img.shields.io/badge/Tailwind_CSS-4.1.4-38B2AC?logo=tailwind-css&logoColor=white" alt="Tailwind CSS">
  </a>
  <a href="https://shadcn.com/">
    <img src="https://img.shields.io/badge/Shadcn-0.1.14-000000?logo=shadcn&logoColor=white" alt="Shadcn">
  </a>
  <a href="https://bun.sh/">
    <img src="https://img.shields.io/badge/Bun-1.0.0-000000?logo=bun&logoColor=white" alt="Bun">
  </a>
  <a href="https://deepwiki.com/ekmigasari/wfcOS"><img src="https://deepwiki.com/badge.svg" alt="Ask DeepWiki"></a>
</p>

<p align="center">
  <b>A web-based desktop environment to centralize your digital workflow and enhance productivity.</b>
</p>

<p align="center">
  <a href="#-overview">Overview</a> •
  <a href="#-features">Features</a> •
  <a href="#%EF%B8%8F-tech-stack">Tech Stack</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-development">Development</a> •
  <a href="#-contributing">Contributing</a> •
  <a href="https://deepwiki.com/ekmigasari/wfcOS/">Documentation</a> •
  <a href="#-license">License</a>
</p>

## 📋 Overview

WFCOS (Work From Cafe OS) provides a single, organized interface that helps users reduce clutter, streamline tasks, and access essential tools and applications efficiently from any browser.

Built with a cutting-edge stack including Next.js 15, React 19, and Tailwind CSS v4, WFCOS offers a customizable and performant workspace. Leveraging Radix UI and shadcn/ui, it provides a familiar, desktop-like environment tailored to your needs.

Ideal for remote workers, developers, and anyone seeking a consistent and personalized command center for their online activities.

> **📚 Documentation**: For detailed information on how this app works, visit our [DeepWiki documentation](https://deepwiki.com/ekmigasari/wfcOS/).

## ✨ Features

### Version 2.3.1 - Latest Release

### 💼 Blog

- Added blogs section and blog pages

### ⏱️ Timer

- Track work sessions and productivity
- Link tasks to work sessions

### 📊 Session Log

- View sessions as charts and tables
- Charts show weekly, monthly, yearly data
- Tables display all session data

### ✅ To-do List

- Session count in task items

## 🛠️ Tech Stack

### Framework

- [Next.js](https://nextjs.org/) v15.3.1 with App Router

### UI Library

- [React](https://react.dev/) v19.1.0

### Styling

- [Tailwind CSS](https://tailwindcss.com/) v4.1.4

### State Management

- [Jotai](https://jotai.org/) v2.12.3

### Component Library

- [Shadcn/UI](https://ui.shadcn.com/) with [Radix UI](https://www.radix-ui.com/)

### Icons

- [Lucide React](https://lucide.dev/) v0.507.0

### Drag and Drop

- [dnd-kit](https://dndkit.com/) v6.3.1

### Charts

- [Recharts](https://recharts.org/) v2.15.3

### Linting

- [ESLint](https://eslint.org/) v9.25.1

### Git Hooks

- [Husky](https://typicode.github.io/husky/) v9.1.7

### Language

- [TypeScript](https://www.typescriptlang.org/) v5.8.3

### Package Manager

- [Bun](https://bun.sh/)

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18.x
- [Bun](https://bun.sh/) >= 1.0.0
- [Docker](https://www.docker.com/) (optional, for containerized setup)

### Installation

1. Clone the repository:

   ```bash
   git clone <your-repository-url>
   cd wfcOS
   ```

2. Set up environment variables:

   ```bash
   cp env.template .env.local
   ```

3. Install dependencies with Bun:
   ```bash
   bun install
   ```

### Development Commands

```bash
# Start development server
bun dev

# Build for production
bun build

# Start production server
bun start

# Lint code
bun lint
```

### Docker Deployment

```bash
# Build and run with Docker
docker build -t wfcos .
docker run -p 3000:3000 wfcos

# Or use docker-compose
docker-compose up -d
```

## 📁 Project Structure

<details>
<summary>Click to expand folder structure</summary>

```
.
├── src/                    # Source code
│   ├── app/                # Next.js App Router
│   │   ├── [page]/         # Route-specific directories
│   │   │   ├── page.tsx    # Page component
│   │   │   ├── layout.tsx  # Page-specific layout
│   │   │   └── components/ # Page-specific components
│   │
│   ├── presentation/       # UI Layer
│   │   ├── components/     # React components
│   │   │   ├── ui/         # Shadcn components
│   │   │   ├── layout/     # Layout components
│   │   │   └── apps/       # Application feature components
│   │   └── styles/         # Global styles
│   │
│   ├── application/        # Application Layer
│   │   ├── atoms/          # Jotai atoms for state management
│   │   ├── hooks/          # Custom React hooks
│   │   └── types/          # TypeScript type definitions
│   │
│   └── infrastructure/     # Infrastructure Layer
│       ├── config/         # Configuration files
│       ├── utils/          # Utilities
│       └── lib/            # Shared libraries
│
├── public/                 # Static assets
```

</details>

## 🧩 Architecture

The project follows a clean architecture approach with three main layers:

<table>
  <tr>
    <td valign="top" width="33%">
      <h3 align="center">Presentation Layer</h3>
      <p align="center">Components, UI elements, and styles</p>
      <p align="center"><code>/src/presentation/</code></p>
    </td>
    <td valign="top" width="33%">
      <h3 align="center">Application Layer</h3>
      <p align="center">Business logic, state management</p>
      <p align="center"><code>/src/application/</code></p>
    </td>
    <td valign="top" width="33%">
      <h3 align="center">Infrastructure Layer</h3>
      <p align="center">Configuration, utilities, external services</p>
      <p align="center"><code>/src/infrastructure/</code></p>
    </td>
  </tr>
</table>

### Key Components

- **Component Structure**:
  - Server Components (default) vs Client Components (with "use client" directive)
  - Component organization follows high cohesion, low coupling principles
- **State Management**:
  - Uses Jotai for global state with atom-based architecture
  - Local state when appropriate
- **Window System**:
  - All applications use the reusable window component at `/src/presentation/components/layout/window.tsx`
- **App Registry**:
  - Applications are registered in `/src/infrastructure/config/appRegistry.ts`

## 📝 Development Guidelines

<details>
<summary>Naming Conventions</summary>

### Files & Directories

- Directories: Kebab-case (`user-profile/`)
- React components: PascalCase (`UserProfile.tsx`)
- Utility files: camelCase (`formatDate.ts`)
- Page files: `page.tsx`
- Layout files: `layout.tsx`

### Code Style

- Components: PascalCase (`UserProfile`, `UserProfileProps`)
- Variables/Functions: camelCase (`getUserData()`)
- Constants: UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`)
- Booleans: Use prefixes like `is`, `has`, `should` (`isLoading`, `hasAccess`)
</details>

<details>
<summary>Commit Message Format</summary>

This project uses [Conventional Commits](https://www.conventionalcommits.org/) for standardized commit messages:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

Common types:

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code changes that neither fix bugs nor add features
- `test`: Adding or modifying tests
- `chore`: Changes to the build process or auxiliary tools
</details>

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes using the conventional commit format
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgements

- Inspired by [ryos](https://github.com/ryokun6/ryos)
- [Next.js](https://nextjs.org/) - The React Framework
- [Tailwind CSS](https://tailwindcss.com/) - For utility-first CSS
- [Shadcn](https://ui.shadcn.com/) - For UI components
- [Radix UI](https://www.radix-ui.com/) - For accessible UI components
- [Bun](https://bun.sh/) - For fast JavaScript runtime and package management
- [Jotai](https://jotai.org/) - For state management
- [dnd-kit](https://dndkit.com/) - For drag-and-drop functionality
