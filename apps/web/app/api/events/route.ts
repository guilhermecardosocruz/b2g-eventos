import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@events/db";
import {
  CreateEvent,
  type Event
} from "@events/core";
import {
  PrismaUserRepository
} from "@/lib/repositories/prisma-user-repository";
import {
  PrismaEventRepository
} from "@/lib/repositories/prisma-event-repository";
import { AuthService } from "@/lib/auth/auth-service";
import {
  createEventSchema
} from "@/lib/validation/schemas";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const organizerId = searchParams.get("organizerId") ?? undefined;
    const status = searchParams.get("status") ?? undefined;
    const q = searchParams.get("q") ?? undefined;

    const where: any = {};

    if (organizerId) {
      where.organizerId = organizerId;
    }

    if (status === "PUBLISHED") {
      where.published = true;
    } else if (status === "DRAFT") {
      where.published = false;
    }

    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } }
      ];
    }

    const events = await prisma.event.findMany({
      where,
      orderBy: { startDate: "asc" }
    });

    return NextResponse.json(
      events.map((e) => ({
        id: e.id,
        organizerId: e.organizerId,
        title: e.title,
        description: e.description,
        slug: e.slug,
        startDate: e.startDate,
        endDate: e.endDate,
        location: e.location,
        capacity: e.capacity,
        published: e.published,
        createdAt: e.createdAt,
        updatedAt: e.updatedAt
      })),
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[EVENTS_GET]", error);
    return NextResponse.json(
      { error: "Não foi possível carregar os eventos." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = new AuthService();
    const currentUser = await auth.getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Não autenticado." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const parsed = createEventSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Dados inválidos.",
          details: parsed.error.flatten()
        },
        { status: 400 }
      );
    }

    const userRepo = new PrismaUserRepository();
    const eventRepo = new PrismaEventRepository();
    const usecase = new CreateEvent(userRepo, eventRepo);

    const result = await usecase.execute({
      organizerId: currentUser.id,
      title: parsed.data.title,
      description: parsed.data.description,
      startDate: parsed.data.startDate,
      endDate: parsed.data.endDate,
      location: parsed.data.location,
      capacity: parsed.data.capacity
    });

    const event: Event = result.event;

    return NextResponse.json(
      {
        id: event.id,
        organizerId: event.organizerId,
        title: event.title,
        description: event.description,
        slug: event.slug,
        startDate: event.startDate,
        endDate: event.endDate,
        location: event.location,
        capacity: event.capacity,
        status: event.status
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[EVENTS_POST]", error);
    const message =
      typeof error?.message === "string"
        ? error.message
        : "Não foi possível criar o evento.";
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}
