# Uiverse

Local-first visual CSS editor and code generator.

## Workspace

- `apps/web`: Next.js App Router application for dashboard, editor, export, and settings
- `packages/schema`: shared bundle contract and validation helpers
- `packages/exporter`: shared React/Tailwind and HTML/CSS generators
- `packages/cli`: `@uiverse/cli` command line generator

## Commands

```bash
pnpm install
pnpm dev
pnpm build
pnpm test
```

## CLI

```bash
npx @uiverse/cli generate ./bundle.json --format react-tailwind --out ./generated
```
