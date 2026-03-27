# Paliative Frontend

Paliative Frontend is a production-oriented React application built with Vite, TypeScript, Ant Design, Zustand, TanStack Query, Axios, and React-Toastify. The project is organized around feature modules and a token-driven design system so the codebase can scale without drifting into inconsistent UI, duplicated state patterns, or tightly coupled page logic.

This repository already includes:

- a design-system-first architecture contract in `ai.md`
- a shared theme layer for Ant Design token overrides
- global UI wrapper components
- a responsive authentication flow
- an example `products` feature module
- shared API, query, toast, and client-state foundations

## Table of Contents

- Project Goals
- Tech Stack
- Getting Started
- Available Scripts
- Environment Configuration
- Project Structure
- Architecture Rules
- Routing
- Design System
- State Management
- API Layer
- Notifications
- Features Included
- Development Workflow
- Adding a New Feature
- Known Notes

## Project Goals

The project is designed around a few non-negotiable goals:

- strict adherence to the extracted design system
- modular, feature-based scaling
- predictable state separation between client and server state
- reusable UI primitives instead of page-specific one-offs
- maintainable API access patterns
- a clean onboarding path for future developers and AI collaborators

The architecture contract that governs these goals lives in `ai.md`. Treat that file as the constitution of the codebase.

## Tech Stack

### Core

- React 18
- TypeScript
- Vite
- React Router

### UI and Styling

- Ant Design
- project-specific wrapper components
- tokenized CSS and centralized theme overrides

### Data and State

- TanStack Query for server state
- Zustand for lightweight client/UI state
- Axios for HTTP requests

### Feedback

- React-Toastify for notifications

## Getting Started

### Prerequisites

- Node.js 20+ recommended
- npm 10+ recommended

### Installation

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

The app will start in Vite dev mode, typically at `http://localhost:5173` or the next available port.

### Create a production build

```bash
npm run build
```

### Preview the production build locally

```bash
npm run preview
```

## Available Scripts

| Script            | Description                                                   |
| ----------------- | ------------------------------------------------------------- |
| `npm run dev`     | Starts the Vite development server                            |
| `npm run build`   | Runs TypeScript project build and creates a production bundle |
| `npm run preview` | Serves the production bundle locally                          |

## Environment Configuration

The shared Axios client reads its base URL from `VITE_API_BASE_URL`.

If that variable is not provided, the app currently falls back to:

```txt
https://dummyjson.com
```

Create an `.env` file when you want to point the app to a different backend:

```env
VITE_API_BASE_URL=https://your-api.example.com
```

## Project Structure

```txt
.
├── ai.md
├── index.html
├── package.json
├── src
│   ├── app
│   │   ├── providers
│   │   ├── router
│   │   └── styles
│   ├── components
│   │   ├── layout
│   │   └── ui
│   ├── features
│   │   ├── auth
│   │   └── products
│   ├── shared
│   │   ├── api
│   │   ├── lib
│   │   └── store
│   ├── theme
│   │   ├── tokens
│   │   └── antdTheme.ts
│   ├── App.tsx
│   └── main.tsx
└── vite.config.ts
```

### Directory Responsibilities

#### `src/app`

Application-level composition:

- providers
- routing
- global bootstrap
- global styles

#### `src/components`

Reusable cross-feature components.

- `ui/` contains primitives such as buttons, inputs, cards, typography, and checkboxes
- `layout/` contains structural pieces shared across routes

#### `src/features`

Domain modules. Each feature owns its own pages, components, hooks, services, types, and optional store.

#### `src/shared`

Cross-cutting technical utilities:

- Axios client
- interceptors
- query client
- toast helpers
- non-domain shared state

#### `src/theme`

Centralized tokens and Ant Design theme overrides.

## Architecture Rules

The architecture is intentionally strict. The goal is to keep future work easy to reason about.

### Feature-based structure

Each feature should follow this pattern:

```txt
features/{feature-name}/
  components/
  pages/
  hooks/
  store/
  services/
  types/
  utils/
  index.ts
```

### What belongs where

- global UI primitives go in `src/components/ui`
- reusable layout structures go in `src/components/layout`
- business-specific UI belongs in a feature
- feature pages should compose existing building blocks rather than inventing new patterns inline

### Cross-feature boundaries

- do not import another feature's private internals
- expose what a feature wants to share from its `index.ts`
- move generic code into `shared` or `components` only when it is truly reusable

## Routing

Current routes:

| Route       | Purpose                                          |
| ----------- | ------------------------------------------------ |
| `/`         | Redirects to `/sign-in`                          |
| `/sign-in`  | Authentication sign-in experience                |
| `/products` | Example feature module and design-system preview |

Routing is defined in `src/app/router/AppRouter.tsx`.

## Design System

The visual system follows the extracted Figma design guidance: clean enterprise surfaces, blue-first action hierarchy, soft neutrals, clear semantic states, and Inter typography.

### Core principles

- no raw color literals in feature code when a token exists
- no arbitrary spacing outside the approved scale
- no arbitrary font sizing
- no mixing UI libraries
- no bypassing wrapper components in pages

### Theme layers

The design system is implemented through two layers:

1. raw tokens in `src/theme/tokens`
2. semantic and component mapping in `src/theme/antdTheme.ts`

### Current token families

- colors
- typography
- spacing
- radius

The current palette is intentionally centralized so exact Figma values can replace estimated values later without feature-level refactors.

## UI Wrapper Components

The codebase wraps Ant Design primitives so pages and features consume a project-specific UI API.

Current wrappers include:

- `AppButton`
- `AppInput`
- `AppSelect`
- `AppTypography`
- `AppCard`
- `AppCheckbox`

Why wrappers matter:

- they centralize visual defaults
- they reduce direct Ant Design leakage into feature code
- they make global restyling easier
- they reinforce consistency across the app

## State Management

State is intentionally split by responsibility.

### Zustand

Use Zustand for:

- UI-only state
- toggles
- filters
- form-adjacent client state when appropriate
- non-server session shaping

Examples in the current codebase:

- `src/features/auth/store/auth.store.ts`
- `src/shared/store/ui.store.ts`
- `src/features/products/store/products.store.ts`

### TanStack Query

Use TanStack Query for:

- API-backed lists and resources
- caching
- loading states
- error handling for server interactions
- mutations

Examples:

- `src/features/auth/hooks/useSignInMutation.ts`
- `src/features/products/hooks/useProductsQuery.ts`

### Rule of thumb

- if the source of truth is the server, use TanStack Query
- if the source of truth is purely client/UI state, use Zustand

## API Layer

The API layer is shared and feature-aware.

### Shared HTTP foundation

`src/shared/api/axios.ts` defines the configured Axios instance.

`src/shared/api/interceptors.ts` applies:

- request auth token injection from `localStorage`
- centralized response error handling

### Feature services

Feature services live inside:

```txt
src/features/{feature}/services
```

Examples:

- `src/features/auth/services/auth.service.ts`
- `src/features/products/services/products.service.ts`

### API rules

- no direct API calls inside components
- no direct `axios` usage in pages
- components should consume hooks, not raw service functions
- service functions should stay typed

## Notifications

Notifications are handled with React-Toastify.

Shared toast helpers live in:

```txt
src/shared/lib/toast.ts
```

Use the helper methods instead of inline `toast.*` calls in components.

## Features Included

### Auth

The `auth` feature provides the responsive sign-in flow used for both mobile and desktop layouts.

Included pieces:

- `SignInPage`
- `AuthShell`
- `SignInForm`
- `signIn` service
- `useSignInMutation`
- `auth.store`
- feature styles in `auth.css`

Current behavior:

- sign-in form uses Ant Design form handling
- success stores the returned access token in `localStorage`
- success also stores session data in Zustand
- the page includes desktop and mobile presentation logic

### Products

The `products` feature is an example domain module that demonstrates:

- feature service patterns
- query hook usage
- client-side filtering with Zustand
- wrapper-based page composition

It also acts as a design-system preview route.

## App Bootstrap

Application bootstrapping starts in:

- `src/main.tsx`
- `src/App.tsx`
- `src/app/providers/AppProviders.tsx`

The provider stack currently includes:

- Ant Design `ConfigProvider`
- TanStack `QueryClientProvider`
- React Router `BrowserRouter`
- React-Toastify `ToastContainer`

## Development Workflow

### Recommended onboarding order

1. Read `ai.md`
2. Read this `README.md`
3. Review `src/app/router/AppRouter.tsx`
4. Review `src/theme/antdTheme.ts`
5. Review one feature from entry page to service layer

### Before adding code

Ask these questions:

- Is this change feature-specific or shared?
- Does a wrapper already exist for this UI pattern?
- Should this state live in Zustand or TanStack Query?
- Is this API logic in the correct service layer?
- Am I using design tokens rather than one-off styles?

## Adding a New Feature

When adding a new feature, follow this checklist.

### 1. Create the module skeleton

```txt
src/features/new-feature/
  components/
  pages/
  hooks/
  services/
  store/
  types/
  index.ts
```

### 2. Define the feature types

Start with `types/*.types.ts`.

### 3. Add service functions

Place remote requests in `services/*.service.ts`.

### 4. Add query or mutation hooks

Use TanStack Query in `hooks/`.

### 5. Add client-only state if needed

Use Zustand only if the feature needs local UI state.

### 6. Build the UI from wrappers

Use the existing wrapper components first. If a needed primitive does not exist, add it in `src/components/ui` before using it across feature pages.

### 7. Export the public surface

Use the feature `index.ts` to expose what other parts of the app should import.

## Current Conventions

### File naming

- components: `PascalCase.tsx`
- hooks: `camelCase.ts`
- folders: `kebab-case`
- services: `*.service.ts`
- stores: `*.store.ts`
- types: `*.types.ts`

### Import style

Use the `@/` alias for imports from `src`.

### Styling

- prefer centralized CSS classes or token-driven styling
- preserve the design language already established
- keep layout responsive by default

## Known Notes

### Large bundle warning

The production build currently emits a Vite chunk-size warning for the main bundle. This does not block development, but it is a good candidate for future optimization through route-level or feature-level code splitting.

### Authentication backend assumptions

The current auth flow assumes a login endpoint at:

```txt
/auth/login
```

Adjust the service contract and response type once the real backend API is finalized.

### Design token refinement

Some current token values were derived from the extracted design-system document rather than exact Figma inspect values. When the exact values become available, update the token files and theme mappings instead of patching feature-level styles.

## Contribution Guidance

If you are contributing to this codebase:

- read `ai.md` first
- preserve feature boundaries
- do not bypass wrappers in page-level code
- do not mix server state into Zustand
- do not mix UI state into TanStack Query
- update documentation when the architecture changes

## License

No license has been defined yet for this repository.
