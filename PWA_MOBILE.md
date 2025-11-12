# PWA Installation Guide - Mobile

## Why don't I see the install prompt on mobile?

Different browsers and platforms have different behaviors:

### 📱 **iOS (iPhone/iPad) - Safari**

**Apple doesn't support automatic PWA install prompts.** You must manually add to home screen:

1. Open the app in **Safari** (not Chrome!)
2. Tap the **Share** button (square with arrow pointing up)
3. Scroll down and tap **"Add to Home Screen"**
4. Tap **"Add"**
5. The app icon will appear on your home screen! 🎉

**Our custom prompt helps:** When you visit on iOS, you'll see a banner with step-by-step instructions.

### 🤖 **Android - Chrome**

Chrome will show the install prompt automatically, but **only when these criteria are met:**

✅ Site is served over **HTTPS** (or localhost for testing)
✅ Has a valid **manifest.json**
✅ Has a **service worker** registered
✅ User has visited the site **at least twice** (with 5 minutes between visits)
✅ User has engaged with the site for at least **30 seconds**

**Our custom prompt:** Shows after 3 seconds on Android if not already installed.

### Testing on Mobile:

#### Option 1: Use ngrok (Recommended)

```bash
# Install ngrok
npm install -g ngrok

# Run your dev server
npm run dev

# In another terminal, expose it
ngrok http 5173

# Visit the https://xxx.ngrok.io URL on your phone
```

#### Option 2: Use local network IP

```bash
# Run dev server with network access
npm run dev -- --host

# Visit http://YOUR_IP:5173 on your phone
# (Note: Won't work on iOS without HTTPS)
```

#### Option 3: Deploy to production

- Deploy to Vercel/Netlify/Firebase Hosting (they provide HTTPS)
- Visit on mobile
- Install prompt should appear

## Custom Install Banner

We've added a custom install banner that:

- **Shows after 3 seconds** on first visit
- **Detects iOS** and shows special instructions with Safari share icon
- **Detects Android** and shows install button
- **Can be dismissed** for 7 days
- **Only shows if not already installed**

## Verifying Installation

### Desktop

1. Chrome DevTools → Application tab
2. Check "Manifest" section - should show all fields
3. Check "Service Workers" section - should be active
4. Lighthouse audit should show PWA score

### Mobile

1. Install the app using instructions above
2. App should appear on home screen with custom icon
3. Open it - should run in standalone mode (no browser UI)
4. Try turning on Airplane mode - app should still load

## Common Issues

### "Manifest not found" error

- Make sure `/public/manifest.json` exists
- Check that `index.html` has `<link rel="manifest" href="/manifest.json" />`
- Verify Vite is serving files from `/public` folder

### Icons not loading

- Run `generate-icons.html` to create all icon sizes
- Place icons in `/public/icons/` folder
- Check browser console for 404 errors

### Service worker not registering

- Must be HTTPS in production (localhost is OK for dev)
- Check console for service worker errors
- Clear cache and reload

### Install prompt not showing

- **iOS:** Never shows automatically - use manual steps
- **Android:** Wait for engagement criteria (or use our custom banner)
- **Desktop:** Should show install icon in address bar

### App not working offline

- Service worker might not be caching files
- Check DevTools → Application → Cache Storage
- Clear all caches and reload to force fresh cache

## Force Reset (if something breaks)

```javascript
// Run in browser console
navigator.serviceWorker.getRegistrations().then((registrations) => {
  registrations.forEach((r) => r.unregister());
});
localStorage.clear();
location.reload();
```

## Production Checklist

Before deploying:

- [ ] All icons generated (72, 96, 128, 144, 152, 192, 384, 512)
- [ ] manifest.json has correct URLs and colors
- [ ] Service worker caches important files
- [ ] HTTPS enabled
- [ ] Test on real mobile devices (iOS + Android)
- [ ] Test offline functionality
- [ ] Lighthouse PWA audit passes (90+)

## Need Help?

Check your browser console for errors. Common messages:

- `Service worker registration failed` → Check HTTPS
- `Manifest could not be fetched` → Check file path
- `Icon could not be loaded` → Generate icons
- `beforeinstallprompt not fired` → Wait for user engagement (Android)

The install banner we added should help on most devices! 🎁
