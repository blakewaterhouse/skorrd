const CACHE = 'skorrd-v5'
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

self.addEventListener('push', e => {
  let data = { title: 'New slot on Skorrd', body: 'A new discounted appointment just dropped!', url: '/' }
  if (e.data) {
    try { data = { ...data, ...JSON.parse(e.data.text()) } } catch {}
  }
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: './icons/icon-192.png',
      badge: './icons/icon-192.png',
      data: { url: data.url },
      vibrate: [100, 50, 100],
    })
  )
})

self.addEventListener('notificationclick', e => {
  e.notification.close()
  const url = e.notification.data?.url || '/'
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      const match = list.find(c => c.url.includes('skorrd') && 'focus' in c)
      return match ? match.focus() : clients.openWindow(url)
    })
  )
})
