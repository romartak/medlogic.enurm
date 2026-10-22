import { toast } from '@/store/toasts'
import { PROMPT_TOOLS } from '@/data/prompts'

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Alternativa para navegadores sin acceso al portapapeles.
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    ta.remove()
    return ok
  }
}

/** Copia el prompt y abre la IA elegida (con el texto precargado cuando la herramienta lo admite). */
export async function openInAi(toolId: (typeof PROMPT_TOOLS)[number]['id'], prompt: string, attachment?: string) {
  const tool = PROMPT_TOOLS.find((t) => t.id === toolId)!
  await copyText(prompt)
  const url = tool.url(prompt)
  // Las URL muy largas fallan: en ese caso se abre la herramienta y el prompt queda copiado.
  const tooLong = url.length > 7000
  window.open(tooLong || !tool.prefill ? tool.url('') .replace(/\?q=$/, '') : url, '_blank', 'noopener')
  toast({
    kind: 'success',
    title: tool.prefill && !tooLong ? `Abriendo ${tool.name}` : `Prompt copiado: pégalo en ${tool.name}`,
    body: attachment ?? (tool.prefill && !tooLong ? 'El prompt también quedó copiado.' : 'Usa Ctrl+V (o mantén pulsado y "Pegar").'),
  })
}
