const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("."));

function buildPrompt(text) {
  return `
You are a professional sentiment analysis engine.

Analyze the text and return ONLY valid JSON. No markdown. No explanation.

Text:
"""
${text}
"""

Return exactly this JSON structure:
{
  "sentiment": "positive",
  "score": 0.8,
  "confidence": 90,
  "emotions": [
    {
      "label": "joy",
      "intensity": 80,
      "emoji": "😊"
    }
  ],
  "keywords": ["example keyword"],
  "tones": {
    "joy": 80,
    "anger": 0,
    "sadness": 0,
    "fear": 0,
    "surprise": 0
  },
  "summary": "A short 2 sentence insight.",
  "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"],
  "language": "English"
}
`;
}

function fixAIResponse(data) {
  return {
    sentiment: typeof data.sentiment === "string" ? data.sentiment : "neutral",
    score: typeof data.score === "number" ? data.score : 0,
    confidence: typeof data.confidence === "number" ? data.confidence : 0,

    emotions: Array.isArray(data.emotions) ? data.emotions : [],

    keywords: Array.isArray(data.keywords) ? data.keywords : [],

    tones: {
      joy: Number(data.tones?.joy) || 0,
      anger: Number(data.tones?.anger) || 0,
      sadness: Number(data.tones?.sadness) || 0,
      fear: Number(data.tones?.fear) || 0,
      surprise: Number(data.tones?.surprise) || 0
    },

    summary:
      typeof data.summary === "string"
        ? data.summary
        : "Analysis completed successfully.",

    recommendations: Array.isArray(data.recommendations)
      ? data.recommendations
      : [
          "Review the emotional tone carefully.",
          "Use the insight to improve communication.",
          "Consider the key phrases when responding."
        ],

    language: typeof data.language === "string" ? data.language : "Unknown"
  };
}

app.post("/api/analyze", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ error: "Text cannot be empty." });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        error: "Missing GROQ_API_KEY on server."
      });
    }

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          temperature: 0.2,
          max_tokens: 1000,
          messages: [
            {
              role: "system",
              content:
                "You are a sentiment analysis API. Always return only valid JSON."
            },
            {
              role: "user",
              content: buildPrompt(text)
            }
          ]
        })
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: result.error?.message || "Groq API error"
      });
    }

    const raw = result.choices?.[0]?.message?.content || "{}";

    const clean = raw
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let parsed;

    try {
      parsed = JSON.parse(clean);
    } catch (error) {
      return res.status(500).json({
        error: "AI returned invalid JSON. Please try again."
      });
    }

    const fixedResult = fixAIResponse(parsed);

    res.json(fixedResult);
  } catch (error) {
    res.status(500).json({
      error: error.message || "Server error"
    });
  }
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});