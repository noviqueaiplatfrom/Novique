import Link from "next/link";

const GITHUB_URL = "https://github.com/noviqueaiplatfrom/Novique";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/[0.05] py-12 mt-16 bg-[#07111F] relative z-10">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row md:justify-between gap-10">
        <div className="max-w-xs">
          <Link href="/" className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_rgba(108,99,255,0.4)]" />
            <span className="text-sm font-display font-extrabold text-white">Novique</span>
          </Link>
          <p className="text-xs text-[#9AA8BD] leading-relaxed">
            Real-time AI intelligence: news, research, models, and companies connected, explained, and ranked.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-xs">
          <div>
            <span className="block font-bold text-white mb-3 uppercase tracking-wider text-[10px]">Product</span>
            <div className="flex flex-col gap-2.5">
              <Link href="/intelligence" className="text-[#9AA8BD] hover:text-white transition-colors">Intelligence</Link>
              <Link href="/models" className="text-[#9AA8BD] hover:text-white transition-colors">Models</Link>
              <Link href="/companies" className="text-[#9AA8BD] hover:text-white transition-colors">Companies</Link>
              <Link href="/weekly-reports" className="text-[#9AA8BD] hover:text-white transition-colors">Weekly Reports</Link>
            </div>
          </div>
          <div>
            <span className="block font-bold text-white mb-3 uppercase tracking-wider text-[10px]">Learn</span>
            <div className="flex flex-col gap-2.5">
              <Link href="/learning" className="text-[#9AA8BD] hover:text-white transition-colors">Learning</Link>
              <Link href="/research" className="text-[#9AA8BD] hover:text-white transition-colors">Research</Link>
              <Link href="/opportunities" className="text-[#9AA8BD] hover:text-white transition-colors">Opportunities</Link>
            </div>
          </div>
          <div>
            <span className="block font-bold text-white mb-3 uppercase tracking-wider text-[10px]">Company</span>
            <div className="flex flex-col gap-2.5">
              <Link href="/privacy" className="text-[#9AA8BD] hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-[#9AA8BD] hover:text-white transition-colors">Terms &amp; Conditions</Link>
              <Link href="/contact" className="text-[#9AA8BD] hover:text-white transition-colors">Contact</Link>
              <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="text-[#9AA8BD] hover:text-white transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-10 pt-6 border-t border-white/[0.04] text-[11px] text-zinc-500">
        &copy; {year} Novique. Scored and aggregated by the Novique AI platform.
      </div>
    </footer>
  );
}
