# Cómo contribuir

Gracias por querer ayudar. MedLogic es gratuito y se mantiene con aportes de la comunidad.

## Formas de ayudar

- **Corregir contenido médico:** una respuesta equivocada, una explicación incompleta o una referencia desactualizada. Abre un *issue* con la pregunta y la fuente.
- **Proponer preguntas o guías:** con explicación y bibliografía. Ver [docs/FORMATO_PREGUNTAS.md](docs/FORMATO_PREGUNTAS.md).
- **Reportar errores:** usa la plantilla de *issue* e incluye dispositivo y navegador.
- **Código:** arreglos y funciones. Para cambios grandes, abre primero un *issue* para acordar el enfoque.

## Preparar el entorno

```bash
npm install
npm run dev
```

Requiere Node.js 22.

## Antes de abrir un pull request

```bash
npm run typecheck
npm test
npm run build
```

La integración continua ejecuta las pruebas y la compilación en cada pull request.

## Convenciones

- Una rama por cambio, con un nombre descriptivo (`arreglar-racha`, `nuevas-preguntas-cardiologia`).
- Commits y pull requests en español, claros y enfocados en una sola cosa.
- Sigue el estilo del código que te rodea (nombres, comentarios, estructura).
- Todo contenido médico debe poder respaldarse con una fuente.
- No subas datos de pacientes ni claves secretas. Las únicas claves en el cliente son las públicas de Supabase.

## Contenido médico

El material es educativo. Si tienes dudas sobre una respuesta, prefiere citar la guía o el texto de referencia en lugar de opinar sin fuente.
