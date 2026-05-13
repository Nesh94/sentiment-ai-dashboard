# SentimentAI — Sentiment Analysis Tool

**Individual Project | AI for Data Analysis & Insights**

A fully AI-powered sentiment analysis dashboard that uses the Claude API to interpret text data, detect emotions, extract key phrases, and generate actionable insights.

---

## Features

- **Single Text Analysis** — Paste any text and get instant sentiment scoring, emotion detection, tone breakdown, and AI-generated insights
- **Bulk CSV Analysis** — Upload a CSV or TXT file to analyze multiple entries at once, with a visual bar chart and export
- **Sample Texts** — Try pre-loaded examples to explore the tool instantly
- **History** — All analyses are saved locally in your browser
- **Export** — Download results as JSON for your portfolio/report

---

## Project Structure

```
sentiment-analysis/
├── index.html                        # Main HTML entry point
├── README.md                         # This file
└── src/
    ├── styles/
    │   └── main.css                  # All styles
    ├── services/
    │   ├── claudeService.js          # Claude AI API integration
    │   └── storageService.js         # localStorage history manager
    ├── utils/
    │   ├── helpers.js                # Shared utility functions
    │   └── chartHelper.js            # Canvas chart renderer
    └── components/
        ├── tabs.js                   # Tab switching UI
        ├── fileUpload.js             # CSV/TXT drag-drop upload
        ├── resultsRenderer.js        # Renders analysis results
        └── app.js                    # Main app controller
```

---

## Setup & Running

### Option 1: Open directly in browser (simplest)
1. Open `index.html` in any modern web browser
2. The app uses the Claude API via `fetch` — **no build step needed**

### Option 2: VS Code with Live Server (recommended)
1. Open the `sentiment-analysis/` folder in VS Code
2. Install the **Live Server** extension (if not already installed)
3. Right-click `index.html` → **Open with Live Server**

---

## API Key

This project calls the Claude API (`https://api.anthropic.com/v1/messages`).

The API key is handled automatically via the Claude.ai environment.  
If running **outside** Claude.ai (e.g. locally or deployed), you need to add your API key:

Open `src/services/claudeService.js` and update the fetch headers:

```javascript
headers: {
  'Content-Type': 'application/json',
  'x-api-key': 'YOUR_API_KEY_HERE',         // Add this line
  'anthropic-version': '2023-06-01',         // Add this line
  'anthropic-dangerous-direct-browser-access': 'true'  // Add for browser use
},
```

Get your API key at: https://console.anthropic.com

---

## CSV Format

For bulk analysis, upload a `.csv` file with a `text` column:

```csv
text
"This product is amazing!"
"Terrible experience, very disappointed."
"It was okay, nothing special."
```

Or a plain `.txt` file with one entry per line.

---

## Measurable Outcomes

- ✅ Working sentiment analysis solution (single & bulk)
- ✅ Ability to interpret data using AI (Claude API)
- ✅ Documented individual project (this README)

---

## Technologies Used

- **HTML5 / CSS3 / Vanilla JavaScript** — No framework needed
- **Claude AI API** (`claude-sonnet-4-20250514`) — Sentiment intelligence
- **Canvas API** — Bulk results bar chart
- **localStorage** — History persistence

---

*Built for the Coursera "AI for Data Analysis & Insights" Individual Project*
