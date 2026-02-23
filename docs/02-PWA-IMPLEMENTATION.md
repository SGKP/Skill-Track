# PWA (Progressive Web App) Implementation Guide

## 🎯 Goal
Transform SkillTrack into an installable app that works offline and feels native.

## ✨ Features You'll Add
- ✅ Install to home screen (mobile & desktop)
- ✅ Offline support
- ✅ Push notifications
- ✅ Fast loading with caching
- ✅ App-like experience

---

## Step 1: Install Dependencies

```bash
npm install next-pwa workbox-webpack-plugin
```

---

## Step 2: Configure Next.js for PWA

Update `next.config.js`:
```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // Disable in dev
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 365 * 24 * 60 * 60 // 1 year
        }
      }
    },
    {
      urlPattern: /^https:\/\/cdn\..*\.(png|jpg|jpeg|svg|gif)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'external-images',
        expiration: {
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
        }
      }
    },
    {
      urlPattern: /^\/api\//,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 5 * 60 // 5 minutes
        },
        networkTimeoutSeconds: 10
      }
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-images',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
        }
      }
    }
  ]
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true
};

module.exports = withPWA(nextConfig);
```

---

## Step 3: Create Web Manifest

Create `public/manifest.json`:
```json
{
  "name": "SkillTrack - Career Tracking Platform",
  "short_name": "SkillTrack",
  "description": "Track your career journey with AI-powered guidance and real-time insights",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0f172a",
  "theme_color": "#3b82f6",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "categories": ["business", "productivity", "education"],
  "screenshots": [
    {
      "src": "/screenshots/dashboard.png",
      "sizes": "1280x720",
      "type": "image/png"
    }
  ],
  "shortcuts": [
    {
      "name": "Dashboard",
      "short_name": "Dashboard",
      "description": "View your career dashboard",
      "url": "/user/dashboard",
      "icons": [{ "src": "/icons/dashboard-96x96.png", "sizes": "96x96" }]
    },
    {
      "name": "AI Assistant",
      "short_name": "AI Chat",
      "description": "Chat with career AI",
      "url": "/user/dashboard?tab=chatbot",
      "icons": [{ "src": "/icons/ai-96x96.png", "sizes": "96x96" }]
    }
  ]
}
```

---

## Step 4: Update Layout with Metadata

Update `src/app/layout.js`:
```javascript
export const metadata = {
  title: 'SkillTrack - Career Tracking Platform',
  description: 'Track your career journey with AI-powered guidance',
  manifest: '/manifest.json',
  themeColor: '#3b82f6',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SkillTrack'
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false
  },
  icons: {
    icon: '/icons/icon-192x192.png',
    apple: '/icons/icon-192x192.png'
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* PWA Meta Tags */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3b82f6" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SkillTrack" />
        
        {/* Microsoft Tiles */}
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-TileImage" content="/icons/icon-144x144.png" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

---

## Step 5: Create Install Prompt Component

Create `src/components/InstallPWA.js`:
```javascript
'use client'
import { useState, useEffect } from 'react';

export default function InstallPWA() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for install prompt
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      
      // Show prompt after 30 seconds
      setTimeout(() => setShowPrompt(true), 30000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Detect if installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;

    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('✅ PWA installed');
      setShowPrompt(false);
    }

    setInstallPrompt(null);
  };

  if (isInstalled || !showPrompt) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-2xl p-4 max-w-sm z-50 border-2 border-blue-500">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 mb-1">Install SkillTrack</h3>
          <p className="text-sm text-gray-600 mb-3">
            Install our app for faster access and offline support!
          </p>
          
          <div className="flex gap-2">
            <button
              onClick={handleInstall}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
            >
              Install
            </button>
            <button
              onClick={() => setShowPrompt(false)}
              className="text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition"
            >
              Later
            </button>
          </div>
        </div>
        
        <button
          onClick={() => setShowPrompt(false)}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
```

Add to your layout or dashboard:
```javascript
import InstallPWA from '@/components/InstallPWA';

export default function Dashboard() {
  return (
    <div>
      {/* Your dashboard content */}
      <InstallPWA />
    </div>
  );
}
```

---

## Step 6: Offline Page

Create `public/offline.html`:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Offline - SkillTrack</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      padding: 20px;
    }
    
    .container {
      text-align: center;
      max-width: 500px;
    }
    
    .icon {
      font-size: 80px;
      margin-bottom: 20px;
    }
    
    h1 {
      font-size: 32px;
      margin-bottom: 16px;
    }
    
    p {
      font-size: 18px;
      opacity: 0.9;
      margin-bottom: 30px;
    }
    
    button {
      background: white;
      color: #667eea;
      border: none;
      padding: 12px 32px;
      font-size: 16px;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      transition: transform 0.2s;
    }
    
    button:hover {
      transform: scale(1.05);
    }
    
    button:active {
      transform: scale(0.95);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">📡</div>
    <h1>You're Offline</h1>
    <p>It seems like you've lost your internet connection. Don't worry, some features still work offline!</p>
    <button onclick="location.reload()">Try Again</button>
  </div>
</body>
</html>
```

---

## Step 7: Push Notifications

Create `src/lib/notifications.js`:
```javascript
export class PushNotifications {
  static async requestPermission() {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  static async subscribe() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('Push messaging is not supported');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        )
      });

      // Send subscription to backend
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      });

      return subscription;
    } catch (error) {
      console.error('Failed to subscribe:', error);
      return null;
    }
  }

  static async showNotification(title, options = {}) {
    if (Notification.permission !== 'granted') {
      return;
    }

    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      registration.showNotification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        vibrate: [200, 100, 200],
        ...options
      });
    } else {
      new Notification(title, options);
    }
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
```

Add notification button to your dashboard:
```javascript
'use client'
import { PushNotifications } from '@/lib/notifications';

export default function NotificationButton() {
  const enableNotifications = async () => {
    const granted = await PushNotifications.requestPermission();
    
    if (granted) {
      await PushNotifications.subscribe();
      await PushNotifications.showNotification('Notifications Enabled!', {
        body: 'You\'ll now receive career updates and job alerts.',
        icon: '/icons/icon-192x192.png',
        tag: 'welcome'
      });
    }
  };

  return (
    <button
      onClick={enableNotifications}
      className="bg-blue-600 text-white px-4 py-2 rounded-lg"
    >
      🔔 Enable Notifications
    </button>
  );
}
```

---

## Step 8: Generate Icons

Create icons using online tools or this script:

Create `scripts/generate-icons.js`:
```javascript
// Install: npm install sharp
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputIcon = 'public/logo.png'; // Your source image (1024x1024 recommended)
const outputDir = 'public/icons';

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generateIcons() {
  for (const size of sizes) {
    await sharp(inputIcon)
      .resize(size, size)
      .toFile(path.join(outputDir, `icon-${size}x${size}.png`));
    
    console.log(`✅ Generated ${size}x${size} icon`);
  }
  
  console.log('🎉 All icons generated!');
}

generateIcons().catch(console.error);
```

Run with:
```bash
npm install sharp
node scripts/generate-icons.js
```

---

## Step 9: Test PWA

### Desktop (Chrome DevTools):
1. Open DevTools (F12)
2. Go to "Application" tab
3. Click "Manifest" - verify all data is correct
4. Click "Service Workers" - verify worker is registered
5. Test "Offline" mode - enable offline and reload

### Mobile Testing:
```bash
# Install ngrok for HTTPS tunnel
npm install -g ngrok

# Run your dev server
npm run dev

# In another terminal:
ngrok http 3000

# Open the HTTPS URL on mobile
# You should see "Install App" prompt
```

### Lighthouse Audit:
1. Open Chrome DevTools
2. Go to "Lighthouse" tab
3. Select "Progressive Web App"
4. Click "Generate report"
5. Aim for 100% score!

---

## Step 10: Update Manifest Dynamically (Advanced)

Create `src/app/manifest.ts`:
```typescript
import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SkillTrack - Career Tracking Platform',
    short_name: 'SkillTrack',
    description: 'Track your career journey with AI-powered guidance',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#3b82f6',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable'
      }
    ]
  };
}
```

---

## 🧪 Features to Test

### ✅ Installation
- [ ] Install prompt appears
- [ ] App installs successfully
- [ ] Icon appears on home screen
- [ ] Splash screen shows on launch

### ✅ Offline Mode
- [ ] Page loads offline
- [ ] Cached data displays
- [ ] Offline indicator shows
- [ ] Queue actions for later

### ✅ Performance
- [ ] Assets cached properly
- [ ] Fast repeat visits
- [ ] Smooth animations

### ✅ Push Notifications
- [ ] Permission request works
- [ ] Notifications received
- [ ] Click opens correct page

---

## 📱 Expected Results

### Before PWA:
- Mobile bounce rate: ~60%
- Page load: ~2-3 seconds
- Not installable

### After PWA:
- Mobile bounce rate: ~30%
- Page load: ~300ms (cached)
- Installable
- +40% engagement from installed users

---

## 🐛 Common Issues

**Service worker not registering:**
```javascript
// Check in browser console
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Registered workers:', registrations);
});
```

**Install prompt not showing:**
- Requires HTTPS (or localhost)
- Manifest must be valid
- Service worker must be registered
- User must engage with site first

**Icons not showing:**
```bash
# Verify icons exist
ls public/icons

# Check manifest
curl http://localhost:3000/manifest.json
```

---

## 🚀 Deployment

### Vercel (Automatic):
```bash
# PWA works automatically on Vercel
vercel deploy
```

### Manual Build:
```bash
npm run build
npm start

# PWA assets generated in public/
```

---

## 📚 Resources

- **web.dev PWA**: https://web.dev/progressive-web-apps/
- **PWA Builder**: https://www.pwabuilder.com/
- **Workbox**: https://developers.google.com/web/tools/workbox
- **Can I Use**: Check PWA support by browser

---

Ready to make SkillTrack installable? Start with Step 1!
