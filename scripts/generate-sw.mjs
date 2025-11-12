#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env file manually
const envPath = path.resolve(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach((line) => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim();
  }
});

// Read the template
const templatePath = path.resolve(
  __dirname,
  '../public/firebase-messaging-sw.template.js'
);
let content = fs.readFileSync(templatePath, 'utf-8');

// Replace placeholders
content = content
  .replace('__FIREBASE_API_KEY__', env.VITE_FIREBASE_API_KEY || '')
  .replace('__FIREBASE_AUTH_DOMAIN__', env.VITE_FIREBASE_AUTH_DOMAIN || '')
  .replace('__FIREBASE_PROJECT_ID__', env.VITE_FIREBASE_PROJECT_ID || '')
  .replace(
    '__FIREBASE_STORAGE_BUCKET__',
    env.VITE_FIREBASE_STORAGE_BUCKET || ''
  )
  .replace(
    '__FIREBASE_MESSAGING_SENDER_ID__',
    env.VITE_FIREBASE_MESSAGING_SENDER_ID || ''
  )
  .replace('__FIREBASE_APP_ID__', env.VITE_FIREBASE_APP_ID || '');

// Write to public directory
const outputPath = path.resolve(
  __dirname,
  '../public/firebase-messaging-sw.js'
);
fs.writeFileSync(outputPath, content);

console.log('✅ Generated firebase-messaging-sw.js with environment variables');
