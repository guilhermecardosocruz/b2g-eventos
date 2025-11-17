import { Event } from "../domain/event";
import type { IUserRepository, IEventRepository } from "../repositories";

export interface CreateEventInput {
  organizerId: string;
  title: string;
  description?: string | null;
  startDate: Date;
  endDate?: Date | null;
  location?: string | null;
  capacity?: number | null;
}

export interface CreateEventOutput {
  event: Event;
}

function slugify(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export class CreateEvent {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly eventRepository: IEventRepository
  ) {}

  async execute(input: CreateEventInput): Promise<CreateEventOutput> {
    const organizer = await this.userRepository.findById(input.organizerId);

    if (!organizer) {
      throw new Error("Organizer not found");
    }

    if (!organizer.isOrganizer()) {
      throw new Error("User is not allowed to create events");
    }

    const slugBase = slugify(input.title);
    let slug = slugBase;
    let counter = 1;

    // Garantir slug único (lógica simples, sem depender de banco específico)
    // Implementações concretas podem otimizar isso com consultas dedicadas.
    while (await this.eventRepository.findBySlug(slug)) {
      counter += 1;
      slug = `${slugBase}-${counter}`;
    }

    const event = Event.create({
      id: crypto.randomUUID(),
      organizerId: organizer.id,
      title: input.title,
      description: input.description,
      slug,
      startDate: input.startDate,
      endDate: input.endDate,
      location: input.location,
      capacity: input.capacity,
      status: "DRAFT"
    });

    await this.eventRepository.save(event);

    return { event };
  }
}
