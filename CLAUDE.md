# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A GitHub Action that downloads and extracts Intel SDE (Software Development Emulator) binaries, then exports the path as an environment variable. It targets `windows-latest` and `ubuntu-latest` runners; macOS is mapped in code but not tested in CI.

## Commands

```bash
npm install          # install dependencies
npm run build        # compile index.ts → dist/index.js via ncc (bundles all deps)
npm run start        # run the action locally (reads INPUT_* env vars)
npm run test <VAR>   # verify VAR env var points to a valid SDE directory with a working sde binary
```

The build uses `@vercel/ncc` to produce a single bundled `dist/index.js`. **Always run `npm run build` before committing** — `action.yml` points to `dist/index.js`, not the TypeScript source.

To test the full flow locally, set the action inputs as environment variables before running:

```bash
INPUT_ENVIRONMENTVARIABLENAME=SDE_PATH INPUT_SDEVERSION=10.8.0 npm run start
npm run test SDE_PATH
```

## Architecture

All logic lives in a single file: [index.ts](index.ts).

- `getPlatformIdentifier()` maps Node's `process.platform` to Intel's archive suffix (`win`, `mac`, `lin`).
- `getVersionDownloadUrl(version)` returns the full Intel mirror URL for a given version string. Adding a new SDE version means adding a case here.
- `run()` orchestrates: download → chmod (Linux only) → extract → export env var.

**Windows extraction workaround**: `@actions/tool-cache`'s `extractTar` hangs indefinitely on `windows-latest`, so Windows uses Git's bundled `tar.exe` at `C:\Program Files\Git\usr\bin\tar.exe` with `--force-local`. This is a known limitation documented with TODO comments.

**Tester** ([tester.js](tester.js)): a plain JS script (not TypeScript) that validates the exported env var points to an existing directory and that `sde -version` executes successfully. Receives the variable name as a CLI argument (`npm run test <VAR_NAME>`).

## Adding a new SDE version

1. Add a case in `getVersionDownloadUrl()` in [index.ts](index.ts) with the Intel mirror URL and version string.
2. Add the version to the build matrix in [.github/workflows/build.yml](.github/workflows/build.yml).
3. Update the default version constants and `action.yml` description if it becomes the new default.
4. Run `npm run build` to rebuild `dist/index.js`.
