'use client';

import { getRatingColor } from '@/lib/scoring';

interface RatingBarProps {
  label: string;
  description?: string;
  score: number;
  maxScore?: number;
}

export default function RatingBar({ label, description, score, maxScore = 5 }: RatingBarProps) {
  const percentage = (score / maxScore) * 100;
  const barColor = getRatingColor(score);

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-1.5">
        <div>
          <span className="text-sm font-medium text-white">{label}</span>
          {description && (
            <span className="ml-2 text-xs text-zinc-500 hidden sm:inline">{description}</span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((dot) => (
            <div
              key={dot}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                dot <= score ? barColor.replace('bg-', 'bg-') : 'bg-zinc-700'
              }`}
            />
          ))}
          <span className="ml-1.5 text-sm font-bold text-white tabular-nums">
            {score}
            <span className="text-zinc-600 font-normal">/5</span>
          </span>
        </div>
      </div>
      <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
