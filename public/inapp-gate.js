// Pantalla «Ábrelo en Safari/Chrome» para el navegador integrado de redes sociales (ver theme-init.js).
// Es JavaScript simple a propósito: se dibuja al instante, sin esperar a la app (600 KB), y trae su propia
// animación de entrada. Todos los estilos van explícitos para que la hoja de estilos de la app, que llega
// después, no mueva nada. «Continuar aquí» monta la app con el evento «medlogic:continue».
;(function () {
  if (!window.__inappGate) return
  var ua = navigator.userAgent
  var ios = /iPhone|iPad|iPod/i.test(ua)
  var android = /Android/i.test(ua)
  var browser = ios ? 'Safari' : 'Chrome'
  var href = location.href

  // En Android, un enlace «intent» abre Chrome directamente. En iPhone no existe un equivalente.
  function chromeIntent() {
    try {
      var u = new URL(href)
      return 'intent://' + u.host + u.pathname + u.search + '#Intent;scheme=' + u.protocol.replace(':', '') + ';package=com.android.chrome;S.browser_fallback_url=' + encodeURIComponent(href) + ';end'
    } catch (e) {
      return href
    }
  }

  var css = [
    'html.inapp{background:#f6f8fb}html.inapp.dark{background:#070b14}',
    '#gate{--bg:#f6f8fb;--tx:#0f172a;--mu:#5b6b80;--cd:#fff;--bd:rgba(15,23,42,.08);--s2:#eef2f6;--hi:#067c71;position:fixed;inset:0;z-index:2147483000;overflow-y:auto;overscroll-behavior:contain;background:var(--bg);color:var(--tx);font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",Roboto,system-ui,sans-serif;-webkit-font-smoothing:antialiased;text-align:center;line-height:1.35}',
    'html.dark #gate{--bg:#070b14;--tx:#e8edf5;--mu:#9fb0c6;--cd:#0e1524;--bd:rgba(255,255,255,.08);--s2:#131c2e;--hi:#1fe0c9}',
    '#gate,#gate *{box-sizing:border-box;margin:0;padding:0;border:0}',
    '#gate .g-wrap{min-height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:max(72px,env(safe-area-inset-top)) 24px max(32px,env(safe-area-inset-bottom));max-width:440px;margin:0 auto}',
    '#gate .g-glow{position:fixed;inset:0;pointer-events:none;background:radial-gradient(520px circle at 50% 40%,rgba(20,184,166,.16),transparent 62%),radial-gradient(460px circle at 58% 62%,rgba(99,102,241,.12),transparent 62%)}',
    // Logo: arranca al centro de la pantalla y sube a su sitio.
    '#gate .g-stage{position:relative;width:84px;height:84px;flex:none}',
    '#gate .g-logo{display:block;width:84px;height:84px;filter:drop-shadow(0 14px 30px rgba(13,148,136,.35))}',
    '#gate .g-line{stroke-dasharray:100}',
    '#gate .g-ring{position:absolute;inset:0;border-radius:50%;border:2px solid rgba(20,184,166,.6);opacity:0}',
    '#gate .g-sh{position:absolute;left:50%;top:50%;opacity:0;margin:-8px 0 0 -8px;width:16px;height:16px}',
    '#gate .g-sh i{display:block;width:100%;height:100%;background:var(--c)}',
    '#gate .g-sh.g-k-dot i{border-radius:50%}#gate .g-sh.g-k-sq i{border-radius:3px}',
    '#gate .g-sh.g-k-ring i{background:none;border:3px solid var(--c);border-radius:50%}',
    '#gate .g-sh.g-k-tri i{clip-path:polygon(50% 0,100% 100%,0 100%)}',
    '#gate .g-sh.g-k-plus i{background:linear-gradient(var(--c),var(--c)) center/100% 3px no-repeat,linear-gradient(var(--c),var(--c)) center/3px 100% no-repeat}',
    '#gate h1{margin-top:26px;font-size:28px;line-height:1.12;font-weight:800;letter-spacing:-.025em;text-wrap:balance}',
    '#gate .g-sub{margin-top:12px;font-size:16px;color:var(--mu);text-wrap:balance}',
    '#gate .g-main{display:flex;flex-direction:column;align-items:center;width:100%}',
    '#gate .g-go{margin-top:22px;width:100%;height:48px;border-radius:14px;background:linear-gradient(135deg,#0ba595,#066a60);color:#fff;font:700 16px/48px -apple-system,BlinkMacSystemFont,system-ui,sans-serif;text-decoration:none;display:block;box-shadow:0 10px 30px -10px rgba(13,148,136,.7)}',
    '#gate ol{list-style:none;margin-top:24px;width:100%;text-align:left;background:var(--cd);border:1px solid var(--bd);border-radius:24px;padding:22px;display:flex;flex-direction:column;gap:18px;box-shadow:0 10px 30px -18px rgba(15,23,42,.25)}',
    '#gate li{display:flex;align-items:center;gap:14px;font-size:15px;color:var(--mu)}',
    '#gate li b{color:var(--tx)}',
    '#gate .g-n{flex:none;width:36px;height:36px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,#0ba595,#066a60);color:#fff;font-size:14px;font-weight:800}',
    '#gate .g-hint{margin-top:26px;font-size:14px;color:var(--mu)}',
    '#gate button{appearance:none;-webkit-appearance:none;cursor:pointer;font-family:inherit;color:inherit;background:none}',
    '#gate .g-copy{margin-top:12px;width:100%;height:48px;border-radius:999px;background:var(--s2);color:var(--tx);font-size:16px;font-weight:700;display:flex;align-items:center;justify-content:center;gap:8px}',
    '#gate .g-copy:active,#gate .g-go:active{transform:scale(.98)}',
    '#gate .g-skip{margin-top:22px;font-size:14px;color:var(--mu);text-decoration:underline;text-underline-offset:4px;padding:8px}',
    '#gate .g-arrow{position:fixed;top:10px;right:24px;display:flex;flex-direction:column;align-items:center;gap:2px;color:var(--hi);pointer-events:none}',
    '#gate .g-arrow b{font-size:13px;letter-spacing:3px;line-height:1;font-weight:900}',
    // Entrada: el logo se dibuja, estalla en ondas y formas, sube, y entra el resto en cascada.
    '@keyframes g-bg{from{opacity:0}}',
    '@keyframes g-pop{from{opacity:0;transform:scale(.55) rotate(-10deg)}60%{transform:scale(1.12) rotate(2deg)}}',
    '@keyframes g-draw{from{stroke-dashoffset:100}}',
    '@keyframes g-rise{from{transform:translateY(var(--dy,0px))}}',
    '@keyframes g-wave{0%{opacity:.85;transform:scale(1)}100%{opacity:0;transform:scale(3)}}',
    '@keyframes g-burst{0%{opacity:1;transform:translate(0,0) scale(0) rotate(0)}45%{opacity:1;transform:translate(var(--x),var(--y)) scale(1) rotate(calc(var(--r)*.6))}100%{opacity:0;transform:translate(calc(var(--x)*1.14),calc(var(--y)*1.14 + 16px)) scale(.8) rotate(var(--r))}}',
    '@keyframes g-up{from{opacity:0;transform:translateY(16px)}}',
    '@keyframes g-badge{from{opacity:0;transform:scale(.3)}60%{transform:scale(1.18)}}',
    '@keyframes g-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}',
    '#gate.g-go-on .g-logo{animation:g-pop .7s cubic-bezier(.34,1.56,.64,1) both}',
    '#gate.g-go-on .g-line{animation:g-draw .9s cubic-bezier(.65,0,.35,1) .25s backwards}',
    '#gate.g-go-on .g-stage{animation:g-rise .85s cubic-bezier(.16,1,.3,1) 1s backwards}',
    '#gate.g-go-on .g-ring{animation:g-wave 1.1s ease-out backwards}',
    '#gate.g-go-on .g-ring{animation-delay:.55s}#gate.g-go-on .g-ring:nth-of-type(2){animation-delay:.69s}#gate.g-go-on .g-ring:nth-of-type(3){animation-delay:.83s}',
    '#gate.g-go-on .g-sh{animation:g-burst 1.4s cubic-bezier(.16,1,.3,1) both;animation-delay:calc(.55s + var(--d))}',
    '#gate.g-go-on h1{animation:g-up .6s cubic-bezier(.16,1,.3,1) 1.35s backwards}',
    '#gate.g-go-on .g-sub{animation:g-up .6s cubic-bezier(.16,1,.3,1) 1.5s backwards}',
    '#gate.g-go-on .g-go{animation:g-up .6s cubic-bezier(.16,1,.3,1) 1.6s backwards}',
    '#gate.g-go-on ol{animation:g-up .6s cubic-bezier(.16,1,.3,1) 1.65s backwards}',
    '#gate.g-go-on li:nth-child(1) .g-n{animation:g-badge .5s cubic-bezier(.34,1.56,.64,1) 1.85s backwards}',
    '#gate.g-go-on li:nth-child(2) .g-n{animation:g-badge .5s cubic-bezier(.34,1.56,.64,1) 2.05s backwards}',
    '#gate.g-go-on li:nth-child(3) .g-n{animation:g-badge .5s cubic-bezier(.34,1.56,.64,1) 2.25s backwards}',
    '#gate.g-go-on li span{animation:g-up .5s cubic-bezier(.16,1,.3,1) backwards}',
    '#gate.g-go-on li:nth-child(1) span{animation-delay:1.9s}#gate.g-go-on li:nth-child(2) span{animation-delay:2.1s}#gate.g-go-on li:nth-child(3) span{animation-delay:2.3s}',
    '#gate.g-go-on .g-hint{animation:g-up .6s ease-out 2.4s backwards}',
    '#gate.g-go-on .g-copy{animation:g-up .6s cubic-bezier(.16,1,.3,1) 2.5s backwards}',
    '#gate.g-go-on .g-skip{animation:g-up .6s ease-out 2.7s backwards}',
    '#gate.g-go-on .g-arrow{animation:g-up .5s ease-out 2.2s backwards}',
    '#gate.g-go-on .g-arrow svg{animation:g-bob 1s ease-in-out 2.7s 4}',
    '@media (prefers-reduced-motion:reduce){#gate *{animation:none!important}#gate .g-sh,#gate .g-ring{display:none}}',
  ].join('\n')

  var SHAPES = ['g-k-dot', 'g-k-sq', 'g-k-ring', 'g-k-plus', 'g-k-tri']
  var COLORS = ['#0ba595', '#6366f1', '#ec4899', '#f59e0b', '#14b8a6', '#8b5cf6']
  var shapes = ''
  for (var i = 0; i < 14; i++) {
    var a = (i / 14) * Math.PI * 2 + (i % 2 ? 0.18 : -0.1)
    var dist = 120 + (i % 3) * 38
    shapes += '<span class="g-sh ' + SHAPES[i % 5] + '" style="--x:' + Math.round(Math.cos(a) * dist) + 'px;--y:' + Math.round(Math.sin(a) * dist) + 'px;--r:' + (i % 2 ? 1 : -1) * (90 + i * 20) + 'deg;--c:' + COLORS[i % 6] + ';--d:' + (i % 4) * 0.03 + 's"><i></i></span>'
  }

  var logo =
    '<svg class="g-logo" viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="gg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#14bfac"/><stop offset=".55" stop-color="#078377"/><stop offset="1" stop-color="#055b53"/></linearGradient><radialGradient id="gh" cx=".28" cy=".18" r=".78"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset=".65" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>' +
    '<rect width="64" height="64" rx="18" fill="url(#gg)"/><rect width="64" height="64" rx="18" fill="url(#gh)"/><rect x=".5" y=".5" width="63" height="63" rx="17.5" fill="none" stroke="#fff" stroke-opacity=".16"/>' +
    '<path d="M9 40H15L22 18 32 44 42 18 49 40H52" fill="none" stroke="#fff" stroke-opacity=".22" stroke-width="4.6" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<path class="g-line" pathLength="100" d="M9 40H15L22 18 32 44 42 18 49 40H52" fill="none" stroke="#fff" stroke-width="4.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="56" cy="40" r="3.2" fill="#a7f3d0"/></svg>'

  var html =
    '<div class="g-glow"></div>' +
    '<div class="g-arrow" aria-hidden="true"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg><b>•••</b></div>' +
    '<div class="g-wrap"><div class="g-stage"><span class="g-ring"></span><span class="g-ring"></span><span class="g-ring"></span>' + shapes + logo + '</div>' +
    '<div class="g-main"><h1>Ábrelo en ' + browser + ' para seguir</h1>' +
    '<p class="g-sub">Desde esta ventana no se puede guardar tu progreso ni instalar MedLogic como app en tu celular. Toma 5 segundos.</p>' +
    (android ? '<a class="g-go" href="' + chromeIntent().replace(/"/g, '&quot;') + '">Abrir en Chrome</a>' : '') +
    '<ol><li><i class="g-n">1</i><span>Toca los <b>•••</b> arriba a la derecha</span></li>' +
    '<li><i class="g-n">2</i><span>Toca <b>«Abrir en navegador externo»</b></span></li>' +
    '<li><i class="g-n">3</i><span>Si te pregunta, elige <b>' + browser + '</b></span></li></ol>' +
    '<p class="g-hint">¿No te sale? Copia el link y pégalo en ' + browser + ':</p>' +
    '<button type="button" class="g-copy"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg><span>Copiar el link</span></button>' +
    '<button type="button" class="g-skip">Continuar aquí de todos modos</button></div></div>'

  function run() {
    var style = document.createElement('style')
    style.textContent = css
    document.head.appendChild(style)
    var gate = document.createElement('div')
    gate.id = 'gate'
    gate.setAttribute('role', 'dialog')
    gate.setAttribute('aria-modal', 'true')
    gate.setAttribute('aria-label', 'Ábrelo en ' + browser + ' para seguir')
    gate.innerHTML = html
    document.documentElement.appendChild(gate)

    // El logo empieza en el centro de la pantalla y sube hasta su lugar: se mide antes de animar.
    var stage = gate.querySelector('.g-stage')
    var r = stage.getBoundingClientRect()
    gate.style.setProperty('--dy', Math.round(innerHeight / 2 - (r.top + r.height / 2)) + 'px')
    gate.className = 'g-go-on'

    var label = gate.querySelector('.g-copy span')
    gate.querySelector('.g-copy').addEventListener('click', function () {
      function done() {
        label.textContent = 'Link copiado'
        setTimeout(function () {
          label.textContent = 'Copiar el link'
        }, 2500)
      }
      function legacy() {
        var ta = document.createElement('textarea')
        ta.value = href
        ta.style.cssText = 'position:fixed;opacity:0'
        document.body.appendChild(ta)
        ta.select()
        try {
          if (document.execCommand('copy')) done()
        } catch (e) {}
        ta.remove()
      }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(href).then(done, legacy)
      else legacy()
    })

    gate.querySelector('.g-skip').addEventListener('click', function () {
      try {
        sessionStorage.setItem('medlogic-inapp-skip', '1')
      } catch (e) {}
      gate.remove()
      style.remove()
      document.documentElement.classList.remove('inapp')
      window.__inappGate = false
      window.dispatchEvent(new Event('medlogic:continue'))
    })
  }

  run()
})()
