/**
 * Cliente de integração com a Zoop.
 * Aqui usamos uma implementação mockada, mas a interface já está pronta
 * para receber chamadas reais via HTTP.
 */

export type ZoopPaymentMethod = "PIX" | "CREDIT_CARD";

export interface ZoopCreateChargeInput {
  amount: number; // em centavos
  currency: string;
  description: string;
  customer: {
    name: string;
    email: string;
  };
  metadata?: Record<string, string>;
  method: ZoopPaymentMethod;
}

export interface ZoopCharge {
  id: string;
  status: "pending" | "paid" | "canceled" | "failed";
  amount: number;
  currency: string;
  checkoutUrl?: string;
  pixQrCode?: string;
}

export class ZoopClient {
  private apiKey: string | undefined;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.ZOOP_API_KEY;
    this.baseUrl = process.env.ZOOP_BASE_URL ?? "https://api.zoop.example.com";
  }

  /**
   * Cria uma cobrança (mock).
   */
  async createCharge(input: ZoopCreateChargeInput): Promise<ZoopCharge> {
    // Em modo mock, apenas gera um ID fake.
    const id = `zoop_${Math.random().toString(36).slice(2, 10)}`;
    const isPix = input.method === "PIX";

    // Aqui você faria um fetch real para a API da Zoop usando this.apiKey.
    return {
      id,
      status: "pending",
      amount: input.amount,
      currency: input.currency,
      checkoutUrl: !isPix
        ? `https://sandbox.zoop.example.com/checkout/${id}`
        : undefined,
      pixQrCode: isPix ? "00020126580014BR.GOV.BCB.PIX..." : undefined
    };
  }

  /**
   * Consulta status de uma cobrança (mock).
   */
  async getChargeStatus(chargeId: string): Promise<ZoopCharge> {
    // Mock simplificado. Em produção, faça GET na Zoop.
    return {
      id: chargeId,
      status: "paid",
      amount: 1000,
      currency: "BRL",
      checkoutUrl: `https://sandbox.zoop.example.com/checkout/${chargeId}`
    };
  }

  /**
   * Trata payload de webhook da Zoop (mock).
   * Retorne um objeto normalizado para o domínio da aplicação.
   */
  async handleWebhookPayload(payload: any): Promise<{
    provider: "zoop";
    chargeId: string;
    status: "pending" | "paid" | "canceled" | "failed";
    amount: number;
    currency: string;
    externalEvent: any;
  }> {
    // Aqui você faria a validação de assinatura/HMAC, etc.
    const chargeId = payload?.data?.id ?? "unknown";
    const status = (payload?.data?.status as
      | "pending"
      | "paid"
      | "canceled"
      | "failed") ?? "pending";
    const amount = Number(payload?.data?.amount ?? 0);
    const currency = payload?.data?.currency ?? "BRL";

    return {
      provider: "zoop",
      chargeId,
      status,
      amount,
      currency,
      externalEvent: payload
    };
  }
}
