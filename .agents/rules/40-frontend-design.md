# Frontend and design ownership

[DESIGN.md](../../docs/DESIGN.md) is reserved for the frontend designer and intentionally empty. Do not populate it, invent a brand system, or copy the reference repository's styling unless the user explicitly assigns that design work.

- Read approved page/content requirements and existing designer artifacts before creating UI. An empty design document means visual decisions are unresolved, not that generic styling is approved.
- Use the accepted stack; treat shadcn/ui as primitives to compose under the designer's system.
- The full official selected shadcn registry is installed under `src/components/ui`. The frontend designer still creates custom school components under public/admin or feature folders; see [FRONTEND.md](../../docs/FRONTEND.md). Do not present registry installation as finished design work or blindly overwrite customized primitives.
- Preserve semantic structure, keyboard access, visible focus, labeled inputs, accessible feedback, and reduced-motion behavior. Track the formal accessibility target as proposed until DEC-112 is accepted.
- Handle loading, empty, error, unavailable, validation, pending, and success states appropriate to the feature. Do not fabricate school content or pretend a failed send succeeded.
- Keep implementation/provider details out of visitor-facing flows unless needed for a meaningful action. Use truthful, plain-language outcomes.
- Render published content safely and expose meaningful image alt text. Keep privileged CMS calls out of browser components.

For technical scaffolding without approved visuals, keep components minimal and identify the pending design dependency. This rule does not block independent API, documentation, or test work.
