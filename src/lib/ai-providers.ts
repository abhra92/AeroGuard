import { getHeuristicAssistantResponse } from './heuristic-rules';

export interface AICompletionRequest {
  prompt: string;
  systemInstruction?: string;
  currentAqi?: number;
  currentPm25?: number;
  city?: string;
  geminiKey?: string;
  groqKey?: string;
  /** Optional check on the reply; a provider whose reply fails it is skipped for the next one. */
  accept?: (text: string) => boolean;
}

// Current models reason before answering, which uses output tokens, so leave room for both.
const MAX_OUTPUT_TOKENS = 4096;

export interface AICompletionResponse {
  text: string;
  provider: 'gemini' | 'groq' | 'heuristic';
  citations?: string[];
}

export async function generateAIResponse(req: AICompletionRequest): Promise<AICompletionResponse> {
  const geminiApiKey = req.geminiKey || process.env.GEMINI_API_KEY;
  const groqApiKey = req.groqKey || process.env.GROQ_API_KEY;

  const aqi = req.currentAqi || 180;
  const pm25 = req.currentPm25 || 90;
  const city = req.city || 'your area';
  const accept = req.accept ?? ((text: string) => text.trim().length > 0);

  const baseSystemPrompt = req.systemInstruction || `
You are AeroGuard AI, an expert environmental engineer and pediatric pulmonary health advisor specializing in urban winter smog, radiation temperature inversions, indoor air quality (IAQ) hacks, and sustainable low-emission daily routines.
Current Context: City: ${city}, Current US AQI: ${aqi}, PM2.5: ${pm25} ug/m3.
Always provide scientifically precise, compassionate, actionable advice. Emphasize low-cost DIY solutions (like Corsi-Rosenthal boxes), diurnal inversion safe windows (typically midday 1:00 - 3:30 PM), anti-idling, and exposure reduction.
Include specific numbers, avoided PM2.5 inhalation estimates, and clear bullet points.
`;

  // 1. Try Google Gemini API if key is available
  if (geminiApiKey) {
    try {
      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent',
        {
          method: 'POST',
          // Key in a header, not the URL, so it stays out of logs and proxies.
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': geminiApiKey },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: `${baseSystemPrompt}\n\nUser Question: ${req.prompt}` }],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: MAX_OUTPUT_TOKENS,
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const parts: { text?: string }[] = data.candidates?.[0]?.content?.parts ?? [];
        const candidateText = parts.map((p) => p.text ?? '').join('');
        if (accept(candidateText)) {
          return {
            text: candidateText,
            provider: 'gemini',
            citations: ['Google Gemini Flash (Free Tier)', 'Open-Meteo Atmospheric Reanalysis'],
          };
        }
      } else {
        console.warn(`Gemini API error ${response.status}, falling back...`);
      }
    } catch (err) {
      console.warn('Gemini API call failed, falling back to secondary provider:', err);
    }
  }

  // 2. Try Groq API if key is available
  if (groqApiKey) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${groqApiKey}`,
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-120b',
          messages: [
            { role: 'system', content: baseSystemPrompt },
            { role: 'user', content: req.prompt },
          ],
          temperature: 0.7,
          max_tokens: MAX_OUTPUT_TOKENS,
          reasoning_effort: 'low',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text: string = data.choices?.[0]?.message?.content ?? '';
        if (accept(text)) {
          return {
            text,
            provider: 'groq',
            citations: ['Groq GPT-OSS 120B (Free Tier)', 'Open-Meteo Atmospheric Reanalysis'],
          };
        }
      }
    } catch (err) {
      console.warn('Groq API call failed:', err);
    }
  }

  // 3. Fallback to 100% Zero-Key Offline Heuristic Engine
  const heuristicResult = getHeuristicAssistantResponse(req.prompt, aqi, pm25);
  return {
    text: heuristicResult.text,
    provider: 'heuristic',
    citations: heuristicResult.citations,
  };
}
