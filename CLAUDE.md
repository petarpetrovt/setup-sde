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
- `getLfsBinaryFilename(version)` returns the filename for a given version+platform combination, which is used to build the `media.githubusercontent.com` LFS download URL.
- `run()` orchestrates: resolve LFS URL → download (with optional `GITHUB_TOKEN` Bearer auth) → chmod (Linux only) → extract → export env var.

**Binary storage**: SDE tarballs are committed to `binaries/` via Git LFS. The download URL is constructed from `GITHUB_ACTION_REPOSITORY` and `GITHUB_ACTION_REF` at runtime, pointing to `media.githubusercontent.com`. No `GITHUB_TOKEN` is required for public repos — the token is used opportunistically to avoid rate limits if present.

**Windows extraction workaround**: `@actions/tool-cache`'s `extractTar` hangs indefinitely on `windows-latest`, so Windows uses Git's bundled `tar.exe` at `C:\Program Files\Git\usr\bin\tar.exe` with `--force-local`. This is a known limitation documented with TODO comments.

**Tester** ([tester.js](tester.js)): a plain JS script that validates the exported env var points to an existing directory and that `sde -version` executes successfully.

## Adding a new SDE version

1. Download the Linux and Windows tarballs from Intel and commit them to `binaries/` via Git LFS.
2. Add a case in `getLfsBinaryFilename()` in [index.ts](index.ts) matching the filename pattern.
3. Add the version to the `matrix.version` array in [.github/workflows/build.yml](.github/workflows/build.yml).
4. Update the `defaultSdeVersion` constant and `action.yml` description if it becomes the new default.
5. Run `npm run build` to rebuild `dist/index.js`.
