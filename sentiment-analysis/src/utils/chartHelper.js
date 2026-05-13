/**
 * chartHelper.js
 * Simple canvas-based bar chart for bulk results.
 */

const ChartHelper = (() => {
  function drawBulkChart(canvasId, results) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const PAD = { top: 30, right: 30, bottom: 50, left: 50 };

    // Tally
    const counts = { positive: 0, negative: 0, neutral: 0, mixed: 0 };
    results.forEach(r => { if (counts[r.sentiment] !== undefined) counts[r.sentiment]++; });

    const categories = ['positive', 'negative', 'neutral', 'mixed'];
    const colors = { positive: '#3ecf8e', negative: '#f26060', neutral: '#7e90f0', mixed: '#c070e0' };
    const labels = { positive: 'Positive', negative: 'Negative', neutral: 'Neutral', mixed: 'Mixed' };
    const values = categories.map(c => counts[c]);
    const maxVal = Math.max(...values, 1);

    const chartW = W - PAD.left - PAD.right;
    const chartH = H - PAD.top - PAD.bottom;
    const barW = Math.min(80, (chartW / categories.length) * 0.55);
    const gap = chartW / categories.length;

    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = '#141418';
    ctx.fillRect(0, 0, W, H);

    // Grid lines
    ctx.strokeStyle = '#2a2a35';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = PAD.top + chartH - (i / 4) * chartH;
      ctx.beginPath();
      ctx.moveTo(PAD.left, y);
      ctx.lineTo(W - PAD.right, y);
      ctx.stroke();
      ctx.fillStyle = '#6a6870';
      ctx.font = '11px DM Mono, monospace';
      ctx.textAlign = 'right';
      ctx.fillText(Math.round((i / 4) * maxVal), PAD.left - 8, y + 4);
    }

    // Bars
    categories.forEach((cat, i) => {
      const val = values[i];
      const barH = val === 0 ? 0 : Math.max(4, (val / maxVal) * chartH);
      const x = PAD.left + i * gap + (gap - barW) / 2;
      const y = PAD.top + chartH - barH;

      // Gradient
      const grad = ctx.createLinearGradient(0, y, 0, y + barH);
      grad.addColorStop(0, colors[cat]);
      grad.addColorStop(1, colors[cat] + '88');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, y, barW, barH, [6, 6, 0, 0]);
      ctx.fill();

      // Value on top
      ctx.fillStyle = '#f0ede8';
      ctx.font = 'bold 14px Manrope, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(val, x + barW / 2, y - 8);

      // Category label
      ctx.fillStyle = '#a09d98';
      ctx.font = '12px Manrope, sans-serif';
      ctx.fillText(labels[cat], x + barW / 2, H - PAD.bottom + 20);
    });
  }

  return { drawBulkChart };
})();
