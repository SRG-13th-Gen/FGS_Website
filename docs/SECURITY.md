# Security and privacy

Status: server-only CMS authentication and WordPress data ownership are accepted boundaries. Detailed controls and the role matrix below are proposed requirements pending the decisions linked here. This is an engineering specification, not a compliance certification or evidence of deployed controls.

## Identity and authorization

School staff authenticate with native WordPress at the CMS host. Team members authenticate separately for Next.js `/admin`; the provider, auth library, session lifecycle, MFA, and invite/revocation process remain DEC-103. No public team signup is proposed.

**Interim state**: DEC-103 is on hold pending access to the school's Google account.
Until it is resolved, `/admin` is gated by a temporary, dev-only seeded login
(`src/lib/auth/dev-login.ts`, documented in [SPEC-003](specs/003-team-admin.md)).
Credentials live only in `.env.local` (`ADMIN_DEV_EMAIL`, `ADMIN_DEV_PASSWORD`,
`ADMIN_DEV_SESSION_SECRET`); the session cookie is httpOnly, sameSite=lax, signed,
and expires after 8 hours. It is hard-disabled outside development — a production
build never accepts it and every `/admin` route denies access with no fallback to
open access. `requireAdmin()` performs the real check in the protected layout and
must be called by every protected admin server action/route handler; a proxy-level
cookie-presence check is optimistic UX only, not authorization. This is scaffolding
for FR-005, not FR-005 itself: no rate limiting, lockout, password rules,
allowlist, or roles.

Proposed role matrix (DEC-111):

| Capability                                                   | Viewer | Editor | Admin |
| ------------------------------------------------------------ | ------ | ------ | ----- |
| Read authorized admin content                                | Yes    | Yes    | Yes   |
| Create/edit draft announcements                              | No     | Yes    | Yes   |
| Publish / withdraw announcements                             | No     | Yes    | Yes   |
| Upload media / edit alt text / create or edit categories     | No     | Yes    | Yes   |
| Trash announcements                                          | No     | No     | Yes   |
| Assign/revoke team access through the chosen identity system | No     | No     | Yes   |
| Permanently delete content/media or manage WordPress plugins | No     | No     | No    |

Unknown roles and missing permissions deny access. Authorize each server operation, including reads; do not rely on hidden controls, route layouts, or browser claims. The dedicated CMS account's capabilities bound every team operation but do not identify the individual team actor; proposed app audit events provide that attribution.

Use secure session cookies appropriate to production HTTPS and implement server-side expiry/revocation checks. Protect cookie-authenticated mutations against cross-site requests. The exact library configuration and origin policy require a feature spec and negative tests.

## Secrets and infrastructure boundaries

- WordPress Application Passwords, auth secrets, revalidation secrets, and email credentials stay server-side; never put them in `NEXT_PUBLIC_*`, browser responses, committed files, or logs.
- Use a dedicated least-privilege WordPress integration user. Rotate/revoke integration credentials and verify the resulting failure behavior. Application Passwords are an API authentication mechanism, not the team login/session system. See [WordPress authentication](https://developer.wordpress.org/rest-api/using-the-rest-api/authentication/) (consulted 2026-09-19).
- Use production HTTPS across privileged connections. Local HTTP is a development exception that must be verified against the selected CMS setup, not copied to production.
- Separate development and production credentials and content. Do not pull production student/family data into developer fixtures.
- Bound upstream URLs to configured trusted hosts. Do not expose arbitrary WordPress proxy operations or direct CMS database access.
- Public caches must never contain authenticated edit-context responses. A robots directive is not an access-control mechanism.

## Content and file handling

Treat CMS-rendered HTML as input crossing a trust boundary. Agree an allowed Gutenberg/block and HTML policy, sanitize/render accordingly, and test malicious links, scripts, embeds, and attributes without breaking approved school content. The policy and compatible admin editing behavior require DEC-108.

Validate upload sizes, actual file types, metadata, and permissions server-side; UI file filters alone are insufficient. Decide allowed types and sizes before implementation. Do not allow executable uploads or arbitrary remote fetching. Restrict image sources to approved CMS origins.

## Inquiry privacy and abuse controls

The proposed form collects name, email, and message only; it does not solicit student records, identity documents, health information, or attachments. School-approved guidance should discourage sensitive information in free text. Any extra fields need a purpose and owner approval.

Before enabling live inquiries, DEC-106/110 must establish:

- Authorized recipient mailbox, verified sender, reply-to behavior, and people allowed mailbox/provider access.
- Delivery provider, data location, retention/deletion process, and the privacy notice explaining where messages go. Confirm applicable privacy obligations with the school's responsible owner.
- Retention for the mailbox, provider, audit logs, rate-limit keys, and duplicate-handling metadata. No invented duration is authoritative.
- Server validation limits, shared rate-limit policy, accessible bot protection, and behavior when protection is unavailable.
- Duplicate/ambiguous-result handling without automatic repeat email sends.

Do not persist inquiry bodies in app storage by default. This does not mean messages are never stored: providers and mailboxes keep copies. General logs and analytics exclude messages, email addresses, credentials, and raw provider payloads. Use safe correlation IDs and minimal event outcomes. Automated visitor replies are deferred to avoid making the form an unsolicited-mail mechanism.

## Operational readiness

Before launch, assign incident and credential-rotation owners, verify backups include CMS database and uploaded media, rehearse restore and release rollback, and define monitoring for CMS errors, revalidation failures, and inquiry delivery failures. Hosting verification is DEC-107; recovery objectives, retention, and operational ownership are DEC-110.

Security regression scenarios are mapped in [TESTING.md](TESTING.md). Report a discovered vulnerability privately to the repository/school owner using an agreed channel; never include live secrets or personal inquiry data in a public issue. A dedicated reporting address is not configured yet.
