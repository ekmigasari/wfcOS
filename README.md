# Work from Coffee

WFCOS (Work From Cafe OS) is a web-based desktop environment designed to centralize your digital workflow and enhance productivity. By providing a single, organized interface, it helps users reduce clutter, streamline tasks, and access essential tools and applications efficiently from any browser.

Built with a cutting-edge stack including Next.js 15, React 19, and Tailwind CSS v4, WFCOS offers a customizable and performant workspace. Leveraging Radix UI and shadcn/ui, it provides a familiar, desktop-like environment tailored to your needs. Ideal for remote workers, developers, and anyone seeking a consistent and personalized command center for their online activities.

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) v15 with App Router
- **UI Library:** [React](https://reactjs.org/) v19
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) v4
- **State Management:** [Jotai](https://jotai.org/) (Atom-based state management)
- **Component Library:** [Shadcn/UI](https://ui.shadcn.com/) with [Radix UI](https://www.radix-ui.com/)
- **Linting:** [ESLint](https://eslint.org/) v8
- **Git Hooks:** [Husky](https://typicode.github.io/husky/)
- **Commit Linting:** [Commitlint](https://commitlint.js.org/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Package Manager:** [Bun](https://bun.sh/)
- **Icons:** [Lucide React](https://lucide.dev/)

## 📁 Folder Structure

```
.
├── .husky/                 # Husky git hooks configuration
│
├── .next/                  # Next.js build output (generated)
│
├── public/                 # Static assets
│   ├── background/         # Background images
│   ├── icons/              # UI icons and graphics
│   └── sounds/             # Audio files and sound effects
│
├── src/                    # Source code
│   ├── app/                # Next.js App Router
│   │   ├── [page]/         # Route-specific directories
│   │   │   ├── page.tsx    # Page component
│   │   │   ├── layout.tsx  # Page-specific layout
│   │   │   └── components/ # Page-specific components
│   │   ├── layout.tsx      # Root layout component
│   │   └── page.tsx        # Home page component
│   │
│   ├── presentation/       # UI Layer
│   │   ├── components/     # React components
│   │   │   ├── ui/         # Shadcn components
│   │   │   ├── layout/     # Layout components like window.tsx
│   │   │   └── apps/       # Application feature components
│   │   └── styles/         # Global styles and Tailwind configuration
│   │       └── globals.css # Global styles
│   │
│   ├── application/        # Application Layer
│   │   ├── atoms/          # Jotai atoms for state management
│   │   ├── hooks/          # Custom React hooks
│   │   └── types/          # TypeScript type definitions
│   │
│   └── infrastructure/     # Infrastructure Layer
│       ├── config/         # Configuration files
│       │   └── appRegistry.ts # Registry for all apps and features
│       ├── utils/          # Helper functions and utilities
│       │   └── storage.ts  # Helpers for local storage persistence
│       └── lib/            # Shared libraries and integrations
│
├── .dockerignore           # Files to ignore in Docker build
├── .eslintrc.json          # ESLint configuration (specific rules)
├── .gitignore              # Files ignored by Git
├── Dockerfile              # Docker build instructions
├── README.md               # Project documentation
├── bun.lock                # Bun lock file
├── commitlint.config.mjs   # Commitlint configuration
├── components.json         # UI components configuration
├── docker-compose.yml      # Docker Compose configuration
├── eslint.config.mjs       # ESLint configuration (main)
├── next-env.d.ts           # Next.js TypeScript declarations
├── next.config.ts          # Next.js configuration
├── package.json            # Project metadata and dependencies
├── postcss.config.mjs      # PostCSS configuration for Tailwind
└── tsconfig.json           # TypeScript configuration
```

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18.x
- [Bun](https://bun.sh/) >= 1.0.0
- [Docker](https://www.docker.com/) (If running via Docker)

### Installation

1. Clone the repository:

   ```bash
   git clone <your-repository-url>
   cd wfcOS
   ```

2. Install dependencies with Bun:
   ```bash
   bun install
   ```

### Running the Development Server

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Building for Production

```bash
bun run build
```

### Starting the Production Server

```bash
bun run start
```

### Linting Code

```bash
bun run lint
```

### Running with Docker

1. Build the Docker image:

   ```bash
   docker build -t wfcOS .
   ```

2. Run the container:

   ```bash
   docker run -p 3000:3000 wfcOS
   ```

   Alternatively, using docker-compose:

   ```bash
   docker-compose up -d
   ```

## 📦 Package Management

- Install packages: `bun add [package-name]`
- Install dev dependencies: `bun add -D [package-name]`
- Add Shadcn components: `bunx shadcn@latest add [component-name]`

## 🧩 Architecture

The project follows a clean architecture approach with three main layers:

1. **Presentation Layer**:

   - Components, UI elements, and styles
   - Located in `/src/presentation/`

2. **Application Layer**:

   - Business logic, state management with Jotai atoms, hooks
   - Located in `/src/application/`

3. **Infrastructure Layer**:
   - Configuration, utilities, and external services integration
   - Located in `/src/infrastructure/`

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

> **Note**: For detailed code organization and component guidelines, check the cursor rules in the Cursor Folder. These rules provide comprehensive guidance on naming conventions, component structure, and development best practices.

## 📝 Development Guidelines

### Commit Message Format

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

Commit messages are enforced using commitlint and Husky.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes using the conventional commit format
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- Inspired by [ryos](https://github.com/ryokun6/ryos)
- [Next.js](https://nextjs.org/) - The React Framework
- [Tailwind CSS](https://tailwindcss.com/) - For utility-first CSS
- [Shadcn](https://ui.shadcn.com/) - For UI components
- [Radix UI](https://www.radix-ui.com/) - For accessible UI components
- [Bun](https://bun.sh/) - For fast JavaScript runtime and package management
- [Jotai](https://jotai.org/) - For state management
