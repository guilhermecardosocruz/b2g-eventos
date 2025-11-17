import { Invitation } from "../domain/invitation";
import type {
  IEventRepository,
  IInvitationRepository
} from "../repositories";

export interface InviteUserToEventInput {
  eventId: string;
  email: string;
}

export interface InviteUserToEventOutput {
  invitation: Invitation;
}

export class InviteUserToEvent {
  constructor(
    private readonly eventRepository: IEventRepository,
    private readonly invitationRepository: IInvitationRepository
  ) {}

  async execute(
    input: InviteUserToEventInput
  ): Promise<InviteUserToEventOutput> {
    const event = await this.eventRepository.findById(input.eventId);

    if (!event) {
      throw new Error("Event not found");
    }

    const token = crypto.randomUUID();

    const invitation = Invitation.create({
      id: crypto.randomUUID(),
      eventId: event.id,
      email: input.email,
      token
    });

    await this.invitationRepository.save(invitation);

    return { invitation };
  }
}
