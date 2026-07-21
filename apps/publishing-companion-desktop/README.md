# AgenticThat Publishing Companion for Windows

This Electron application packages the persistent Publish Queue API, local JSON
store, media uploads, scheduler, and isolated Chrome profiles into a normal
Windows desktop installer.

On first launch it creates a random Operations Manager password and auth secret,
stores them with Windows-protected Electron safe storage when available, starts
the service on loopback port 8792, and enables launch at Windows sign-in. The
control window shows health, Chrome availability, credentials, logs, and local
data without requiring a terminal.

## Development

From the repository root:

```text
npm run publishing:desktop:install
npm run publishing:desktop:start
```

## Packaging

```text
npm run publishing:release:windows
```

The Squirrel installer and portable ZIP are copied to the repository's ignored
`artifacts/` directory. Set `WINDOWS_CERTIFICATE_FILE` and
`WINDOWS_CERTIFICATE_PASSWORD` to sign the installer during a production build.
