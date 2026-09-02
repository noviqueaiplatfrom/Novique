export default function Loading() {
  return (
    <div className="min-h-screen bg-ink flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
        <span className="text-xs font-bold uppercase tracking-widest text-textSecondary">
          Loading Novique
        </span>
      </div>
    </div>
  );
}
