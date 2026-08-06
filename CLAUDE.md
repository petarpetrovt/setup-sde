# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A GitHub Action that downloads and extracts Intel SDE (Software Development Emulator) binaries from this repo's Git LFS, then exports the path as an environment variable. It targets `windows-latest` and `ubuntu-latest` runners; macOS is not tested in CI.

## Commands

```bash
npm install          # install dependencies
npm run build        # compile index.ts → dist/index.js via ncc (bundles all deps)
npm run start        # run the action locally (reads INPUT_* env vars)
npm run test <VAR>   # verify VAR env var points to a valid SDE directory with a working sde binary
```

The build uses `@vercel/ncc` to produce a single bundled `dist/index.js`. **Always run `npm run build` before committing** — `action.yml` points to `dist/index.js`, not the TypeScript source.

To test the full flow locally:

```bash
INPUT_ENVIRONMENTVARIABLENAME=SDE_PATH INPUT_SDEVERSION=10.8.0 npm run start
npm run test SDE_PATH
```

## Architecture

All logic lives in a single file: [index.ts](index.ts).

- `getPlatformIdentifier()` maps `process.platform` to Intel's archive suffix (`win` or `lin`).
- `releases` is a map of version → `{ date, sha256: { lin, win } }`, used to look up the tarball filename and its expected checksum.
- `getBinaryPair(version)` resolves the `releases` entry for the current platform into `{ filename, sha256 }`.
- `downloadTarballCached(...)` restores the tarball from the Actions cache if present, otherwise downloads it, then verifies its SHA256 against `releases` (this also guards against a poisoned/corrupt cache entry) and saves it to cache.
- `run()` orchestrates: resolve binary filename/checksum → download (cached, with optional `GITHUB_TOKEN` Bearer auth) → verify SHA256 → chmod (Linux only) → extract → export env var.

**Binary storage**: SDE tarballs are committed to `binaries/` via Git LFS. On every push to `main`, the `upload-binaries` job in [.github/workflows/build.yml](.github/workflows/build.yml) mirrors `binaries/*` to a GitHub Release tagged `binaries` (created if missing). At runtime, `index.ts` downloads from `https://github.com/petarpetrovt/setup-sde/releases/download/binaries/<filename>` — not the Git LFS media URL. No `GITHUB_TOKEN` is required for public repos — the token is used opportunistically to avoid rate limits if present.

**Integrity verification**: every download (cached or fresh) has its SHA256 checked against the hash recorded in `releases`; a mismatch fails the run.

**Windows extraction workaround**: `@actions/tool-cache`'s `extractTar` hangs indefinitely on `windows-latest`, so Windows uses Git's bundled `tar.exe` at `C:\Program Files\Git\usr\bin\tar.exe` with `--force-local`. This is a known limitation documented with TODO comments.

**Tester** ([tester.mjs](tester.mjs)): a plain ESM script that validates the exported env var points to an existing directory and that `sde -version` executes successfully. It's `.mjs` (not `.js`) because `@actions/core`/`@actions/exec` v3+ are ESM-only.

## Adding a new SDE version

1. Download the Linux and Windows tarballs from Intel and commit them to `binaries/` via Git LFS.
2. Add an entry to the `releases` map in [index.ts](index.ts) with the release `date` and the SHA256 checksum for both the `lin` and `win` tarballs.
3. Add the version to the `matrix.version` array in [.github/workflows/build.yml](.github/workflows/build.yml).
4. Update the `defaultSdeVersion` constant and `action.yml`'s `sdeVersion` default/description if it becomes the new default.
5. Run `npm run build` to rebuild `dist/index.js`.
