import type { EventId } from "./event";

export type InvitationId = string;

export type InvitationStatus =
  | "PENDING"
  | "ACCEPTED"
  | "DECLINED"
  | "EXPIRED";

export interface InvitationProps {
  id: InvitationId;
  eventId: EventId;
  email: string;
  token: string;
  status: InvitationStatus;
  createdAt: Date;
  respondedAt?: Date | null;
}

export class Invitation {
  private props: InvitationProps;

  private constructor(props: InvitationProps) {
    this.props = props;
  }

  static create(params: {
    id: InvitationId;
    eventId: EventId;
    email: string;
    token: string;
    status?: InvitationStatus;
    createdAt?: Date;
    respondedAt?: Date | null;
  }): Invitation {
    const now = new Date();

    return new Invitation({
      id: params.id,
      eventId: params.eventId,
      email: params.email.trim().toLowerCase(),
      token: params.token,
      status: params.status ?? "PENDING",
      createdAt: params.createdAt ?? now,
      respondedAt: params.respondedAt ?? null
    });
  }

  get id(): InvitationId {
    return this.props.id;
  }

  get eventId(): EventId {
    return this.props.eventId;
  }

  get email(): string {
    return this.props.email;
  }

  get token(): string {
    return this.props.token;
  }

  get status(): InvitationStatus {
    return this.props.status;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get respondedAt(): Date | null | undefined {
    return this.props.respondedAt;
  }

  accept(): void {
    this.props.status = "ACCEPTED";
    this.props.respondedAt = new Date();
  }

  decline(): void {
    this.props.status = "DECLINED";
    this.props.respondedAt = new Date();
  }

  expire(): void {
    this.props.status = "EXPIRED";
    this.props.respondedAt = new Date();
  }
}
