// Test-only stand-in for the "server-only" package. Next.js resolves that
// package to a no-op under its "react-server" bundler condition, which
// Vitest does not set, so a direct import throws outside Next.js. Aliased in
// vitest.config.ts so unit tests can still import server-only modules.
export {};
