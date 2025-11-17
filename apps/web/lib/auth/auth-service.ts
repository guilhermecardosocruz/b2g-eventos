import { prisma } from "@events/db";
import { Email, User } from "@events/core";
import type { UserType } from "@events/core";
import { hashPassword, verifyPassword } from "./password";
import { createSession, destroySession, getCurrentSession } from "./session";

export class AuthService {
  async register(params: {
    name: string;
    email: string;
    password: string;
    type?: UserType;
  }): Promise<User> {
    const email = Email.create(params.email);

    const existing = await prisma.user.findUnique({
      where: { email: email.value }
    });

    if (existing) {
      throw new Error("Já existe um usuário cadastrado com este e-mail.");
    }

    const passwordHash = await hashPassword(params.password);

    const created = await prisma.user.create({
      data: {
        name: params.name.trim(),
        email: email.value,
        passwordHash,
        type: params.type ?? "ATTENDEE"
      }
    });

    return User.create({
      id: created.id,
      name: created.name,
      email: created.email,
      type: created.type,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt
    });
  }

  async login(params: { email: string; password: string }): Promise<User> {
    const email = params.email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new Error("Credenciais inválidas.");
    }

    const ok = await verifyPassword(params.password, user.passwordHash);
    if (!ok) {
      throw new Error("Credenciais inválidas.");
    }

    await createSession(user.id);

    return User.create({
      id: user.id,
      name: user.name,
      email: user.email,
      type: user.type,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  }

  async logout(): Promise<void> {
    await destroySession();
  }

  async getCurrentUser(): Promise<User | null> {
    const session = await getCurrentSession();
    if (!session) return null;

    const user = await prisma.user.findUnique({
      where: { id: session.userId }
    });

    if (!user) return null;

    return User.create({
      id: user.id,
      name: user.name,
      email: user.email,
      type: user.type,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  }
}
