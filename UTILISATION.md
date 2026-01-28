# 🎨 Critical CSS Extractor - Guide d'utilisation

## Accès rapide

L'application est accessible sur: **http://localhost:3500**

## Utilisation simple

1. **Ouvrir l'interface**
   ```
   http://localhost:3500
   ```

2. **Entrer l'URL à analyser**
   - Par défaut: `https://www.concilio.com/endocrinologie`
   - Vous pouvez tester n'importe quelle URL publique

3. **Ajuster les dimensions (optionnel)**
   - Largeur: 1920px (défaut)
   - Hauteur: 1080px (défaut)

4. **Cliquer sur "Extraire le CSS Critique"**
   - Le serveur va charger la page avec Puppeteer
   - Analyser tous les sélecteurs CSS utilisés
   - Générer le fichier critique

5. **Télécharger critical.css**
   - Bouton "📥 Télécharger critical.css"
   - Le fichier est prêt à être utilisé

## Intégration dans WordPress

Une fois téléchargé, copiez `critical.css` dans le plugin:

```bash
cp ~/Downloads/critical.css /var/www/www.concilio.com/wp-content/plugins/concilio-static-seo/critical.css
```

Puis videz le cache:

```bash
rm -rf /var/www/www.concilio.com/static-cache/endocrinologie
```

Le CSS critique sera automatiquement injecté dans les prochaines pages cachées.

## API

### Extraction via curl

```bash
curl -X POST http://localhost:3500/api/extract \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.concilio.com/endocrinologie",
    "width": 1920,
    "height": 1080
  }' | jq -r '.css' > critical.css
```

### Vérifier le statut

```bash
curl http://localhost:3500/health
```

## Démarrage/Arrêt

### Démarrage manuel
```bash
cd /var/www/nodejs-css-extractor
./start.sh
```

### Avec PM2 (recommandé)
```bash
pm2 start server.js --name nodejs-css-extractor
pm2 save
```

### Arrêt
```bash
pm2 stop nodejs-css-extractor
```

## Logs

```bash
pm2 logs nodejs-css-extractor
```

## Performances

- **Taille moyenne**: 50-60 KB de CSS critique
- **Réduction**: 80-95% du CSS total
- **Temps d'extraction**: 5-15 secondes selon la page

## Dépannage

### Le serveur ne démarre pas
```bash
cd /var/www/nodejs-css-extractor
npm install
node server.js
```

### Port 3500 déjà utilisé
```bash
PORT=3501 node server.js
```

### Puppeteer ne fonctionne pas
```bash
# Installer les dépendances système
sudo apt-get install -y libgbm1 libasound2
```
