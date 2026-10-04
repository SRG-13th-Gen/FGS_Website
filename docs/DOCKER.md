# Local database

Docker runs MariaDB only; there is no WordPress or PHP service.

```sh
pnpm setup:env
pnpm docker:config
pnpm docker:up
pnpm db:migrate
```

The database listens on 127.0.0.1:3307. Compose reads local generated credentials from ignored `.env.local`; media uses `.data/media`. Production uses Hostinger databases and absolute outside-deployment storage.

`docker:stop` stops services. `docker:down` removes containers/network and preserves volumes. Do not remove volumes without explicit data-loss authorization. The new content volume is distinct from the former WordPress database volume, preserving old local data.

Configure Google login separately. Never use production databases for routine tests. See [TESTING](TESTING.md) for the guarded disposable database suite.
