/**
 * Dirección a la que hay que pasar la ruta cuando alguien entra por una dirección limpia (sin «#»).
 * Devuelve null cuando no hay nada que cambiar.
 *
 * Importante: en la raíz del sitio NO se toca la dirección. Google, los enlaces de confirmar correo y los de
 * recuperar contraseña vuelven a «/?code=…»; reescribirla a «./#/» borraría ese código antes de que la cuenta
 * pueda leerlo, y la persona caería en la portada sin sesión.
 */
export function entryRedirect(loc: { pathname: string; search: string; hash: string }, base: string): string | null {
  if (loc.hash) return null
  const path = loc.pathname
  const isRoot = path === '/' || path === base || path === `${base}index.html` || path === '/index.html'
  if (isRoot) return null
  // Una ruta que no existe (un enlace viejo, por ejemplo) pasa al hash, conservando lo que venga en «?».
  return `${base}${loc.search}#${path}`
}
