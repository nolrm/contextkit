# ContextKit Documentation Site

This is the official documentation website for [ContextKit](https://github.com/nolrm/contextkit), built with **Next.js 16**, **Tailwind CSS v4**, and **shadcn/ui** components.

## What is This?

The `contextkit-docs` directory contains the complete source code for the ContextKit documentation website. This site provides comprehensive documentation about ContextKit, including:

- Quick start guide (installation + setup)
- Platform-specific examples (Cursor, VS Code, Aider, Claude CLI, Gemini)
- Project structure overview
- CLI commands reference

## Technologies

- **Framework**: Next.js 16 with App Router
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui component library
- **Language**: TypeScript
- **Package Manager**: pnpm

## Directory Structure

```
contextkit-docs/
├── app/                          # Next.js App Router pages
│   ├── docs/                     # Documentation pages
│   │   ├── platform-examples/    # Platform examples (Cursor, VS Code, Aider, etc.)
│   │   │   └── page.tsx
│   │   ├── project-structure/    # Project structure guide
│   │   │   └── page.tsx
│   │   ├── commands/             # CLI commands reference
│   │   │   └── page.tsx
│   │   ├── quick-start/          # Complete installation + setup guide
│   │   │   └── page.tsx
│   │   ├── layout.tsx            # Docs layout with sidebar
│   │   └── page.tsx              # Main docs landing page
│   ├── globals.css               # Global styles
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Home page
│
├── components/                    # React components
│   ├── ui/                        # shadcn/ui components (57 files)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── ...                    # Other UI components
│   ├── docs-header.tsx           # Documentation header
│   ├── docs-sidebar.tsx          # Documentation sidebar navigation
│   ├── features.tsx              # Features section
│   ├── footer.tsx                # Footer component
│   ├── header.tsx                # Main header
│   ├── hero.tsx                  # Hero section
│   └── theme-provider.tsx        # Theme provider
│
├── hooks/                        # Custom React hooks
│   ├── use-mobile.ts             # Mobile detection hook
│   └── use-toast.ts              # Toast notification hook
│
├── lib/                          # Utility functions
│   └── utils.ts                  # Utility functions (cn, etc.)
│
├── public/                       # Static assets
│   ├── images/
│   │   ├── context-flow.png      # Context engineering flow diagram
│   │   └── project-structure.png  # Project structure diagram
│   └── placeholder-*.png          # Placeholder images
│
├── styles/
│   └── globals.css               # Global CSS styles
│
├── components.json               # shadcn/ui configuration
├── next.config.mjs               # Next.js configuration
├── package.json                  # Dependencies and scripts
├── pnpm-lock.yaml                # Dependency lock file
├── postcss.config.mjs            # PostCSS configuration
├── tsconfig.json                 # TypeScript configuration
└── next-env.d.ts                 # Next.js type definitions
```

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- pnpm (or npm/yarn)

### Installation

```bash
# Install dependencies
pnpm install
```

### Development

```bash
# Start development server
pnpm dev
```

The site will be available at `http://localhost:3000`

### Build

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

### Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## Features

### Documentation Sections

1. **Introduction** (`/docs`) - Overview of ContextKit and Context Engineering
2. **Quick Start** (`/docs/quick-start`) - Complete installation and setup guide (3 steps)
3. **Platform Examples** (`/docs/platform-examples`) - How to use with Cursor, VS Code, Aider, Claude CLI, OpenCode, Gemini
4. **Project Structure** (`/docs/project-structure`) - Directory structure and customization
5. **Commands** (`/docs/commands`) - Complete CLI command reference

### Key Components

- **Responsive Sidebar** - Sticky navigation for easy browsing
- **Modern UI** - Built with shadcn/ui components
- **Dark Theme** - Optimized for dark mode
- **Syntax Highlighting** - Code examples with proper formatting
- **Mobile Responsive** - Works on all device sizes

## Styling

The project uses **Tailwind CSS v4** with custom CSS variables for theming. Global styles are located in:
- `app/globals.css` - Root-level styles
- `styles/globals.css` - Additional styling

The site uses CSS variables for colors and theming:
- `--background`, `--foreground`
- `--primary`, `--secondary`
- `--muted`, `--accent`
- And more...

## Deployment

This site is deployed to Vercel. Configuration is in the root `vercel.json` file.

## Contributing

To update documentation:

1. Edit the relevant page in `app/docs/`
2. Update components in `components/` if needed
3. Run `pnpm dev` to preview changes
4. Commit and push changes

## License

MIT License - see [LICENSE](../LICENSE) file for details.

