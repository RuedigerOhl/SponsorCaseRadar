import { Ratings } from './supabase';

export const RATING_DIMENSIONS = [
  {
    key: 'kreative_idee' as keyof Ratings,
    label: 'Kreative Idee',
    description: 'Originell / kulturell relevant?',
    low: 'Standard',
    high: 'Cultural Moment',
  },
  {
    key: 'strategischer_fit' as keyof Ratings,
    label: 'Strategischer Fit',
    description: 'Glaubwürdig zur Marke?',
    low: 'austauschbar',
    high: 'perfekt integriert',
  },
  {
    key: 'visibility' as keyof Ratings,
    label: 'Visibility',
    description: 'Sichtbarkeit / Alleinstellung?',
    low: 'nur bedingt sichtbar',
    high: 'Dominant',
  },
  {
    key: 'multichannel' as keyof Ratings,
    label: 'Multichannel-Vernetzung',
    description: 'Paid/Owned/Earned/On-Ground verbunden?',
    low: 'isoliert',
    high: 'vollintegriert',
  },
  {
    key: 'talk_of_town' as keyof Ratings,
    label: 'Talk of Town',
    description: 'Gesprächswert / Innovation?',
    low: 'kleine Aktion',
    high: 'hoher ToT-Effekt',
  },
  {
    key: 'aktivierungsmechanik' as keyof Ratings,
    label: 'Aktivierungsmechanik',
    description: 'Echte Interaktion / CTA?',
    low: 'nur Aktion',
    high: 'echte Participation',
  },
  {
    key: 'impact' as keyof Ratings,
    label: 'Impact & Messbarkeit',
    description: 'Engagement / Business Impact?',
    low: 'unklar',
    high: 'klar messbarer Effekt',
  },
  {
    key: 'nachhaltigkeit' as keyof Ratings,
    label: 'Nachhaltigkeit',
    description: 'Wirkt über Event hinaus?',
    low: 'einmaliger Moment',
    high: 'Plattform',
  },
];

export function calculateScore(ratings: Ratings): { total: number; label: string } {
  const total = Object.values(ratings).reduce((sum, val) => sum + (val || 0), 0);

  let label: string;
  if (total >= 31) {
    label = 'Best-in-Class';
  } else if (total >= 21) {
    label = 'Sehr stark';
  } else if (total >= 10) {
    label = 'Solide';
  } else {
    label = 'Taktisch';
  }

  return { total, label };
}

export function getScoreEmoji(label: string): string {
  switch (label) {
    case 'Best-in-Class':
      return '⭐';
    case 'Sehr stark':
      return '🔥';
    case 'Solide':
      return '👍';
    case 'Taktisch':
      return '🟡';
    default:
      return '';
  }
}

export function getScoreColors(label: string): {
  bg: string;
  text: string;
  border: string;
} {
  switch (label) {
    case 'Best-in-Class':
      return {
        bg: 'bg-amber-500/20',
        text: 'text-amber-400',
        border: 'border-amber-500/40',
      };
    case 'Sehr stark':
      return {
        bg: 'bg-red-500/20',
        text: 'text-red-400',
        border: 'border-red-500/40',
      };
    case 'Solide':
      return {
        bg: 'bg-blue-500/20',
        text: 'text-blue-400',
        border: 'border-blue-500/40',
      };
    case 'Taktisch':
      return {
        bg: 'bg-zinc-500/20',
        text: 'text-zinc-400',
        border: 'border-zinc-500/40',
      };
    default:
      return {
        bg: 'bg-zinc-500/20',
        text: 'text-zinc-400',
        border: 'border-zinc-500/40',
      };
  }
}

export function getRatingColor(score: number): string {
  if (score >= 4.5) return 'bg-amber-500';
  if (score >= 3.5) return 'bg-green-500';
  if (score >= 2.5) return 'bg-blue-500';
  if (score >= 1.5) return 'bg-orange-500';
  return 'bg-red-500';
}
