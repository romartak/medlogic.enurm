/* MedLogic ENURM: modo sin conexión.
 *  - Páginas: primero la red; sin internet, la última copia guardada.
 *  - assets/ (archivos con huella, no cambian nunca): primero lo guardado.
 *  - Datos, fuentes e imágenes: lo guardado al instante y se actualiza en segundo plano.
 *  - «Guardar para estudiar sin conexión» (Ajustes) descarga todo lo listado en precache.json.
 * Nada de esto guarda datos personales: solo archivos públicos de la propia app. */
const CACHE = 'medlogic-v1'

/* Los scripts de la página se piden con cabecera Origin y los archivos se guardaron sin ella: sin ignoreVary, el caché
 * los trata como distintos (Vary: Origin) y no encuentra nada. */
const MATCH = { ignoreVary: true }

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys()) if (key !== CACHE) await caches.delete(key)
      await self.clients.claim()
    })(),
  )
})

async function put(request, response) {
  if (response && response.ok && response.type === 'basic') {
    const cache = await caches.open(CACHE)
    await cache.put(request, response.clone())
  }
  return response
}

async function networkFirst(request) {
  try {
    return await put(request, await fetch(request))
  } catch (err) {
    const hit = (await caches.match(request, MATCH)) || (await caches.match(self.registration.scope, MATCH))
    if (hit) return hit
    throw err
  }
}

async function cacheFirst(request) {
  const hit = await caches.match(request, MATCH)
  if (hit) return hit
  return put(request, await fetch(request))
}

async function staleWhileRevalidate(request) {
  const hit = await caches.match(request, MATCH)
  const refresh = fetch(request)
    .then((res) => put(request, res))
    .catch(() => hit)
  return hit || refresh
}

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  if (url.pathname.endsWith('/sw.js') || url.pathname.endsWith('/precache.json')) return
  if (request.mode === 'navigate') event.respondWith(networkFirst(request))
  else if (url.pathname.includes('/assets/')) event.respondWith(cacheFirst(request))
  else event.respondWith(staleWhileRevalidate(request))
})

/** Descarga todo lo que lista precache.json y avisa del avance a la página que lo pidió. */
async function precache(client) {
  const cache = await caches.open(CACHE)
  const list = await (await fetch(new URL('precache.json', self.registration.scope), { cache: 'no-store' })).json()
  let done = 0
  let failed = 0
  for (const file of list.files) {
    try {
      const url = new URL(file, self.registration.scope)
      const res = await fetch(url)
      if (res.ok) await cache.put(url, res)
      else failed++
    } catch {
      failed++
    }
    done++
    if (client) client.postMessage({ type: 'precache-progress', done, total: list.files.length })
  }
  if (client) client.postMessage({ type: 'precache-done', total: list.files.length, failed })
}

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'precache') event.waitUntil(precache(event.source))
})
