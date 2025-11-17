import { Money } from "../domain/valueObjects";
import { Transaction } from "../domain/transaction";
import type {
  IUserRepository,
  IEventRepository,
  IEventTicketRepository,
  ITransactionRepository
} from "../repositories";

export interface PurchaseTicketInput {
  userId: string;
  eventId: string;
  ticketId: string;
  quantity: number;
  method: "PIX" | "CREDIT_CARD" | "DEBIT_CARD" | "CASH" | "OTHER";
}

export interface PurchaseTicketOutput {
  transaction: Transaction;
}

export class PurchaseTicket {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly eventRepository: IEventRepository,
    private readonly ticketRepository: IEventTicketRepository,
    private readonly transactionRepository: ITransactionRepository
  ) {}

  async execute(input: PurchaseTicketInput): Promise<PurchaseTicketOutput> {
    const [user, event, ticket] = await Promise.all([
      this.userRepository.findById(input.userId),
      this.eventRepository.findById(input.eventId),
      this.ticketRepository.findById(input.ticketId)
    ]);

    if (!user) {
      throw new Error("User not found");
    }

    if (!event) {
      throw new Error("Event not found");
    }

    if (!event.isPublished()) {
      throw new Error("Event is not published");
    }

    if (!ticket || ticket.eventId !== event.id) {
      throw new Error("Ticket not found for this event");
    }

    if (!ticket.hasAvailability(input.quantity)) {
      throw new Error("Not enough tickets available");
    }

    if (input.quantity <= 0) {
      throw new Error("Quantity must be greater than zero");
    }

    const totalAmount = Money.create(ticket.price.amount * input.quantity, ticket.price.currency);

    ticket.reserve(input.quantity);
    await this.ticketRepository.save(ticket);

    const transaction = Transaction.create({
      id: crypto.randomUUID(),
      userId: user.id,
      eventId: event.id,
      ticketId: ticket.id,
      amount: totalAmount,
      method: input.method
    });

    await this.transactionRepository.save(transaction);

    return { transaction };
  }
}
