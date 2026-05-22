'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Case } from '@/lib/supabase';
import ScoreBadge from './ScoreBadge';

interface CaseCardProps {
  caseData: Case;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default function CaseCard({ caseData }: CaseCardProps) {
  return (
    <Link href={`/case/${caseData.id}`} className="block group">
      <div className="bg-surface border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-600 transition-all duration-200 hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5">
        {/* Image */}
        <div className="relative h-48 bg-surface-2 overflow-hidden">
          {caseData.photo_url ? (
            <Image
              src={caseData.photo_url}
              alt={caseData.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-5xl opacity-20 select-none">
                {caseData.category === 'Sport'
                  ? '⚽'
                  : caseData.category === 'Musik'
                    ? '🎵'
                    : caseData.category === 'Kultur'
                      ? '🎭'
                      : caseData.category === 'Lifestyle'
                        ? '✨'
                        : caseData.category === 'Entertainment'
                          ? '🎬'
                          : '📋'}
              </div>
            </div>
          )}
          {/* Category tag */}
          {caseData.category && (
            <div className="absolute top-3 left-3">
              <span className="bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full border border-white/10">
                {caseData.category}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-white text-base leading-tight mb-1 line-clamp-2 group-hover:text-blue-400 transition-colors">
            {caseData.title}
          </h3>
          {(caseData.brand || caseData.partner) && (
            <p className="text-sm text-zinc-500 mb-3">
              {[caseData.brand, caseData.partner].filter(Boolean).join(' × ')}
            </p>
          )}

          <div className="flex items-center justify-between">
            {caseData.score_label && caseData.score_total !== null ? (
              <ScoreBadge
                label={caseData.score_label}
                total={caseData.score_total}
                size="sm"
              />
            ) : (
              <span className="text-xs text-zinc-600">Keine Bewertung</span>
            )}
            <span className="text-xs text-zinc-600">{formatDate(caseData.created_at)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
