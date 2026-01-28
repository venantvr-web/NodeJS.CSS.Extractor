/**
 * Tests unitaires pour les fonctions de validation
 */

// Extraction des fonctions de validation depuis server.js
// En production, ces fonctions devraient être dans un module séparé

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
            /^0\./,
            /^\[?::1\]?$/,
            /^\[?fe80:/i
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

describe('Validation des URLs', () => {
    test('URL valide HTTPS', () => {
        const result = validateUrl('https://example.com');
        expect(result.valid).toBe(true);
    });

    test('URL valide HTTP', () => {
        const result = validateUrl('http://example.com/page');
        expect(result.valid).toBe(true);
    });

    test('Rejette protocole FTP', () => {
        const result = validateUrl('ftp://example.com');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('HTTP et HTTPS');
    });

    test('Rejette protocole file', () => {
        const result = validateUrl('file:///etc/passwd');
        expect(result.valid).toBe(false);
    });

    test('Rejette localhost', () => {
        const result = validateUrl('http://localhost:3000');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('locales');
    });

    test('Rejette 127.0.0.1', () => {
        const result = validateUrl('http://127.0.0.1');
        expect(result.valid).toBe(false);
    });

    test('Rejette 192.168.x.x', () => {
        const result = validateUrl('http://192.168.1.1');
        expect(result.valid).toBe(false);
    });

    test('Rejette 10.x.x.x', () => {
        const result = validateUrl('http://10.0.0.1');
        expect(result.valid).toBe(false);
    });

    test('Rejette 172.16-31.x.x', () => {
        const result = validateUrl('http://172.16.0.1');
        expect(result.valid).toBe(false);
    });

    test('Rejette URL invalide', () => {
        const result = validateUrl('not a url');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('invalide');
    });

    test('Rejette URL trop longue', () => {
        const longUrl = 'https://example.com/' + 'a'.repeat(2050);
        const result = validateUrl(longUrl);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('trop longue');
    });

    test('Accepte URL avec paramètres', () => {
        const result = validateUrl('https://example.com/page?param=value&other=123');
        expect(result.valid).toBe(true);
    });

    test('Accepte URL avec fragment', () => {
        const result = validateUrl('https://example.com/page#section');
        expect(result.valid).toBe(true);
    });
});

describe('Validation des dimensions', () => {
    test('Dimensions valides standard', () => {
        const result = validateDimensions(1920, 1080);
        expect(result.valid).toBe(true);
        expect(result.width).toBe(1920);
        expect(result.height).toBe(1080);
    });

    test('Dimensions valides minimales', () => {
        const result = validateDimensions(320, 240);
        expect(result.valid).toBe(true);
    });

    test('Dimensions valides maximales', () => {
        const result = validateDimensions(3840, 2160);
        expect(result.valid).toBe(true);
    });

    test('Largeur trop petite', () => {
        const result = validateDimensions(200, 1080);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('Largeur');
    });

    test('Largeur trop grande', () => {
        const result = validateDimensions(5000, 1080);
        expect(result.valid).toBe(false);
    });

    test('Hauteur trop petite', () => {
        const result = validateDimensions(1920, 100);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('Hauteur');
    });

    test('Hauteur trop grande', () => {
        const result = validateDimensions(1920, 3000);
        expect(result.valid).toBe(false);
    });

    test('Largeur non numérique', () => {
        const result = validateDimensions('abc', 1080);
        expect(result.valid).toBe(false);
    });

    test('Hauteur non numérique', () => {
        const result = validateDimensions(1920, 'xyz');
        expect(result.valid).toBe(false);
    });

    test('Conversion de chaînes numériques', () => {
        const result = validateDimensions('1920', '1080');
        expect(result.valid).toBe(true);
        expect(result.width).toBe(1920);
        expect(result.height).toBe(1080);
    });
});
