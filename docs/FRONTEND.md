# Frontend implementation

Preserve the designer's [DESIGN](DESIGN.md) guidance. The WordPress migration changes storage, not public composition or admin structure.

`src/components/ui` contains shadcn primitives; `src/components/public` contains the school's navbar, hero, sections, gallery, news and footer. `src/components/admin` contains the shell, form fields, media picker and article controls. The homepage and news detail read dynamic server-only content services in `src/lib/content`.

Seven editors retain Hero, About, Admission, Clubs, Gallery, Contact and School Info fields. Media is selected by ID or uploaded; JSON never accepts arbitrary image URLs. Gallery membership remains explicitly selected photos. Article forms retain paragraphs and ordered captioned photos and support image-only stories. Stale revisions show a reload conflict; saved-but-refresh-failed messages do not invite duplicate saves.

Imported images use local `/media/...` URLs through Next.js Image. Bundled fallback assets remain under `public/images`. No WordPress remote-image configuration, Gutenberg editor or native-editor fallback is required.

Google login and allowlisting are implemented; hosted acceptance remains required. Contact information is displayed, while inquiry submission remains deferred. See [TESTING](TESTING.md) and [SPEC-008](specs/008-wordpress-removal.md) for verification.
