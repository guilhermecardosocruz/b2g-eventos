import type { User } from "./domain/user";
import type { Event } from "./domain/event";
import type { EventTicket } from "./domain/eventTicket";
import type { Transaction } from "./domain/transaction";
import type { Invitation } from "./domain/invitation";
import type { Money } from "./domain/valueObjects";

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<void>;
}

export interface IEventRepository {
  findById(id: string): Promise<Event | null>;
  findBySlug(slug: string): Promise<Event | null>;
  save(event: Event): Promise<void>;
}

export interface IEventTicketRepository {
  findById(id: string): Promise<EventTicket | null>;
  findByEventId(eventId: string): Promise<EventTicket[]>;
  save(ticket: EventTicket): Promise<void>;
}

export interface ITransactionRepository {
  findById(id: string): Promise<Transaction | null>;
  save(transaction: Transaction): Promise<void>;
}

export interface IInvitationRepository {
  findByToken(token: string): Promise<Invitation | null>;
  save(invitation: Invitation): Promise<void>;
}

export interface IWalletRepository {
  getOrganizerBalance(organizerId: string): Promise<Money>;
  withdraw(organizerId: string, amount: Money): Promise<void>;
}
