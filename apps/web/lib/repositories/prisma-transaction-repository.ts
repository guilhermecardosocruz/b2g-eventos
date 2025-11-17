import { prisma } from "@events/db";
import { Transaction, Money } from "@events/core";
import type { ITransactionRepository } from "@events/core";

function mapToDomainTransaction(row: any): Transaction {
  const amountNumber = Number(row.amount);
  const money = Money.create(amountNumber, "BRL");

  return Transaction.create({
    id: row.id,
    userId: row.userId,
    eventId: row.eventId,
    ticketId: row.ticketId,
    amount: money,
    status: row.status,
    method: row.method,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  });
}

export class PrismaTransactionRepository implements ITransactionRepository {
  async findById(id: string) {
    const row = await prisma.transaction.findUnique({ where: { id } });
    if (!row) return null;
    return mapToDomainTransaction(row);
  }

  async save(transaction: Transaction): Promise<void> {
    await prisma.transaction.upsert({
      where: { id: transaction.id },
      create: {
        id: transaction.id,
        userId: transaction.userId ?? null,
        eventId: transaction.eventId,
        ticketId: transaction.ticketId,
        amount: transaction.amount.amount,
        status: transaction.status,
        method: transaction.method
      },
      update: {
        userId: transaction.userId ?? null,
        eventId: transaction.eventId,
        ticketId: transaction.ticketId,
        amount: transaction.amount.amount,
        status: transaction.status,
        method: transaction.method
      }
    });
  }
}
