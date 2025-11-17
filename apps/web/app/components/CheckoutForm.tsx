"use client";

import { useEffect, useState } from "react";

export type CheckoutBuyer = {
  name: string;
  email: string;
};

export type CheckoutEvent = {
  id: string;
  title: string;
  startDate?: string | null;
  endDate?: string | null;
  location?: string | null;
};

export type CheckoutTicket = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  remaining: number;
};

export interface CheckoutFormProps {
  event: CheckoutEvent;
  ticket: CheckoutTicket;
  eventId: string;
  ticketId: string;
}

type CheckoutState = {
  buyer: CheckoutBuyer;
  quantity: number;
};

const PENDING_STORAGE_KEY = "events_pwa_pending_checkout";

export default function CheckoutForm(props: CheckoutFormProps) {
  const [buyer, setBuyer] = useState<CheckoutBuyer>({
    name: "",
    email: ""
  });
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Recupera estado pendente do localStorage (se houver)
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem(PENDING_STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw) as {
        eventId: string;
        ticketId: string;
        state: CheckoutState;
      };

      if (
        parsed.eventId === props.eventId &&
        parsed.ticketId === props.ticketId
      ) {
        setBuyer(parsed.state.buyer);
        setQuantity(parsed.state.quantity);
      }
    } catch {
      // ignora erros de parse
    }
  }, [props.eventId, props.ticketId]);

  function formatDateRange(start?: string | null, end?: string | null) {
    if (!start && !end) return null;
    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    };

    const startDate = start ? new Date(start) : null;
    const endDate = end ? new Date(end) : null;

    if (startDate && endDate) {
      return `${startDate.toLocaleString("pt-BR", options)} - ${endDate.toLocaleString(
        "pt-BR",
        options
      )}`;
    }

    if (startDate) {
      return startDate.toLocaleString("pt-BR", options);
    }

    if (endDate) {
      return endDate.toLocaleString("pt-BR", options);
    }

    return null;
  }

  const dateRangeLabel = formatDateRange(
    props.event.startDate ?? null,
    props.event.endDate ?? null
  );

  const totalPrice = props.ticket.price * quantity;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!buyer.name.trim() || !buyer.email.trim()) {
      setErrorMessage("Preencha seu nome e e-mail para continuar.");
      return;
    }

    if (quantity <= 0) {
      setErrorMessage("Selecione uma quantidade válida de ingressos.");
      return;
    }

    setLoading(true);

    // Salva tentativa no localStorage, caso falhe por rede
    if (typeof window !== "undefined") {
      const payload: { eventId: string; ticketId: string; state: CheckoutState } =
        {
          eventId: props.eventId,
          ticketId: props.ticketId,
          state: { buyer, quantity }
        };
      window.localStorage.setItem(PENDING_STORAGE_KEY, JSON.stringify(payload));
    }

    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          eventId: props.eventId,
          ticketId: props.ticketId,
          quantity,
          method: "PIX"
        })
      });

      if (!res.ok) {
        const data =
          (await res.json().catch(() => null)) ?? { error: "Erro desconhecido." };
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "Não foi possível confirmar a compra."
        );
      }

      const data = await res.json();

      setSuccessMessage(
        "Compra realizada com sucesso! Você receberá os detalhes no seu e-mail."
      );
      setErrorMessage(null);

      // Se deu certo, limpa o estado pendente
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(PENDING_STORAGE_KEY);
      }

      console.debug("Checkout success:", data);
    } catch (err: any) {
      console.error("Checkout error:", err);
      const msg =
        typeof err?.message === "string"
          ? err.message
          : "Não foi possível confirmar a compra. Verifique sua conexão e tente novamente.";
      setErrorMessage(msg);
      setSuccessMessage(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-6">
      <div className="space-y-2 border-b border-slate-800 pb-3">
        <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
          Resumo da compra
        </p>
        <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
          {props.event.title}
        </h1>

        <div className="space-y-1 text-xs text-slate-300 sm:text-sm">
          {dateRangeLabel && (
            <p className="flex flex-wrap gap-1">
              <span className="text-slate-400">Data:</span> {dateRangeLabel}
            </p>
          )}
          {props.event.location && (
            <p className="flex flex-wrap gap-1">
              <span className="text-slate-400">Local:</span>{" "}
              {props.event.location}
            </p>
          )}
          <p className="flex flex-wrap gap-1">
            <span className="text-slate-400">Ingresso:</span>{" "}
            <span className="font-medium text-slate-100">
              {props.ticket.name}
            </span>
          </p>
          <p className="text-[11px] text-slate-400 sm:text-xs">
            {props.ticket.remaining} ingressos disponíveis.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label
            htmlFor="name"
            className="text-xs font-medium text-slate-200 sm:text-sm"
          >
            Nome completo
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            value={buyer.name}
            onChange={(e) =>
              setBuyer((prev) => ({ ...prev, name: e.target.value }))
            }
            className="h-9 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm text-slate-50 outline-none ring-0 ring-offset-0 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="Seu nome"
          />
        </div>

        <div className="space-y-1">
          <label
            htmlFor="email"
            className="text-xs font-medium text-slate-200 sm:text-sm"
          >
            E-mail
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={buyer.email}
            onChange={(e) =>
              setBuyer((prev) => ({ ...prev, email: e.target.value }))
            }
            className="h-9 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm text-slate-50 outline-none ring-0 ring-offset-0 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="voce@exemplo.com"
          />
          <p className="text-[11px] text-slate-500">
            Usaremos este e-mail para enviar o comprovante e os ingressos.
          </p>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <label
              htmlFor="quantity"
              className="text-xs font-medium text-slate-200 sm:text-sm"
            >
              Quantidade
            </label>
            <div className="inline-flex items-center rounded-full border border-slate-700 bg-slate-950">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="h-8 w-8 text-sm text-slate-300 hover:text-white"
                disabled={loading || quantity <= 1}
              >
                −
              </button>
              <input
                id="quantity"
                type="number"
                min={1}
                max={props.ticket.remaining}
                value={quantity}
                onChange={(e) =>
                  setQuantity(
                    Math.min(
                      props.ticket.remaining,
                      Math.max(1, Number(e.target.value) || 1)
                    )
                  )
                }
                className="h-8 w-12 border-x border-slate-800 bg-transparent text-center text-sm text-slate-50 outline-none"
              />
              <button
                type="button"
                onClick={() =>
                  setQuantity((q) =>
                    Math.min(props.ticket.remaining, q + 1)
                  )
                }
                className="h-8 w-8 text-sm text-slate-300 hover:text-white"
                disabled={loading || quantity >= props.ticket.remaining}
              >
                +
              </button>
            </div>
          </div>

          <div className="text-right text-xs sm:text-sm">
            <p className="text-slate-400">Total</p>
            <p className="text-lg font-semibold text-emerald-300 sm:text-xl">
              {totalPrice.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL"
              })}
            </p>
            <p className="text-[11px] text-slate-500">
              Pagamento via PIX (simulação).
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="rounded-xl border border-red-900/60 bg-red-950/40 px-3 py-2 text-[11px] text-red-200 sm:text-xs">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="rounded-xl border border-emerald-900/60 bg-emerald-950/40 px-3 py-2 text-[11px] text-emerald-200 sm:text-xs">
            {successMessage}
          </div>
        )}

        {!successMessage && (
          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-10 w-full items-center justify-center rounded-full bg-blue-500 text-sm font-medium text-white shadow-md shadow-blue-500/20 hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-slate-700"
          >
            {loading ? "Processando..." : "Confirmar compra"}
          </button>
        )}

        <p className="text-center text-[11px] text-slate-500 sm:text-xs">
          Se sua conexão cair durante o processo, tentaremos guardar seus dados
          localmente para você tentar de novo depois.
        </p>
      </form>
    </div>
  );
}
