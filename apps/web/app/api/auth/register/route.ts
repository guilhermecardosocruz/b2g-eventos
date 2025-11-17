import { NextRequest, NextResponse } from "next/server";
import { registerSchema } from "@/lib/validation/schemas";
import { AuthService } from "@/lib/auth/auth-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Dados inválidos.",
          details: parsed.error.flatten()
        },
        { status: 400 }
      );
    }

    const authService = new AuthService();
    const user = await authService.register({
      name: parsed.data.name,
      email: parsed.data.email,
      password: parsed.data.password,
      type: parsed.data.type
    });

    return NextResponse.json(
      {
        id: user.id,
        name: user.name,
        email: user.email.value,
        type: user.type
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[AUTH_REGISTER]", error);
    const message =
      typeof error?.message === "string"
        ? error.message
        : "Não foi possível criar sua conta.";
    const statusCode =
      message.includes("já existe um usuário") ? 409 : 400;

    return NextResponse.json(
      { error: message },
      { status: statusCode }
    );
  }
}
