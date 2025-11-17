import { prisma } from "@events/db";
import { Money } from "@events/core";
import type { IWalletRepository } from "@events/core";

export class PrismaWalletRepository implements IWalletRepository {
  async getOrganizerBalance(organizerId: string) {
    const result = await prisma.transaction.aggregate({
      _sum: {
        amount: true
      },
      where: {
        status: "PAID",
        event: {
          organizerId
        }
      }
    });

    const total = result._sum.amount ? Number(result._sum.amount) : 0;
    return Money.create(total, "BRL");
  }

  async withdraw(organizerId: string, amount: Money): Promise<void> {
    // Aqui é apenas um esqueleto.
    // Em uma implementação real, você registraria o saque em uma tabela própria
    // e integraria com o provedor de pagamentos/banco.
    console.log(
      `[Wallet] Solicitação de saque para organizer=${organizerId}, valor=${amount.amount} ${amount.currency}`
    );
  }
}
