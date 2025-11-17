import type { IWalletRepository } from "../repositories";
import { Money } from "../domain/valueObjects";

export interface WithdrawBalanceInput {
  organizerId: string;
  amount: number;
  currency?: string;
}

export class WithdrawBalance {
  constructor(private readonly walletRepository: IWalletRepository) {}

  async execute(input: WithdrawBalanceInput): Promise<void> {
    const requested = Money.create(input.amount, input.currency ?? "BRL");
    const currentBalance = await this.walletRepository.getOrganizerBalance(
      input.organizerId
    );

    if (requested.amount <= 0) {
      throw new Error("Withdrawal amount must be greater than zero");
    }

    if (requested.amount > currentBalance.amount) {
      throw new Error("Insufficient balance");
    }

    await this.walletRepository.withdraw(input.organizerId, requested);
  }
}
