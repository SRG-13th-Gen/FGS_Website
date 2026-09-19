# Frontend development foundation

The application uses Next.js App Router, TypeScript, Tailwind CSS v4, and the shadcn Radix Nova registry with neutral starter tokens and Lucide icons. The registry preset is a technical starting point, not approved school branding.

## Primitives and custom components

The full installable component set from the selected official shadcn registry is copied into `src/components/ui`. These are repository-owned source files, not an immutable component package. Registry examples/blocks and components from third-party registries are not part of that set. Recipe-based patterns such as data tables and date pickers are composed from installed primitives rather than being separate application screens.

**The frontend designer must still design and build custom components.** Installing shadcn does not supply the school site's navigation, page sections, announcement compositions, inquiry form, or admin workflows. Build those custom components under `src/components/public`, `src/components/admin`, or a justified feature folder when the corresponding design/spec is ready. Import primitives directly; avoid a barrel that indiscriminately pulls the whole library into a client boundary.

Use `src/components/ui` for low-level primitive behavior and shared variants, and keep school-specific content/layout out of that directory. Adapt primitives as needed to support the approved design. Check local changes before rerunning registry generation; do not overwrite designer work with `--overwrite` by default.

Local compatibility adjustments: the mobile hook and carousel use React external-store subscriptions instead of synchronous effect-driven state updates; carousel listeners are removed on cleanup. Preserve these fixes when comparing future registry updates.

## Tokens and ownership

[DESIGN.md](DESIGN.md) remains empty and designer-owned. Current neutral CSS variables, system fonts, spacing, and radii are provisional scaffolding. The designer owns branding, typography, component composition, responsive layouts, interaction states, and final tokens. Update DESIGN when that work is explicitly assigned; use semantic tokens in custom components rather than scattered raw colors.

`src/app/globals.css` contains Tailwind imports, registry tokens, and system font defaults. The initial app does not download Google fonts during builds. `src/components/providers.tsx` wires theme handling, tooltip context, and Sonner while leaving page components server-rendered unless they need client interaction.

## Commands

- `pnpm dev`: run Next.js locally.
- `pnpm ui:add <component>`: add a named official registry component through the pinned CLI.
- `pnpm ui:all`: install the registry's available component set; review changes before accepting regeneration.
- `pnpm lint`, `pnpm typecheck`, `pnpm format:check`: check source quality.
- `pnpm test:e2e`: build and run the production scaffold browser checks.

The current home page is a minimal non-indexable placeholder. It is not an approved school design or an implemented public content feature. No admin login, CMS CRUD, revalidation endpoint, or inquiry delivery has been added by this scaffold.

References consulted 2026-09-19: [shadcn installation](https://ui.shadcn.com/docs/installation/next), [CLI](https://ui.shadcn.com/docs/cli), and [Tailwind with Next.js](https://tailwindcss.com/docs/installation/framework-guides/nextjs). Exact installed versions are recorded in the root package manifest and lockfile.
