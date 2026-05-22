import Link from 'next/link';
import UploadForm from '@/components/UploadForm';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-4 pt-8 pb-2 text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="text-2xl font-extrabold tracking-tight text-white">
            Spot<span className="text-accent">Case</span>
          </span>
          <span className="bg-accent/20 text-accent text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wide border border-accent/30">
            S20
          </span>
        </div>
        <p className="text-sm text-zinc-500 font-medium">
          Sponsoring Best Cases — entdecken, bewerten, archivieren
        </p>
      </header>

      {/* Main content */}
      <main className="flex-1 w-full max-w-lg mx-auto px-4 py-8">
        {/* Hero text */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-3 tracking-tight">
            Was ist der beste
            <br />
            <span className="text-accent">Sponsoring-Case</span>
            <br />
            den du kennst?
          </h1>
          <p className="text-zinc-500 text-sm leading-relaxed">
            Lade ein Foto hoch oder beschreibe den Case — die KI recherchiert alles und
            bewertet ihn nach dem S20 Benchmark in 8 Dimensionen.
          </p>
        </div>

        {/* Form card */}
        <div className="bg-surface rounded-2xl border border-zinc-800 p-5 sm:p-6 shadow-xl shadow-black/30">
          <UploadForm />
        </div>

        {/* Examples */}
        <div className="mt-6 text-center">
          <p className="text-xs text-zinc-600 mb-3">Beispiele die funktionieren:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              'Edeka Nationalmannschaft',
              'Red Bull Stratos',
              'Nike Just Do It',
              'Adidas UEFA Champions League',
            ].map((example) => (
              <span
                key={example}
                className="text-xs bg-zinc-900 border border-zinc-800 text-zinc-500 px-3 py-1.5 rounded-full"
              >
                {example}
              </span>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-4 py-6 text-center border-t border-zinc-900">
        <div className="flex items-center justify-center gap-6">
          <Link
            href="/archive"
            className="text-sm text-zinc-500 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            Alle Cases ansehen
          </Link>
        </div>
        <p className="text-xs text-zinc-700 mt-4">
          SponsorCaseRadar · Powered by Claude AI · S20 Benchmark-Raster
        </p>
      </footer>
    </div>
  );
}
