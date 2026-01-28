# Guide de référence rapide - NodeJS.CSS.Extractor

## 🚀 Commandes de démarrage

```bash
# Installation des dépendances
npm install

# Démarrage en mode développement (avec nodemon)
npm run dev

# Démarrage en mode production
npm start

# Démarrage en arrière-plan
nohup node server.js > server.log 2>&1 &
```

## 🧪 Tests

```bash
# Lancer tous les tests avec couverture
npm test

# Tests en mode watch (re-exécution automatique)
npm run test:watch

# Couverture de code détaillée
npm run test:coverage

# Tests d'un fichier spécifique
npx jest __tests__/validation.test.js
```

## 📝 Logs

```bash
# Voir les logs en temps réel
tail -f logs/app.log

# Voir les 50 dernières lignes
tail -50 logs/app.log

# Filtrer par niveau (error)
grep '"level":"error"' logs/app.log

# Filtrer par niveau (warn)
grep '"level":"warn"' logs/app.log

# Voir uniquement les requêtes HTTP
grep '"message":"HTTP Request"' logs/app.log

# Compter les erreurs
grep -c '"level":"error"' logs/app.log
```

## 🔍 Tests de l'API

### Health Check
```bash
# Simple
curl http://localhost:3000/health

# Formaté (si jq installé)
curl -s http://localhost:3000/health | jq .
```

### Extraction CSS (succès)
```bash
curl -X POST http://localhost:3000/api/extract \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "width": 1920,
    "height": 1080
  }'
```

### Tests de validation (erreurs attendues)

**URL manquante:**
```bash
curl -X POST http://localhost:3000/api/extract \
  -H "Content-Type: application/json" \
  -d '{}'
# => {"error":"URL manquante"}
```

**Localhost bloqué:**
```bash
curl -X POST http://localhost:3000/api/extract \
  -H "Content-Type: application/json" \
  -d '{"url":"http://localhost:3000"}'
# => {"error":"Les URLs locales et privées ne sont pas autorisées"}
```

**IP privée bloquée:**
```bash
curl -X POST http://localhost:3000/api/extract \
  -H "Content-Type: application/json" \
  -d '{"url":"http://192.168.1.1"}'
# => {"error":"Les URLs locales et privées ne sont pas autorisées"}
```

**Protocole invalide:**
```bash
curl -X POST http://localhost:3000/api/extract \
  -H "Content-Type: application/json" \
  -d '{"url":"ftp://example.com"}'
# => {"error":"Seuls les protocoles HTTP et HTTPS sont autorisés"}
```

**Dimensions invalides:**
```bash
curl -X POST http://localhost:3000/api/extract \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","width":100,"height":100}'
# => {"error":"Largeur invalide (min: 320, max: 3840)"}
```

## 🔧 Gestion du processus

### Vérifier si le serveur tourne
```bash
# Par nom de processus
ps aux | grep "node server.js" | grep -v grep

# Par port
lsof -i :3000
```

### Arrêter le serveur
```bash
# Trouver le PID
PID=$(ps aux | grep "node server.js" | grep -v grep | awk '{print $2}')

# Arrêter proprement
kill $PID

# Arrêter de force (si nécessaire)
kill -9 $PID
```

### Redémarrer le serveur
```bash
# Arrêter et redémarrer
npm start

# Ou avec PM2
pm2 restart nodejs-css-extractor
```

## 📦 PM2 (Production)

### Installation et configuration
```bash
# Installer PM2 globalement
npm install -g pm2

# Démarrer l'application
pm2 start server.js --name nodejs-css-extractor

# Configurer le démarrage automatique
pm2 startup
pm2 save
```

### Commandes PM2
```bash
# Voir le statut
pm2 status

# Voir les logs
pm2 logs nodejs-css-extractor

# Logs en temps réel
pm2 logs nodejs-css-extractor --lines 50

# Redémarrer
pm2 restart nodejs-css-extractor

# Arrêter
pm2 stop nodejs-css-extractor

# Supprimer
pm2 delete nodejs-css-extractor

# Voir les métriques
pm2 monit
```

## 🐳 systemd (Linux)

### Contrôle du service
```bash
# Démarrer
sudo systemctl start nodejs-css-extractor

# Arrêter
sudo systemctl stop nodejs-css-extractor

# Redémarrer
sudo systemctl restart nodejs-css-extractor

# Voir le statut
sudo systemctl status nodejs-css-extractor

# Activer au démarrage
sudo systemctl enable nodejs-css-extractor

# Voir les logs
sudo journalctl -u nodejs-css-extractor -f
```

## 🔒 Nginx

### Tester la configuration
```bash
# Vérifier la syntaxe
sudo nginx -t

# Recharger la configuration
sudo nginx -s reload

# Redémarrer Nginx
sudo systemctl restart nginx
```

## 📊 Monitoring

### Vérifier l'utilisation mémoire
```bash
# Processus Node.js
ps aux | grep node | awk '{print $6/1024 " MB"}'

# Avec PM2
pm2 show nodejs-css-extractor
```

### Analyser les logs
```bash
# Nombre de requêtes par endpoint
grep '"path":"/api/extract"' logs/app.log | wc -l

# Nombre d'erreurs
grep '"level":"error"' logs/app.log | wc -l

# Temps de réponse moyen (approximatif)
grep '"duration"' logs/app.log | grep -o '"duration":"[0-9]*ms"' | grep -o '[0-9]*'
```

## 🧹 Maintenance

### Nettoyer les logs
```bash
# Vider les logs (backup avant)
cp logs/app.log logs/app.log.backup
> logs/app.log

# Rotation des logs (manuel)
mv logs/app.log logs/app.log.$(date +%Y%m%d)
touch logs/app.log
```

### Mettre à jour les dépendances
```bash
# Vérifier les updates disponibles
npm outdated

# Mettre à jour (attention aux breaking changes)
npm update

# Audit de sécurité
npm audit

# Corriger les vulnérabilités
npm audit fix
```

## 🔍 Debugging

### Mode debug Node.js
```bash
# Avec inspect
node --inspect server.js

# Mode verbose
DEBUG=* node server.js

# Avec LOG_LEVEL=debug
LOG_LEVEL=debug node server.js
```

### Tester Puppeteer
```bash
# Mode non-headless (voir le navigateur)
# Modifier temporairement dans server.js: headless: false
```

## 📁 Structure du projet

```bash
# Voir la structure
tree -L 2 -I node_modules

# Taille du projet
du -sh .

# Nombre de lignes de code
find . -name "*.js" -not -path "./node_modules/*" | xargs wc -l
```

## 🌐 Accès à l'application

### Local
- Interface web: http://localhost:3000
- API: http://localhost:3000/api/extract
- Health: http://localhost:3000/health

### Avec Nginx (production)
- http://votre-domaine.com
- https://votre-domaine.com (avec SSL)

## 🔐 Sécurité

### Vérifier les permissions
```bash
# Fichiers
ls -la

# Logs ne doivent pas être en root
ls -la logs/

# Owner recommandé: www-data ou utilisateur non-privilégié
sudo chown -R www-data:www-data /var/www/NodeJS.CSS.Extractor
```

### Variables d'environnement
```bash
# Créer .env depuis l'exemple
cp .env.example .env

# Éditer les valeurs
nano .env

# Ne JAMAIS commiter .env
git status  # .env doit être dans .gitignore
```

## 📚 Documentation

### Générer la doc
```bash
# Lire le README
cat README.md

# Voir le changelog
cat CHANGELOG.md

# Résumé de l'implémentation
cat IMPLEMENTATION_SUMMARY.md
```

## 🎯 Workflow complet

### Développement
```bash
# 1. Cloner/Télécharger
cd /var/www/NodeJS.CSS.Extractor

# 2. Installer
npm install

# 3. Tester
npm test

# 4. Lancer en dev
npm run dev

# 5. Tester l'API
curl http://localhost:3000/health
```

### Déploiement
```bash
# 1. Pull les derniers changements
git pull

# 2. Installer les dépendances
npm install --production

# 3. Lancer les tests
npm test

# 4. Démarrer avec PM2
pm2 start server.js --name nodejs-css-extractor

# 5. Sauvegarder la config PM2
pm2 save

# 6. Vérifier
pm2 status
curl http://localhost:3000/health
```

---

## 📞 Aide

Pour plus d'informations, consultez:
- README.md - Documentation complète
- IMPLEMENTATION_SUMMARY.md - Détails techniques
- CHANGELOG.md - Historique des versions
- GitHub Issues - Problèmes connus et solutions
