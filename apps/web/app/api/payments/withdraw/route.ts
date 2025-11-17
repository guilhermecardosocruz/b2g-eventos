import { NextRequest, NextResponse } from "next/server";
import {
  WithdrawBalance
} from "@events/core";
import { AuthService } from "@/lib/auth/auth-service";
import { withdrawSchema } from "@/lib/validation/schemas";
import {
  PrismaWalletRepository
} from "@/lib/repositories/prisma-wallet-repository";

export async function POST(req: NextRequest) {
  try {
    const auth = new AuthService();
    const currentUser = await auth.getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Não autenticado." },
        { status: 401 }
      );
    }

    if (currentUser.type !== "ORGANIZER") {
      return NextResponse.json(
        { error: "Apenas organizadores podem solicitar saque." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const parsed = withdrawSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Dados inválidos.",
          details: parsed.error.flatten()
        },
        { status: 400 }
      );
    }

    const walletRepo = new PrismaWalletRepository();
    const usecase = new WithdrawBalance(walletRepo);

    await usecase.execute({
      organizerId: currentUser.id,
      amount: parsed.data.amount,
      currency: parsed.data.currency
    });

    return NextResponse.json(
      { success: true },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[PAYMENTS_WITHDRAW_POST]", error);
    const message =
      typeof error?.message === "string"
        ? error.message
        : "Não foi possível iniciar o saque.";
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}
