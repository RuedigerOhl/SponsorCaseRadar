import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { RATING_DIMENSIONS, getScoreEmoji } from '@/lib/scoring';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Case ID fehlt.' }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { data: caseData, error } = await supabase
      .from('cases')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !caseData) {
      return NextResponse.json({ error: 'Case nicht gefunden.' }, { status: 404 });
    }

    const emoji = getScoreEmoji(caseData.score_label || '');
    const ratings = caseData.ratings || {};

    // Generate print-friendly HTML
    const html = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${caseData.title} — SponsorCaseRadar Report</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Inter', sans-serif;
      background: #ffffff;
      color: #1a1a1a;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 2px solid #e5e7eb;
    }

    .brand-logo {
      font-size: 20px;
      font-weight: 700;
      color: #2563eb;
      letter-spacing: -0.5px;
    }

    .date {
      font-size: 13px;
      color: #6b7280;
    }

    .case-title {
      font-size: 28px;
      font-weight: 700;
      color: #111827;
      margin-bottom: 8px;
      line-height: 1.2;
    }

    .case-meta {
      font-size: 16px;
      color: #6b7280;
      margin-bottom: 24px;
    }

    .score-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      border-radius: 12px;
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 32px;
      background: ${caseData.score_label === 'Best-in-Class' ? '#fef3c7' : caseData.score_label === 'Sehr stark' ? '#fee2e2' : caseData.score_label === 'Solide' ? '#dbeafe' : '#f3f4f6'};
      color: ${caseData.score_label === 'Best-in-Class' ? '#92400e' : caseData.score_label === 'Sehr stark' ? '#991b1b' : caseData.score_label === 'Solide' ? '#1e40af' : '#374151'};
    }

    .section-title {
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #6b7280;
      margin-bottom: 12px;
      margin-top: 28px;
    }

    .summary-text {
      font-size: 15px;
      line-height: 1.7;
      color: #374151;
    }

    .ratings-grid {
      display: grid;
      gap: 12px;
      margin-top: 8px;
    }

    .rating-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .rating-label {
      font-size: 13px;
      font-weight: 500;
      color: #374151;
      width: 180px;
      flex-shrink: 0;
    }

    .rating-bar-container {
      flex: 1;
      height: 8px;
      background: #e5e7eb;
      border-radius: 4px;
      overflow: hidden;
    }

    .rating-bar-fill {
      height: 100%;
      border-radius: 4px;
      background: #2563eb;
    }

    .rating-score {
      font-size: 14px;
      font-weight: 700;
      color: #111827;
      width: 32px;
      text-align: right;
      flex-shrink: 0;
    }

    .insight-text {
      font-size: 15px;
      line-height: 1.7;
      color: #374151;
      background: #f9fafb;
      padding: 20px;
      border-radius: 8px;
      border-left: 3px solid #2563eb;
    }

    .sources-list {
      list-style: none;
    }

    .sources-list li {
      font-size: 12px;
      color: #6b7280;
      padding: 4px 0;
      word-break: break-all;
    }

    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .footer-text {
      font-size: 12px;
      color: #9ca3af;
    }

    .photo-container {
      margin: 20px 0;
      border-radius: 12px;
      overflow: hidden;
      max-height: 300px;
    }

    .photo-container img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    @media print {
      body { padding: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand-logo">SponsorCaseRadar</div>
    <div class="date">S20 Benchmark Report · ${new Date().toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
  </div>

  <div class="case-title">${caseData.title}</div>
  <div class="case-meta">${[caseData.brand, caseData.partner].filter(Boolean).join(' × ')}${caseData.category ? ` · ${caseData.category}` : ''}</div>

  <div class="score-badge">
    ${emoji} ${caseData.score_label} · ${caseData.score_total}/40 Punkte
  </div>

  ${caseData.photo_url ? `<div class="photo-container"><img src="${caseData.photo_url}" alt="${caseData.title}" /></div>` : ''}

  <div class="section-title">Management Summary</div>
  <div class="summary-text">${(caseData.summary || '').replace(/\n/g, '<br>')}</div>

  <div class="section-title">S20 Bewertung (8 Dimensionen)</div>
  <div class="ratings-grid">
    ${RATING_DIMENSIONS.map((dim) => {
      const score = ratings[dim.key] || 0;
      const percent = (score / 5) * 100;
      return `
      <div class="rating-row">
        <div class="rating-label">${dim.label}</div>
        <div class="rating-bar-container">
          <div class="rating-bar-fill" style="width: ${percent}%"></div>
        </div>
        <div class="rating-score">${score}/5</div>
      </div>`;
    }).join('')}
  </div>

  <div class="section-title">Strategische Einschätzung</div>
  <div class="insight-text">${(caseData.strategic_insight || '').replace(/\n/g, '<br>')}</div>

  ${
    caseData.sources && caseData.sources.length > 0
      ? `<div class="section-title">Quellen</div>
  <ul class="sources-list">
    ${caseData.sources.map((s: string) => `<li>· ${s}</li>`).join('')}
  </ul>`
      : ''
  }

  <div class="footer">
    <div class="footer-text">SponsorCaseRadar · S20 Benchmark · ${caseData.discovered_by ? `Eingereicht von ${caseData.discovered_by}` : 'Anonyme Einreichung'}</div>
    <div class="footer-text">spotcase.io</div>
  </div>

  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('PDF export error:', error);
    return NextResponse.json({ error: 'Export fehlgeschlagen.' }, { status: 500 });
  }
}
