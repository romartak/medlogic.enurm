/**
 * Semitono en vivo: dibuja un <video> como una trama de puntos (más grandes donde la imagen es oscura, más
 * pequeños donde es clara), como una impresión. Se calcula en la tarjeta gráfica con WebGL, así que cuesta
 * casi nada y los puntos salen nítidos aunque el video sea liviano y esté muy comprimido.
 * Devuelve la función que lo detiene, o `null` si el navegador no soporta WebGL (se queda el video normal).
 */
const VERT = `attribute vec2 a; void main(){ gl_Position = vec4(a, 0.0, 1.0); }`

const FRAG = `
precision mediump float;
uniform sampler2D u_tex;
uniform vec2 u_res;
uniform float u_cell;

void main() {
  vec2 p = vec2(gl_FragCoord.x, u_res.y - gl_FragCoord.y);
  vec2 center = (floor(p / u_cell) + 0.5) * u_cell;
  vec2 o = vec2(0.25 * u_cell) / u_res;
  vec2 uv = center / u_res;
  vec3 c = (texture2D(u_tex, uv + vec2(-o.x, -o.y)).rgb
          + texture2D(u_tex, uv + vec2( o.x, -o.y)).rgb
          + texture2D(u_tex, uv + vec2(-o.x,  o.y)).rgb
          + texture2D(u_tex, uv + vec2( o.x,  o.y)).rgb) * 0.25;
  float lum = dot(c, vec3(0.299, 0.587, 0.114));
  // Tinta: el color de la imagen, un poco más vivo y más oscuro, sobre papel blanco.
  vec3 ink = mix(vec3(lum), c, 1.5) * 0.82;
  // El área del punto sigue a la oscuridad de la imagen (con un mínimo para que los fondos claros conserven su tono).
  float dark = clamp(1.0 - lum, 0.0, 1.0);
  float r = u_cell * 0.7 * sqrt(max(dark, 0.12));
  float m = 1.0 - smoothstep(r - 0.7, r + 0.7, length(p - center));
  gl_FragColor = vec4(mix(vec3(1.0), ink, m), 1.0);
}`

function shader(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!
  gl.shaderSource(s, src)
  gl.compileShader(s)
  return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null
}

export function startHalftone(canvas: HTMLCanvasElement, video: HTMLVideoElement, onFirstFrame: () => void, cssCell = 2.2): (() => void) | null {
  const gl = canvas.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'low-power' })
  if (!gl) return null
  const vs = shader(gl, gl.VERTEX_SHADER, VERT)
  const fs = shader(gl, gl.FRAGMENT_SHADER, FRAG)
  const prog = gl.createProgram()
  if (!vs || !fs || !prog) return null
  gl.attachShader(prog, vs)
  gl.attachShader(prog, fs)
  gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null
  gl.useProgram(prog)

  const buf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
  const loc = gl.getAttribLocation(prog, 'a')
  gl.enableVertexAttribArray(loc)
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

  const tex = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, tex)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  const uRes = gl.getUniformLocation(prog, 'u_res')
  const uCell = gl.getUniformLocation(prog, 'u_cell')

  let dpr = 1
  const size = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr))
    const h = Math.max(1, Math.round(canvas.clientHeight * dpr))
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w
      canvas.height = h
    }
    gl.viewport(0, 0, w, h)
  }

  let first = true
  const draw = () => {
    if (video.readyState < 2 || !video.videoWidth) return
    size()
    gl.uniform2f(uRes, canvas.width, canvas.height)
    gl.uniform1f(uCell, cssCell * dpr)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    if (first) {
      first = false
      onFirstFrame()
    }
  }

  // Solo dibuja mientras el video avanza; en pausa se queda el último cuadro.
  let running = false
  let handle = 0
  const useRvfc = 'requestVideoFrameCallback' in video
  const tick = () => {
    if (!running) return
    draw()
    handle = useRvfc ? (video as HTMLVideoElement).requestVideoFrameCallback(tick) : requestAnimationFrame(tick)
  }
  const start = () => {
    if (running) return
    running = true
    tick()
  }
  const stop = () => {
    running = false
    if (useRvfc) video.cancelVideoFrameCallback(handle)
    else cancelAnimationFrame(handle)
  }
  const onPause = () => {
    stop()
    draw()
  }
  video.addEventListener('playing', start)
  video.addEventListener('pause', onPause)
  video.addEventListener('loadeddata', draw)
  const ro = new ResizeObserver(draw)
  ro.observe(canvas)
  if (!video.paused) start()
  else draw()

  return () => {
    stop()
    video.removeEventListener('playing', start)
    video.removeEventListener('pause', onPause)
    video.removeEventListener('loadeddata', draw)
    ro.disconnect()
    gl.getExtension('WEBGL_lose_context')?.loseContext()
  }
}
