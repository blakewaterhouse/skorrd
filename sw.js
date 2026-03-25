const CACHE = 'skorrd-v3'
const STATIC = [
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
]

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(STATIC)).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return
  if (e.request.url.includes('supabase.co')) return

  const url = new URL(e.request.url)
  const isHtml = url.pathname.endsWith('.html') || url.pathname === '/' || !url.pathname.includes('.')

  if (isHtml) {
    // Network-first for HTML — always get the latest version
    e.respondWith(
      fetch(e.request).then(res => {
        if (res.ok) {
          const clone = res.clone()
          caches.open(CACHE).then(cache => cache.put(e.request, clone))
        }
        return res
      }).catch(() => caches.match(e.request))
    )
  } else {
    // Cache-first for static assets (fonts, icons, JS)
    e.respondWith(
      caches.match(e.request).then(cached => {
        const network = fetch(e.request).then(res => {
          if (res.ok) {
            const clone = res.clone()
            caches.open(CACHE).then(cache => cache.put(e.request, clone))
          }
          return res
        })
        return cached || network
      })
    )
  }
})
