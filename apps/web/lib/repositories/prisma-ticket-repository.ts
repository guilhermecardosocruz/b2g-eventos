import { prisma } from "@events/db";
import { EventTicket, Money } from "@events/core";
import type { IEventTicketRepository } from "@events/core";

function mapToDomainTicket(row: any): EventTicket {
  const priceNumber = Number(row.price);
  const money = Money.create(priceNumber, "BRL");

  return EventTicket.create({
    id: row.id,
    eventId: row.eventId,
    name: row.name,
    description: row.description,
    price: money,
    quantityTotal: row.quantityTotal,
    quantitySold: row.quantitySold,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  });
}

export class PrismaEventTicketRepository implements IEventTicketRepository {
  async findById(id: string) {
    const row = await prisma.eventTicket.findUnique({ where: { id } });
    if (!row) return null;
    return mapToDomainTicket(row);
  }

  async findByEventId(eventId: string) {
    const rows = await prisma.eventTicket.findMany({ where: { eventId } });
    return rows.map(mapToDomainTicket);
  }

  async save(ticket: EventTicket): Promise<void> {
    await prisma.eventTicket.update({
      where: { id: ticket.id },
      data: {
        name: ticket.name,
        description: ticket.description ?? null,
        price: ticket.price.amount,
        quantityTotal: ticket.quantityTotal,
        quantitySold: ticket.quantitySold
      }
    });
  }
}
