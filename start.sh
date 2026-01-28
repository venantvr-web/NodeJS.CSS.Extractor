#!/bin/bash

cd "$(dirname "$0")"

echo "🚀 Démarrage de Critical CSS Extractor..."

if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
fi

echo "✓ Démarrage du serveur sur http://localhost:3000"
node server.js
