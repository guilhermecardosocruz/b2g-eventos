import type { UserId } from "./user";

export type EventId = string;

export type EventStatus = "DRAFT" | "PUBLISHED";

export interface EventProps {
  id: EventId;
  organizerId: UserId;
  title: string;
  description?: string | null;
  slug: string;
  startDate: Date;
  endDate?: Date | null;
  location?: string | null;
  capacity?: number | null;
  status: EventStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class Event {
  private props: EventProps;

  private constructor(props: EventProps) {
    this.props = props;
  }

  static create(params: {
    id: EventId;
    organizerId: UserId;
    title: string;
    description?: string | null;
    slug: string;
    startDate: Date;
    endDate?: Date | null;
    location?: string | null;
    capacity?: number | null;
    status?: EventStatus;
    createdAt?: Date;
    updatedAt?: Date;
  }): Event {
    const now = new Date();
    const title = params.title.trim();

    if (!title) {
      throw new Error("Event title is required");
    }

    if (!params.slug) {
      throw new Error("Event slug is required");
    }

    return new Event({
      id: params.id,
      organizerId: params.organizerId,
      title,
      description: params.description ?? null,
      slug: params.slug,
      startDate: params.startDate,
      endDate: params.endDate ?? null,
      location: params.location ?? null,
      capacity: params.capacity ?? null,
      status: params.status ?? "DRAFT",
      createdAt: params.createdAt ?? now,
      updatedAt: params.updatedAt ?? now
    });
  }

  get id(): EventId {
    return this.props.id;
  }

  get organizerId(): UserId {
    return this.props.organizerId;
  }

  get title(): string {
    return this.props.title;
  }

  get description(): string | null | undefined {
    return this.props.description;
  }

  get slug(): string {
    return this.props.slug;
  }

  get startDate(): Date {
    return this.props.startDate;
  }

  get endDate(): Date | null | undefined {
    return this.props.endDate;
  }

  get location(): string | null | undefined {
    return this.props.location;
  }

  get capacity(): number | null | undefined {
    return this.props.capacity;
  }

  get status(): EventStatus {
    return this.props.status;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  isPublished(): boolean {
    return this.props.status === "PUBLISHED";
  }

  publish(): void {
    if (this.isPublished()) return;
    this.props.status = "PUBLISHED";
    this.props.updatedAt = new Date();
  }
}
