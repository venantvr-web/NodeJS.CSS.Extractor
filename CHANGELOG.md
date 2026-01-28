# Changelog

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [1.1.0] - 2026-01-28

### Ajouté
- Validation stricte des URLs avec blocage des protocoles non HTTP/HTTPS
- Blocage des URLs locales et des IP privées (localhost, 127.x, 192.168.x, 10.x, 172.16-31.x)
- Validation des dimensions viewport (min: 320x240, max: 3840x2160)
- Système de logs structurés au format JSON
- Logs dans fichier `logs/app.log` avec rotation
- Middleware de logging des requêtes HTTP avec durée
- Tests automatisés avec Jest et Supertest (34 tests)
- Test de validation des URLs
- Test de validation des dimensions
- Tests d'intégration de l'API
- Endpoint `/health` amélioré avec version et uptime
- Variables d'environnement (PORT, LOG_LEVEL, PUPPETEER_TIMEOUT)
- Fichier `.env.example` pour configuration
- Gestion améliorée des erreurs avec stack traces dans les logs
- Documentation complète dans README.md
- Section sécurité dans le README
- Instructions de déploiement (PM2, systemd, Nginx)
- Badges GitHub dans le README

### Modifié
- Migration vers version 1.1.0
- Amélioration de la structure du code avec fonctions de validation séparées
- Messages d'erreur plus explicites
- Timeout Puppeteer configurable via variable d'environnement
- Amélioration du `.gitignore` (ajout logs/, coverage/)
- Console de démarrage plus informative

### Sécurité
- Validation stricte empêchant les attaques SSRF
- Limitation de la longueur des URLs (max 2048 caractères)
- Validation des types et ranges pour les dimensions
- Logs d'audit pour traçabilité des requêtes

## [1.0.0] - 2026-01-28

### Ajouté
- Version initiale de l'application
- Extraction du CSS critique via Puppeteer
- API REST avec endpoint `/api/extract`
- Interface web responsive avec formulaire
- Affichage des statistiques (taille CSS, réduction, nombre de règles)
- Prévisualisation du CSS extrait
- Téléchargement du fichier `critical.css`
- Support des media queries
- Gestion des erreurs CORS
- Endpoint de santé `/health`
- Configuration des dimensions viewport
- Mode headless de Puppeteer
- Détection des éléments visibles (display/visibility)
- Extraction des sélecteurs utilisés (id, classes, tags)
- Timeout de 60 secondes pour les extractions

### Technique
- Express.js pour le serveur web
- Puppeteer pour l'automatisation Chrome
- Serveur de fichiers statiques
- Interface HTML/CSS/JS vanilla
- Scripts npm: start, dev (avec nodemon)

---

## Format des versions

### Types de changements
- **Ajouté** : pour les nouvelles fonctionnalités
- **Modifié** : pour les changements dans les fonctionnalités existantes
- **Déprécié** : pour les fonctionnalités bientôt supprimées
- **Supprimé** : pour les fonctionnalités supprimées
- **Corrigé** : pour les corrections de bugs
- **Sécurité** : pour les correctifs de vulnérabilités

### Numérotation sémantique (X.Y.Z)
- **X** (Majeure) : Changements incompatibles avec les versions précédentes
- **Y** (Mineure) : Ajout de fonctionnalités rétrocompatibles
- **Z** (Patch) : Corrections de bugs rétrocompatibles
