import { NextResponse } from "next/server";
import { prisma } from "@events/db";
import { AuthService } from "@/lib/auth/auth-service";

export async function GET() {
  try {
    const auth = new AuthService();
    const currentUser = await auth.getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Não autenticado." },
        { status: 401 }
      );
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: currentUser.id,
        status: "PAID"
      },
      include: {
        event: true,
        ticket: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    const result = transactions.map((tx) => ({
      id: tx.id,
      status: tx.status,
      method: tx.method,
      amount: Number(tx.amount),
      createdAt: tx.createdAt,
      event: tx.event
        ? {
            id: tx.event.id,
            title: tx.event.title,
            slug: tx.event.slug,
            startDate: tx.event.startDate,
            endDate: tx.event.endDate,
            location: tx.event.location
          }
        : null,
      ticket: tx.ticket
        ? {
            id: tx.ticket.id,
            name: tx.ticket.name
          }
        : null
    }));

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("[USER_TICKETS_GET]", error);
    return NextResponse.json(
      { error: "Não foi possível carregar seus ingressos." },
      { status: 500 }
    );
  }
}
