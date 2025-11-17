import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@events/db";

interface PageProps {
  params: { slug: string };
}

export default async function EventoDetalhePage({ params }: PageProps) {
  const event = await prisma.event.findUnique({
    where: { slug: params.slug },
    include: {
      tickets: true
    }
  });

  if (!event) {
    notFound();
  }

  const startDate = event.startDate
    ? new Date(event.startDate).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit"
      })
    : null;

  const endDate = event.endDate
    ? new Date(event.endDate).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit"
      })
    : null;

  return (
    <section className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
      <header className="mb-4 sm:mb-6">
        <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
          Evento
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          {event.title}
        </h1>
        {event.description && (
          <p className="mt-2 text-sm text-slate-300 sm:text-base">
            {event.description}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-300 sm:text-sm">
          {startDate && (
            <span className="rounded-full bg-slate-800/90 px-3 py-1">
              Início: {startDate}
            </span>
          )}
          {endDate && (
            <span className="rounded-full bg-slate-800/90 px-3 py-1">
              Fim: {endDate}
            </span>
          )}
          {event.location && (
            <span className="rounded-full bg-slate-800/90 px-3 py-1">
              Local: {event.location}
            </span>
          )}
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)] sm:items-start">
        <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-200">
          <h2 className="text-sm font-semibold tracking-tight sm:text-base">
            Sobre o evento
          </h2>
          <p className="text-xs text-slate-300 sm:text-sm">
            Esta página é um esqueleto inicial. Aqui você poderá adicionar
            descrição detalhada, fotos, mapa, FAQ e muito mais.
          </p>
        </div>

        <aside className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <h2 className="text-sm font-semibold tracking-tight sm:text-base">
            Ingressos
          </h2>

          {event.tickets.length === 0 ? (
            <p className="text-xs text-slate-400 sm:text-sm">
              Ainda não há tipos de ingresso disponíveis para este evento.
            </p>
          ) : (
            <ul className="space-y-2">
              {event.tickets.map((ticket) => (
                <li
                  key={ticket.id}
                  className="flex items-center justify-between gap-3 rounded-xl bg-slate-950/60 px-3 py-2"
                >
                  <div>
                    <p className="text-xs font-medium text-slate-100 sm:text-sm">
                      {ticket.name}
                    </p>
                    {ticket.description && (
                      <p className="text-[11px] text-slate-400 sm:text-xs">
                        {ticket.description}
                      </p>
                    )}
                    <p className="mt-0.5 text-[11px] text-slate-400 sm:text-xs">
                      {ticket.quantityTotal - ticket.quantitySold} disponíveis
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <p className="text-xs font-semibold text-emerald-300 sm:text-sm">
                      {Number(ticket.price).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL"
                      })}
                    </p>
                    <Link
                      href={`/checkout?eventId=${event.id}&ticketId=${ticket.id}`}
                      className="inline-flex items-center rounded-full bg-blue-500 px-3 py-1 text-[11px] font-medium text-white hover:bg-blue-600 sm:text-xs"
                    >
                      Comprar ingresso
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </section>
  );
}
