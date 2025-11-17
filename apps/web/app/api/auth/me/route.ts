import { NextResponse } from "next/server";
import { AuthService } from "@/lib/auth/auth-service";

export async function GET() {
  try {
    const authService = new AuthService();
    const user = await authService.getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Não autenticado." },
        { status: 401 }
      );
    }

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
    console.error("[AUTH_ME]", error);
    return NextResponse.json(
      { error: "Erro ao carregar usuário autenticado." },
      { status: 500 }
    );
  }
}
