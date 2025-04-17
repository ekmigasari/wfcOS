# WFCOS

Web OS like PC desktop

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) v15.2.4
- **UI Library:** [React](https://reactjs.org/) v19.1.0
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) v4.1.4
- **Linting:** [ESLint](https://eslint.org/) v9.24.0
- **Git Hooks:** [Husky](https://typicode.github.io/husky/) v9.1.7
- **Commit Linting:** [Commitlint](https://commitlint.js.org/) v19.8.0
- **Containerization:** [Docker](https://www.docker.com/)
- **Language:** [TypeScript](https://www.typescriptlang.org/) v5.8.3
- **Package Manager:** [Bun](https://bun.sh/) v1.x
- **UI Components:** [Radix UI](https://www.radix-ui.com/) v1.1.7
- **Icons:** [Lucide React](https://lucide.dev/) v0.488.0

## 📁 Folder Structure

```
.
├── .husky/                 # Husky git hooks configuration
│   └── pre-commit          # Pre-commit hook script
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
│   │   ├── layout.tsx      # Root layout component
│   │   ├── page.tsx        # Home page component
│   │   └── favicon.ico     # Site favicon
│   │
│   ├── components/         # React components
│   │   ├── apps.tsx        # Main application component
│   │   ├── clock.tsx       # Clock component
│   │   ├── apps/           # Application-specific components
│   │   ├── layout/         # Layout components
│   │   └── ui/             # Reusable UI components
│   │
│   ├── config/             # Configuration files
│   │
│   ├── hooks/              # Custom React hooks
│   │
│   ├── lib/                # Utility libraries
│   │
│   ├── styles/             # Global styles
│   │
│   ├── types/              # TypeScript type definitions
│   │
│   └── utils/              # Helper functions and utilities
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

- [Next.js](https://nextjs.org/) - The React Framework
- [Tailwind CSS](https://tailwindcss.com/) - For utility-first CSS
- [Radix UI](https://www.radix-ui.com/) - For accessible UI components
- [Bun](https://bun.sh/) - For fast JavaScript runtime and package management
