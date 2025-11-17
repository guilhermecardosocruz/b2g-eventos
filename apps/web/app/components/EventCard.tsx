import Link from "next/link";

export interface EventCardProps {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  startDate: string;
  endDate?: string | null;
  location?: string | null;
  published?: boolean;
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short"
  });
}

export default function EventCard(props: EventCardProps) {
  const start = formatDate(props.startDate);
  const end = formatDate(props.endDate ?? null);

  return (
    <article className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-sm transition hover:border-blue-500/70 hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <h2 className="line-clamp-2 text-sm font-semibold tracking-tight sm:text-base">
          {props.title}
        </h2>
        {props.published && (
          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
            Publicado
          </span>
        )}
      </div>

      <p className="mt-2 line-clamp-3 text-xs text-slate-300 sm:text-sm">
        {props.description || "Evento sem descrição detalhada ainda."}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-400 sm:text-xs">
        {start && (
          <span className="rounded-full bg-slate-800/80 px-2 py-0.5">
            {end && end !== start ? `${start} - ${end}` : start}
          </span>
        )}
        {props.location && (
          <span className="rounded-full bg-slate-800/80 px-2 py-0.5">
            {props.location}
          </span>
        )}
      </div>

      <div className="mt-4 flex justify-end">
        <Link
          href={`/eventos/${props.slug}`}
          className="inline-flex items-center rounded-full bg-blue-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-600"
        >
          Ver detalhes
        </Link>
      </div>
    </article>
  );
}
