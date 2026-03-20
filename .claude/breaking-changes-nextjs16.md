# Breaking Changes - Next.js 16

El proyecto usa **Next.js 16.2.0**. El `AGENTS.md` advierte sobre breaking changes respecto a versiones anteriores.

## params es async (desde Next.js 15)

En Next.js 14 y anteriores, `params` era un objeto síncrono:

```tsx
// ANTES (Next.js 14) — YA NO FUNCIONA
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id  // Acceso directo
}
```

Desde Next.js 15/16, `params` es una **Promise** que debe ser awaited:

```tsx
// AHORA (Next.js 16) — Correcto
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params  // Requiere await
}
```

### Patrón nuevo recomendado: RouteContext

Next.js 16 introduce el helper `RouteContext` para tipar automáticamente:

```tsx
import type { NextRequest } from 'next/server'

export async function GET(_req: NextRequest, ctx: RouteContext<'/users/[id]'>) {
  const { id } = await ctx.params
}
```

Los tipos se generan durante `next dev`, `next build` o `next typegen`.

## Estado en el challenge

El código del challenge **ya usa params como Promise** correctamente en `src/app/api/tickets/[id]/route.ts` línea 16. No necesitamos cambiar nada, pero debemos tener cuidado de no escribir `params.id` directo (sin await) al tocar ese archivo.

## Referencia

Docs incluidos en `node_modules/next/dist/docs/`:
- `01-app/01-getting-started/15-route-handlers.md` — Route Handlers y RouteContext
- `01-app/01-getting-started/18-upgrading.md` — Guía de upgrade
