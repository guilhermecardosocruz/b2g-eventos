import { Money } from "./valueObjects";
import type { UserId } from "./user";
import type { EventId } from "./event";
import type { EventTicketId } from "./eventTicket";

export type TransactionId = string;

export type TransactionStatus =
  | "PENDING"
  | "PAID"
  | "CANCELED"
  | "REFUNDED";

export type PaymentMethod =
  | "PIX"
  | "CREDIT_CARD"
  | "DEBIT_CARD"
  | "CASH"
  | "OTHER";

export interface TransactionProps {
  id: TransactionId;
  userId?: UserId | null;
  eventId: EventId;
  ticketId: EventTicketId;
  amount: Money;
  status: TransactionStatus;
  method: PaymentMethod;
  createdAt: Date;
  updatedAt: Date;
}

export class Transaction {
  private props: TransactionProps;

  private constructor(props: TransactionProps) {
    this.props = props;
  }

  static create(params: {
    id: TransactionId;
    userId?: UserId | null;
    eventId: EventId;
    ticketId: EventTicketId;
    amount: Money;
    status?: TransactionStatus;
    method: PaymentMethod;
    createdAt?: Date;
    updatedAt?: Date;
  }): Transaction {
    const now = new Date();

    return new Transaction({
      id: params.id,
      userId: params.userId ?? null,
      eventId: params.eventId,
      ticketId: params.ticketId,
      amount: params.amount,
      status: params.status ?? "PENDING",
      method: params.method,
      createdAt: params.createdAt ?? now,
      updatedAt: params.updatedAt ?? now
    });
  }

  get id(): TransactionId {
    return this.props.id;
  }

  get userId(): UserId | null | undefined {
    return this.props.userId;
  }

  get eventId(): EventId {
    return this.props.eventId;
  }

  get ticketId(): EventTicketId {
    return this.props.ticketId;
  }

  get amount(): Money {
    return this.props.amount;
  }

  get status(): TransactionStatus {
    return this.props.status;
  }

  get method(): PaymentMethod {
    return this.props.method;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  markAsPaid(): void {
    if (this.props.status === "PAID") return;
    if (this.props.status === "CANCELED") {
      throw new Error("Cannot pay a canceled transaction");
    }
    this.props.status = "PAID";
    this.props.updatedAt = new Date();
  }

  cancel(): void {
    if (this.props.status === "PAID") {
      throw new Error("Cannot cancel a paid transaction");
    }
    if (this.props.status === "CANCELED") return;
    this.props.status = "CANCELED";
    this.props.updatedAt = new Date();
  }

  refund(): void {
    if (this.props.status !== "PAID") {
      throw new Error("Only paid transactions can be refunded");
    }
    this.props.status = "REFUNDED";
    this.props.updatedAt = new Date();
  }
}
