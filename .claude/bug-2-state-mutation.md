# Bug 2: Se requiere recargar la página para ver cambios de estado

## Análisis del Problema

**Archivo:** `src/app/page.tsx` (líneas 55-62, función `handleResolve`)

**Síntoma:** Al resolver un ticket, el estado no se actualiza visualmente. El usuario debe hacer reload completo para ver el cambio.

**Causa raíz:** Mutación directa del state de React. El código modifica el array existente en lugar de crear uno nuevo, por lo que React no detecta el cambio (compara por referencia).

```tsx
// BUGGY: Mutación directa del array
const ticketIndex = tickets.findIndex((t) => t.id === updatedTicket.id)
if (ticketIndex !== -1) {
  tickets[ticketIndex] = updatedTicket   // Modifica el mismo array
  setTickets(tickets)                     // React ve la misma referencia → no re-renderiza
}
```

React usa `Object.is()` para comparar el state anterior con el nuevo. Si es la misma referencia de array, asume que nada cambió y omite el re-render.

## Plan de Solución

Usar la forma funcional de `setTickets` con `.map()` para crear un nuevo array inmutable:

```tsx
setTickets((prev) =>
  prev.map((t) => (t.id === updatedTicket.id ? updatedTicket : t))
)
```

**Por qué esta forma y no `[...tickets]`:**
- La forma funcional `(prev) => ...` evita problemas de closures stale
- `.map()` es más declarativo y idiomático en React que spread + index assignment
- Es una sola expresión limpia, sin variables intermedias

**Nota:** Algunos candidatos agregaron polling (refetch cada 5s) o `fetchTickets()` adicional. Esto es innecesario y añade carga de red. El problema es puramente de manejo de estado local.

## Commit message
```
fix(state): use immutable update in handleResolve to trigger re-render

React skipped re-rendering because setTickets received the same array
reference after direct mutation. Replaced with functional updater using
.map() to produce a new array, ensuring React detects the state change.
```
