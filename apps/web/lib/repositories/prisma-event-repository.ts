import { prisma } from "@events/db";
import { Event } from "@events/core";
import type { IEventRepository } from "@events/core";

function mapToDomainEvent(row: any): Event {
  return Event.create({
    id: row.id,
    organizerId: row.organizerId,
    title: row.title,
    description: row.description,
    slug: row.slug,
    startDate: row.startDate,
    endDate: row.endDate,
    location: row.location,
    capacity: row.capacity,
    status: row.published ? "PUBLISHED" : "DRAFT",
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  });
}

export class PrismaEventRepository implements IEventRepository {
  async findById(id: string) {
    const row = await prisma.event.findUnique({ where: { id } });
    if (!row) return null;
    return mapToDomainEvent(row);
  }

  async findBySlug(slug: string) {
    const row = await prisma.event.findUnique({ where: { slug } });
    if (!row) return null;
    return mapToDomainEvent(row);
  }

  async save(event: Event): Promise<void> {
    await prisma.event.update({
      where: { id: event.id },
      data: {
        organizerId: event.organizerId,
        title: event.title,
        description: event.description ?? null,
        slug: event.slug,
        startDate: event.startDate,
        endDate: event.endDate ?? null,
        location: event.location ?? null,
        capacity: event.capacity ?? null,
        published: event.isPublished()
      }
    });
  }
}
