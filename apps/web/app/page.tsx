export default function HomePage() {
return (
<main className="flex min-h-screen items-center justify-center">
<div className="mx-4 max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
<h1 className="text-2xl font-semibold tracking-tight">
Eventos PWA
</h1>
<p className="mt-2 text-sm text-slate-300">
Monorepo pronto para evoluir em um app de eventos com Next.js 15,
Tailwind e PWA.
</p>
<p className="mt-4 text-xs text-slate-500">
Comece criando as páginas de listagem de eventos em{" "}
<code className="rounded bg-slate-800 px-1 py-0.5">
app/
</code>{" "}
e conectando com os pacotes em{" "}
<code className="rounded bg-slate-800 px-1 py-0.5">
packages/
</code>
.
</p>
</div>
</main>
);
}
