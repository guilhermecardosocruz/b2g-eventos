import { NextRequest, NextResponse } from "next/server";
import {
  PurchaseTicket
} from "@events/core";
import {
  PrismaUserRepository
} from "@/lib/repositories/prisma-user-repository";
import {
  PrismaEventRepository
} from "@/lib/repositories/prisma-event-repository";
import {
  PrismaEventTicketRepository
} from "@/lib/repositories/prisma-ticket-repository";
import {
  PrismaTransactionRepository
} from "@/lib/repositories/prisma-transaction-repository";
import { AuthService } from "@/lib/auth/auth-service";
import { purchaseTicketSchema } from "@/lib/validation/schemas";

export async function POST(req: NextRequest) {
  try {
    const auth = new AuthService();
    const currentUser = await auth.getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Não autenticado." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const parsed = purchaseTicketSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Dados inválidos.",
          details: parsed.error.flatten()
        },
        { status: 400 }
      );
    }

    const userRepo = new PrismaUserRepository();
    const eventRepo = new PrismaEventRepository();
    const ticketRepo = new PrismaEventTicketRepository();
    const transactionRepo = new PrismaTransactionRepository();

    const usecase = new PurchaseTicket(
      userRepo,
      eventRepo,
      ticketRepo,
      transactionRepo
    );

    const { transaction } = await usecase.execute({
      userId: currentUser.id,
      eventId: parsed.data.eventId,
      ticketId: parsed.data.ticketId,
      quantity: parsed.data.quantity,
      method: parsed.data.method
    });

    return NextResponse.json(
      {
        id: transaction.id,
        userId: transaction.userId,
        eventId: transaction.eventId,
        ticketId: transaction.ticketId,
        amount: transaction.amount.amount,
        currency: transaction.amount.currency,
        status: transaction.status,
        method: transaction.method,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[PAYMENTS_CHECKOUT_POST]", error);
    const message =
      typeof error?.message === "string"
        ? error.message
        : "Não foi possível iniciar a compra.";
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}
