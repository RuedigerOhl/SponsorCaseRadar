'use client';

import { getScoreColors, getScoreEmoji } from '@/lib/scoring';

interface ScoreBadgeProps {
  label: string;
  total: number;
  size?: 'sm' | 'md' | 'lg';
  showScore?: boolean;
}

export default function ScoreBadge({
  label,
  total,
  size = 'md',
  showScore = true,
}: ScoreBadgeProps) {
  const colors = getScoreColors(label);
  const emoji = getScoreEmoji(label);

  const sizeClasses = {
    sm: 'text-xs px-2 py-1 gap-1',
    md: 'text-sm px-3 py-1.5 gap-1.5',
    lg: 'text-base px-4 py-2 gap-2',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border font-semibold ${colors.bg} ${colors.text} ${colors.border} ${sizeClasses[size]}`}
    >
      <span>{emoji}</span>
      <span>{label}</span>
      {showScore && (
        <>
          <span className="opacity-50">·</span>
          <span>{total}/40</span>
        </>
      )}
    </span>
  );
}
