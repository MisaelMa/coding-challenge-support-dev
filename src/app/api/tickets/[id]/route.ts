import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

async function sendEmailNotification(ticketId: string, companyId: string) {
  return new Promise<void>((resolve) => {
    console.log(`Enviando notificación urgente para el ticket ${ticketId} (${companyId})...`)
    resolve()
  })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await request.json()

    // In production this would come from the JWT token or user session
    const CURRENT_COMPANY_ID = 'TechCorp'

    const ticket = await prisma.ticket.findUnique({
      where: { id },
    })

    // Return 404 (not 403) to avoid revealing that the resource exists
    if (!ticket || ticket.companyId !== CURRENT_COMPANY_ID) {
      return NextResponse.json({ error: 'Ticket no encontrado' }, { status: 404 })
    }

    if (ticket.priority === 'Urgente' && status === 'Resuelto') {
      await sendEmailNotification(ticket.id, ticket.companyId)
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json(updatedTicket)
  } catch (error) {
    console.error('Error updating ticket:', error)
    return NextResponse.json({ error: 'Error updating ticket' }, { status: 500 })
  }
}
