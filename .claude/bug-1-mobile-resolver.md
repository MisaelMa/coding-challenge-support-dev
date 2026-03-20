# Bug 1: Botón "Resolver" no funciona en móvil

## Análisis del Problema

**Archivo:** `src/app/page.tsx` (líneas 83 y 176-186)

**Síntoma:** El usuario Austin reporta que desde su celular el botón "Resolver" no hace nada.

**Causa raíz:** Existe un footer fijo en la parte inferior de la pantalla (`fixed bottom-0`) que solo se muestra en móvil (`md:hidden`). Este footer se superpone sobre las tarjetas de tickets, cubriendo el botón "Resolver" del último ticket. El contenedor principal no tiene padding inferior para compensar el espacio del footer.

```tsx
// El contenedor principal NO tiene padding-bottom
<div className="min-h-screen bg-gray-50 relative">

// El footer fijo cubre el contenido en móvil
<div className="md:hidden fixed bottom-0 left-0 right-0 z-50 p-4 ...">
```

El botón está ahí, pero es **intocable** porque el footer está encima con `z-50`.

## Plan de Solución

Agregar `pb-24` al contenedor principal para que el contenido tenga espacio suficiente y no quede debajo del footer fijo.

```tsx
// ANTES
<div className="min-h-screen bg-gray-50 relative">

// DESPUÉS
<div className="min-h-screen bg-gray-50 relative pb-24">
```

**Por qué `pb-24`:** El footer tiene `p-4` más el contenido interno (~80-96px). `pb-24` = 6rem = 96px, suficiente clearance.

## Commit message
```
fix(mobile): add bottom padding to prevent footer from covering ticket actions

The fixed mobile footer (z-50) was overlapping the last ticket card,
making the "Resolver" button untappable. Added pb-24 to the main
container to ensure all content scrolls above the footer.
```
