// Aplica el tema antes de pintar para evitar parpadeo (archivo aparte: la política de seguridad no permite scripts en línea).
try {
  var s = JSON.parse(localStorage.getItem('medlogic-progress') || '{}')
  var t = (s.state && s.state.settings && s.state.settings.theme) || 'system'
  var dark = t === 'dark' || (t === 'system' && matchMedia('(prefers-color-scheme: dark)').matches)
  if (dark) document.documentElement.classList.add('dark')
} catch (e) {}

// Navegador integrado de Instagram, Facebook, TikTok...: ahí no se puede instalar la app ni guardar bien el progreso.
// Se detecta antes de pintar y se muestra la pantalla «Ábrelo en Safari» (inapp-gate.js, que index.html carga en paralelo) sin esperar a la app,
// así no aparece primero la carga normal. «Continuar aquí» guarda la elección y monta la app (ver main.tsx).
try {
  if (/Instagram|FBAN|FBAV|FB_IAB|FBIOS|Messenger|musical_ly|Bytedance|TikTok|Snapchat|LinkedInApp|Pinterest|Line\/|Twitter|MicroMessenger/i.test(navigator.userAgent) && sessionStorage.getItem('medlogic-inapp-skip') !== '1') {
    window.__inappGate = true
    document.documentElement.classList.add('inapp')
  }
} catch (e) {}
