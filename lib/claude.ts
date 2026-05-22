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
  strategic_insight: string;
  sources: string[];
}

export async function analyzeSponsoringCase(
  description?: string,
  imageBase64?: string,
  imageMimeType?: string
): Promise<ClaudeAnalysisResult> {
  const systemPrompt = `Du bist ein erfahrener Sponsoring-Stratege und Markenkommunikations-Experte mit über 20 Jahren Erfahrung in der Bewertung von Sponsoring-Aktivierungen. Du bewertest Sponsoring-Cases nach dem S20 Benchmark-Raster mit 8 Dimensionen.

Deine Bewertungen sind präzise, fundiert und basieren auf verfügbaren Informationen. Du antwortest IMMER als valides JSON ohne Markdown-Formatierung oder Codeblöcke.`;

  const userPromptParts: Anthropic.MessageParam['content'] = [];

  // Add image if provided
  if (imageBase64 && imageMimeType) {
    userPromptParts.push({
      type: 'image',
      source: {
        type: 'base64',
        media_type: imageMimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
        data: imageBase64,
      },
    });
  }

  const textPrompt = `Du bist ein Sponsoring-Experte. Analysiere diesen Sponsoring-Case und bewerte ihn nach dem S20 Benchmark-Raster.

${imageBase64 ? 'Erkenne zuerst welcher Sponsoring-Case auf dem Bild zu sehen ist.' : ''}
${description ? `Case-Beschreibung: ${description}` : ''}

Suche im Internet nach allen verfügbaren Informationen zu diesem Case und nutze diese für deine Analyse.

Erstelle dann:
1. Eine Management Summary auf Deutsch (2-3 Absätze): Wer mit wem, was wurde aktiviert, Laufzeit, Reichweite
2. Eine Bewertung nach den 8 S20-Dimensionen (je 1-5 Punkte):
   - kreative_idee (1=Standard, 5=Cultural Moment): Originell / kulturell relevant?
   - strategischer_fit (1=austauschbar, 5=perfekt integriert): Glaubwürdig zur Marke?
   - visibility (1=nur bedingt sichtbar, 5=Dominant): Sichtbarkeit / Alleinstellung?
   - multichannel (1=isoliert, 5=vollintegriert): Paid/Owned/Earned/On-Ground verbunden?
   - talk_of_town (1=kleine Aktion, 5=hoher ToT-Effekt): Gesprächswert / Innovation?
   - aktivierungsmechanik (1=nur Aktion, 5=echte Participation): Echte Interaktion / CTA?
   - impact (1=unklar, 5=klar messbarer Effekt): Engagement / Business Impact?
   - nachhaltigkeit (1=einmaliger Moment, 5=Plattform): Wirkt über Event hinaus?
3. Eine strategische Einschätzung auf Deutsch: Was kann man von diesem Case lernen?

Antworte ausschließlich als JSON (kein Markdown, keine Codeblöcke):
{
  "title": "Kurzbezeichnung des Cases",
  "brand": "Markenname",
  "partner": "Rechtehalter/Verein/Event",
  "summary": "Management Summary auf Deutsch...",
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
  "strategic_insight": "Was man von diesem Case lernen kann auf Deutsch...",
  "sources": ["url1", "url2"]
}`;

  userPromptParts.push({
    type: 'text',
    text: textPrompt,
  });

  // Web search tool definition using correct SDK type
  const webSearchTool: Anthropic.WebSearchTool20250305 = {
    type: 'web_search_20250305',
    name: 'web_search',
  };

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: systemPrompt,
      tools: [webSearchTool],
      messages: [
        {
          role: 'user',
          content: userPromptParts,
        },
      ],
    });

    // Extract the text content — if stop_reason is end_turn we have what we need
    // If tool_use happened, we need to handle the tool results
    let resultText = '';

    // Process through possible multi-turn tool use
    let currentResponse = response;
    const messages: Anthropic.MessageParam[] = [
      {
        role: 'user',
        content: userPromptParts,
      },
    ];

    // Agentic loop: handle tool use
    let iterations = 0;
    while (currentResponse.stop_reason === 'tool_use' && iterations < 5) {
      iterations++;

      // Collect tool use blocks
      const toolUseBlocks = currentResponse.content.filter(
        (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use'
      );

      if (toolUseBlocks.length === 0) break;

      // Add assistant's response to messages
      messages.push({
        role: 'assistant',
        content: currentResponse.content,
      });

      // Add tool results (web search is handled server-side by Claude — we just acknowledge)
      const toolResults: Anthropic.ToolResultBlockParam[] = toolUseBlocks.map((block) => ({
        type: 'tool_result' as const,
        tool_use_id: block.id,
        content: 'Bitte nutze die Suchergebnisse für deine Analyse.',
      }));

      messages.push({
        role: 'user',
        content: toolResults,
      });

      currentResponse = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 4096,
        system: systemPrompt,
        tools: [webSearchTool],
        messages,
      });
    }

    // Extract final text
    for (const block of currentResponse.content) {
      if (block.type === 'text') {
        resultText = block.text;
        break;
      }
    }

    if (!resultText) {
      throw new Error('Keine Textantwort von Claude erhalten.');
    }

    // Clean and parse the JSON response
    const cleanedText = resultText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const result = JSON.parse(cleanedText) as ClaudeAnalysisResult;

    // Validate and clamp ratings
    const ratingKeys = [
      'kreative_idee',
      'strategischer_fit',
      'visibility',
      'multichannel',
      'talk_of_town',
      'aktivierungsmechanik',
      'impact',
      'nachhaltigkeit',
    ] as const;

    for (const key of ratingKeys) {
      result.ratings[key] = Math.min(5, Math.max(1, Math.round(result.ratings[key] || 3)));
    }

    return result;
  } catch (error) {
    console.error('Claude API error:', error);

    // Return a fallback result if Claude fails
    const fallbackTitle = description
      ? description.substring(0, 60)
      : 'Unbekannter Sponsoring-Case';

    return {
      title: fallbackTitle,
      brand: 'Unbekannt',
      partner: 'Unbekannt',
      summary:
        'Die automatische Analyse konnte nicht vollständig durchgeführt werden. Bitte überprüfe die Eingaben und versuche es erneut.',
      ratings: {
        kreative_idee: 3,
        strategischer_fit: 3,
        visibility: 3,
        multichannel: 3,
        talk_of_town: 3,
        aktivierungsmechanik: 3,
        impact: 3,
        nachhaltigkeit: 3,
      },
      strategic_insight: 'Strategische Einschätzung konnte nicht automatisch erstellt werden.',
      sources: [],
    };
  }
}
