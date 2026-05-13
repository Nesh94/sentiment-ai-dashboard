/**
 * resultsRenderer.js
 * Renders single and bulk sentiment analysis results into the DOM.
 */

const ResultsRenderer = (() => {

  function renderSingle(result) {
    const section = document.getElementById('resultsSection');
    const singleDiv = document.getElementById('singleResult');
    const bulkDiv = document.getElementById('bulkResult');

    section.classList.remove('hidden');
    singleDiv.classList.remove('hidden');
    bulkDiv.classList.add('hidden');

    // Meter
    const pct = Helpers.scoreToPercent(result.score);
    document.getElementById('meterThumb').style.left = pct + '%';

    // Badge
    const badge = document.getElementById('resultBadge');
    badge.textContent = result.sentiment.toUpperCase();
    badge.className = 'result-badge ' + result.sentiment;

    // Score & confidence
    document.getElementById('resultScore').textContent = Helpers.formatScore(result.score);
    document.getElementById('resultScore').style.color = Helpers.sentimentColor(result.sentiment);
    document.getElementById('resultConfidence').textContent = `${result.confidence}% confidence · ${result.language || 'English'}`;

    // Emotions
    const emotionsList = document.getElementById('emotionsList');
    emotionsList.innerHTML = '';
    (result.emotions || []).forEach(em => {
      const tag = document.createElement('div');
      tag.className = 'emotion-tag';
      tag.innerHTML = `<span class="e-icon">${em.emoji}</span><span>${em.label}</span><span style="color:var(--text-3);font-size:11px">${em.intensity}%</span>`;
      emotionsList.appendChild(tag);
    });

    // Keywords
    const keywordsList = document.getElementById('keywordsList');
    keywordsList.innerHTML = '';
    (result.keywords || []).forEach(kw => {
      const tag = document.createElement('span');
      tag.className = 'keyword-tag';
      tag.textContent = kw;
      keywordsList.appendChild(tag);
    });

    // Summary
    document.getElementById('summaryText').textContent = result.summary || '';

    // Tone bars
    const toneBars = document.getElementById('toneBars');
    toneBars.innerHTML = '';
    const toneColors = { joy: '#3ecf8e', anger: '#f26060', sadness: '#7e90f0', fear: '#c070e0', surprise: '#e8a020' };
    Object.entries(result.tones || {}).forEach(([tone, val]) => {
      const row = document.createElement('div');
      row.className = 'tone-row';
      row.innerHTML = `
        <span class="tone-label">${tone.charAt(0).toUpperCase() + tone.slice(1)}</span>
        <div class="tone-track"><div class="tone-bar" style="width:${val}%;background:${toneColors[tone] || 'var(--accent)'}"></div></div>
        <span class="tone-pct">${val}%</span>`;
      toneBars.appendChild(row);
    });

    // Recommendations
    const recList = document.getElementById('recommendList');
    recList.innerHTML = '';
    (result.recommendations || []).forEach(rec => {
      const li = document.createElement('li');
      li.textContent = rec;
      recList.appendChild(li);
    });

    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderBulk(results) {
    const section = document.getElementById('resultsSection');
    const singleDiv = document.getElementById('singleResult');
    const bulkDiv = document.getElementById('bulkResult');

    section.classList.remove('hidden');
    singleDiv.classList.add('hidden');
    bulkDiv.classList.remove('hidden');

    // Stats
    const counts = { positive: 0, negative: 0, neutral: 0, mixed: 0 };
    results.forEach(r => { if (counts[r.sentiment] !== undefined) counts[r.sentiment]++; });
    const avgScore = results.reduce((s, r) => s + (r.score || 0), 0) / results.length;

    const statsRow = document.getElementById('bulkStatsRow');
    statsRow.innerHTML = '';
    [
      { label: 'Total', num: results.length, color: 'var(--text)' },
      { label: 'Positive', num: counts.positive, color: 'var(--positive)' },
      { label: 'Negative', num: counts.negative, color: 'var(--negative)' },
      { label: 'Neutral', num: counts.neutral, color: 'var(--neutral)' },
      { label: 'Mixed', num: counts.mixed, color: 'var(--mixed)' },
      { label: 'Avg Score', num: Helpers.formatScore(avgScore), color: Helpers.sentimentColor(avgScore >= 0.2 ? 'positive' : avgScore <= -0.2 ? 'negative' : 'neutral') }
    ].forEach(s => {
      const card = document.createElement('div');
      card.className = 'bulk-stat-card';
      card.innerHTML = `<div class="bulk-stat-num" style="color:${s.color}">${s.num}</div><div class="bulk-stat-label">${s.label}</div>`;
      statsRow.appendChild(card);
    });

    // Chart
    ChartHelper.drawBulkChart('bulkChart', results);

    // Table
    const tbody = document.getElementById('bulkTableBody');
    tbody.innerHTML = '';
    results.forEach((r, i) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${i + 1}</td>
        <td class="text-cell" title="${r.text}">${Helpers.truncate(r.text, 70)}</td>
        <td><span class="badge-sm ${r.sentiment}">${r.sentiment}</span></td>
        <td style="font-family:var(--font-mono);color:${Helpers.sentimentColor(r.sentiment)}">${Helpers.formatScore(r.score)}</td>
        <td style="font-family:var(--font-mono);color:var(--text-3)">${r.confidence}%</td>`;
      tbody.appendChild(tr);
    });

    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function hide() {
    document.getElementById('resultsSection').classList.add('hidden');
  }

  return { renderSingle, renderBulk, hide };
})();
