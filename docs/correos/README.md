# Plantillas de correo (Supabase Auth)

Se pegan en Supabase → Authentication → Emails → Templates.

| Plantilla de Supabase | Asunto | Archivo |
| --- | --- | --- |
| Confirm signup | Confirma tu correo en MedLogic ENURM | `confirmar-registro.html` |
| Reset password | Cambia tu contraseña de MedLogic ENURM | `recuperar-contrasena.html` |

Usan la variable `{{ .ConfirmationURL }}` de Supabase; no la cambies.
