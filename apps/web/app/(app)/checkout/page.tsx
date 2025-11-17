"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import CheckoutForm, {
  type CheckoutEvent,
  type CheckoutTicket
} from "@/app/components/CheckoutForm";

type EventApiResponse = {
  id: string;
  organizerId: string;
  title: string;
  description?: string | null;
  slug: string;
  startDate?: string | null;
  endDate?: string | null;
  location?: string | null;
  capacity?: number | null;
  published?: boolean;
};

type TicketsApiResponse = Array<{
  id: string;
  eventId: string;
  name: string;
  description?: string | null;
  price: number;
  quantityTotal: number;
  quantitySold: number;
}>;

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const eventIdFromQuery = searchParams.get("eventId");
  const ticketIdFromQuery = searchParams.get("ticketId");

  const [event, setEvent] = useState<CheckoutEvent | null>(null);
  const [ticket, setTicket] = useState<CheckoutTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventIdFromQuery || !ticketIdFromQuery) {
      setLoadError("Informações de evento ou ingresso não foram fornecidas.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setLoadError(null);

      try {
        const [eventRes, ticketRes] = await Promise.all([
          fetch(`/api/events/${eventIdFromQuery}`),
          fetch(`/api/event-tickets?eventId=${eventIdFromQuery}`)
        ]);

        if (!eventRes.ok) {
          throw new Error("Não foi possível carregar o evento.");
        }

        const eventData = (await eventRes.json()) as EventApiResponse;

        if (!ticketRes.ok) {
          throw new Error("Não foi possível carregar os ingressos do evento.");
        }

        const ticketsData = (await ticketRes.json()) as TicketsApiResponse;
        const ticketData = ticketsData.find(
          (t) => t.id === ticketIdFromQuery
        );

        if (!ticketData) {
          throw new Error("Ingresso selecionado não foi encontrado.");
        }

        if (!cancelled) {
          setEvent({
            id: eventData.id,
            title: eventData.title,
            startDate: eventData.startDate ?? null,
            endDate: eventData.endDate ?? null,
            location: eventData.location ?? null
          });

          const remaining =
            ticketData.quantityTotal - ticketData.quantitySold;

          setTicket({
            id: ticketData.id,
            name: ticketData.name,
            description: ticketData.description ?? null,
            price: ticketData.price,
            remaining
          });
        }
      } catch (err: any) {
        console.error("[CHECKOUT_LOAD]", err);
        if (!cancelled) {
          const message =
            typeof err?.message === "string"
              ? err.message
              : "Não foi possível carregar os dados do checkout. Verifique sua conexão e tente novamente.";
          setLoadError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [eventIdFromQuery, ticketIdFromQuery]);

  if (!eventIdFromQuery || !ticketIdFromQuery) {
    return (
      <section className="mx-auto flex max-w-xl flex-1 items-center px-4 py-6 sm:py-10">
        <div className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-center text-sm text-slate-200 sm:p-6 sm:text-base">
          <p className="font-medium">
            Checkout inválido
          </p>
          <p className="mt-2 text-xs text-slate-400 sm:text-sm">
            Não encontramos informações suficientes sobre o evento ou o ingresso.
          </p>
          <button
            type="button"
            onClick={() => router.push("/eventos")}
            className="mt-4 inline-flex items-center justify-center rounded-full bg-blue-500 px-4 py-1.5 text-xs font-medium text-white hover:bg-blue-600 sm:text-sm"
          >
            Voltar para eventos
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto flex max-w-6xl flex-1 items-start justify-center px-4 py-6 sm:py-10">
      <div className="w-full max-w-4xl">
        <header className="mb-4 sm:mb-6">
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
            Checkout
          </p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
            Confirme sua compra
          </h1>
          <p className="mt-1 text-xs text-slate-400 sm:text-sm">
            Revise os dados do evento e preencha suas informações para finalizar
            a compra.
          </p>
        </header>

        {loading && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-sm text-slate-200 sm:p-6">
            Carregando informações do evento e do ingresso...
          </div>
        )}

        {!loading && loadError && (
          <div className="rounded-2xl border border-red-900/60 bg-red-950/40 p-4 text-sm text-red-100 sm:p-6">
            <p className="font-medium">
              Não foi possível carregar o checkout.
            </p>
            <p className="mt-1 text-xs text-red-200 sm:text-sm">
              {loadError}
            </p>
            <button
              type="button"
              onClick={() => router.refresh()}
              className="mt-4 inline-flex items-center justify-center rounded-full bg-slate-100 px-4 py-1.5 text-xs font-medium text-slate-900 hover:bg-white sm:text-sm"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {!loading && !loadError && event && ticket && (
          <CheckoutForm
            event={event}
            ticket={ticket}
            eventId={eventIdFromQuery}
            ticketId={ticketIdFromQuery}
          />
        )}
      </div>
    </section>
  );
}
