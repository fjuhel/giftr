# PWA Setup for Giftr

## What is a PWA?

A **Progressive Web App (PWA)** is a web application that can be installed on devices and work offline, providing a native app-like experience while remaining a web app.

## How It Works

### 1. **Web App Manifest** (`manifest.json`)

- Defines app metadata (name, icons, colors, display mode)
- Tells the browser how to display the app when installed
- Specifies icons for different screen sizes
- Sets theme colors for the system UI

### 2. **Service Worker** (`sw.js`)

- Runs in the background, separate from the web page
- Intercepts network requests
- Caches files for offline access
- Enables push notifications (optional)
- Updates automatically when you deploy new versions

### 3. **Registration** (`pwa-register.ts`)

- Registers the service worker when the app loads
- Handles updates and prompts user to reload
- Manages install prompts for adding to home screen

## Features Enabled

✅ **Install on Desktop/Mobile** - Add to home screen or install as desktop app
✅ **Offline Support** - App works without internet (with cached data)
✅ **Fast Loading** - Cached assets load instantly
✅ **App-like Experience** - Runs in standalone window without browser UI
✅ **Auto-updates** - Service worker updates automatically
✅ **Background Sync** - Can sync data when connection returns (ready for implementation)

## Setup Steps Completed

1. ✅ Created `manifest.json` with app metadata
2. ✅ Created `sw.js` service worker with caching strategy
3. ✅ Created `pwa-register.ts` for service worker registration
4. ✅ Updated `index.html` with manifest link and meta tags
5. ✅ Integrated PWA registration in main app component
6. ⏳ **TODO**: Generate icons (use `generate-icons.html`)

## Generating Icons

### Option 1: Automated (Recommended)

1. Open `generate-icons.html` in your browser
2. It will automatically generate and download all required icon sizes
3. Move the downloaded icons to `/public/icons/` folder

### Option 2: Manual

Create PNG icons in these sizes:

- 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512

Use your logo/gift icon with the Giftr gradient background:

- Background: Linear gradient from #ef4444 → #ec4899 → #8b5cf6
- Icon: White gift symbol 🎁

### Option 3: Use a Tool

- [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)
- [Favicon.io](https://favicon.io/)
- [RealFaviconGenerator](https://realfavicongenerator.net/)

## Testing Your PWA

### Development (localhost)

1. Run your dev server: `npm run dev`
2. Open Chrome DevTools
3. Go to **Application** tab
4. Check **Manifest** section
5. Check **Service Workers** section
6. Use **Lighthouse** tab to audit PWA score

### Install Button

The app automatically detects when install is available. You can add a custom install button:

```typescript
import { promptInstall } from './pwa-register';

// In your component
async handleInstall() {
  const accepted = await promptInstall();
  if (accepted) {
    console.log('App installed!');
  }
}
```

### Production

1. Deploy to HTTPS (required for PWA)
2. Open in mobile browser (Chrome/Safari)
3. Look for "Add to Home Screen" prompt
4. Install and test offline functionality

## Caching Strategy

**Network First, Cache Fallback**:

1. Try to fetch from network
2. If successful, update cache
3. If network fails, serve from cache
4. If no cache, show offline message

This ensures:

- Users always get fresh content when online
- App works offline with cached content
- Firebase/API calls work normally

## File Structure

```
giftr/
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── sw.js                  # Service worker
│   └── icons/                 # App icons
│       ├── icon-72x72.png
│       ├── icon-192x192.png
│       └── icon-512x512.png
├── src/
│   ├── pwa-register.ts        # SW registration
│   └── gr-app-component.ts    # Registers PWA on load
├── index.html                 # Links to manifest
└── generate-icons.html        # Icon generator tool
```

## Browser Support

| Feature   | Chrome | Firefox | Safari         | Edge |
| --------- | ------ | ------- | -------------- | ---- |
| Install   | ✅     | ✅      | ✅ (iOS 16.4+) | ✅   |
| Offline   | ✅     | ✅      | ✅             | ✅   |
| Shortcuts | ✅     | ❌      | ❌             | ✅   |
| Push      | ✅     | ✅      | ❌             | ✅   |

## Next Steps

1. **Generate Icons**: Open `generate-icons.html` and save icons to `/public/icons/`
2. **Test Install**: Run dev server and install PWA from browser
3. **Test Offline**: Disable network in DevTools and verify app works
4. **Add Install Button** (optional): Add UI to prompt installation
5. **Deploy to HTTPS**: PWAs require secure context in production

## Updating the App

When you deploy new code:

1. Service worker detects update
2. Downloads new files in background
3. Prompts user: "New version available! Reload to update?"
4. User confirms → app reloads with new version

Automatic, seamless updates! 🎉

## Resources

- [MDN PWA Guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [web.dev PWA](https://web.dev/progressive-web-apps/)
- [Service Worker Cookbook](https://serviceworke.rs/)
- [PWA Builder](https://www.pwabuilder.com/)
