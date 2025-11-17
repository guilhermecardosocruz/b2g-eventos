import { prisma } from "@events/db";
import { Invitation } from "@events/core";
import type { IInvitationRepository } from "@events/core";

function mapToDomainInvitation(row: any): Invitation {
  return Invitation.create({
    id: row.id,
    eventId: row.eventId,
    email: row.email,
    token: row.token,
    status: row.status,
    createdAt: row.createdAt,
    respondedAt: row.respondedAt
  });
}

export class PrismaInvitationRepository implements IInvitationRepository {
  async findByToken(token: string) {
    const row = await prisma.invitation.findUnique({ where: { token } });
    if (!row) return null;
    return mapToDomainInvitation(row);
  }

  async save(invitation: Invitation): Promise<void> {
    await prisma.invitation.upsert({
      where: { id: invitation.id },
      create: {
        id: invitation.id,
        eventId: invitation.eventId,
        email: invitation.email,
        token: invitation.token,
        status: invitation.status,
        respondedAt: invitation.respondedAt ?? null
      },
      update: {
        status: invitation.status,
        respondedAt: invitation.respondedAt ?? null
      }
    });
  }
}
