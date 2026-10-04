# Hosted operations and recovery

Production launched October 4, 2026. Production and preview are independent Hostinger Node 24 applications; both WordPress installations were removed after acceptance and verified recovery backups. [SPEC-008](specs/008-wordpress-removal.md) holds the migration history. Routine releases use [CI/CD](CI_CD.md).

## Environment configuration

| Environment | Domain                             | Persistent media root                         |
| ----------- | ---------------------------------- | --------------------------------------------- |
| Staging     | `preview.flordegraceschoolinc.com` | `/home/u414393871/.fgs-data/staging/media`    |
| Production  | `flordegraceschoolinc.com`         | `/home/u414393871/.fgs-data/production/media` |

Each has separate database credentials and media. Databases were provisioned under preview during cutover; do not assume deleting a website is isolated from its associated database records. Media stays outside every deployment directory.

Set these server-only values in Hostinger, using actual credentials rather than masked API responses:

- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`.
- Absolute `MEDIA_STORAGE_PATH`.
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `ADMIN_ALLOWED_EMAILS`.
- `SITE_INDEXABLE=true` only for production; preview remains non-indexable.

Google must allow each destination's `/api/auth/callback/google` URI. SSH is enabled at `u414393871@46.202.138.125`, port `65002`; use the [Hostinger skill](../.agents/skills/hostinger-ssh/SKILL.md). API/SSH credentials belong in ignored `.env.hostinger-ssh.local` and GitHub operations secrets, never app source or public settings.

## Release checks

Before schema-changing releases, retain a fresh content/media backup and ensure migrations work with the current app. Promote reviewed source through protected branches. After deployment check HTTPS, published stories/assets, canonicals, indexing, sitemap, legacy redirects and anonymous admin protection. For auth or editor changes, verify Google sign-in, denied access and affected save/upload/publish/trash workflows on staging.

Check persistence after changes to storage or deployment topology. Keep staging edits isolated. A passing public smoke check does not establish full hosted acceptance.

## Backup and restoration

Choose the intended environment explicitly with `FGS_ENV_FILE`; credentials must allow database access from the execution host. `content:backup` produces `content.json`, its checksum and checksum-verified `files/` in a private directory using a consistent database snapshot. Copy recovery data outside both Git and the hosting account.

```sh
pnpm content:backup .data/backups/release-checkpoint
```

For restoration, prepare a separate migrated database with empty content tables and an empty media directory. Set `FGS_RESTORE_DATABASE` to that exact `DB_NAME`, then run:

```sh
pnpm content:restore .data/backups/release-checkpoint
```

The restore verifies manifest/media checksums and restores relational rows transactionally. Rehearse restoration in disposable storage before replacing any live data. Do not overwrite later administrator edits with an old backup.

Application rollback means rebuilding a compatible prior commit/archive with the existing live database and uploads. Schema changes are not automatically reversed. Restore data only after reviewing the recovery target, current edits and verified disposable restoration.

## Retained recovery evidence

Initial accepted production release: `fgs-release-b698aabb412bb33f.zip`, SHA-256 `b698aabb412bb33ff324116185a18529a7f150e111c15449cbfcd0025e4c8693`; Hostinger build `01a105b9-3fbc-70f2-bcd3-ec4375f7d1b1`.

Accepted content recovery archive: `content-production-accepted.tar.gz`, SHA-256 `b69eead9f1e81329254922d21d0eee6ccdb9644dea6b404ac208d3bcd8d1c341`. It was restored into disposable storage successfully.

Fresh WordPress files/SQL, the migration snapshot, releases and application backups remain in ignored `backups/2026-10-04` / `backups/2026-10-04-final`, account-private `/home/u414393871/.fgs-backups`, and the off-repository `FGS Website Backups/2026-10-04-final` folder in the operator's Documents directory. Private settings and historical recovery credentials are retained alongside those copies. Keep them private and available for recovery; they are not active WordPress services.

Post-launch cleanup removed disposable restore trees, retired server tools and 102 restored WordPress tables from the test database. Production/staging content, media and recovery archives were preserved. Backup ownership, retention and recovery-time targets still require an operations decision (DEC-110).
