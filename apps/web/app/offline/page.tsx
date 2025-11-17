export default function OfflinePage() {
return (
<main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-50">
<div className="mx-4 max-w-md space-y-3 text-center">
<h1 className="text-2xl font-semibold tracking-tight">
Você está offline
</h1>
<p className="text-sm text-slate-300">
Não foi possível carregar todos os dados porque a conexão caiu.
</p>
<p className="text-xs text-slate-500">
Assim que a internet voltar, atualize a página para continuar usando o
app normalmente.
</p>
</div>
</main>
);
}
