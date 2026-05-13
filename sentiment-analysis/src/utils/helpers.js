/**
 * helpers.js
 * Shared utility functions.
 */

const Helpers = (() => {
  function scoreToPercent(score) {
    // score: -1 to 1 → 0 to 100
    return Math.round(((score + 1) / 2) * 100);
  }

  function formatScore(score) {
    const s = parseFloat(score);
    return (s >= 0 ? '+' : '') + s.toFixed(2);
  }

  function sentimentColor(sentiment) {
    const map = {
      positive: 'var(--positive)',
      negative: 'var(--negative)',
      neutral: 'var(--neutral)',
      mixed: 'var(--mixed)'
    };
    return map[sentiment] || 'var(--text-2)';
  }

  function timeAgo(isoString) {
    const diff = Date.now() - new Date(isoString).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  }

  function truncate(str, len = 80) {
    if (!str) return '';
    return str.length > len ? str.slice(0, len) + '…' : str;
  }

  function parseCsv(text) {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return [];
    
    // Check if it has a header with "text" column
    const header = lines[0].toLowerCase().split(',');
    const textIdx = header.indexOf('text');
    
    if (textIdx !== -1) {
      // Has header — extract "text" column
      return lines.slice(1).map(line => {
        const cols = line.split(',');
        return (cols[textIdx] || '').replace(/^"|"$/g, '').trim();
      }).filter(Boolean);
    } else {
      // Treat each line as text (plain list)
      return lines.map(l => l.replace(/^"|"$/g, '').trim()).filter(Boolean);
    }
  }

  return { scoreToPercent, formatScore, sentimentColor, timeAgo, truncate, parseCsv };
})();
