# 🎨 NodeJS.CSS.Extractor

[![Node.js](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Une application web moderne et performante pour extraire automatiquement le CSS critique de n'importe quelle page web. Optimisez vos temps de chargement en ne chargeant que le CSS nécessaire au rendu initial.

## ✨ Fonctionnalités

- 🚀 **Extraction automatique** du CSS critique via Puppeteer
- 📊 **Statistiques détaillées** (taille, réduction, nombre de règles)
- 🎯 **Analyse above-the-fold** avec dimensions personnalisables
- 📱 **Interface responsive** et intuitive
- 💾 **Téléchargement direct** du fichier `critical.css`
- 🔍 **Support des media queries** et sélecteurs complexes
- ⚡ **API REST** pour intégration dans vos workflows
- 🛡️ **Validation stricte** des URLs et sécurité renforcée
- 📝 **Logs structurés** pour monitoring et debugging
- ✅ **Tests automatisés** pour garantir la fiabilité

## 📋 Prérequis

- Node.js >= 14.0.0
- npm >= 6.0.0
- Chrome/Chromium (installé automatiquement par Puppeteer)

## 🚀 Installation

```bash
# Cloner le dépôt
git clone https://github.com/votre-username/nodejs-css-extractor.git
cd nodejs-css-extractor

# Installer les dépendances
npm install

# Lancer les tests (optionnel)
npm test
```

## 💻 Utilisation

### Démarrage en mode développement

```bash
npm run dev
```

### Démarrage en mode production

```bash
npm start
```

L'application sera disponible sur `http://localhost:3000`

### Interface Web

1. Ouvrir http://localhost:3000 dans votre navigateur
2. Entrer l'URL de la page à analyser
3. Ajuster les dimensions de la fenêtre si nécessaire (défaut: 1920x1080)
4. Cliquer sur "Extraire le CSS Critique"
5. Télécharger le fichier `critical.css` généré

## 🔌 API REST

### POST /api/extract

Extrait le CSS critique d'une URL donnée.

**Request:**
```bash
curl -X POST http://localhost:3000/api/extract \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "width": 1920,
    "height": 1080
  }'
```

**Body Parameters:**
| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `url` | string | Oui | URL complète de la page (http/https uniquement) |
| `width` | number | Non | Largeur viewport (320-3840, défaut: 1920) |
| `height` | number | Non | Hauteur viewport (240-2160, défaut: 1080) |

**Response Success (200):**
```json
{
  "css": "/* CSS critique extrait */",
  "originalSize": 341000,
  "rulesCount": 1250,
  "usedSelectorsCount": 450
}
```

**Response Error (400/500):**
```json
{
  "error": "URL invalide ou non accessible"
}
```

### GET /health

Vérifier l'état du service.

**Response:**
```json
{
  "status": "ok",
  "service": "nodejs-css-extractor"
}
```

## 🐳 Déploiement

### Avec PM2

```bash
# Installation globale de PM2
npm install -g pm2

# Démarrage
pm2 start server.js --name nodejs-css-extractor

# Configuration du démarrage automatique
pm2 save
pm2 startup
```

### Avec systemd

Créer un fichier `/etc/systemd/system/nodejs-css-extractor.service`:

```ini
[Unit]
Description=NodeJS.CSS.Extractor Service
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/nodejs-css-extractor
ExecStart=/usr/bin/node server.js
Restart=on-failure
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable nodejs-css-extractor
sudo systemctl start nodejs-css-extractor
```

### Configuration Nginx (Reverse Proxy)

```nginx
server {
    listen 80;
    server_name css-extractor.example.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;

        # Timeout pour les extractions longues
        proxy_read_timeout 90s;
    }
}
```

## 🧪 Tests

```bash
# Lancer tous les tests
npm test

# Tests avec couverture
npm run test:coverage

# Tests en mode watch
npm run test:watch
```

## 📊 Monitoring

L'application génère des logs structurés au format JSON pour faciliter le monitoring:

```bash
# Visualiser les logs en temps réel
tail -f logs/app.log

# Filtrer les erreurs uniquement
tail -f logs/app.log | grep '"level":"error"'
```

## ⚙️ Variables d'environnement

Créer un fichier `.env` à la racine:

```env
# Port du serveur
PORT=3000

# Niveau de log (debug, info, warn, error)
LOG_LEVEL=info

# Timeout Puppeteer (ms)
PUPPETEER_TIMEOUT=60000

# Désactiver le sandbox Puppeteer (non recommandé en production)
PUPPETEER_NO_SANDBOX=false
```

## 🛡️ Sécurité

- ✅ Validation stricte des URLs (http/https uniquement)
- ✅ Limitation des dimensions viewport
- ✅ Timeout sur les requêtes Puppeteer
- ✅ Gestion des erreurs CORS
- ✅ Logs d'audit pour traçabilité

**Note de sécurité**: En production, évitez d'utiliser le flag `--no-sandbox` de Puppeteer.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à:

1. Fork le projet
2. Créer une branche (`git checkout -b feature/amelioration`)
3. Commit vos changements (`git commit -m 'Ajout fonctionnalité'`)
4. Push vers la branche (`git push origin feature/amelioration`)
5. Ouvrir une Pull Request

## 📝 Changelog

### v1.1.0 (2025-01-28)
- Ajout validation stricte des URLs
- Implémentation des logs structurés
- Ajout des tests automatisés
- Amélioration de la sécurité

### v1.0.0
- Version initiale
- Extraction CSS critique
- Interface web
- API REST

## 📄 Licence

MIT © 2025

## 🙏 Remerciements

- [Puppeteer](https://pptr.dev/) - Automatisation Chrome headless
- [Express](https://expressjs.com/) - Framework web Node.js

## 📧 Support

Pour toute question ou problème, ouvrez une [issue](https://github.com/votre-username/nodejs-css-extractor/issues) sur GitHub.

## Stack

[![Stack](https://skillicons.dev/icons?i=nodejs,js,express,nginx,linux,git,css&theme=dark)](https://skillicons.dev)
