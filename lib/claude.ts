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

// Step 1: Fast image identification — no web search, just read what's visible
async function identifyFromImage(
  imageBase64: string,
  imageMimeType: string
): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 400,
    messages: [
      {
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
2. Alle lesbaren Texte, Slogans oder Schriftzüge
3. Den Kontext: Was ist das für ein Sponsoring? (Trikot, Plakat, Bande, Event, Produkt etc.)
4. Den Sport/Verband/Verein/Event falls erkennbar

Antworte knapp und faktisch, keine Einleitung.`,
          },
        ],
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === 'text');
  return textBlock ? (textBlock as Anthropic.TextBlock).text : '';
}

// Step 2: Deep analysis with targeted web search based on identified case
async function analyzeWithSearch(
  caseIdentification: string,
  description?: string
): Promise<ClaudeAnalysisResult> {
  const webSearchTool: Anthropic.WebSearchTool20250305 = {
    type: 'web_search_20250305',
    name: 'web_search',
  };

  const searchPrompt = `Du bist ein erfahrener Sponsoring-Stratege. Analysiere folgenden Sponsoring-Case nach dem S20 Benchmark-Raster.

${caseIdentification ? `IDENTIFIZIERTER CASE (aus Bildanalyse):\n${caseIdentification}\n` : ''}
${description ? `ZUSÄTZLICHE BESCHREIBUNG:\n${description}\n` : ''}

Suche jetzt gezielt nach Informationen zu diesem Case: Kampagnendetails, Laufzeit, Aktivierungen, Mediadaten, Ergebnisse, Awards.

Erstelle dann exakt dieses JSON (kein Markdown, keine Codeblöcke):
{
  "title": "Marke × Partner — Kampagnenname",
  "brand": "Sponsoring-Marke",
  "partner": "Rechtehalter",
  "summary": "Mindestens 4 Absätze:\\n\\nAbsatz 1 — Das Sponsoring: Wer sponsert wen, seit wann, Kategorie, vertraglicher Rahmen.\\n\\nAbsatz 2 — Die Aktivierung: Konkrete Maßnahmen (TV, Social, Events, Promotions, POS, Produktintegration).\\n\\nAbsatz 3 — Reichweite & Wirkung: Mediadaten, Zuschauerzahlen, Social-Reichweite, PR-Wert, Awards.\\n\\nAbsatz 4 — Einordnung: Warum ist dieser Case bemerkenswert oder wo hat er Schwächen?",
  "ratings": {
    "kreative_idee": 4,
    "strategischer_fit": 5,
    "visibility": 4,
    "multichannel": 3,
    "talk_of_town": 4,
    "aktivierungsmechanik": 3,
    "impact": 4,
    "nachhaltigkeit": 5
  },
  "rating_reasons": {
    "kreative_idee": "2-3 konkrete Sätze warum diese Note — mit spezifischen Beispielen aus der Kampagne.",
    "strategischer_fit": "2-3 konkrete Sätze — passt die Marke zum Partner oder wirkt es austauschbar?",
    "visibility": "2-3 konkrete Sätze — wo und wie stark ist die Marke sichtbar?",
    "multichannel": "2-3 konkrete Sätze — welche Kanäle werden bespielt, wie gut verzahnt?",
    "talk_of_town": "2-3 konkrete Sätze — was hat für Gesprächsstoff gesorgt?",
    "aktivierungsmechanik": "2-3 konkrete Sätze — welche Mechanik, wie stark werden Fans aktiviert?",
    "impact": "2-3 konkrete Sätze — welche messbaren Ergebnisse, KPIs, Sales-Effekte?",
    "nachhaltigkeit": "2-3 konkrete Sätze — einmalige Aktion oder langfristige Plattform?"
  },
  "strategic_insight": "2-3 Absätze: Was können andere Sponsoren lernen? Welche Mechaniken sind übertragbar?",
  "sources": ["url1", "url2"]
}

Wichtig: Bewertung 3 = Branchendurchschnitt. summary mind. 250 Wörter.`;

  const messages: Anthropic.MessageParam[] = [
    { role: 'user', content: searchPrompt },
  ];

  let response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 6000,
    system: 'Du antwortest IMMER als valides JSON ohne Markdown oder Codeblöcke.',
    tools: [webSearchTool],
    messages,
  });

  let iterations = 0;
  while (response.stop_reason === 'tool_use' && iterations < 6) {
    iterations++;
    messages.push({ role: 'assistant', content: response.content });
    response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 6000,
      system: 'Du antwortest IMMER als valides JSON ohne Markdown oder Codeblöcke.',
      tools: [webSearchTool],
      messages,
    });
  }

  const textBlock = response.content.find((b) => b.type === 'text');
  if (!textBlock) throw new Error('Keine Antwort von Claude erhalten.');

  const raw = (textBlock as Anthropic.TextBlock).text
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();

  return JSON.parse(raw) as ClaudeAnalysisResult;
}

export async function analyzeSponsoringCase(
  description?: string,
  imageBase64?: string,
  imageMimeType?: string
): Promise<ClaudeAnalysisResult> {
  // Step 1: If image provided, identify it first (fast, ~2s)
  let caseIdentification = '';
  if (imageBase64 && imageMimeType) {
    caseIdentification = await identifyFromImage(imageBase64, imageMimeType);
  }

  // Step 2: Deep analysis with web search using the identified case
  const result = await analyzeWithSearch(caseIdentification, description);

  // Clamp ratings 1–5
  const ratingKeys = [
    'kreative_idee', 'strategischer_fit', 'visibility', 'multichannel',
    'talk_of_town', 'aktivierungsmechanik', 'impact', 'nachhaltigkeit',
  ] as const;
  for (const key of ratingKeys) {
    result.ratings[key] = Math.min(5, Math.max(1, Math.round(result.ratings[key] || 3)));
  }

  return result;
}
