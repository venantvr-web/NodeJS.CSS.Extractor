/**
 * Tests d'intégration de l'API
 * Note: Ces tests ne lancent pas de vraies extractions Puppeteer
 */

const request = require('supertest');
const express = require('express');

// Mock d'une version simplifiée du serveur pour les tests
function createTestApp() {
    const app = express();
    app.use(express.json());

    // Réutiliser les fonctions de validation
    function validateUrl(urlString) {
        try {
            const url = new URL(urlString);
            if (!['http:', 'https:'].includes(url.protocol)) {
                return { valid: false, error: 'Seuls les protocoles HTTP et HTTPS sont autorisés' };
            }
            const hostname = url.hostname.toLowerCase();
            const blockedPatterns = [
                /^localhost$/i,
                /^127\./,
                /^192\.168\./,
                /^10\./,
                /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
            ];
            if (blockedPatterns.some(pattern => pattern.test(hostname))) {
                return { valid: false, error: 'Les URLs locales et privées ne sont pas autorisées' };
            }
            if (urlString.length > 2048) {
                return { valid: false, error: 'URL trop longue (max 2048 caractères)' };
            }
            return { valid: true, url };
        } catch (error) {
            return { valid: false, error: 'Format d\'URL invalide' };
        }
    }

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

    app.post('/api/extract', async (req, res) => {
        const { url, width = 1920, height = 1080 } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'URL manquante' });
        }

        const urlValidation = validateUrl(url);
        if (!urlValidation.valid) {
            return res.status(400).json({ error: urlValidation.error });
        }

        const dimensionsValidation = validateDimensions(width, height);
        if (!dimensionsValidation.valid) {
            return res.status(400).json({ error: dimensionsValidation.error });
        }

        // Mock response au lieu d'exécuter Puppeteer
        res.json({
            css: '/* Mock CSS */',
            originalSize: 1000,
            rulesCount: 10,
            usedSelectorsCount: 20
        });
    });

    app.get('/health', (req, res) => {
        res.json({
            status: 'ok',
            service: 'nodejs-css-extractor',
            version: '1.1.0'
        });
    });

    return app;
}

describe('API Endpoints', () => {
    let app;

    beforeAll(() => {
        app = createTestApp();
    });

    describe('GET /health', () => {
        test('Retourne status ok', async () => {
            const response = await request(app).get('/health');

            expect(response.status).toBe(200);
            expect(response.body.status).toBe('ok');
            expect(response.body.service).toBe('nodejs-css-extractor');
        });
    });

    describe('POST /api/extract', () => {
        test('Requête valide retourne succès', async () => {
            const response = await request(app)
                .post('/api/extract')
                .send({
                    url: 'https://example.com',
                    width: 1920,
                    height: 1080
                })
                .set('Content-Type', 'application/json');

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('css');
            expect(response.body).toHaveProperty('rulesCount');
        });

        test('URL manquante retourne 400', async () => {
            const response = await request(app)
                .post('/api/extract')
                .send({})
                .set('Content-Type', 'application/json');

            expect(response.status).toBe(400);
            expect(response.body.error).toContain('manquante');
        });

        test('URL invalide retourne 400', async () => {
            const response = await request(app)
                .post('/api/extract')
                .send({ url: 'not a url' })
                .set('Content-Type', 'application/json');

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        test('Protocole invalide retourne 400', async () => {
            const response = await request(app)
                .post('/api/extract')
                .send({ url: 'ftp://example.com' })
                .set('Content-Type', 'application/json');

            expect(response.status).toBe(400);
            expect(response.body.error).toContain('HTTP');
        });

        test('URL localhost bloquée', async () => {
            const response = await request(app)
                .post('/api/extract')
                .send({ url: 'http://localhost:3000' })
                .set('Content-Type', 'application/json');

            expect(response.status).toBe(400);
            expect(response.body.error).toContain('locales');
        });

        test('URL IP privée bloquée', async () => {
            const response = await request(app)
                .post('/api/extract')
                .send({ url: 'http://192.168.1.1' })
                .set('Content-Type', 'application/json');

            expect(response.status).toBe(400);
        });

        test('Dimensions invalides retourne 400', async () => {
            const response = await request(app)
                .post('/api/extract')
                .send({
                    url: 'https://example.com',
                    width: 100,
                    height: 100
                })
                .set('Content-Type', 'application/json');

            expect(response.status).toBe(400);
            expect(response.body.error).toContain('invalide');
        });

        test('Largeur hors limites retourne 400', async () => {
            const response = await request(app)
                .post('/api/extract')
                .send({
                    url: 'https://example.com',
                    width: 5000,
                    height: 1080
                })
                .set('Content-Type', 'application/json');

            expect(response.status).toBe(400);
        });

        test('Dimensions par défaut si non spécifiées', async () => {
            const response = await request(app)
                .post('/api/extract')
                .send({ url: 'https://example.com' })
                .set('Content-Type', 'application/json');

            expect(response.status).toBe(200);
        });

        test('URL avec paramètres acceptée', async () => {
            const response = await request(app)
                .post('/api/extract')
                .send({ url: 'https://example.com/page?param=value' })
                .set('Content-Type', 'application/json');

            expect(response.status).toBe(200);
        });
    });
});
