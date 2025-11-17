import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/auth/auth-service";
import { purchaseTicketSchema } from "@/lib/validation/schemas";
import {
  PaymentsService
} from "@/lib/integrations/payments-service";

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

    const provider =
      (process.env.PAYMENTS_PROVIDER as "ZOOP" | "PAYPAL" | undefined) ?? "ZOOP";

    const service = new PaymentsService();

    const { transaction, providerPayload } = await service.startCheckout({
      userId: currentUser.id,
      eventId: parsed.data.eventId,
      ticketId: parsed.data.ticketId,
      quantity: parsed.data.quantity,
      method: parsed.data.method,
      provider,
      // Buyer poderia vir do body; aqui, simplificamos.
      buyer: {
        name: currentUser.name,
        email: currentUser.email.value
      }
    });

    return NextResponse.json(
      {
        transaction: {
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
        provider: providerPayload
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
