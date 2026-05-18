/**
 * claudeService.js
 * Powered by Groq API
 */

const ClaudeService = (() => {
  // Groq API endpoint
  const API_URL = 'https://api.groq.com/openai/v1/chat/completions';

  // Groq model
  const MODEL = 'llama-3.3-70b-versatile';

  // Replace with your Groq API key
  const API_KEY = "YOUR_GROQ_API_KEY_HERE";

  /**
   * Build AI prompt
   */
  function buildPrompt(text) {
    return `
You are a professional sentiment analysis engine.

Analyze the following text and return ONLY a valid JSON object.

Text:
"""
${text}
"""

Return this exact structure:
{
  "sentiment": "positive" | "negative" | "neutral" | "mixed",
  "score": <number from -1.0 to 1.0>,
  "confidence": <number from 0 to 100>,
  "emotions": [
    {
      "label": "<emotion>",
      "intensity": <0-100>,
      "emoji": "<emoji>"
    }
  ],
  "keywords": ["<keyword1>", "<keyword2>"],
  "tones": {
    "joy": <0-100>,
    "anger": <0-100>,
    "sadness": <0-100>,
    "fear": <0-100>,
    "surprise": <0-100>
  },
  "summary": "<2-3 sentence summary>",
  "recommendations": [
    "<recommendation1>",
    "<recommendation2>",
    "<recommendation3>"
  ],
  "language": "<detected language>"
}
`;
  }

  /**
   * Analyze single text
   */
  async function analyzeText(text) {
    if (!text || text.trim().length === 0) {
      throw new Error('Text cannot be empty.');
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: MODEL,
          temperature: 0.3,
          max_tokens: 1000,
          messages: [
            {
              role: 'system',
              content:
                'You are an advanced sentiment analysis AI that returns only clean JSON.'
            },
            {
              role: 'user',
              content: buildPrompt(text)
            }
          ]
        })
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));

        throw new Error(
          err.error?.message || `Groq API error: ${response.status}`
        );
      }

      const data = await response.json();

      // Extract AI response
      const raw =
        data.choices?.[0]?.message?.content || '{}';

      // Remove markdown if model adds it
      const clean = raw
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      try {
        return JSON.parse(clean);
      } catch (parseError) {
        console.error('JSON Parse Error:', clean);

        throw new Error(
          'Failed to parse AI response. Try again.'
        );
      }
    } catch (error) {
      console.error('Analysis Error:', error);
      throw error;
    }
  }

  /**
   * Analyze multiple texts
   */
  async function analyzeBulk(texts, onProgress) {
    const results = [];

    for (let i = 0; i < texts.length; i++) {
      try {
        const result = await analyzeText(texts[i]);

        results.push({
          text: texts[i],
          ...result,
          error: null
        });
      } catch (err) {
        results.push({
          text: texts[i],
          sentiment: 'neutral',
          score: 0,
          confidence: 0,
          emotions: [],
          keywords: [],
          tones: {},
          summary: '',
          recommendations: [],
          language: 'unknown',
          error: err.message
        });
      }

      // Progress callback
      if (onProgress) {
        onProgress(i + 1, texts.length);
      }

      // Small delay to avoid rate limits
      if (i < texts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }

    return results;
  }

  return {
    analyzeText,
    analyzeBulk
  };
})();