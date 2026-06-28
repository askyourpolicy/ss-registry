# StitchStudio shadcn Registry

Shared StitchStudio shadcn registry for framework-agnostic projects.

## Install

From a project with shadcn configured:

```bash
bunx shadcn@latest add askyourpolicy/ss-registry/stitch
```

The `stitch` item installs the full StitchStudio base payload: theme CSS, `cn`, hooks, generated shadcn Base UI components, Phosphor icons, and shared component dependencies.

To inspect before installing:

```bash
bunx shadcn@latest view askyourpolicy/ss-registry/stitch
bunx shadcn@latest add askyourpolicy/ss-registry/stitch --dry-run
```

To pin an install to a branch, tag, or commit:

```bash
bunx shadcn@latest add askyourpolicy/ss-registry/stitch#main
```

## Usage

Import the installed theme CSS once from your app entrypoint:

```ts
import "@/styles/globals.css";
```

## Registry Commands

List, search, or validate the GitHub registry:

```bash
bunx shadcn@latest list askyourpolicy/ss-registry
bunx shadcn@latest search askyourpolicy/ss-registry --query stitch
bunx shadcn@latest registry validate askyourpolicy/ss-registry
```

## Development

For maintainers:

```bash
bun install
bun run format
bun run lint
bun run typecheck
bun run check
```
