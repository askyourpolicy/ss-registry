# StitchStudio shadcn Registry

Shared React 19 components for StitchStudio.

Built with Tailwind CSS 4, Base UI, base-nova, and Phosphor icons.

## Install

Install the theme, utilities, common primitives, and shared components:

```bash
bunx shadcn@latest add askyourpolicy/ss-registry/stitch-core
```

Or install a single item:

```bash
bunx shadcn@latest add askyourpolicy/ss-registry/data-table-card
```

Dependencies such as `stitch-base` install automatically.

Import the theme CSS once from your application entrypoint:

```ts
import "@/styles/globals.css";
```

React 19 and React DOM 19 are required.

## Bundles

| Item                  | Includes                                          |
| --------------------- | ------------------------------------------------- |
| `stitch-base`         | Theme, utilities, and shared tooling              |
| `stitch-core`         | Base plus common primitives and components        |
| `stitch-vite`         | Vite, TypeScript, Tailwind CSS, and Vitest config |
| `stitch-docker`       | Bun Dockerfile, nginx config, and `.dockerignore` |
| `stitch-vite-starter` | Base, core, Vite, and Docker bundles              |

Install any bundle with the same command:

```bash
bunx shadcn@latest add askyourpolicy/ss-registry/stitch-vite-starter
```

Scaffold bundles target root-level files.

Preview changes with `--dry-run` before using `--overwrite`.

## Browse and update

```bash
# Discover items
bunx shadcn@latest list askyourpolicy/ss-registry
bunx shadcn@latest search askyourpolicy/ss-registry --query navigation
bunx shadcn@latest view askyourpolicy/ss-registry/app-navigation

# Review an update
bunx shadcn@latest add askyourpolicy/ss-registry/stitch-base --diff
```

## Development

```bash
bun install
bun run registry:build
bun run check
```

Generated files in `public/r` are tracked.

Rebuild them after changing registry definitions or source files.
