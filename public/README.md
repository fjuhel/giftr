# Firebase Service Worker

The `firebase-messaging-sw.js` file is **generated** from the template and should not be committed to version control.

## How it works

1. **Template**: `public/firebase-messaging-sw.template.js` contains placeholders like `__FIREBASE_API_KEY__`
2. **Script**: `scripts/generate-sw.mjs` reads your `.env` file and replaces placeholders
3. **Output**: `public/firebase-messaging-sw.js` is generated with actual values (gitignored)

## Usage

The service worker is automatically generated when you run:

- `yarn dev` - Generates SW then starts dev server
- `yarn build` - Generates SW then builds for production
- `yarn generate:sw` - Generates SW only

## Important

- ✅ Commit: `firebase-messaging-sw.template.js`
- ❌ Don't commit: `firebase-messaging-sw.js` (auto-generated)
