import Link from "next/link";

export const metadata = {
  title: "Page Not Found",
  description: "The page you're looking for doesn't exist or may have moved.",
  robots: { index: false, follow: false },
};

const POPULAR_LINKS = [
  { href: "/intelligence", label: "AI Intelligence Feed" },
  { href: "/models", label: "Compare AI Models" },
  { href: "/companies", label: "Company Intelligence" },
  { href: "/learning", label: "Learning & Certifications" },
];

export default function NotFound() {
  return (
    <div className="min-h-screen bg-ink text-textPrimary relative font-sans flex flex-col">
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-accent/5 via-transparent to-transparent pointer-events-none z-0" />

      <header className="relative z-10 max-w-6xl mx-auto w-full px-6 py-6 flex items-center gap-2.5">
        <span className="w-2.5 h-2.5 rounded-full bg-accent shadow-[0_0_8px_rgba(108,99,255,0.4)]" />
        <Link href="/" className="text-lg font-display font-extrabold text-white tracking-tight">
          Novique
        </Link>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-accent mb-4 bg-accent/10 px-3.5 py-1 rounded-full">
          Error 404
        </span>
        <h1 className="text-6xl md:text-8xl font-display font-black text-white tracking-tight mb-4">
          404
        </h1>
        <p className="text-base md:text-lg text-textSecondary max-w-md mb-10">
          This page doesn&rsquo;t exist or may have moved. The intelligence pipeline is still running though.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mb-14">
          <Link
            href="/"
            className="px-6 py-3 rounded-xl font-bold bg-accent hover:bg-accent/80 text-white transition-all"
          >
            Back to Home
          </Link>
          <Link
            href="/intelligence"
            className="px-6 py-3 rounded-xl font-bold border border-white/[0.08] bg-white/[0.02] text-textSecondary hover:text-white hover:bg-white/[0.05] transition-all"
          >
            Explore Intelligence
          </Link>
        </div>

        <div className="w-full max-w-2xl">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block mb-4">
            Or try one of these
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {POPULAR_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="bg-panel border border-white/[0.05] rounded-2xl px-5 py-4 text-left hover:border-accent/30 hover:-translate-y-0.5 transition-all text-sm font-bold text-zinc-200 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
