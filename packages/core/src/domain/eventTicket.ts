import { Money } from "./valueObjects";
import type { EventId } from "./event";

export type EventTicketId = string;

export interface EventTicketProps {
  id: EventTicketId;
  eventId: EventId;
  name: string;
  description?: string | null;
  price: Money;
  quantityTotal: number;
  quantitySold: number;
  createdAt: Date;
  updatedAt: Date;
}

export class EventTicket {
  private props: EventTicketProps;

  private constructor(props: EventTicketProps) {
    this.props = props;
  }

  static create(params: {
    id: EventTicketId;
    eventId: EventId;
    name: string;
    description?: string | null;
    price: Money;
    quantityTotal: number;
    quantitySold?: number;
    createdAt?: Date;
    updatedAt?: Date;
  }): EventTicket {
    const now = new Date();
    const name = params.name.trim();

    if (!name) {
      throw new Error("Ticket name is required");
    }

    if (params.quantityTotal <= 0) {
      throw new Error("Ticket total quantity must be greater than zero");
    }

    const quantitySold = params.quantitySold ?? 0;
    if (quantitySold < 0 || quantitySold > params.quantityTotal) {
      throw new Error("Invalid quantitySold for ticket");
    }

    return new EventTicket({
      id: params.id,
      eventId: params.eventId,
      name,
      description: params.description ?? null,
      price: params.price,
      quantityTotal: params.quantityTotal,
      quantitySold,
      createdAt: params.createdAt ?? now,
      updatedAt: params.updatedAt ?? now
    });
  }

  get id(): EventTicketId {
    return this.props.id;
  }

  get eventId(): EventId {
    return this.props.eventId;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string | null | undefined {
    return this.props.description;
  }

  get price(): Money {
    return this.props.price;
  }

  get quantityTotal(): number {
    return this.props.quantityTotal;
  }

  get quantitySold(): number {
    return this.props.quantitySold;
  }

  get remainingQuantity(): number {
    return this.props.quantityTotal - this.props.quantitySold;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  hasAvailability(quantity: number): boolean {
    return this.remainingQuantity >= quantity;
  }

  reserve(quantity: number): void {
    if (quantity <= 0) {
      throw new Error("Quantity must be greater than zero");
    }
    if (!this.hasAvailability(quantity)) {
      throw new Error("Not enough tickets available");
    }
    this.props.quantitySold += quantity;
    this.props.updatedAt = new Date();
  }
}
