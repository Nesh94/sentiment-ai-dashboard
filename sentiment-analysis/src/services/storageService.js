/**
 * storageService.js
 * Manages analysis history in localStorage.
 */

const StorageService = (() => {
  const KEY = 'sentimentai_history';
  const MAX_ITEMS = 50;

  function getAll() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || '[]');
    } catch { return []; }
  }

  function save(entry) {
    const items = getAll();
    items.unshift({ id: Date.now(), timestamp: new Date().toISOString(), ...entry });
    if (items.length > MAX_ITEMS) items.splice(MAX_ITEMS);
    localStorage.setItem(KEY, JSON.stringify(items));
  }

  function clear() {
    localStorage.removeItem(KEY);
  }

  function getStats() {
    const items = getAll();
    const total = items.length;
    const positive = items.filter(i => i.sentiment === 'positive').length;
    const negative = items.filter(i => i.sentiment === 'negative').length;
    return { total, positive, negative };
  }

  return { getAll, save, clear, getStats };
})();
