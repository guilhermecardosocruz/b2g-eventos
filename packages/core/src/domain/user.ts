import { Email } from "./valueObjects";

export type UserId = string;

export type UserType = "ORGANIZER" | "ATTENDEE";

export interface UserProps {
  id: UserId;
  name: string;
  email: Email;
  type: UserType;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  private props: UserProps;

  private constructor(props: UserProps) {
    this.props = props;
  }

  static create(params: {
    id: UserId;
    name: string;
    email: string;
    type?: UserType;
    createdAt?: Date;
    updatedAt?: Date;
  }): User {
    const now = new Date();
    const email = Email.create(params.email);

    return new User({
      id: params.id,
      name: params.name.trim(),
      email,
      type: params.type ?? "ATTENDEE",
      createdAt: params.createdAt ?? now,
      updatedAt: params.updatedAt ?? now
    });
  }

  get id(): UserId {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get email(): Email {
    return this.props.email;
  }

  get type(): UserType {
    return this.props.type;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  isOrganizer(): boolean {
    return this.props.type === "ORGANIZER";
  }

  isAttendee(): boolean {
    return this.props.type === "ATTENDEE";
  }
}
