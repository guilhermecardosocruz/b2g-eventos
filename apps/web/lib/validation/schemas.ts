import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string({
      required_error: "Nome é obrigatório."
    })
    .min(2, "Nome deve ter pelo menos 2 caracteres."),
  email: z
    .string({
      required_error: "E-mail é obrigatório."
    })
    .email("Informe um e-mail válido."),
  password: z
    .string({
      required_error: "Senha é obrigatória."
    })
    .min(6, "A senha deve ter pelo menos 6 caracteres."),
  type: z.enum(["ORGANIZER", "ATTENDEE"]).optional()
});

export const loginSchema = z.object({
  email: z
    .string({
      required_error: "E-mail é obrigatório."
    })
    .email("Informe um e-mail válido."),
  password: z
    .string({
      required_error: "Senha é obrigatória."
    })
    .min(1, "Senha é obrigatória.")
});

export const createEventSchema = z.object({
  title: z
    .string({
      required_error: "Título é obrigatório."
    })
    .min(3, "O título deve ter pelo menos 3 caracteres."),
  description: z.string().optional(),
  startDate: z.coerce.date({
    required_error: "Data inicial é obrigatória."
  }),
  endDate: z
    .coerce.date()
    .optional()
    .refine(
      (value, ctx) => {
        const start = ctx.parent?.startDate as Date | undefined;
        if (value && start && value < start) {
          return false;
        }
        return true;
      },
      {
        message: "A data de término não pode ser anterior à data de início."
      }
    ),
  location: z.string().optional(),
  capacity: z
    .number()
    .int("Capacidade deve ser um número inteiro.")
    .positive("Capacidade deve ser maior que zero.")
    .optional()
});

export const updateEventSchema = createEventSchema.partial();

const ticketBase = {
  eventId: z.string({
    required_error: "Evento é obrigatório."
  }),
  name: z
    .string({
      required_error: "Nome do ingresso é obrigatório."
    })
    .min(2, "Nome deve ter pelo menos 2 caracteres."),
  description: z.string().optional(),
  price: z
    .number({
      required_error: "Preço é obrigatório."
    })
    .nonnegative("Preço não pode ser negativo."),
  quantityTotal: z
    .number({
      required_error: "Quantidade total é obrigatória."
    })
    .int("Quantidade deve ser um número inteiro.")
    .positive("Quantidade deve ser maior que zero.")
};

export const createTicketSchema = z.object(ticketBase);

export const updateTicketSchema = z
  .object({
    id: z.string({
      required_error: "ID do ingresso é obrigatório."
    })
  })
  .extend({
    name: ticketBase.name.optional(),
    description: ticketBase.description.optional(),
    price: ticketBase.price.optional(),
    quantityTotal: ticketBase.quantityTotal.optional()
  });

export const purchaseTicketSchema = z.object({
  eventId: z.string({
    required_error: "Evento é obrigatório."
  }),
  ticketId: z.string({
    required_error: "Tipo de ingresso é obrigatório."
  }),
  quantity: z
    .number({
      required_error: "Quantidade é obrigatória."
    })
    .int("Quantidade deve ser um número inteiro.")
    .positive("Quantidade deve ser maior que zero."),
  method: z.enum(["PIX", "CREDIT_CARD", "DEBIT_CARD", "CASH", "OTHER"], {
    required_error: "Método de pagamento é obrigatório."
  })
});

export const inviteSchema = z.object({
  eventId: z.string({
    required_error: "Evento é obrigatório."
  }),
  email: z
    .string({
      required_error: "E-mail é obrigatório."
    })
    .email("Informe um e-mail válido.")
});

export const withdrawSchema = z.object({
  amount: z
    .number({
      required_error: "Valor é obrigatório."
    })
    .positive("Valor deve ser maior que zero."),
  currency: z.string().optional()
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type PurchaseTicketInput = z.infer<typeof purchaseTicketSchema>;
export type InviteInput = z.infer<typeof inviteSchema>;
export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;
export type WithdrawInput = z.infer<typeof withdrawSchema>;
