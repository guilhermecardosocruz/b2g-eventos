/**
 * Cliente de integração com o PayPal.
 * Implementação mock, com interface pronta para chamadas reais.
 */

export interface PaypalCreateOrderInput {
  amount: number; // em centavos
  currency: string;
  description: string;
  customer: {
    name: string;
    email: string;
  };
  metadata?: Record<string, string>;
}

export interface PaypalOrder {
  id: string;
  status: "PENDING" | "COMPLETED" | "CANCELED" | "FAILED";
  amount: number;
  currency: string;
  approvalUrl?: string;
}

export class PaypalClient {
  private clientId: string | undefined;
  private clientSecret: string | undefined;
  private baseUrl: string;

  constructor() {
    this.clientId = process.env.PAYPAL_CLIENT_ID;
    this.clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    this.baseUrl =
      process.env.PAYPAL_BASE_URL ?? "https://api-m.sandbox.paypal.com";
  }

  /**
   * Cria uma ordem de pagamento (mock).
   */
  async createOrder(input: PaypalCreateOrderInput): Promise<PaypalOrder> {
    const id = `paypal_${Math.random().toString(36).slice(2, 10)}`;

    // Em produção, obtenha accessToken via clientId/clientSecret e faça POST em /v2/checkout/orders
    return {
      id,
      status: "PENDING",
      amount: input.amount,
      currency: input.currency,
      approvalUrl: `https://www.sandbox.paypal.com/checkoutnow?token=${id}`
    };
  }

  /**
   * Consulta status de uma ordem (mock).
   */
  async getOrderStatus(orderId: string): Promise<PaypalOrder> {
    // Mock simples; em produção, GET em /v2/checkout/orders/{order_id}
    return {
      id: orderId,
      status: "COMPLETED",
      amount: 1000,
      currency: "BRL",
      approvalUrl: `https://www.sandbox.paypal.com/checkoutnow?token=${orderId}`
    };
  }

  /**
   * Trata webhook do PayPal (mock).
   */
  async handleWebhookPayload(payload: any): Promise<{
    provider: "paypal";
    orderId: string;
    status: "PENDING" | "COMPLETED" | "CANCELED" | "FAILED";
    amount: number;
    currency: string;
    externalEvent: any;
  }> {
    const orderId = payload?.resource?.id ?? "unknown";
    const status = (payload?.resource?.status as
      | "PENDING"
      | "COMPLETED"
      | "CANCELED"
      | "FAILED") ?? "PENDING";
    const amount = Number(
      payload?.resource?.amount?.value
        ? Number(payload.resource.amount.value) * 100
        : 0
    );
    const currency = payload?.resource?.amount?.currency_code ?? "BRL";

    return {
      provider: "paypal",
      orderId,
      status,
      amount,
      currency,
      externalEvent: payload
    };
  }
}
