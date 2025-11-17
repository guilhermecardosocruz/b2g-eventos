import Link from "next/link";

export type UserTicket = {
  id: string;
  eventTitle: string;
  eventSlug: string;
  eventDate?: string | null;
  eventLocation?: string | null;
  ticketName?: string | null;
  amount: number;
  status: string;
  purchaseDate: string;
};

export interface UserTicketsListProps {
  tickets: UserTicket[];
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export default function UserTicketsList({ tickets }: UserTicketsListProps) {
  if (!tickets.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/70 p-4 text-center text-xs text-slate-300 sm:p-6 sm:text-sm">
        Você ainda não comprou ingressos. Assim que realizar uma compra, eles
        aparecerão aqui.
      </div>
    );
  }

  return (
    <div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
      {tickets.map((ticket) => {
        const eventDate = formatDate(ticket.eventDate);
        const purchaseDate = formatDate(ticket.purchaseDate);
        const isActive = ticket.status === "PAID";

        return (
          <article
            key={ticket.id}
            className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-xs text-slate-200 shadow-sm sm:text-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h3 className="line-clamp-2 text-sm font-semibold tracking-tight sm:text-base">
                  {ticket.eventTitle}
                </h3>
                {ticket.ticketName && (
                  <p className="mt-0.5 text-[11px] text-slate-400 sm:text-xs">
                    Ingresso:{" "}
                    <span className="font-medium text-slate-100">
                      {ticket.ticketName}
                    </span>
                  </p>
                )}
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium sm:text-[11px] ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-300"
                    : "bg-slate-700/40 text-slate-200"
                }`}
              >
                {isActive ? "Confirmado" : ticket.status}
              </span>
            </div>

            <div className="mt-2 space-y-1 text-[11px] text-slate-300 sm:text-xs">
              {eventDate && (
                <p>
                  <span className="text-slate-400">Data do evento:</span>{" "}
                  {eventDate}
                </p>
              )}
              {ticket.eventLocation && (
                <p>
                  <span className="text-slate-400">Local:</span>{" "}
                  {ticket.eventLocation}
                </p>
              )}
              <p>
                <span className="text-slate-400">Valor pago:</span>{" "}
                <span className="font-medium text-emerald-300">
                  {ticket.amount.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL"
                  })}
                </span>
              </p>
              {purchaseDate && (
                <p className="text-slate-400">
                  Comprado em {purchaseDate}
                </p>
              )}
            </div>

            <div className="mt-3 flex justify-end">
              <Link
                href={`/eventos/${ticket.eventSlug}`}
                className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-900 hover:bg-white sm:text-xs"
              >
                Ver evento
              </Link>
            </div>
          </article>
        );
      })}
    </div>
  );
}
