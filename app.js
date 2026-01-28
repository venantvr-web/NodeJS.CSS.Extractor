let criticalCSS = '';

document.getElementById('extractForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const url = document.getElementById('url').value;
    const width = parseInt(document.getElementById('width').value);
    const height = parseInt(document.getElementById('height').value);

    await extractCriticalCSS(url, width, height);
});

document.getElementById('downloadBtn').addEventListener('click', () => {
    downloadCSS();
});

async function extractCriticalCSS(url, width, height) {
    const extractBtn = document.getElementById('extractBtn');
    const status = document.getElementById('status');
    const progress = document.getElementById('progress');
    const results = document.getElementById('results');

    extractBtn.disabled = true;
    status.className = 'status';
    results.classList.remove('show');
    progress.classList.add('show');

    try {
        updateProgress(20, 'Envoi de la requête au serveur...');

        const response = await fetch('/api/extract', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url, width, height })
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }

        updateProgress(100, 'Extraction terminée!');

        const data = await response.json();

        criticalCSS = data.css;

        showResults(data);

        status.textContent = '✅ CSS critique extrait avec succès!';
        status.className = 'status success show';

    } catch (error) {
        console.error('Erreur:', error);
        status.textContent = `❌ Erreur: ${error.message}`;
        status.className = 'status error show';
    } finally {
        extractBtn.disabled = false;
        progress.classList.remove('show');
    }
}

function updateProgress(percent, text) {
    document.getElementById('progressFill').style.width = percent + '%';
    document.getElementById('progressText').textContent = text;
}

function showResults(data) {
    const results = document.getElementById('results');

    const sizeKB = (data.css.length / 1024).toFixed(2);
    const reduction = data.originalSize > 0
        ? ((1 - data.css.length / data.originalSize) * 100).toFixed(2)
        : 0;

    document.getElementById('cssSize').textContent = sizeKB + ' KB';
    document.getElementById('reduction').textContent = reduction + '%';
    document.getElementById('rulesCount').textContent = data.rulesCount || countRules(data.css);

    const preview = document.getElementById('preview');
    preview.textContent = data.css.substring(0, 5000) + (data.css.length > 5000 ? '\n\n... (tronqué)' : '');

    results.classList.add('show');
}

function countRules(css) {
    return (css.match(/\{/g) || []).length;
}

function downloadCSS() {
    const blob = new Blob([criticalCSS], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'critical.css';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
