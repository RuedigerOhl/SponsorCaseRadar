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

const SYSTEM_PROMPT = `Du bist ein erfahrener Sponsoring-Stratege mit über 20 Jahren Erfahrung. Du analysierst Sponsoring-Kampagnen präzise und tiefgründig nach dem S20 Benchmark-Raster. Deine Bewertungen enthalten immer konkrete Begründungen und sind auf Basis öffentlich verfügbarer Fakten belegt. Du antwortest IMMER als valides JSON ohne Markdown oder Codeblöcke.`;

function buildPrompt(description?: string, hasImage?: boolean): string {
  return `Analysiere den folgenden Sponsoring-Case und bewerte ihn nach dem S20 Benchmark-Raster.

${hasImage ? 'Erkenne anhand des Bildes, um welchen Sponsoring-Case es sich handelt.' : ''}
${description ? `Case-Eingabe: "${description}"` : ''}

SCHRITT 1: Suche im Internet nach detaillierten Informationen zu diesem Sponsoring-Case (Kampagnendetails, Laufzeit, Budget falls bekannt, Aktivierungen, Mediadaten, Ergebnisse, Presseberichte).

SCHRITT 2: Erstelle auf Basis der gefundenen Informationen folgendes JSON:

{
  "title": "Prägnanter Case-Titel (z.B. 'Edeka × DFB — Die Nationalelf Kampagne')",
  "brand": "Name der Marke/des Sponsors",
  "partner": "Name des Rechtehalters (Verein, Verband, Event, Künstler etc.)",

  "summary": "MANAGEMENT SUMMARY — mindestens 4 ausführliche Absätze auf Deutsch:\\n\\nAbsatz 1 — Das Sponsoring: Wer sponsert wen, seit wann, in welcher Kategorie (Hauptsponsor, Presenting Sponsor etc.), was ist der vertragliche Rahmen soweit bekannt.\\n\\nAbsatz 2 — Die Aktivierung: Welche konkreten Maßnahmen wurden umgesetzt? TV-Spots, Social Media, Events, Promotions, Produktintegrationen, POS-Maßnahmen — so detailliert wie möglich.\\n\\nAbsatz 3 — Reichweite & Wirkung: Welche Mediadaten, Zuschauerzahlen, Social-Media-Reichweiten, PR-Wert oder andere Metriken sind bekannt? Welche Auszeichnungen oder Benchmarks wurden erreicht?\\n\\nAbsatz 4 — Einordnung: Warum ist dieser Case bemerkenswert? Was macht ihn zu einem Best Case oder was sind die Schwächen?",

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
    "kreative_idee": "Konkrete Begründung warum diese Note: Was ist originell, was ist Standard? Nenne spezifische Beispiele aus der Kampagne.",
    "strategischer_fit": "Konkrete Begründung: Wie gut passt die Marke zum Rechtehalter? Gibt es inhaltliche Überschneidungen, oder wirkt es aufgesetzt?",
    "visibility": "Konkrete Begründung: Wo ist die Marke sichtbar? Wie dominant? Alleinstellung oder im Clutter?",
    "multichannel": "Konkrete Begründung: Welche Kanäle werden bespielt? Wie gut sind sie verzahnt? Was fehlt?",
    "talk_of_town": "Konkrete Begründung: Was hat für Gesprächsstoff gesorgt? Wurde es organisch aufgegriffen? Gibt es PR-Wert?",
    "aktivierungsmechanik": "Konkrete Begründung: Welche Mechanik gibt es? Wie stark werden Fans/Konsumenten aktiviert? Einstiegshürde?",
    "impact": "Konkrete Begründung: Welche messbaren Ergebnisse gibt es? KPIs, Sales-Effekte, Markenmetriken?",
    "nachhaltigkeit": "Konkrete Begründung: Ist das eine einmalige Aktion oder eine langfristige Plattform? Gibt es Anschlusspotenzial?"
  },

  "strategic_insight": "2-3 Absätze: Was können andere Sponsoren von diesem Case lernen? Welche Mechaniken sind übertragbar? Was würdest du als nächsten Schritt empfehlen?",

  "sources": ["url1", "url2", "url3"]
}

WICHTIG:
- summary muss mindestens 300 Wörter haben
- Jede rating_reason muss mindestens 2-3 konkrete Sätze haben
- Bewertungen 1-5, wobei 3 = Branchendurchschnitt
- Wenn du keine gesicherten Infos findest, sage das explizit in der Summary statt zu raten`;
}

export async function analyzeSponsoringCase(
  description?: string,
  imageBase64?: string,
  imageMimeType?: string
): Promise<ClaudeAnalysisResult> {
  const webSearchTool: Anthropic.WebSearchTool20250305 = {
    type: 'web_search_20250305',
    name: 'web_search',
  };

  const userContent: Anthropic.MessageParam['content'] = [];

  if (imageBase64 && imageMimeType) {
    userContent.push({
      type: 'image',
      source: {
        type: 'base64',
        media_type: imageMimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
        data: imageBase64,
      },
    });
  }

  userContent.push({ type: 'text', text: buildPrompt(description, !!imageBase64) });

  const messages: Anthropic.MessageParam[] = [{ role: 'user', content: userContent }];

  let response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8000,
    system: SYSTEM_PROMPT,
    tools: [webSearchTool],
    messages,
  });

  // Agentic loop — for web_search_20250305 Anthropic executes searches server-side.
  // We just append each assistant turn and call again until end_turn.
  let iterations = 0;
  while (response.stop_reason === 'tool_use' && iterations < 8) {
    iterations++;
    messages.push({ role: 'assistant', content: response.content });

    // For server-side tools like web_search, send an empty user continuation
    // so Anthropic can inject the search results automatically.
    response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8000,
      system: SYSTEM_PROMPT,
      tools: [webSearchTool],
      messages,
    });
  }

  // Extract final JSON text
  let resultText = '';
  for (const block of response.content) {
    if (block.type === 'text') {
      resultText = block.text;
      break;
    }
  }

  if (!resultText) throw new Error('Keine Textantwort von Claude erhalten.');

  const cleanedText = resultText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const result = JSON.parse(cleanedText) as ClaudeAnalysisResult;

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
