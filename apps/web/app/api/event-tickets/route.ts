import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@events/db";
import { Money } from "@events/core";
import { AuthService } from "@/lib/auth/auth-service";
import {
  createTicketSchema,
  updateTicketSchema
} from "@/lib/validation/schemas";

export async function GET(req: NextRequest) {
  try {
    const eventId = req.nextUrl.searchParams.get("eventId") ?? undefined;

    const where: any = {};
    if (eventId) where.eventId = eventId;

    const tickets = await prisma.eventTicket.findMany({
      where,
      orderBy: { createdAt: "asc" }
    });

    return NextResponse.json(
      tickets.map((t) => ({
        id: t.id,
        eventId: t.eventId,
        name: t.name,
        description: t.description,
        price: Number(t.price),
        quantityTotal: t.quantityTotal,
        quantitySold: t.quantitySold,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt
      })),
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[TICKETS_GET]", error);
    return NextResponse.json(
      { error: "Não foi possível carregar os ingressos." },
      { status: 500 }
    );
  }
}

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
    const parsed = createTicketSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Dados inválidos.",
          details: parsed.error.flatten()
        },
        { status: 400 }
      );
    }

    const event = await prisma.event.findUnique({
      where: { id: parsed.data.eventId }
    });

    if (!event) {
      return NextResponse.json(
        { error: "Evento não encontrado." },
        { status: 404 }
      );
    }

    if (event.organizerId !== currentUser.id) {
      return NextResponse.json(
        { error: "Você não pode criar ingressos para este evento." },
        { status: 403 }
      );
    }

    const created = await prisma.eventTicket.create({
      data: {
        eventId: parsed.data.eventId,
        name: parsed.data.name,
        description: parsed.data.description ?? null,
        price: parsed.data.price,
        quantityTotal: parsed.data.quantityTotal,
        quantitySold: 0
      }
    });

    return NextResponse.json(
      {
        id: created.id,
        eventId: created.eventId,
        name: created.name,
        description: created.description,
        price: Number(created.price),
        quantityTotal: created.quantityTotal,
        quantitySold: created.quantitySold
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[TICKETS_POST]", error);
    return NextResponse.json(
      { error: "Não foi possível criar o ingresso." },
      { status: 400 }
    );
  }
}

export async function PATCH(req: NextRequest) {
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
    const parsed = updateTicketSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Dados inválidos.",
          details: parsed.error.flatten()
        },
        { status: 400 }
      );
    }

    const existing = await prisma.eventTicket.findUnique({
      where: { id: parsed.data.id },
      include: { event: true }
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Ingresso não encontrado." },
        { status: 404 }
      );
    }

    if (existing.event.organizerId !== currentUser.id) {
      return NextResponse.json(
        { error: "Você não pode editar este ingresso." },
        { status: 403 }
      );
    }

    const data: any = { ...parsed.data };
    delete data.id;

    const updated = await prisma.eventTicket.update({
      where: { id: existing.id },
      data
    });

    return NextResponse.json(
      {
        id: updated.id,
        eventId: updated.eventId,
        name: updated.name,
        description: updated.description,
        price: Number(updated.price),
        quantityTotal: updated.quantityTotal,
        quantitySold: updated.quantitySold
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[TICKETS_PATCH]", error);
    return NextResponse.json(
      { error: "Não foi possível atualizar o ingresso." },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = new AuthService();
    const currentUser = await auth.getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Não autenticado." },
        { status: 401 }
      );
    }

    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "ID do ingresso é obrigatório." },
        { status: 400 }
      );
    }

    const existing = await prisma.eventTicket.findUnique({
      where: { id },
      include: { event: true }
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Ingresso não encontrado." },
        { status: 404 }
      );
    }

    if (existing.event.organizerId !== currentUser.id) {
      return NextResponse.json(
        { error: "Você não pode remover este ingresso." },
        { status: 403 }
      );
    }

    await prisma.eventTicket.delete({
      where: { id }
    });

    return NextResponse.json(
      { success: true },
      { status: 204 }
    );
  } catch (error: any) {
    console.error("[TICKETS_DELETE]", error);
    return NextResponse.json(
      { error: "Não foi possível remover o ingresso." },
      { status: 400 }
    );
  }
}
