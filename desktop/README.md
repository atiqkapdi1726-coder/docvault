# DocVault Desktop (Windows)

DocVault packaged as a native Windows desktop application using Electron.

## Run it

- Double-click `Start-DocVault.bat` (recommended)
- Or run `out\DocVault-win32-x64\DocVault.exe` directly

The app loads the live DocVault web app (https://docvault-lac.vercel.app) inside a native window, so it needs an internet connection.

## What's inside

```
desktop/
  main.js          Electron main process (window + menu)
  preload.js       Secure preload script
  build/icon.ico   App icon (16/32/48/256)
  out/
    DocVault-win32-x64/     Ready-to-use app folder (DocVault.exe)
    DocVault-Desktop-Win64.zip  Distributable archive (share this)
```

## Build from source

```bash
cd desktop
npm install
npm start          # test in dev mode
npx electron-packager . DocVault --platform=win32 --arch=x64 --out=out --icon=build/icon.ico --overwrite --asar
```

Then zip `out/DocVault-win32-x64` to distribute.

## Features

- Native window with DocVault branding (icon, title)
- Google Sign-In works (accounts.google.com popups allowed)
- View menu: reload, zoom, fullscreen
- Help menu: About dialog
- External links open in the default browser
