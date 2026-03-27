# AI Constitution

## 1. Project Overview

This project is a production-grade React frontend for an enterprise SaaS application built with Vite, TypeScript, Ant Design, Zustand, TanStack Query, Axios, and React-Toastify.

The application must follow the uploaded design-system extraction document as the single source of truth for visual decisions. Every UI surface, state, and interaction must align with the documented design language: modern enterprise SaaS, neutral surfaces, strong blue action hierarchy, semantic feedback colors, Inter typography, controlled spacing, rounded medium corners, and low-elevation cards.

Primary engineering goals:

- strict design-system adherence
- feature-based scalability
- modularity and low coupling
- strong TypeScript boundaries
- consistent API and state patterns
- maintainable long-term growth

This file is the constitution of the codebase. Any AI or developer generating code must read this file first and comply with it.

## 2. Scope Guardrails

### Allowed

- React + TypeScript with Vite
- Ant Design only through approved wrapper components
- token-driven styling only
- feature-based module organization
- Zustand for lightweight client/UI state only
- TanStack Query for server state only
- Axios through shared client and feature service layers
- React-Toastify through centralized helpers only
- reusable abstractions when a pattern appears more than once

### Not Allowed

- raw Ant Design components used directly in feature pages
- ad-hoc styling that bypasses design tokens
- arbitrary hex values, spacing values, radii, shadows, or typography sizes in feature files
- mixing UI libraries such as MUI, Chakra, Mantine, Bootstrap, Tailwind UI kits, or custom component libraries
- direct API calls inside React components
- cross-feature imports of private internals
- storing server data in Zustand
- storing modal/drawer/filter UI state in TanStack Query
- inline `toast.*` calls in components
- one-off page-level patterns that should be reusable

### Non-negotiable Rule

If the design system does not define a visual behavior, reuse an existing tokenized pattern. Do not invent a new one in a feature file.

## 3. Architecture Overview

The codebase must use a feature-based architecture.

```txt
src/
  app/                -> app providers, routing, global bootstrap, app-level composition
  features/           -> domain-based modules
  components/         -> globally reusable UI and layout components
  shared/             -> shared API, hooks, libs, constants, helpers, generic state
  theme/              -> Ant Design theme config and design tokens
```

Each feature follows this contract:

```txt
features/{feature-name}/
  components/         -> feature-specific UI components
  pages/              -> route-level pages
  hooks/              -> feature-specific hooks
  store/              -> Zustand store if the feature truly needs client state
  services/           -> API logic and query-related service functions
  types/              -> TypeScript models and contracts
  utils/              -> optional feature helpers
  index.ts            -> public exports only
```

### Global vs Feature Components

- Use `src/components/ui` for design-system primitives reused across domains.
- Use `src/components/layout` for app shell or structural reusable layout pieces.
- Use `src/features/{feature}/components` for business-specific components that represent feature concepts.

If a component contains domain language such as `Product`, `Order`, `Customer`, or feature-specific business decisions, it belongs in a feature.

If a component is a cross-app primitive such as button, input, card, text, stack, section shell, or page header, it belongs in global components.

### Business Logic Isolation

- API and async logic stay inside `services` and feature hooks.
- Feature pages compose hooks and components but do not own networking details.
- Shared code must remain generic and domain-agnostic.
- Each feature should expose only its `index.ts` public surface.

### Avoiding Cross-Feature Coupling

- Never import from another feature's internal folders.
- If logic becomes useful to multiple features, promote it into `shared` or a global component.
- Features may depend on `shared`, `components`, `theme`, and `app`, but not on another feature's internals.

## 4. Design System Rules

The uploaded design extraction defines the visual language. Until exact Figma inspect values are provided, use the extracted estimated tokens centrally and nowhere else.

### Color System

- `primary.500 = #2F6BFF`
- `primary.600 = #1F56E0`
- `primary.700 = #1848BD`
- `primary.50 = #EAF1FF`
- `success.500 = #22C55E`
- `success.600 = #16A34A`
- `warning.500 = #F59E0B`
- `warning.600 = #D97706`
- `error.500 = #EF4444`
- `error.600 = #DC2626`
- `info.500 = #0EA5E9`
- use the centralized neutral scale only

### Typography System

- Font family: `Inter`
- Supported semantic levels only:
  - `display`
  - `h1`
  - `h2`
  - `h3`
  - `titleLg`
  - `titleMd`
  - `titleSm`
  - `body`
  - `bodySmall`
  - `caption`
  - `label`
  - `button`

### Spacing System

Approved spacing scale:

- `4, 8, 12, 16, 20, 24, 32, 40, 48, 64`

### Radius System

- `sm = 6`
- `md = 8`
- `lg = 10`
- `pill = 999`

### Shadows

- Minimal shadow usage only
- Prefer borders and surface separation over heavy elevation

### Semantic States

Every interactive component must support:

- default
- hover
- focus
- active
- disabled

Form controls must additionally support:

- error
- success
- helper text

All values must be reused through tokens or wrapper component props. No feature file may define its own visual constants.

## 5. Ant Design Strategy

Ant Design is the only component foundation, but feature code must consume wrapper components instead of raw Ant primitives in pages.

Required wrappers:

- `AppButton`
- `AppInput`
- `AppSelect`
- `AppTypography`
- `AppCard`

Rules:

- pages must not import Ant Design primitives directly for core UI controls
- all shared visual defaults must be encoded in wrappers
- theme configuration must be centralized in `src/theme/antdTheme.ts`
- token overrides are the only approved theming mechanism
- component overrides must happen in the theme layer, not scattered through feature files

## 6. State Management Rules

### Zustand Use Cases

Use Zustand for:

- modal state
- drawer state
- table/filter UI state
- active tabs
- local client preferences
- small ephemeral client-side feature state

### TanStack Query Use Cases

Use TanStack Query for:

- remote collections
- remote entity detail
- mutations
- caching
- background refetching
- loading and error state for server data

### Strict Separation

- never use Zustand for server state
- never use TanStack Query for UI state
- never duplicate the same source of truth in both

## 7. API Layer Rules

Shared API base:

```txt
shared/api/
  axios.ts
  interceptors.ts
```

Feature-level API location:

```txt
features/{feature}/services/
```

Rules:

- no direct `axios` usage inside components
- no fetch logic inside pages
- every remote operation starts in a feature service file
- every component consumes service-backed hooks
- request/response normalization belongs in the service layer
- query keys should live near the feature service or query hook

Expected pattern:

- `getProducts` in service file
- `useProductsQuery` in hook file
- component/page consumes `useProductsQuery`

## 8. Toast / Notification Rules

- use React-Toastify only
- centralize helpers in shared utilities
- no direct inline toast implementation in components

## 9. Component Strategy

Global components:

```txt
components/ui/
components/layout/
```

Feature components:

```txt
features/{feature}/components/
```

Rules:

- UI primitives belong in global UI
- app shell and reusable layout primitives belong in layout
- feature-specific business rendering belongs in feature components

## 10. Hooks Strategy

- shared hooks live in `shared/hooks`
- feature hooks live in `features/{feature}/hooks`
- hooks must hide implementation detail and expose stable typed contracts

## 11. File Naming Conventions

- Components: `PascalCase.tsx`
- Hooks: `camelCase.ts`
- Folders: `kebab-case`
- Service files: `*.service.ts`
- Store files: `*.store.ts`
- Types files: `*.types.ts`

## 12. Developer + AI Rules

Every future AI or developer must:

- read `ai.md` before generating or modifying code
- preserve feature boundaries
- reuse existing wrappers and tokens first
- avoid introducing competing patterns
- not add raw styles that bypass tokens
- not add raw Ant primitives in feature pages
- not create one-off API access patterns
- not duplicate state across Zustand and TanStack Query

## 13. Developer Checklist

Before writing code, confirm:

- Is this inside the correct feature or shared/global layer?
- Does this use approved design tokens only?
- Am I consuming wrapper components instead of raw Ant controls?
- Is API logic isolated in the service layer?
- Is server state in TanStack Query and UI state in Zustand?
- Am I avoiding cross-feature coupling?

## 14. Design-System Enforcement Notes

The uploaded design extraction is partially estimated. That creates an implementation constraint:

- centralize every estimated token in theme files
- annotate estimated values in the theme layer only
- never scatter estimated values across product code
- if exact Figma values later arrive, replace token definitions without refactoring feature code
