const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const PUPPETEER_TIMEOUT = parseInt(process.env.PUPPETEER_TIMEOUT) || 60000;

// Créer le dossier logs s'il n'existe pas
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Logger structuré
const logger = {
    levels: { debug: 0, info: 1, warn: 2, error: 3 },
    currentLevel: LOG_LEVEL,

    log(level, message, metadata = {}) {
        if (this.levels[level] >= this.levels[this.currentLevel]) {
            const logEntry = {
                timestamp: new Date().toISOString(),
                level,
                message,
                ...metadata
            };

            const logLine = JSON.stringify(logEntry) + '\n';

            // Console
            console.log(logLine.trim());

            // Fichier
            fs.appendFileSync(
                path.join(logsDir, 'app.log'),
                logLine,
                { encoding: 'utf8' }
            );
        }
    },

    debug(message, meta) { this.log('debug', message, meta); },
    info(message, meta) { this.log('info', message, meta); },
    warn(message, meta) { this.log('warn', message, meta); },
    error(message, meta) { this.log('error', message, meta); }
};

// Validation stricte des URLs
function validateUrl(urlString) {
    try {
        const url = new URL(urlString);

        // Accepter uniquement http et https
        if (!['http:', 'https:'].includes(url.protocol)) {
            return { valid: false, error: 'Seuls les protocoles HTTP et HTTPS sont autorisés' };
        }

        // Bloquer les URLs locales et privées
        const hostname = url.hostname.toLowerCase();
        const blockedPatterns = [
            /^localhost$/i,
            /^127\./,
            /^192\.168\./,
            /^10\./,
            /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
            /^0\./,
            /^\[?::1\]?$/,
            /^\[?fe80:/i
        ];

        if (blockedPatterns.some(pattern => pattern.test(hostname))) {
            return { valid: false, error: 'Les URLs locales et privées ne sont pas autorisées' };
        }

        // Vérifier la longueur
        if (urlString.length > 2048) {
            return { valid: false, error: 'URL trop longue (max 2048 caractères)' };
        }

        return { valid: true, url };
    } catch (error) {
        return { valid: false, error: 'Format d\'URL invalide' };
    }
}

// Validation des dimensions
function validateDimensions(width, height) {
    const w = parseInt(width);
    const h = parseInt(height);

    if (isNaN(w) || w < 320 || w > 3840) {
        return { valid: false, error: 'Largeur invalide (min: 320, max: 3840)' };
    }

    if (isNaN(h) || h < 240 || h > 2160) {
        return { valid: false, error: 'Hauteur invalide (min: 240, max: 2160)' };
    }

    return { valid: true, width: w, height: h };
}

app.use(express.json());
app.use(express.static(__dirname));

// Middleware de logging des requêtes
app.use((req, res, next) => {
    const startTime = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - startTime;
        logger.info('HTTP Request', {
            method: req.method,
            path: req.path,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip
        });
    });

    next();
});

app.post('/api/extract', async (req, res) => {
    const { url, width = 1920, height = 1080 } = req.body;

    // Validation URL
    if (!url) {
        logger.warn('Requête rejetée: URL manquante', { ip: req.ip });
        return res.status(400).json({ error: 'URL manquante' });
    }

    const urlValidation = validateUrl(url);
    if (!urlValidation.valid) {
        logger.warn('Requête rejetée: URL invalide', {
            url,
            reason: urlValidation.error,
            ip: req.ip
        });
        return res.status(400).json({ error: urlValidation.error });
    }

    // Validation dimensions
    const dimensionsValidation = validateDimensions(width, height);
    if (!dimensionsValidation.valid) {
        logger.warn('Requête rejetée: Dimensions invalides', {
            width,
            height,
            reason: dimensionsValidation.error,
            ip: req.ip
        });
        return res.status(400).json({ error: dimensionsValidation.error });
    }

    const validWidth = dimensionsValidation.width;
    const validHeight = dimensionsValidation.height;

    logger.info('Début extraction CSS critique', {
        url,
        width: validWidth,
        height: validHeight,
        ip: req.ip
    });

    let browser;
    const startTime = Date.now();

    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu'
            ]
        });

        const page = await browser.newPage();
        await page.setViewport({ width: validWidth, height: validHeight });

        logger.debug('Navigation vers l\'URL', { url });

        await page.goto(url, {
            waitUntil: 'networkidle2',
            timeout: PUPPETEER_TIMEOUT
        });

        const result = await page.evaluate(() => {
            const elements = document.querySelectorAll('*');
            const usedSelectors = new Set();
            let totalCSSSize = 0;

            elements.forEach(el => {
                const styles = window.getComputedStyle(el);
                if (styles.display !== 'none' && styles.visibility !== 'hidden') {
                    if (el.id) usedSelectors.add(`#${el.id}`);
                    if (el.className && typeof el.className === 'string') {
                        el.className.split(/\s+/).forEach(cls => {
                            if (cls) usedSelectors.add(`.${cls}`);
                        });
                    }
                    usedSelectors.add(el.tagName.toLowerCase());
                }
            });

            let critical = '';
            const sheets = Array.from(document.styleSheets);

            for (const sheet of sheets) {
                try {
                    const rules = Array.from(sheet.cssRules || []);
                    totalCSSSize += rules.reduce((acc, r) => acc + (r.cssText?.length || 0), 0);

                    for (const rule of rules) {
                        if (rule.type === 1) {
                            const selector = rule.selectorText;
                            let matches = false;

                            const parts = selector.split(/[,\s>+~]+/);
                            for (const part of parts) {
                                if (part && usedSelectors.has(part)) {
                                    matches = true;
                                    break;
                                }
                            }

                            if (matches) {
                                critical += rule.cssText + '\n';
                            }
                        } else if (rule.type === 4) {
                            const mediaRules = Array.from(rule.cssRules);
                            let mediaContent = '';

                            for (const innerRule of mediaRules) {
                                if (innerRule.type === 1) {
                                    const selector = innerRule.selectorText;
                                    let matches = false;

                                    const parts = selector.split(/[,\s>+~]+/);
                                    for (const part of parts) {
                                        if (part && usedSelectors.has(part)) {
                                            matches = true;
                                            break;
                                        }
                                    }

                                    if (matches) {
                                        mediaContent += '  ' + innerRule.cssText + '\n';
                                    }
                                }
                            }

                            if (mediaContent) {
                                critical += `@media ${rule.conditionText} {\n${mediaContent}}\n`;
                            }
                        }
                    }
                } catch (e) {
                    // Skip CORS-blocked stylesheets
                }
            }

            return {
                css: critical,
                originalSize: totalCSSSize,
                usedSelectorsCount: usedSelectors.size
            };
        });

        await browser.close();

        const duration = Date.now() - startTime;
        const cssSize = result.css.length;
        const rulesCount = (result.css.match(/\{/g) || []).length;

        logger.info('Extraction réussie', {
            url,
            cssSize,
            originalSize: result.originalSize,
            rulesCount,
            usedSelectorsCount: result.usedSelectorsCount,
            duration: `${duration}ms`
        });

        res.json({
            css: result.css,
            originalSize: result.originalSize,
            rulesCount,
            usedSelectorsCount: result.usedSelectorsCount
        });

    } catch (error) {
        const duration = Date.now() - startTime;

        logger.error('Erreur lors de l\'extraction', {
            url,
            error: error.message,
            stack: error.stack,
            duration: `${duration}ms`
        });

        if (browser) {
            try {
                await browser.close();
            } catch (closeError) {
                logger.error('Erreur lors de la fermeture du navigateur', {
                    error: closeError.message
                });
            }
        }

        res.status(500).json({
            error: error.message
        });
    }
});

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'nodejs-css-extractor',
        version: '1.1.0',
        uptime: process.uptime()
    });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
    logger.error('Erreur non gérée', {
        error: err.message,
        stack: err.stack,
        path: req.path
    });

    res.status(500).json({
        error: 'Une erreur interne est survenue'
    });
});

// Démarrage du serveur
app.listen(PORT, () => {
    logger.info('Serveur démarré', {
        port: PORT,
        env: process.env.NODE_ENV || 'development',
        nodeVersion: process.version,
        logLevel: LOG_LEVEL
    });
    console.log(`\n🚀 NodeJS.CSS.Extractor v1.1.0`);
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`📊 API: http://localhost:${PORT}/api/extract`);
    console.log(`📝 Logs: ${path.join(logsDir, 'app.log')}\n`);
});
