import Anthropic from '@anthropic-ai/sdk';

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface ClaudeAnalysisResult {
  title: string;
  brand: string;
  partner: string;
  summary: string;
  ratings: {
    kreative_idee: number;
    strategischer_fit: number;
    visibility: number;
    multichannel: number;
    talk_of_town: number;
    aktivierungsmechanik: number;
    impact: number;
    nachhaltigkeit: number;
  };
  rating_reasons: {
    kreative_idee: string;
    strategischer_fit: string;
    visibility: string;
    multichannel: string;
    talk_of_town: string;
    aktivierungsmechanik: string;
    impact: string;
    nachhaltigkeit: string;
  };
  strategic_insight: string;
  sources: string[];
}

// Tool schema — Claude MUST fill this in, guarantees valid structure
const SAVE_ANALYSIS_TOOL: Anthropic.Tool = {
  name: 'save_case_analysis',
  description: 'Speichert die vollständige S20 Benchmark-Analyse eines Sponsoring-Cases.',
  input_schema: {
    type: 'object' as const,
    properties: {
      title: { type: 'string', description: 'Kurztitel: Marke × Partner — Kampagne' },
      brand: { type: 'string', description: 'Name der Sponsoring-Marke' },
      partner: { type: 'string', description: 'Name des Rechtehalters (Verein, Verband, Event)' },
      summary: {
        type: 'string',
        description: 'Management Summary auf Deutsch, mind. 4 Absätze: (1) Das Sponsoring — wer/wen/seit wann/Kategorie, (2) Die Aktivierung — konkrete Maßnahmen TV/Social/Events/POS, (3) Reichweite & Wirkung — Mediadaten/KPIs/Awards, (4) Einordnung — Stärken und Schwächen',
      },
      rating_kreative_idee: { type: 'integer', minimum: 1, maximum: 5, description: 'Wie originell ist die Grundidee? 1=Standard, 5=Cultural Moment' },
      rating_strategischer_fit: { type: 'integer', minimum: 1, maximum: 5, description: 'Wie glaubwürdig passt die Marke zum Rechtehalter? 1=austauschbar, 5=perfekt' },
      rating_visibility: { type: 'integer', minimum: 1, maximum: 5, description: 'Wie dominant ist die Markenpräsenz? 1=kaum sichtbar, 5=Dominant' },
      rating_multichannel: { type: 'integer', minimum: 1, maximum: 5, description: 'Wie gut verzahnt sind Paid/Owned/Earned/On-Ground? 1=isoliert, 5=vollintegriert' },
      rating_talk_of_town: { type: 'integer', minimum: 1, maximum: 5, description: 'Wie viel organischen Gesprächswert erzeugt es? 1=keine Resonanz, 5=viraler Effekt' },
      rating_aktivierungsmechanik: { type: 'integer', minimum: 1, maximum: 5, description: 'Wie stark werden Menschen zu Teilnehmern? 1=nur Zuschauer, 5=echte Participation' },
      rating_impact: { type: 'integer', minimum: 1, maximum: 5, description: 'Wie klar messbar sind Business-Effekte? 1=unklar, 5=klar belegbare KPIs' },
      rating_nachhaltigkeit: { type: 'integer', minimum: 1, maximum: 5, description: 'Langfristige Plattform oder einmaliger Moment? 1=One-Hit-Wonder, 5=Plattform' },
      reason_kreative_idee: { type: 'string', description: '2-3 konkrete Sätze warum genau diese Note, mit Beispielen aus dem Case' },
      reason_strategischer_fit: { type: 'string', description: '2-3 konkrete Sätze — was spricht für/gegen den Markenfit?' },
      reason_visibility: { type: 'string', description: '2-3 konkrete Sätze — wie dominant und wo sichtbar?' },
      reason_multichannel: { type: 'string', description: '2-3 konkrete Sätze — welche Kanäle, wie gut verzahnt, was fehlt?' },
      reason_talk_of_town: { type: 'string', description: '2-3 konkrete Sätze — was hat Gesprächswert erzeugt oder gefehlt?' },
      reason_aktivierungsmechanik: { type: 'string', description: '2-3 konkrete Sätze — welche Mechanik, wie stark die Participation?' },
      reason_impact: { type: 'string', description: '2-3 konkrete Sätze — welche messbaren Ergebnisse oder warum unklar?' },
      reason_nachhaltigkeit: { type: 'string', description: '2-3 konkrete Sätze — einmalig oder ausbaubare Plattform?' },
      strategic_insight: { type: 'string', description: '2-3 Absätze: Was lernen andere Sponsoren? Welche Mechaniken sind übertragbar?' },
      sources: { type: 'array', items: { type: 'string' }, description: 'URLs der genutzten Quellen' },
    },
    required: [
      'title', 'brand', 'partner', 'summary',
      'rating_kreative_idee', 'rating_strategischer_fit', 'rating_visibility', 'rating_multichannel',
      'rating_talk_of_town', 'rating_aktivierungsmechanik', 'rating_impact', 'rating_nachhaltigkeit',
      'reason_kreative_idee', 'reason_strategischer_fit', 'reason_visibility', 'reason_multichannel',
      'reason_talk_of_town', 'reason_aktivierungsmechanik', 'reason_impact', 'reason_nachhaltigkeit',
      'strategic_insight', 'sources',
    ],
  },
};

// Step 1: Fast image identification — uses Haiku for speed
async function identifyFromImage(imageBase64: string, imageMimeType: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 300,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: imageMimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
            data: imageBase64,
          },
        },
        {
          type: 'text',
          text: `Analysiere dieses Bild und nenne mir präzise:
1. Alle sichtbaren Markenlogos und Firmennamen
2. Alle lesbaren Texte, Slogans, Schriftzüge
3. Den Kontext: Was ist das für ein Sponsoring? (Trikot, Plakat, Bande, Event, Produkt etc.)
4. Sport/Verband/Verein/Event falls erkennbar

Antworte knapp und faktisch.`,
        },
      ],
    }],
  });
  const textBlock = response.content.find((b) => b.type === 'text');
  return textBlock ? (textBlock as Anthropic.TextBlock).text : '';
}

// Step 2a: Research with web search — uses Haiku for speed (3 searches max)
async function researchCase(caseIdentification: string, description?: string): Promise<string> {
  const webSearchTool: Anthropic.WebSearchTool20250305 = {
    type: 'web_search_20250305',
    name: 'web_search',
  };

  const caseName = caseIdentification || description || 'Unbekannter Case';
  const researchPrompt = `Recherchiere diesen Sponsoring-Case und sammle alle verfügbaren Fakten:

CASE: ${caseName}

Suche gezielt nach: Marke + Partner, Kampagnenname, Laufzeit, konkrete Aktivierungen (TV/Social/Events/POS), Mediadaten, Ergebnisse/KPIs, Awards. Fasse alles in 300-400 Wörtern zusammen.`;

  const messages: Anthropic.MessageParam[] = [{ role: 'user', content: researchPrompt }];

  let response = await anthropic.messages.create({
    model: 'claude-haiku-4-5',  // Fast + cheap for research
    max_tokens: 2000,
    tools: [webSearchTool],
    messages,
  });

  // Max 3 search iterations to stay within timeout
  let iterations = 0;
  while (response.stop_reason === 'tool_use' && iterations < 3) {
    iterations++;
    messages.push({ role: 'assistant', content: response.content });
    response = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 2000,
      tools: [webSearchTool],
      messages,
    });
  }

  const textBlock = response.content.find((b) => b.type === 'text');
  return textBlock ? (textBlock as Anthropic.TextBlock).text : 'Keine Recherche-Ergebnisse.';
}

// Step 2b: Structured analysis via forced tool use — guaranteed valid output
async function structuredAnalysis(
  researchSummary: string,
  caseIdentification: string,
  description?: string
): Promise<ClaudeAnalysisResult> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 5000,
    tools: [SAVE_ANALYSIS_TOOL],
    tool_choice: { type: 'tool', name: 'save_case_analysis' },
    messages: [{
      role: 'user',
      content: `Erstelle jetzt die vollständige S20 Benchmark-Analyse basierend auf dieser Recherche.

RECHERCHE-ERGEBNISSE:
${researchSummary}

${caseIdentification ? `CASE-IDENTIFIKATION: ${caseIdentification}\n` : ''}
${description ? `BESCHREIBUNG: ${description}\n` : ''}

BEWERTUNGSSKALA (für alle 8 Kriterien):
1 = Weit unter Branchendurchschnitt
2 = Unter Durchschnitt
3 = Branchendurchschnitt (vergib 3 nur wenn wirklich Durchschnitt)
4 = Überdurchschnittlich
5 = Branchenführend / Best-in-Class

Die Noten MÜSSEN den tatsächlichen Qualitäten dieses Cases entsprechen und sollen voneinander abweichen. Rufe jetzt save_case_analysis auf.`,
    }],
  });

  // Extract tool input — this is guaranteed to be valid
  const toolUse = response.content.find((b): b is Anthropic.ToolUseBlock => b.type === 'tool_use');
  if (!toolUse) throw new Error('Claude hat das Analyse-Tool nicht aufgerufen.');

  const i = toolUse.input as Record<string, unknown>;

  return {
    title: String(i.title || ''),
    brand: String(i.brand || ''),
    partner: String(i.partner || ''),
    summary: String(i.summary || ''),
    ratings: {
      kreative_idee: Number(i.rating_kreative_idee) || 3,
      strategischer_fit: Number(i.rating_strategischer_fit) || 3,
      visibility: Number(i.rating_visibility) || 3,
      multichannel: Number(i.rating_multichannel) || 3,
      talk_of_town: Number(i.rating_talk_of_town) || 3,
      aktivierungsmechanik: Number(i.rating_aktivierungsmechanik) || 3,
      impact: Number(i.rating_impact) || 3,
      nachhaltigkeit: Number(i.rating_nachhaltigkeit) || 3,
    },
    rating_reasons: {
      kreative_idee: String(i.reason_kreative_idee || ''),
      strategischer_fit: String(i.reason_strategischer_fit || ''),
      visibility: String(i.reason_visibility || ''),
      multichannel: String(i.reason_multichannel || ''),
      talk_of_town: String(i.reason_talk_of_town || ''),
      aktivierungsmechanik: String(i.reason_aktivierungsmechanik || ''),
      impact: String(i.reason_impact || ''),
      nachhaltigkeit: String(i.reason_nachhaltigkeit || ''),
    },
    strategic_insight: String(i.strategic_insight || ''),
    sources: Array.isArray(i.sources) ? i.sources.map(String) : [],
  };
}

export async function analyzeSponsoringCase(
  description?: string,
  imageBase64?: string,
  imageMimeType?: string
): Promise<ClaudeAnalysisResult> {
  // Step 1 + 2a in parallel: identify image AND start research simultaneously
  let caseIdentification = '';

  if (imageBase64 && imageMimeType) {
    // Run image ID first (fast), then research with the result
    caseIdentification = await identifyFromImage(imageBase64, imageMimeType);
  }

  // Step 2a: Research (uses identification + description)
  const researchSummary = await researchCase(caseIdentification, description);

  // Step 2b: Force-structured analysis (guaranteed valid output)
  const result = await structuredAnalysis(researchSummary, caseIdentification, description);

  // Clamp ratings 1–5
  const ratingKeys = [
    'kreative_idee', 'strategischer_fit', 'visibility', 'multichannel',
    'talk_of_town', 'aktivierungsmechanik', 'impact', 'nachhaltigkeit',
  ] as const;
  for (const key of ratingKeys) {
    result.ratings[key] = Math.min(5, Math.max(1, Math.round(result.ratings[key])));
  }

  return result;
}
