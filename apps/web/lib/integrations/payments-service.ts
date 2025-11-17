import {
  PurchaseTicket,
  type Transaction
} from "@events/core";
import {
  PrismaUserRepository
} from "@/lib/repositories/prisma-user-repository";
import {
  PrismaEventRepository
} from "@/lib/repositories/prisma-event-repository";
import {
  PrismaEventTicketRepository
} from "@/lib/repositories/prisma-ticket-repository";
import {
  PrismaTransactionRepository
} from "@/lib/repositories/prisma-transaction-repository";
import { ZoopClient } from "./zoop-client";
import { PaypalClient } from "./paypal-client";

export type PaymentProvider = "ZOOP" | "PAYPAL";

export interface StartCheckoutInput {
  userId: string;
  eventId: string;
  ticketId: string;
  quantity: number;
  method: "PIX" | "CREDIT_CARD" | "DEBIT_CARD" | "CASH" | "OTHER";
  provider?: PaymentProvider;
  buyer?: {
    name: string;
    email: string;
  };
}

export interface ProviderPayload {
  provider: PaymentProvider;
  externalId: string;
  checkoutUrl?: string;
  pixQrCode?: string;
}

export interface StartCheckoutResult {
  transaction: Transaction;
  providerPayload?: ProviderPayload;
}

/**
 * Camada de orquestração de pagamento.
 * Usa casos de uso de domínio + integrações (Zoop, PayPal, etc.).
 */
export class PaymentsService {
  private userRepo = new PrismaUserRepository();
  private eventRepo = new PrismaEventRepository();
  private ticketRepo = new PrismaEventTicketRepository();
  private transactionRepo = new PrismaTransactionRepository();

  async startCheckout(input: StartCheckoutInput): Promise<StartCheckoutResult> {
    const provider =
      input.provider ?? (process.env.PAYMENTS_PROVIDER as PaymentProvider) ?? "ZOOP";

    const usecase = new PurchaseTicket(
      this.userRepo,
      this.eventRepo,
      this.ticketRepo,
      this.transactionRepo
    );

    const { transaction } = await usecase.execute({
      userId: input.userId,
      eventId: input.eventId,
      ticketId: input.ticketId,
      quantity: input.quantity,
      method: input.method
    });

    let providerPayload: ProviderPayload | undefined;

    // Integração simplificada: assumimos valor em BRL.
    const amountInCents = Math.round(transaction.amount.amount * 100);

    if (provider === "ZOOP") {
      const zoop = new ZoopClient();
      const charge = await zoop.createCharge({
        amount: amountInCents,
        currency: transaction.amount.currency,
        description: `Ingresso ${transaction.ticketId} - Evento ${transaction.eventId}`,
        customer: {
          name: input.buyer?.name ?? "Cliente",
          email: input.buyer?.email ?? "cliente@example.com"
        },
        metadata: {
          transactionId: transaction.id,
          eventId: transaction.eventId,
          ticketId: transaction.ticketId
        },
        method: input.method === "PIX" ? "PIX" : "CREDIT_CARD"
      });

      providerPayload = {
        provider: "ZOOP",
        externalId: charge.id,
        checkoutUrl: charge.checkoutUrl,
        pixQrCode: charge.pixQrCode
      };
    } else if (provider === "PAYPAL") {
      const paypal = new PaypalClient();
      const order = await paypal.createOrder({
        amount: amountInCents,
        currency: transaction.amount.currency,
        description: `Ingresso ${transaction.ticketId} - Evento ${transaction.eventId}`,
        customer: {
          name: input.buyer?.name ?? "Cliente",
          email: input.buyer?.email ?? "cliente@example.com"
        },
        metadata: {
          transactionId: transaction.id,
          eventId: transaction.eventId,
          ticketId: transaction.ticketId
        }
      });

      providerPayload = {
        provider: "PAYPAL",
        externalId: order.id,
        checkoutUrl: order.approvalUrl
      };
    }

    return {
      transaction,
      providerPayload
    };
  }
}
