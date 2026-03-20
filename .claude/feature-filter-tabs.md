# Feature: Filtros funcionales por estado (Mobile + Desktop)

## Contexto

Los tabs del footer móvil ("Pendientes" y "Resueltos") eran puramente decorativos: `<div>` estáticos sin `onClick` ni lógica de filtrado. En desktop no existía ningún mecanismo para filtrar tickets por estado.

## Problema

- **Mobile:** Los tabs del footer no hacían nada al tocarlos
- **Desktop:** No había forma de ver solo tickets abiertos o resueltos

## Solución

**Archivo:** `src/app/page.tsx`

### 1. Estado de filtro

```tsx
const [filter, setFilter] = useState<"Todos" | "Abierto" | "Resuelto">("Todos")

const filteredTickets = tickets.filter((t) =>
  filter === "Todos" ? true : t.status === filter
)
```

### 2. Tabs en desktop (hidden en mobile)

Se agregaron botones de filtro visibles solo en pantallas `md:` y superiores, posicionados arriba de la lista de tickets.

### 3. Footer móvil funcional

Se reemplazaron los `<div>` estáticos por `<button>` con `onClick` que cambian el filtro:
- **Pendientes** → filtra por `"Abierto"`
- **Todos** → muestra todo (botón nuevo agregado)
- **Resueltos** → filtra por `"Resuelto"`

Los colores del tab activo cambian dinámicamente para indicar la selección actual.

### 4. Mensaje vacío contextual

Cuando no hay tickets para el filtro seleccionado, se muestra un mensaje específico:
- Filtro "Todos": `"No hay tickets. ¡Buen trabajo!"`
- Otro filtro: `No hay tickets con estado "Abierto".`

## Commit message
```
feat(ui): add working filter tabs for mobile footer and desktop
```
