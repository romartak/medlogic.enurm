// Aplica el tema antes de pintar para evitar parpadeo (archivo aparte: la política de seguridad no permite scripts en línea).
try {
  var s = JSON.parse(localStorage.getItem('medlogic-progress') || '{}')
  var t = (s.state && s.state.settings && s.state.settings.theme) || 'system'
  var dark = t === 'dark' || (t === 'system' && matchMedia('(prefers-color-scheme: dark)').matches)
  if (dark) document.documentElement.classList.add('dark')
} catch (e) {}
