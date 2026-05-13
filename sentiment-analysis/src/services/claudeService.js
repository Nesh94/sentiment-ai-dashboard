/**
 * claudeService.js
 * Now powered by Groq API (free) instead of Anthropic.
 */

const ClaudeService = (() => {
  const API_URL = 'https://api.groq.com/openai/v1/chat/completions';
  const MODEL = 'llama-3.3-70b-versatile';
const API_KEY= "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";
  function buildPrompt(text) {
    return `You are a professional sentiment analysis engine. Analyze the following text and return ONLY a valid JSON object with no markdown fences, no preamble, and no extra text.

Text to analyze:
"""
${text}
"""

Return this exact JSON structure:
{
  "sentiment": "positive" | "negative" | "neutral" | "mixed",
  "score": <number from -1.0 to 1.0>,
  "confidence": <number from 0 to 100>,
  "emotions": [
    { "label": "<emotion>", "intensity": <0-100>, "emoji": "<emoji>" }
  ],
  "keywords": ["<phrase1>", "<phrase2>"],
  "tones": {
    "joy": <0-100>,
    "anger": <0-100>,
    "sadness": <0-100>,
    "fear": <0-100>,
    "surprise": <0-100>
  },
  "summary": "<2-3 sentence AI insight>",
  "recommendations": ["<rec1>", "<rec2>", "<rec3>"],
  "language": "<detected language>"
}`;
  }

  async function analyzeText(text) {
    if (!text || text.trim().length === 0) {
      throw new Error('Text cannot be empty.');
    }

    const response = await fetch(API_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`
  },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1000,
        messages: [{ role: 'user', content: buildPrompt(text) }]
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    const raw = data.choices[0].message.content;
    const clean = raw.replace(/```json|```/g, '').trim();

    try {
      return JSON.parse(clean);
    } catch (e) {
      throw new Error('Failed to parse AI response. Please try again.');
    }
  }

  async function analyzeBulk(texts, onProgress) {
    const results = [];
    for (let i = 0; i < texts.length; i++) {
      try {
        const result = await analyzeText(texts[i]);
        results.push({ text: texts[i], ...result, error: null });
      } catch (err) {
        results.push({ text: texts[i], error: err.message, sentiment: 'neutral', score: 0, confidence: 0 });
      }
      if (onProgress) onProgress(i + 1, texts.length);
      if (i < texts.length - 1) await new Promise(r => setTimeout(r, 300));
    }
    return results;
  }

  return { analyzeText, analyzeBulk };
})();
