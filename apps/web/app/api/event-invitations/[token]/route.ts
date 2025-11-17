import { NextRequest, NextResponse } from "next/server";
import { PrismaInvitationRepository } from "@/lib/repositories/prisma-invitation-repository";
import { AuthService } from "@/lib/auth/auth-service";

export async function GET(
  _req: NextRequest,
  context: { params: { token: string } }
) {
  try {
    const repo = new PrismaInvitationRepository();
    const invitation = await repo.findByToken(context.params.token);

    if (!invitation) {
      return NextResponse.json(
        { error: "Convite não encontrado." },
        { status: 404 }
      );
    }

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
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[INVITE_TOKEN_GET]", error);
    return NextResponse.json(
      { error: "Não foi possível carregar o convite." },
      { status: 500 }
    );
  }
}

export async function POST(
  _req: NextRequest,
  context: { params: { token: string } }
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

    const repo = new PrismaInvitationRepository();
    const invitation = await repo.findByToken(context.params.token);

    if (!invitation) {
      return NextResponse.json(
        { error: "Convite não encontrado." },
        { status: 404 }
      );
    }

    if (invitation.status !== "PENDING") {
      return NextResponse.json(
        { error: "Convite já foi respondido ou expirou." },
        { status: 400 }
      );
    }

    // Aqui aceitamos o convite; em uma implementação real, você
    // também vincularia o usuário ao evento (ex.: EventAttendee).
    invitation.accept();
    await repo.save(invitation);

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
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[INVITE_TOKEN_POST]", error);
    return NextResponse.json(
      { error: "Não foi possível aceitar o convite." },
      { status: 400 }
    );
  }
}
