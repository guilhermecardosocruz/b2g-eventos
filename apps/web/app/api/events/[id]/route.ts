import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@events/db";
import { PrismaEventRepository } from "@/lib/repositories/prisma-event-repository";
import { AuthService } from "@/lib/auth/auth-service";
import { updateEventSchema } from "@/lib/validation/schemas";

export async function GET(
  _req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const repo = new PrismaEventRepository();
    const event = await repo.findById(context.params.id);

    if (!event) {
      return NextResponse.json(
        { error: "Evento não encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        id: event.id,
        organizerId: event.organizerId,
        title: event.title,
        description: event.description,
        slug: event.slug,
        startDate: event.startDate,
        endDate: event.endDate,
        location: event.location,
        capacity: event.capacity,
        status: event.status
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[EVENT_GET]", error);
    return NextResponse.json(
      { error: "Não foi possível carregar o evento." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const auth = new AuthService();
    const currentUser = await auth.getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Não autenticado." },
        { status: 401 }
      );
    }

    const existing = await prisma.event.findUnique({
      where: { id: context.params.id }
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Evento não encontrado." },
        { status: 404 }
      );
    }

    if (existing.organizerId !== currentUser.id) {
      return NextResponse.json(
        { error: "Você não pode alterar este evento." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const parsed = updateEventSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Dados inválidos.",
          details: parsed.error.flatten()
        },
        { status: 400 }
      );
    }

    const data: any = {
      ...parsed.data
    };

    const updated = await prisma.event.update({
      where: { id: existing.id },
      data
    });

    return NextResponse.json(
      {
        id: updated.id,
        organizerId: updated.organizerId,
        title: updated.title,
        description: updated.description,
        slug: updated.slug,
        startDate: updated.startDate,
        endDate: updated.endDate,
        location: updated.location,
        capacity: updated.capacity,
        published: updated.published
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[EVENT_PATCH]", error);
    return NextResponse.json(
      { error: "Não foi possível atualizar o evento." },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const auth = new AuthService();
    const currentUser = await auth.getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Não autenticado." },
        { status: 401 }
      );
    }

    const existing = await prisma.event.findUnique({
      where: { id: context.params.id }
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Evento não encontrado." },
        { status: 404 }
      );
    }

    if (existing.organizerId !== currentUser.id) {
      return NextResponse.json(
        { error: "Você não pode remover este evento." },
        { status: 403 }
      );
    }

    await prisma.event.delete({
      where: { id: existing.id }
    });

    return NextResponse.json(
      { success: true },
      { status: 204 }
    );
  } catch (error: any) {
    console.error("[EVENT_DELETE]", error);
    return NextResponse.json(
      { error: "Não foi possível remover o evento." },
      { status: 400 }
    );
  }
}
