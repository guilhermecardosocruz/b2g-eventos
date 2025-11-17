export const dynamic = "force-static";

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 text-slate-50">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/90 p-5 text-center shadow-lg">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
          <span className="text-lg">☁️</span>
        </div>
        <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
          Você está offline
        </h1>
        <p className="mt-2 text-xs text-slate-300 sm:text-sm">
          Não foi possível conectar aos nossos servidores agora. Se você já
          visitou páginas de eventos antes, parte do conteúdo pode continuar
          disponível em cache.
        </p>
        <ul className="mt-3 list-disc space-y-1 text-left text-[11px] text-slate-400 sm:text-xs">
          <li>Verifique sua conexão com a internet.</li>
          <li>Tente atualizar a página quando estiver online.</li>
          <li>
            Se estiver em um app instalado, volte mais tarde para concluir suas
            compras.
          </li>
        </ul>
        <button
          type="button"
          onClick={() => {
            if (typeof window !== "undefined") {
              window.location.reload();
            }
          }}
          className="mt-4 inline-flex h-9 items-center justify-center rounded-full bg-blue-500 px-4 text-xs font-medium text-white hover:bg-blue-600 sm:text-sm"
        >
          Tentar novamente
        </button>
      </div>
    </main>
  );
}
