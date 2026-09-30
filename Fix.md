# Fix — Optimización Docker

## Resumen de cambios

Se identificaron y corrigieron los siguientes problemas en la configuración de Docker del proyecto. Los archivos modificados son tres: `dockerfile`, `next.config.mjs` y `.dockerignore` (nuevo).

---

## `dockerfile` — Reescritura completa

| Problema | Corrección aplicada |
|---|---|
| `COPY package*.json ./` — el glob de npm nunca coincidía con `pnpm-lock.yaml`, por lo que `--frozen-lockfile` fallaba | Cambiado a `COPY package.json pnpm-lock.yaml ./` explícito |
| Sin caché de BuildKit para el store de pnpm — cada build volvía a descargar todos los paquetes | Se agregó `--mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store` |
| La etapa de producción reinstalaba pnpm globalmente y copiaba `node_modules` completo (~cientos de MB) | Ambas cosas eliminadas; la salida standalone incluye su propio árbol de dependencias mínimo |
| El contenedor de producción corría como root | Se agregó un usuario de sistema `nodejs`/`nextjs`; todos los archivos con `chown` correspondiente |
| `pnpm start` en producción requería que pnpm estuviese instalado | Reemplazado por `node server.js` (el servidor standalone solo necesita Node) |
| `ENV NEXT_TELEMETRY_DISABLED` y `NODE_ENV` estaban dispersos | Consolidados; telemetría deshabilitada antes de `pnpm run build` |
| Sin `PORT` / `HOSTNAME` — el servidor standalone podría no escuchar en todas las interfaces | Se agregaron `PORT=3000` y `HOSTNAME=0.0.0.0` |
| Faltaba la directiva `# syntax=docker/dockerfile:1` | Agregada para que los cache mounts de BuildKit funcionen sin flags adicionales |

---

## `next.config.mjs` — Un agregado

Se añadió `output: 'standalone'`.

Esta opción instruye a Next.js para que analice y empaquete únicamente los archivos de runtime que cada página utiliza efectivamente, generando el directorio `.next/standalone`. Esto es lo que permite a la etapa de producción del Dockerfile prescindir completamente de la copia de `node_modules` (300–600 MB).

---

## `.dockerignore` — Archivo nuevo

Este archivo no existía en el proyecto. Su ausencia provocaba que Docker enviara el workspace completo al daemon en cada build, incluyendo `node_modules/`, `.next/`, `.git/`, etc.

El archivo creado excluye:

- `node_modules/` y `.pnpm-store/`
- `.next/` y `out/` (salida de builds anteriores)
- `.git/` y `.gitignore`
- Configuraciones de editores (`.vscode/`, `.idea/`, `*.swp`, etc.)
- Archivos de sistema operativo (`.DS_Store`, `Thumbs.db`)
- `*.md` y `LICENSE`
- `styles/` — archivo CSS sin usar, no importado por el build activo
- `.env` y `.env.*` — secretos que nunca deben incluirse en la imagen

---

## Prerequisito cumplido

`pnpm-lock.yaml` solo contenía el encabezado del lockfile (sin paquetes resueltos). Se ejecutó `pnpm install` localmente para generar el lockfile completo (2.963 líneas, 189 paquetes resueltos). El flag `--frozen-lockfile` — correcto para entornos de CI/Docker — requiere que este archivo esté completo y commiteado en el repositorio.

---

## Advertencia de seguridad

Durante la instalación se detectó que `next@14.2.16` tiene una vulnerabilidad de seguridad conocida. Se recomienda actualizar a una versión parcheada:

```bash
pnpm add next@latest
```

Referencia: https://nextjs.org/blog/security-update-2025-12-11
