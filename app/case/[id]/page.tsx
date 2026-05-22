export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createServiceClient } from '@/lib/supabase';
import { RATING_DIMENSIONS, getScoreEmoji } from '@/lib/scoring';
import ScoreBadge from '@/components/ScoreBadge';
import RatingBar from '@/components/RatingBar';

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps) {
  const supabase = createServiceClient();
  const { data } = await supabase.from('cases').select('title, brand, partner').eq('id', params.id).single();

  if (!data) return { title: 'Case nicht gefunden — SponsorCaseRadar' };

  return {
    title: `${data.title} — SponsorCaseRadar`,
    description: `S20 Benchmark-Analyse: ${[data.brand, data.partner].filter(Boolean).join(' × ')}`,
  };
}

export default async function CasePage({ params }: PageProps) {
  const supabase = createServiceClient();
  const { data: caseData, error } = await supabase
    .from('cases')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !caseData) {
    notFound();
  }

  const ratings = caseData.ratings || {};
  const scoreEmoji = getScoreEmoji(caseData.score_label || '');

  // Build WhatsApp share text
  const shareText = encodeURIComponent(
    `*${caseData.title}* — SponsorCaseRadar S20 Analyse\n\n` +
      `${scoreEmoji} ${caseData.score_label} · ${caseData.score_total}/40 Punkte\n\n` +
      `${caseData.summary ? caseData.summary.substring(0, 200) + '...' : ''}\n\n` +
      `Vollständige Analyse: ${process.env.NEXT_PUBLIC_APP_URL || 'https://spotcase.io'}/case/${caseData.id}`
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm border-b border-zinc-900 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-lg font-extrabold tracking-tight">
            Sponsor<span className="text-accent">CaseRadar</span>
          </Link>
          <Link
            href="/archive"
            className="text-sm text-zinc-500 hover:text-white transition-colors"
          >
            Alle Cases →
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Hero image */}
        {caseData.photo_url && (
          <div className="relative h-56 sm:h-72 rounded-2xl overflow-hidden">
            <Image
              src={caseData.photo_url}
              alt={caseData.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        )}

        {/* Title & Meta */}
        <div>
          {caseData.category && (
            <span className="text-xs text-zinc-600 font-medium uppercase tracking-widest">
              {caseData.category}
            </span>
          )}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 mb-2 leading-tight tracking-tight">
            {caseData.title}
          </h1>
          {(caseData.brand || caseData.partner) && (
            <p className="text-zinc-500 text-base">
              {[caseData.brand, caseData.partner].filter(Boolean).join(' × ')}
            </p>
          )}
        </div>

        {/* Score Badge — prominent */}
        <div className="bg-surface border border-zinc-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            {caseData.score_label && caseData.score_total !== null && (
              <ScoreBadge
                label={caseData.score_label}
                total={caseData.score_total}
                size="lg"
              />
            )}
            <p className="text-sm text-zinc-500 mt-2">
              S20 Benchmark · 8 Dimensionen bewertet
            </p>
          </div>
          <div className="text-center sm:text-right">
            <div className="text-4xl font-extrabold text-white tabular-nums">
              {caseData.score_total}
            </div>
            <div className="text-xs text-zinc-600 uppercase tracking-widest">von 40 Punkten</div>
          </div>
        </div>

        {/* Management Summary */}
        <div className="bg-surface border border-zinc-800 rounded-2xl p-5">
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4">
            Management Summary
          </h2>
          <div className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
            {caseData.summary}
          </div>
        </div>

        {/* Rating Bars */}
        <div className="bg-surface border border-zinc-800 rounded-2xl p-5">
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-5">
            S20 Bewertung · 8 Dimensionen
          </h2>
          <div className="space-y-6">
            {RATING_DIMENSIONS.map((dim) => (
              <div key={dim.key}>
                <RatingBar
                  label={dim.label}
                  description={dim.description}
                  score={ratings[dim.key] || 0}
                />
                {caseData.rating_reasons?.[dim.key as keyof typeof caseData.rating_reasons] && (
                  <p className="mt-2 text-xs text-zinc-500 leading-relaxed pl-1 border-l border-zinc-800">
                    {caseData.rating_reasons[dim.key as keyof typeof caseData.rating_reasons]}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Strategic Insight */}
        {caseData.strategic_insight && (
          <div className="bg-surface border border-zinc-800 rounded-2xl p-5">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4">
              Strategische Einschätzung
            </h2>
            <div className="flex gap-4">
              <div className="w-1 bg-accent rounded-full flex-shrink-0" />
              <p className="text-sm text-zinc-300 leading-relaxed">{caseData.strategic_insight}</p>
            </div>
          </div>
        )}

        {/* Sources */}
        {caseData.sources && caseData.sources.length > 0 && (
          <div className="bg-surface border border-zinc-800 rounded-2xl p-5">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4">
              Quellen
            </h2>
            <ul className="space-y-2">
              {caseData.sources.map((source: string, i: number) => (
                <li key={i}>
                  <a
                    href={source.startsWith('http') ? source : `https://${source}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-zinc-600 hover:text-accent transition-colors break-all"
                  >
                    {source}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Meta info */}
        <div className="text-xs text-zinc-700 flex items-center justify-between">
          <span>
            {new Date(caseData.created_at).toLocaleDateString('de-DE', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
            {caseData.discovered_by && ` · Eingereicht von ${caseData.discovered_by}`}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pb-8">
          <a
            href={`/api/export/pdf?id=${caseData.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-surface border border-zinc-700 hover:border-zinc-500 text-white text-sm font-medium py-3 px-4 rounded-xl transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            PDF herunterladen
          </a>
          <a
            href={`https://wa.me/?text=${shareText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-green-600/20 border border-green-600/40 hover:bg-green-600/30 text-green-400 text-sm font-medium py-3 px-4 rounded-xl transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Per WhatsApp teilen
          </a>
        </div>
      </main>
    </div>
  );
}
