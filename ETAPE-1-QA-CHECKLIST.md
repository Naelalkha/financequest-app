# Étape 1 - QA Checklist

## ✅ Scénarios de Test Manuel

### 1. Hero sans données (total = 0)

**Objectif** : Vérifier le comportement quand aucune économie n'existe

- [ ] Ouvrir `/dashboard` avec un compte sans économies
- [ ] **Attendu** :
  - [ ] Hero visible avec "+€0/an"
  - [ ] Chip "Preuves : 0 vérifiée"
  - [ ] CTA primaire : "Démarrer un gain rapide (+€156/an)"
  - [ ] Lien secondaire : "Voir le détail"
  - [ ] Click CTA → navigation vers `/quests?quickwin=1`
  - [ ] Click "Voir le détail" → navigation vers `/impact`
  - [ ] Analytics `impact_viewed` envoyé avec `total_annual: 0`

### 2. Ajout manuel d'une économie (modal)

**Objectif** : Tester le formulaire d'ajout avec validation

- [ ] Aller sur `/impact`
- [ ] Click "Ajouter une économie"
- [ ] **Modal s'ouvre** :
  - [ ] Champs visibles : Titre, Montant, Période, Note
  - [ ] Période par défaut : "par mois"
  
**Tests de validation** :
- [ ] Soumettre sans titre → Erreur "Le titre est requis"
- [ ] Soumettre sans montant → Erreur "Le montant est requis"
- [ ] Entrer montant = 0 → Erreur "Le montant doit être supérieur à 0"
- [ ] Entrer montant négatif → Erreur "Le montant doit être supérieur à 0"

**Test de création réussie** :
- [ ] Remplir : Titre "Test", Montant "10", Période "par mois", Note "Preuve test"
- [ ] Soumettre
- [ ] **Attendu** :
  - [ ] Toast success : "Économie ajoutée avec succès !"
  - [ ] Modal se ferme
  - [ ] Liste se recharge
  - [ ] Nouvel événement visible avec "+€120/an" (10×12)
  - [ ] Badge "Estimé" (pas "Vérifié")
  - [ ] Note de preuve affichée
  - [ ] Analytics `impact_added` envoyé

### 3. Calcul annualisé correct

**Objectif** : Vérifier les calculs month×12 et year×1

**Setup** :
- [ ] Ajouter économie A : 10€/mois → Attendu +€120/an
- [ ] Ajouter économie B : 50€/an → Attendu +€50/an
- [ ] Ajouter économie C : 15€/mois → Attendu +€180/an

**Vérifications** :
- [ ] Hero Dashboard : "+€350/an" (120+50+180)
- [ ] Ledger résumé :
  - [ ] "Total annuel estimé" : €350
  - [ ] "Vérifié" : €0 (aucun vérifié)
  - [ ] "Événements" : 3
- [ ] Chaque ligne affiche le montant annualisé correct
- [ ] Ordre : plus récent en premier (créé last → affiché first)

### 4. Internationalisation (FR/EN)

**Objectif** : Vérifier toutes les traductions

**FR (défaut)** :
- [ ] Hero : "Impact total sécurisé"
- [ ] Sous-titre : "Apprends en 2 min · Agis en 5 · Prouve."
- [ ] CTA : "Démarrer un gain rapide (+€156/an)" ou "Continuer ta quête"
- [ ] Lien : "Voir le détail"
- [ ] Modal : "Ajouter une économie", champs en FR
- [ ] Ledger : "Impact & preuves", bouton "Ajouter une économie"
- [ ] Empty state : "Aucune économie encore"
- [ ] Badge : "Vérifié" / "Estimé"
- [ ] Période : "mensuel" / "annuel"
- [ ] Source : "Quête" / "Manuel"

**EN (switcher)** :
- [ ] Switch langue → EN
- [ ] Hero : "Secured Total Impact"
- [ ] Subtitle : "Learn in 2 min · Act in 5 · Prove."
- [ ] CTA : "Start a quick win (+€156/year)" ou "Continue your quest"
- [ ] Link : "See details"
- [ ] Modal : "Add Savings", fields in EN
- [ ] Ledger : "Impact & Proofs", button "Add Savings"
- [ ] Empty state : "No savings yet"
- [ ] Badge : "Verified" / "Estimated"
- [ ] Period : "monthly" / "yearly"
- [ ] Source : "Quest" / "Manual"

**Format monétaire** :
- [ ] FR : espace avant € (ex: "350 €") ou sans espace selon navigateur
- [ ] EN : pas d'espace (ex: "€350")
- [ ] Pas de centimes (minimumFractionDigits: 0)

### 5. Rafraîchissement & persistence

**Objectif** : Vérifier que les données persistent

- [ ] Créer 2-3 économies
- [ ] Noter les totaux affichés
- [ ] Rafraîchir page Dashboard (F5)
- [ ] **Attendu** :
  - [ ] Hero recharge et affiche les mêmes totaux
  - [ ] Loading state visible pendant fetch
  - [ ] Pas d'erreur console
- [ ] Naviguer vers `/impact`
- [ ] **Attendu** :
  - [ ] Liste complète visible
  - [ ] Résumé identique
  - [ ] Ordre préservé (createdAt desc)

### 6. Accessibilité Mobile

**Objectif** : UX mobile parfaite

**Dashboard (mobile)** :
- [ ] Hero responsive, pas de débordement
- [ ] Texte lisible ≥14px
- [ ] CTA tappables (min 44×44px)
- [ ] Chip preuves lisible

**Ledger (mobile)** :
- [ ] Header sticky fonctionne
- [ ] Bouton "+" visible et tappable
- [ ] Résumé : 3 cartes en colonne (1 col sur mobile)
- [ ] Cartes événements lisibles
- [ ] Scroll fluide
- [ ] Modal occupe bien l'écran, champs accessibles

**Tests tactiles** :
- [ ] Double-tap zoom désactivé sur boutons
- [ ] Scroll sans lag
- [ ] Clavier mobile apparaît correctement (champ montant = numeric)

### 7. Analytics (PostHog)

**Objectif** : Tous les events envoyés

**Sur Dashboard** :
- [ ] `impact_viewed` au render du Hero
  - [ ] Payload : `{ total_annual, verified_count, pending_count }`

**Clicks** :
- [ ] Click "Démarrer un gain rapide" → `cta_quickwin_clicked`
- [ ] Click "Continuer ta quête" → `cta_continue_clicked`
- [ ] Click "Voir le détail" → `impact_ledger_opened`
  - [ ] Payload : `{ total_annual, events_count }`

**Ajout économie** :
- [ ] Submit modal → `impact_added`
  - [ ] Payload : `{ amount, period, verified: false, source: 'manual', has_proof }`

**Vérification** :
- [ ] Ouvrir DevTools → Network → Filtrer "posthog" ou "analytics"
- [ ] Ou console.log dans trackEvent() pour debug

### 8. Dark Mode

**Objectif** : Support du thème sombre

- [ ] Switch dark mode (si disponible)
- [ ] **Vérifier** :
  - [ ] Hero : fond sombre, texte lisible
  - [ ] Modal : fond dark, bordures visibles
  - [ ] Ledger : cartes dark, contrastes ok
  - [ ] Aucun texte blanc sur fond blanc
  - [ ] Focus rings visibles en dark

### 9. Sécurité (règles Firestore)

**Objectif** : verified non-modifiable côté client

**Test manuel (DevTools)** :
- [ ] Créer un événement via modal
- [ ] Ouvrir Firestore dans console Firebase
- [ ] Vérifier document créé :
  - [ ] `verified: false` ✓
  - [ ] `createdAt` et `updatedAt` sont timestamps
  - [ ] `source: 'manual'`
  - [ ] `questId: 'manual'`
- [ ] Tenter de modifier `verified: true` via DevTools console :
  ```js
  // Devrait échouer (règles Firestore)
  await updateDoc(doc(db, 'users', uid, 'savingsEvents', eventId), {
    verified: true
  });
  ```
- [ ] **Attendu** : Erreur "permission-denied"

### 10. Edge Cases

**Gros montants** :
- [ ] Ajouter 99999€/an
- [ ] **Attendu** : Formaté correctement "€99,999" (virgule milliers)

**Décimaux** :
- [ ] Ajouter 10.50€/mois
- [ ] **Attendu** : Annualisé = €126/an (arrondi sans décimales)

**Note longue** :
- [ ] Ajouter note de 500 caractères
- [ ] **Attendu** :
  - [ ] Accepté dans modal
  - [ ] Affiché dans ledger (peut être tronqué avec ellipsis)

**0 événements après suppression** :
- [ ] Supprimer tous les événements (via Firestore ou implémenter delete)
- [ ] **Attendu** :
  - [ ] Hero retourne à "+€0/an"
  - [ ] Ledger affiche empty state

---

## 🎯 Définition de "Fini" (Acceptance Criteria)

- ✅ Hero visible en haut du Dashboard
  - Affiche +€X/an calculé correctement
  - Chip preuves avec compteurs
  - CTA conditionnel fonctionne
  - Lien détail → /impact
  
- ✅ Page /impact opérationnelle
  - Résumé 3 compteurs corrects
  - Liste triée createdAt desc
  - Empty state complet
  - Modal d'ajout fonctionnelle
  
- ✅ Création d'événement réussit
  - Validation : titre requis, amount > 0
  - `verified: false` toujours
  - `serverTimestamp()` pour dates
  - Refuse modification de `verified` côté client
  
- ✅ Analytics implémentés (5 events)
  - `impact_viewed`
  - `cta_quickwin_clicked`
  - `cta_continue_clicked`
  - `impact_ledger_opened`
  - `impact_added`
  
- ✅ i18n FR/EN complète
  - Toutes les clés traduites
  - Format currency adapté à la locale
  
- ✅ Mobile responsive
  - Lisible, tappable, pas de débordements
  
- ✅ Accessibilité
  - Contraste ≥4.5:1
  - Focus visible
  - Labels ARIA
  - Keyboard navigation

---

## 🐛 Bugs Connus / Limitations

- [ ] Pagination non implémentée (limit 50 pour l'instant)
- [ ] Pas de suppression d'événement dans l'UI (à venir)
- [ ] Pas d'édition d'événement dans l'UI (à venir)
- [ ] Upload de fichier (preuve image/PDF) non implémenté (étape future)
- [ ] Agrégats dans `/users/{uid}` non calculés (étape 4 - Cloud Functions)

---

## 📝 Notes pour QA

1. **Base de données propre** : Tester d'abord avec un compte sans données pour valider l'empty state
2. **Console Firestore** : Garder ouverte pour vérifier la structure des documents créés
3. **PostHog** : Si pas configuré, les events ne seront pas envoyés (vérifier `trackEvent()` fait console.log au minimum)
4. **Dark mode** : Si pas de toggle, tester en changeant les préférences système
5. **Locale navigateur** : Format currency dépend de `navigator.language` si LanguageContext non configuré

---

**Date de création** : 2025-01-30
**Version** : Étape 1 complète
**Status** : Prêt pour tests ✅

