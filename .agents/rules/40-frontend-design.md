# Frontend and design ownership

[DESIGN.md](../../docs/DESIGN.md) records the frontend designer's current visual system. Use it and the implemented public components as the design baseline; do not replace approved styling with invented branding.

- Read approved page/content requirements and existing designer artifacts before creating UI. Where DESIGN does not cover a new pattern, follow the established site components and resolve material visual decisions with the designer or owner.
- Use the accepted stack; treat shadcn/ui as primitives to compose under the designer's system.
- The selected shadcn registry is installed under `src/components/ui`; custom school components already exist under public/admin folders. See [FRONTEND.md](../../docs/FRONTEND.md). Do not blindly overwrite customized primitives.
- Preserve semantic structure, keyboard access, visible focus, labeled inputs, accessible feedback, and reduced-motion behavior. Track the formal accessibility target as proposed until DEC-112 is accepted.
- Handle loading, empty, error, unavailable, validation, pending, and success states appropriate to the feature. Do not fabricate school content or pretend a failed send succeeded.
- Keep implementation/provider details out of visitor-facing flows unless needed for a meaningful action. Use truthful, plain-language outcomes.
- Render published content safely and expose meaningful image alt text. Keep privileged CMS calls out of browser components.

For new features without an established visual pattern, follow the existing design system and identify any unresolved design dependency. This rule does not block independent API, documentation, or test work.
