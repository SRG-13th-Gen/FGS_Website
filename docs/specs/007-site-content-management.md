# SPEC-007: Site content management

Seven accepted editors remain: Hero, About, Admission, Clubs, Gallery, Contact and School Info. The existing schemas, fields, visual presentation and admin shell are preserved. The October 4 owner instruction in [SPEC-008](008-wordpress-removal.md) replaces WordPress section pages with application-owned MySQL JSON rows.

Each fixed slug has validated data, positive revision and UTC modified date. Forms load a revision and submit it with saves; a stale revision cannot silently overwrite another editor. Existing image references must resolve to image media. New images use signature validation and persistent storage. Gallery membership is explicit and independent of library imports.

Sections missing or invalid during public reads use the existing design fallbacks. Admin cannot save without a loaded revision. Saves distinguish completion from route refresh failure. Public reads are dynamic with no persistent content cache.

The CMS copy is authoritative for the initial seven sections because it has edits newer than September backups. Import inserts only missing sections; reruns preserve later admin edits. WordPress plugins, webhooks, seed tooling and native editor links are retired.

Implementation and completed hosted acceptance evidence: [SPEC-008](008-wordpress-removal.md), [TESTING](../TESTING.md).
