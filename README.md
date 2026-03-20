# Uiverse

Local-first visual CSS editor and code generator.

## Environment

This repository is pinned to the following toolchain so it can be cloned and continued on another machine without guessing versions:

| Tool | Version |
| --- | --- |
| Node.js | `24.11.0` |
| pnpm | `10.6.5` via Corepack |

Version files:

- [`.nvmrc`](./.nvmrc)
- [`package.json`](./package.json) `engines` / `packageManager`
- [`.github/workflows/ci.yml`](./.github/workflows/ci.yml)

## Quick Start On Another Computer

```bash
git clone https://github.com/doublejun80/UImaker.git
cd UImaker
corepack enable
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

If you use `nvm`, run `nvm use` first so the repo picks up the version from `.nvmrc`.

## Workspace

- `apps/web`: Next.js App Router application for dashboard, editor, export, and settings
- `packages/schema`: shared bundle contract and validation helpers
- `packages/exporter`: shared React/Tailwind and HTML/CSS generators
- `packages/cli`: `@uiverse/cli` command line generator
- `stitch`: original mockups and design references

## Development Commands

```bash
pnpm dev
pnpm build
pnpm test
pnpm typecheck
```

## CLI Usage

The CLI is implemented in this monorepo, but it is not published to npm yet. Use it locally from the workspace:

```bash
pnpm --filter @uiverse/cli build
pnpm --filter @uiverse/cli exec uiverse generate ./bundle.json --format react-tailwind --out ./generated
```

## Cross-Machine Note

The app code is shared through GitHub, but editor project data is stored in browser localStorage in V1. That means source code can be continued immediately on another machine after cloning, while in-browser project data does not sync automatically between computers.