# Delivery status

## Delivered

- Public homepage/news, Google-admin authentication, seven section editors, article and media workflows.
- Application-owned MySQL and persistent uploads; all five legacy articles imported, old URLs mapped and both WordPress installations retired.
- Isolated staging/production storage, hosted acceptance, persistence checks and verified backup restoration.
- Protected branches and named CI quality check; staging migration/build/deployment automation verified.

See [SPEC-008](specs/008-wordpress-removal.md) for launch evidence and [CI/CD](CI_CD.md) for current release behavior.

## Remaining operations

1. Promote reviewed staging changes to `main` and verify the first production branch-driven deployment. Production is already live on its accepted launch release.
2. Assign backup, monitoring and incident-response ownership; agree retention and recovery targets (DEC-110).
3. Keep recovery rehearsals and authenticated regression checks current for relevant releases.

## Deferred or undecided

Inquiry submission requires approved provider, recipient, privacy and abuse policies. Extra roles, public search, analytics and arbitrary page-layout editing remain deferred. Formal accessibility/performance targets require acceptance and measurement; no SLA is implied. See [decisions](DECISIONS.md) and [requirements](FRS_NFRS.md).
