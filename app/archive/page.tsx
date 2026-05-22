'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Case } from '@/lib/supabase';
import CaseCard from '@/components/CaseCard';

const CATEGORIES = ['Sport', 'Musik', 'Kultur', 'Retail', 'Lifestyle', 'Entertainment', 'Sonstiges'];
const SCORE_LABELS = ['Best-in-Class', 'Sehr stark', 'Solide', 'Taktisch'];

export default function ArchivePage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [scoreFilter, setScoreFilter] = useState('all');

  const fetchCases = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (categoryFilter !== 'all') params.set('category', categoryFilter);
      if (scoreFilter !== 'all') params.set('score_label', scoreFilter);
      params.set('limit', '100');

      const response = await fetch(`/api/cases?${params}`);
      if (!response.ok) throw new Error('Laden fehlgeschlagen');
      const data = await response.json();
      setCases(data.cases || []);
    } catch (err) {
      setError('Fehler beim Laden der Cases.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, scoreFilter]);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  const handleExcelExport = () => {
    // Placeholder - in production would generate actual Excel
    alert('Excel-Export wird in Kürze verfügbar sein.');
  };

  const handlePptExport = () => {
    // Placeholder - in production would generate actual PPT
    alert('PowerPoint-Export wird in Kürze verfügbar sein.');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm border-b border-zinc-900 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/s20-logo.svg" alt="S20" width={28} height={29} className="flex-shrink-0" />
            <span className="text-lg font-extrabold tracking-tight">
              Sponsor<span className="text-accent">CaseRadar</span>
            </span>
          </Link>
          <Link
            href="/"
            className="bg-accent hover:bg-red-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
          >
            + Case einreichen
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-white mb-1 tracking-tight">
            Best Case Archiv
          </h1>
          <p className="text-zinc-500 text-sm">
            {loading ? 'Lade...' : `${cases.length} Sponsoring Cases · S20 Benchmark bewertet`}
          </p>
        </div>

        {/* Filters + Export */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          {/* Category filter */}
          <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 flex-1">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`flex-shrink-0 text-xs font-medium px-3 py-2 rounded-lg border transition-colors ${
                categoryFilter === 'all'
                  ? 'bg-accent border-accent text-white'
                  : 'bg-surface border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white'
              }`}
            >
              Alle Kategorien
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`flex-shrink-0 text-xs font-medium px-3 py-2 rounded-lg border transition-colors ${
                  categoryFilter === cat
                    ? 'bg-accent border-accent text-white'
                    : 'bg-surface border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Score filter */}
          <select
            value={scoreFilter}
            onChange={(e) => setScoreFilter(e.target.value)}
            className="bg-surface border border-zinc-800 text-sm text-zinc-400 rounded-xl px-3 py-2 focus:outline-none focus:border-zinc-600 appearance-none cursor-pointer min-w-[160px]"
          >
            <option value="all">Alle Ratings</option>
            {SCORE_LABELS.map((label) => (
              <option key={label} value={label}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Export buttons */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={handleExcelExport}
            className="flex items-center gap-2 bg-surface border border-zinc-800 hover:border-zinc-600 text-zinc-400 hover:text-white text-xs font-medium py-2 px-4 rounded-xl transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Excel Export
          </button>
          <button
            onClick={handlePptExport}
            className="flex items-center gap-2 bg-surface border border-zinc-800 hover:border-zinc-600 text-zinc-400 hover:text-white text-xs font-medium py-2 px-4 rounded-xl transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
              />
            </svg>
            PowerPoint Export
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <svg
              className="animate-spin w-8 h-8 text-accent"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <p className="text-zinc-600 text-sm">Lade Cases...</p>
          </div>
        ) : error ? (
          <div className="text-center py-24">
            <p className="text-red-400 text-sm mb-4">{error}</p>
            <button
              onClick={fetchCases}
              className="text-sm text-zinc-500 hover:text-white transition-colors underline"
            >
              Erneut versuchen
            </button>
          </div>
        ) : cases.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4 opacity-20">📋</div>
            <h3 className="text-lg font-semibold text-zinc-400 mb-2">
              {categoryFilter !== 'all' || scoreFilter !== 'all'
                ? 'Keine Cases gefunden'
                : 'Noch keine Cases'}
            </h3>
            <p className="text-sm text-zinc-600 mb-6">
              {categoryFilter !== 'all' || scoreFilter !== 'all'
                ? 'Versuche andere Filter oder erstelle den ersten Case in dieser Kategorie.'
                : 'Sei der Erste und reiche einen Sponsoring-Case ein!'}
            </p>
            <Link
              href="/"
              className="bg-accent hover:bg-red-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors inline-block"
            >
              Case einreichen →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cases.map((caseData) => (
              <CaseCard key={caseData.id} caseData={caseData} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
