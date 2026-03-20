# Bug 3: Tickets "Urgente" se quedan cargando infinitamente

## Análisis del Problema

**Archivo:** `src/app/api/tickets/[id]/route.ts` (líneas 5-11 y 31-33)

**Síntoma:** Al intentar resolver un ticket con prioridad "Urgente", la petición nunca termina. El UI se queda en estado de carga.

**Causa raíz:** La función `sendEmailNotification()` retorna una Promise que **nunca se resuelve**. No se llama a `resolve()` ni `reject()` dentro del constructor.

```tsx
async function sendEmailNotification(ticketId: string, companyId: string) {
  return new Promise((resolve) => {
    console.log(`Enviando notificación urgente para el ticket ${ticketId}...`)
    // ⚠️ resolve() NUNCA se llama → Promise pendiente para siempre
  })
}
```

El endpoint PATCH hace `await` de esta función solo para tickets urgentes:

```tsx
if (ticket.priority === 'Urgente' && status === 'Resuelto') {
  await sendEmailNotification(ticket.id, ticket.companyId)  // Se bloquea aquí
}
```

El `await` espera indefinidamente → el response nunca se envía → el cliente muestra loading infinito.

## Plan de Solución

Llamar `resolve()` dentro de la Promise para que se complete:

```tsx
async function sendEmailNotification(ticketId: string, companyId: string) {
  return new Promise<void>((resolve) => {
    console.log(`Enviando notificación urgente para el ticket ${ticketId}...`)
    resolve()
  })
}
```

**Detalles:**
- Se tipea como `Promise<void>` ya que no retorna un valor útil
- En producción esto sería una llamada real a un servicio de email (SendGrid, SES, etc.)
- Se mantiene el `console.log` como placeholder del envío

## Commit message
```
fix(api): resolve hanging promise in sendEmailNotification

The function returned a Promise that never called resolve(), causing
PATCH requests for urgent tickets to hang indefinitely. Added resolve()
call so the notification step completes and the response is sent.
```
