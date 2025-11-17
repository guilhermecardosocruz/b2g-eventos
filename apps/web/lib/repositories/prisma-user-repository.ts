import { prisma } from "@events/db";
import { User } from "@events/core";
import type { IUserRepository } from "@events/core";

function mapToDomainUser(row: any): User {
  return User.create({
    id: row.id,
    name: row.name,
    email: row.email,
    type: row.type,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  });
}

export class PrismaUserRepository implements IUserRepository {
  async findById(id: string) {
    const row = await prisma.user.findUnique({ where: { id } });
    if (!row) return null;
    return mapToDomainUser(row);
  }

  async findByEmail(email: string) {
    const row = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });
    if (!row) return null;
    return mapToDomainUser(row);
  }

  async save(user: User): Promise<void> {
    // Atualiza apenas campos de domínio; senha é gerenciada pela camada de auth
    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: user.name,
        email: user.email.value,
        type: user.type
      }
    });
  }
}
