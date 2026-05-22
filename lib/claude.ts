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

  const searchPrompt = `Du bist ein erfahrener Sponsoring-Stratege. Analysiere diesen konkreten Sponsoring-Case individuell und unabhängig.

${caseIdentification ? `IDENTIFIZIERTER CASE (Bildanalyse-Ergebnis):\n${caseIdentification}\n` : ''}
${description ? `BESCHREIBUNG:\n${description}\n` : ''}

SCHRITT 1: Suche im Internet nach diesem spezifischen Case. Finde heraus: Kampagnenname, Laufzeit, Budget (falls bekannt), konkrete Aktivierungen, Mediadaten, Kampagnenergebnisse, Auszeichnungen.

SCHRITT 2: Bewerte den Case anhand der 8 S20-Kriterien. Die Bewertungen MÜSSEN den tatsächlichen Qualitäten DIESES Cases entsprechen — nicht einem Durchschnitt, nicht einem Template. Jedes Kriterium wird unabhängig bewertet:

BEWERTUNGSSKALA (für jedes Kriterium):
- 1 = Weit unter Branchendurchschnitt / kaum vorhanden
- 2 = Unter Durchschnitt / schwach ausgeprägt
- 3 = Branchendurchschnitt / solide aber unremarkable
- 4 = Überdurchschnittlich / klar erkennbare Stärke
- 5 = Branchenführend / Best-in-Class Beispiel

KRITERIEN:
- kreative_idee: Wie originell ist die Grundidee? Bricht sie Erwartungen? Hat sie Cultural-Moment-Potenzial?
- strategischer_fit: Wie glaubwürdig passt die Marke zum Rechtehalter? Wäre es austauschbar?
- visibility: Wie dominant und wahrnehmbar ist die Markenpräsenz? Alleinstellung oder im Clutter?
- multichannel: Wie gut sind Paid/Owned/Earned/On-Ground verzahnt? Isolierte Aktion oder integriert?
- talk_of_town: Wie viel organischen Gesprächswert erzeugt es? Wird es über die Marketingbubble hinaus diskutiert?
- aktivierungsmechanik: Wie stark werden Menschen zu Teilnehmern statt Zuschauern? Niedrige Einstiegshürde?
- impact: Wie klar messbar sind Engagement oder Business-Effekte? Gibt es belegbare KPIs?
- nachhaltigkeit: Ist es eine langfristige Plattform oder ein einmaliger Moment? Ausbaubar?

WICHTIG: Vergib die Noten nach ehrlicher Analyse. Ein Standard-Trikot-Sponsor bekommt nicht automatisch 4-5 Punkte. Ein innovativer Case kann durchaus 5 Punkte in einzelnen Kriterien verdienen, aber 2 in anderen. Die Noten sollen voneinander abweichen wenn die Realität das rechtfertigt.

Antworte mit diesem JSON (kein Markdown, keine Codeblöcke, echte Noten statt Platzhalter):
{
  "title": "Marke × Partner — prägnanter Titel",
  "brand": "Name der Sponsoring-Marke",
  "partner": "Name des Rechtehalters",
  "summary": "4 Absätze auf Deutsch:\\n\\nAbsatz 1 — Das Sponsoring: Wer sponsert wen, seit wann, welche Kategorie, vertraglicher Rahmen.\\n\\nAbsatz 2 — Die Aktivierung: Konkrete Maßnahmen (TV-Spots, Social Media, Events, Promotions, POS, Produktintegration) — so spezifisch wie möglich.\\n\\nAbsatz 3 — Reichweite & Wirkung: Mediadaten, Zuschauerzahlen, Social-Reichweite, PR-Wert, Awards, belegbare Ergebnisse.\\n\\nAbsatz 4 — Einordnung: Was macht diesen Case bemerkenswert oder wo hat er Schwächen?",
  "ratings": {
    "kreative_idee": ECHTE_NOTE_1_BIS_5,
    "strategischer_fit": ECHTE_NOTE_1_BIS_5,
    "visibility": ECHTE_NOTE_1_BIS_5,
    "multichannel": ECHTE_NOTE_1_BIS_5,
    "talk_of_town": ECHTE_NOTE_1_BIS_5,
    "aktivierungsmechanik": ECHTE_NOTE_1_BIS_5,
    "impact": ECHTE_NOTE_1_BIS_5,
    "nachhaltigkeit": ECHTE_NOTE_1_BIS_5
  },
  "rating_reasons": {
    "kreative_idee": "Konkrete Begründung für DIESE Note mit Beispielen aus DIESEM Case.",
    "strategischer_fit": "Konkrete Begründung für DIESE Note — was spricht für/gegen den Fit?",
    "visibility": "Konkrete Begründung — wo genau ist die Marke sichtbar, wie dominant?",
    "multichannel": "Konkrete Begründung — welche Kanäle, wie gut verzahnt, was fehlt?",
    "talk_of_town": "Konkrete Begründung — was hat konkret Gesprächswert erzeugt oder eben nicht?",
    "aktivierungsmechanik": "Konkrete Begründung — welche Mechanik existiert, wie stark die Participation?",
    "impact": "Konkrete Begründung — welche Ergebnisse sind bekannt oder nicht messbar?",
    "nachhaltigkeit": "Konkrete Begründung — einmalig oder Plattform, ausbaubar?"
  },
  "strategic_insight": "2-3 Absätze auf Deutsch: Was lernen andere Sponsoren von diesem Case? Welche Mechaniken sind übertragbar? Was wäre die nächste logische Stufe?",
  "sources": ["konkrete_url_1", "konkrete_url_2"]
}`;

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
