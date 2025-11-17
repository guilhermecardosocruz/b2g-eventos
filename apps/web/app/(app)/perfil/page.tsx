import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import UserTicketsList, {
  type UserTicket
} from "@/app/components/UserTicketsList";

type MeResponse =
  | {
      id: string;
      name: string;
      email: string;
      type: "ORGANIZER" | "ATTENDEE";
    }
  | { error: string };

type TicketsApiResponse = Array<{
  id: string;
  status: string;
  method: string;
  amount: number;
  createdAt: string;
  event: {
    id: string;
    title: string;
    slug: string;
    startDate?: string | null;
    endDate?: string | null;
    location?: string | null;
  } | null;
  ticket: {
    id: string;
    name: string;
  } | null;
}>;

function getBaseUrl() {
  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  if (site) return site;
  return "http://localhost:3000";
}

async function fetchWithSession(path: string) {
  const baseUrl = getBaseUrl();
  const cookieHeader = cookies().toString();

  const res = await fetch(`${baseUrl}${path}`, {
    cache: "no-store",
    headers: {
      cookie: cookieHeader
    }
  });

  return res;
}

export default async function PerfilPage() {
  const meRes = await fetchWithSession("/api/auth/me");

  if (meRes.status === 401) {
    redirect("/login");
  }

  if (!meRes.ok) {
    throw new Error("Não foi possível carregar os dados do usuário.");
  }

  const meJson = (await meRes.json()) as MeResponse;

  if ("error" in meJson) {
    redirect("/login");
  }

  const user = meJson;

  const ticketsRes = await fetchWithSession("/api/users/me/tickets");
  let tickets: UserTicket[] = [];

  if (ticketsRes.ok) {
    const data = (await ticketsRes.json()) as TicketsApiResponse;
    tickets = data
      .filter((t) => t.event && t.ticket)
      .map((t) => ({
        id: t.id,
        eventTitle: t.event!.title,
        eventSlug: t.event!.slug,
        eventDate: t.event!.startDate ?? null,
        eventLocation: t.event!.location ?? null,
        ticketName: t.ticket!.name,
        amount: t.amount,
        status: t.status,
        purchaseDate: t.createdAt
      }));
  }

  const isOrganizer = user.type === "ORGANIZER";

  return (
    <section className="mx-auto flex max-w-6xl flex-1 flex-col px-4 py-6 sm:py-8">
      <header className="mx-auto w-full max-w-4xl border-b border-slate-800 pb-4 sm:pb-6">
        <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
          Minha conta
        </p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
          Perfil
        </h1>

        <div className="mt-3 flex flex-col gap-2 text-sm text-slate-200 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-base font-semibold text-slate-50 sm:text-lg">
              {user.name}
            </p>
            <p className="text-xs text-slate-300 sm:text-sm">
              {user.email}
            </p>
          </div>
          <div className="mt-2 flex flex-wrap gap-2 sm:mt-0 sm:justify-end">
            <span className="inline-flex items-center rounded-full bg-slate-900 px-3 py-1 text-[11px] font-medium text-slate-200 ring-1 ring-slate-700 sm:text-xs">
              Tipo de conta:{" "}
              <span className="ml-1 font-semibold text-blue-300">
                {isOrganizer ? "Organizador" : "Participante"}
              </span>
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto mt-5 w-full max-w-4xl space-y-3 sm:mt-6 sm:space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-tight text-slate-100 sm:text-base">
            Meus ingressos
          </h2>
          <p className="text-[11px] text-slate-400 sm:text-xs">
            Visualize os ingressos já comprados nesta conta.
          </p>
        </div>

        <UserTicketsList tickets={tickets} />
      </div>
    </section>
  );
}
