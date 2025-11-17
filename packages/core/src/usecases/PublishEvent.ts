import type { IEventRepository } from "../repositories";

export interface PublishEventInput {
  eventId: string;
  organizerId: string;
}

export class PublishEvent {
  constructor(private readonly eventRepository: IEventRepository) {}

  async execute(input: PublishEventInput): Promise<void> {
    const event = await this.eventRepository.findById(input.eventId);

    if (!event) {
      throw new Error("Event not found");
    }

    if (event.organizerId !== input.organizerId) {
      throw new Error("Only the organizer can publish this event");
    }

    event.publish();
    await this.eventRepository.save(event);
  }
}
