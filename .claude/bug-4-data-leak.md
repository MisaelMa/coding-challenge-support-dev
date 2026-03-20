# Bug 4: Fuga de datos - usuario ve tickets de otra empresa (CRÍTICO)

## Análisis del Problema

**Archivo:** `src/app/api/tickets/route.ts` (líneas 9-12)

**Síntoma:** Un usuario de TechCorp puede ver tickets que pertenecen a otras empresas (ej: Orosi).

**Causa raíz:** El endpoint GET no filtra por `companyId`. Retorna TODOS los tickets de la base de datos sin discriminar la empresa del usuario.

```tsx
// SIN FILTRO → Retorna tickets de TODAS las empresas
const tickets = await prisma.ticket.findMany({
  orderBy: { createdAt: 'desc' },
})
```

**Evidencia en seed data** (`prisma/seed.ts` línea 29):
```tsx
// Tickets de Otra Empresa (Fuga de datos, el usuario de TechCorp NO debería ver esto)
```

Se crean 2 tickets de TechCorp y 2 de Orosi. Sin filtro, se muestran los 4.

## Plan de Solución

Filtrar por `companyId` en el query de Prisma. Dado que no existe sistema de autenticación, se usa una constante que simula la empresa del usuario autenticado:

```tsx
// Simula la empresa del usuario autenticado
// En producción: se obtendría del token JWT / sesión
const CURRENT_COMPANY_ID = 'TechCorp'

const tickets = await prisma.ticket.findMany({
  where: { companyId: CURRENT_COMPANY_ID },
  orderBy: { createdAt: 'desc' },
})
```

**Adicionalmente, proteger también el PATCH** en `src/app/api/tickets/[id]/route.ts`:
Verificar que el ticket pertenece a la empresa del usuario antes de permitir actualizarlo. Ningún otro candidato hizo esto, pero es el mismo vector de ataque (IDOR).

```tsx
// Validar que el ticket pertenece a la empresa del usuario
const ticket = await prisma.ticket.findUnique({ where: { id } })
if (!ticket || ticket.companyId !== CURRENT_COMPANY_ID) {
  return Response.json({ error: 'Ticket no encontrado' }, { status: 404 })
}
```

**Por qué retornar 404 y no 403:** Revelar que el recurso existe pero no es accesible (403) le da información al atacante. Un 404 genérico no revela nada.

## Commit message
```
fix(security): filter tickets by companyId to prevent cross-tenant data leak

The GET endpoint returned all tickets regardless of company ownership.
Added companyId filter to both GET and PATCH endpoints. PATCH now also
validates ticket ownership before allowing updates, preventing IDOR.
```
