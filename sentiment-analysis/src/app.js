/**
 * app.js
 * Main application controller — wires all components together.
 */

(function () {
  // ── State ──────────────────────────────────────────
  let lastResult = null;
  let lastBulkResults = null;

  // ── DOM refs ───────────────────────────────────────
  const textInput       = document.getElementById('textInput');
  const charCount       = document.getElementById('charCount');
  const analyzeBtn      = document.getElementById('analyzeBtn');
  const analyzeBulkBtn  = document.getElementById('analyzeBulkBtn');
  const loadingOverlay  = document.getElementById('loadingOverlay');
  const loadingText     = document.getElementById('loadingText');
  const exportBtn       = document.getElementById('exportBtn');
  const clearBtn        = document.getElementById('clearBtn');
  const historyList     = document.getElementById('historyList');

  // ── Init ───────────────────────────────────────────
  function init() {
    Tabs.init();
    FileUpload.init();
    bindEvents();
    renderHistory();
    updateStats();
  }

  // ── Event Bindings ─────────────────────────────────
  function bindEvents() {
    // Char counter
    textInput.addEventListener('input', () => {
      charCount.textContent = textInput.value.length;
    });

    // Single analysis
    analyzeBtn.addEventListener('click', handleSingleAnalyze);

    // Bulk analysis
    if (analyzeBulkBtn) {
      analyzeBulkBtn.addEventListener('click', handleBulkAnalyze);
    }

    // Sample cards
    document.querySelectorAll('.sample-card').forEach(card => {
      card.addEventListener('click', () => {
        const text = card.dataset.text;
        textInput.value = text;
        charCount.textContent = text.length;
        // Switch to text tab
        document.querySelector('[data-tab="text"]').click();
        handleSingleAnalyze();
      });
    });

    // Export
    exportBtn.addEventListener('click', handleExport);

    // Clear
    clearBtn.addEventListener('click', () => {
      ResultsRenderer.hide();
      lastResult = null;
      lastBulkResults = null;
    });
  }

  // ── Single Analysis ────────────────────────────────
  async function handleSingleAnalyze() {
    const text = textInput.value.trim();
    if (!text) {
      textInput.focus();
      textInput.style.borderColor = 'var(--negative)';
      setTimeout(() => textInput.style.borderColor = '', 1200);
      return;
    }

    showLoading('Analyzing sentiment with AI…');
    try {
      const result = await ClaudeService.analyzeText(text);
      lastResult = { text, ...result };
      lastBulkResults = null;

      StorageService.save({ text: Helpers.truncate(text, 100), sentiment: result.sentiment, score: result.score });
      ResultsRenderer.renderSingle(result);
      renderHistory();
      updateStats();
    } catch (err) {
      alert('Analysis failed: ' + err.message);
    } finally {
      hideLoading();
    }
  }

  // ── Bulk Analysis ──────────────────────────────────
  async function handleBulkAnalyze() {
    const texts = FileUpload.getTexts();
    if (!texts || texts.length === 0) {
      alert('Please upload a CSV or TXT file first.');
      return;
    }

    showLoading(`Analyzing 0 of ${texts.length} entries…`);
    try {
      const results = await ClaudeService.analyzeBulk(texts, (current, total) => {
        loadingText.textContent = `Analyzing ${current} of ${total} entries…`;
      });

      lastBulkResults = results;
      lastResult = null;

      results.forEach(r => {
        if (!r.error) StorageService.save({ text: Helpers.truncate(r.text, 100), sentiment: r.sentiment, score: r.score });
      });

      ResultsRenderer.renderBulk(results);
      renderHistory();
      updateStats();
    } catch (err) {
      alert('Bulk analysis failed: ' + err.message);
    } finally {
      hideLoading();
    }
  }

  // ── Export ─────────────────────────────────────────
  function handleExport() {
    const data = lastBulkResults || (lastResult ? [lastResult] : null);
    if (!data) return;

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sentiment-results-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── History ────────────────────────────────────────
  function renderHistory() {
    const items = StorageService.getAll();
    if (items.length === 0) {
      historyList.innerHTML = '<div class="history-empty">No analyses yet. Start by entering some text above.</div>';
      return;
    }

    historyList.innerHTML = '';
    items.slice(0, 10).forEach(item => {
      const el = document.createElement('div');
      el.className = 'history-item';
      el.innerHTML = `
        <div class="history-dot ${item.sentiment}"></div>
        <div class="history-text">${item.text}</div>
        <div class="history-meta">${Helpers.formatScore(item.score)} · ${Helpers.timeAgo(item.timestamp)}</div>`;
      el.addEventListener('click', () => {
        textInput.value = item.text;
        charCount.textContent = item.text.length;
        document.querySelector('[data-tab="text"]').click();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      historyList.appendChild(el);
    });
  }

  // ── Stats ──────────────────────────────────────────
  function updateStats() {
    const { total, positive, negative } = StorageService.getStats();
    document.querySelector('#totalAnalyzed .stat-num').textContent = total;
    document.getElementById('positiveCount').textContent = positive;
    document.getElementById('negativeCount').textContent = negative;
  }

  // ── Loading ────────────────────────────────────────
  function showLoading(msg) {
    loadingText.textContent = msg || 'Analyzing…';
    loadingOverlay.classList.remove('hidden');
  }

  function hideLoading() {
    loadingOverlay.classList.add('hidden');
  }

  // ── Start ──────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', init);
})();
