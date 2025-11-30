#!/bin/bash

# 🧹 Script de Nettoyage - Suppression des Anciens Dossiers
# ⚠️  À exécuter UNIQUEMENT après validation complète de l'application

echo "🧹 Nettoyage des anciens dossiers de la migration..."
echo ""

# Sauvegarder les dossiers avant suppression (optionnel)
echo "📦 Création d'une sauvegarde..."
BACKUP_DIR=".migration_backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Copier les anciens dossiers dans le backup
cp -r src/components/dashboard "$BACKUP_DIR/" 2>/dev/null
cp -r src/components/quest "$BACKUP_DIR/" 2>/dev/null
cp -r src/components/gamification "$BACKUP_DIR/" 2>/dev/null
cp -r src/components/impact "$BACKUP_DIR/" 2>/dev/null

echo "✅ Sauvegarde créée dans: $BACKUP_DIR"
echo ""

# Supprimer les anciens dossiers
echo "🗑️  Suppression des anciens dossiers..."

# Dashboard (migré vers features/dashboard/)
if [ -d "src/components/dashboard" ]; then
    echo "  - Suppression de src/components/dashboard/"
    rm -rf src/components/dashboard
fi

# Quest (migré vers features/quests/)
if [ -d "src/components/quest" ]; then
    echo "  - Suppression de src/components/quest/"
    rm -rf src/components/quest
fi

# Gamification (migré vers features/gamification/)
if [ -d "src/components/gamification" ]; then
    echo "  - Suppression de src/components/gamification/"
    rm -rf src/components/gamification
fi

# Impact (migré vers features/impact/)
if [ -d "src/components/impact" ]; then
    echo "  - Suppression de src/components/impact/"
    rm -rf src/components/impact
fi

echo ""
echo "✅ Nettoyage terminé !"
echo ""
echo "📊 Résumé:"
echo "  - Anciens dossiers supprimés"
echo "  - Sauvegarde dans: $BACKUP_DIR"
echo "  - Architecture finale: 100% propre ✨"
echo ""
echo "⚠️  Si besoin de rollback: cp -r $BACKUP_DIR/* src/components/"
echo ""
