import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@events/db";
import {
  InviteUserToEvent
} from "@events/core";
import {
  PrismaEventRepository
} from "@/lib/repositories/prisma-event-repository";
import {
  PrismaInvitationRepository
} from "@/lib/repositories/prisma-invitation-repository";
import { AuthService } from "@/lib/auth/auth-service";
import { inviteSchema } from "@/lib/validation/schemas";

export async function GET(req: NextRequest) {
  try {
    const eventId = req.nextUrl.searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json(
        { error: "Evento é obrigatório." },
        { status: 400 }
      );
    }

    const invitations = await prisma.invitation.findMany({
      where: { eventId },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(
      invitations.map((inv) => ({
        id: inv.id,
        eventId: inv.eventId,
        email: inv.email,
        token: inv.token,
        status: inv.status,
        createdAt: inv.createdAt,
        respondedAt: inv.respondedAt
      })),
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[INVITES_GET]", error);
    return NextResponse.json(
      { error: "Não foi possível carregar os convites." },
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
    const parsed = inviteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Dados inválidos.",
          details: parsed.error.flatten()
        },
        { status: 400 }
      );
    }

    const eventRepo = new PrismaEventRepository();
    const invitationRepo = new PrismaInvitationRepository();
    const usecase = new InviteUserToEvent(eventRepo, invitationRepo);

    const event = await eventRepo.findById(parsed.data.eventId);
    if (!event) {
      return NextResponse.json(
        { error: "Evento não encontrado." },
        { status: 404 }
      );
    }

    if (event.organizerId !== currentUser.id) {
      return NextResponse.json(
        { error: "Você não pode convidar para este evento." },
        { status: 403 }
      );
    }

    const { invitation } = await usecase.execute({
      eventId: parsed.data.eventId,
      email: parsed.data.email
    });

    return NextResponse.json(
      {
        id: invitation.id,
        eventId: invitation.eventId,
        email: invitation.email,
        token: invitation.token,
        status: invitation.status,
        createdAt: invitation.createdAt,
        respondedAt: invitation.respondedAt
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[INVITES_POST]", error);
    return NextResponse.json(
      { error: "Não foi possível criar o convite." },
      { status: 400 }
    );
  }
}
