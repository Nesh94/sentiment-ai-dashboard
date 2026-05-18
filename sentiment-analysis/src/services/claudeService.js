const ClaudeService = (() => {
  const API_URL = "/api/analyze";

  async function analyzeText(text) {
    if (!text || text.trim().length === 0) {
      throw new Error("Text cannot be empty.");
    }

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Analysis failed.");
    }

    return data;
  }

  async function analyzeBulk(texts, onProgress) {
    const results = [];

    for (let i = 0; i < texts.length; i++) {
      try {
        const result = await analyzeText(texts[i]);
        results.push({ text: texts[i], ...result, error: null });
      } catch (err) {
        results.push({
          text: texts[i],
          sentiment: "neutral",
          score: 0,
          confidence: 0,
          error: err.message
        });
      }

      if (onProgress) onProgress(i + 1, texts.length);
    }

    return results;
  }

  return { analyzeText, analyzeBulk };
})();