import EventList from "@/app/components/EventList";
import type { EventCardProps } from "@/app/components/EventCard";

export const dynamic = "force-dynamic";

type EventsApiResponse = Array<{
  id: string;
  organizerId: string;
  title: string;
  description?: string | null;
  slug: string;
  startDate: string;
  endDate?: string | null;
  location?: string | null;
  capacity?: number | null;
  published?: boolean;
}>;

function getBaseUrl() {
  if (typeof window !== "undefined") {
    return "";
  }
  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  if (site) return site;
  return "http://localhost:3000";
}

export default async function EventosPage() {
  const baseUrl = getBaseUrl();

  let events: EventCardProps[] = [];
  try {
    const res = await fetch(`${baseUrl}/api/events`, {
      cache: "no-store"
    });

    if (res.ok) {
      const data = (await res.json()) as EventsApiResponse;
      events = data.map((e) => ({
        id: e.id,
        slug: e.slug,
        title: e.title,
        description: e.description,
        startDate: e.startDate,
        endDate: e.endDate ?? null,
        location: e.location ?? null,
        published: e.published
      }));
    }
  } catch (err) {
    console.error("[EVENTOS_PAGE_FETCH]", err);
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <header className="mb-4 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Eventos disponíveis
          </h1>
          <p className="mt-1 text-xs text-slate-400 sm:text-sm">
            Explore eventos prontos para venda de ingressos, em qualquer
            dispositivo.
          </p>
        </div>
      </header>

      <EventList events={events} />
    </section>
  );
}
