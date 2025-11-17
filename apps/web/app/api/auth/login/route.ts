import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/lib/validation/schemas";
import { AuthService } from "@/lib/auth/auth-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = loginSchema.safeParse(body);

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
    const user = await authService.login({
      email: parsed.data.email,
      password: parsed.data.password
    });

    return NextResponse.json(
      {
        id: user.id,
        name: user.name,
        email: user.email.value,
        type: user.type
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[AUTH_LOGIN]", error);
    const message =
      typeof error?.message === "string"
        ? error.message
        : "Não foi possível realizar login.";
    return NextResponse.json(
      { error: message },
      { status: 401 }
    );
  }
}
