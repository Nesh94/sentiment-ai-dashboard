/**
 * fileUpload.js
 * Handles CSV / TXT file drag-drop and upload.
 */

const FileUpload = (() => {
  let parsedTexts = [];

  function init(onFileParsed) {
    const zone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('fileInput');
    const preview = document.getElementById('bulkPreview');
    const infoEl = document.getElementById('bulkInfo');

    // Drag events
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', e => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    });
    zone.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', () => {
      if (fileInput.files[0]) processFile(fileInput.files[0]);
    });

    function processFile(file) {
      const reader = new FileReader();
      reader.onload = e => {
        const content = e.target.result;
        parsedTexts = Helpers.parseCsv(content);
        if (parsedTexts.length === 0) {
          alert('No text entries found in the file.');
          return;
        }
        infoEl.textContent = `✓ ${parsedTexts.length} entries loaded from "${file.name}"`;
        preview.classList.remove('hidden');
        if (onFileParsed) onFileParsed(parsedTexts);
      };
      reader.readAsText(file);
    }
  }

  function getTexts() { return parsedTexts; }

  return { init, getTexts };
})();
