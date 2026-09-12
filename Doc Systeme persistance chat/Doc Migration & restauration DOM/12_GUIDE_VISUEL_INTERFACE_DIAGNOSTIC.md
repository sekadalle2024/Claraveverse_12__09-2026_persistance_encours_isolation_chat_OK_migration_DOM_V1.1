# 🎨 GUIDE VISUEL - Interface Diagnostic

**Pour** : Utilisateurs finaux & Testeurs  
**Durée lecture** : 3 minutes  
**Date** : 12 Septembre 2026

---

## 🖼️ VUE D'ENSEMBLE INTERFACE

### Position Boutons

```
┌─────────────────────────────────────────────────────────┐
│ Claraverse - E-audit                              [Boutons] │
│                                                   ↓      │
│  ┌─────────────────────────────────────┐  ┌──────────┐ │
│  │                                     │  │🔍 Diag   │ │
│  │    Zone de Chat                     │  │          │ │
│  │                                     │  │🗑️ IndexDB│ │
│  │                                     │  │          │ │
│  │                                     │  │🧹 DOM    │ │
│  │                                     │  │          │ │
│  │                                     │  │💾 Local  │ │
│  └─────────────────────────────────────┘  └──────────┘ │
│                                                         │
│  [Input Chat]                                           │
└─────────────────────────────────────────────────────────┘
```

**Position** : Coin supérieur droit  
**z-index** : 999999 (toujours visible)  
**Layout** : Colonne verticale, gap 10px

---

## 🔍 BOUTON 1 : DIAGNOSTIC COMPLET

### Apparence

```
┌──────────────────────────────┐
│  🔍 Diagnostic Complet       │
│                              │
│  Gradient: Purple → Violet   │
│  #667eea → #764ba2           │
│  Shadow: Glow 6px            │
└──────────────────────────────┘
```

**Hover** : Scale 1.02 + Shadow enhanced  
**Click** : Ouvre fenêtre modale

### Fenêtre Modale

#### Vue Initiale

```
┌─────────────────────────────────────────────────────┐
│ 🔍 Diagnostic Complet DOM Storage              [×] │
│ Tests de persistance & sauvegarde                   │
├─────────────────────────────────────────────────────┤
│                                                     │
│                      🚀                              │
│                                                     │
│           Prêt à Diagnostiquer                      │
│                                                     │
│  Cliquez sur "Lancer Tous les Tests" pour          │
│  démarrer l'analyse complète du système            │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ 📋 Tests Inclus:                            │   │
│  │ • ✅ Vérification Chargement Managers       │   │
│  │ • ✅ Tests Sauvegarde Tables                │   │
│  │ • ✅ Tests Restauration                     │   │
│  │ • ✅ Tests Anti-Doublons                    │   │
│  │ • ✅ Tests Modifications Structurelles      │   │
│  │ • ✅ Analyse Performance                    │   │
│  │ • ✅ Inspection DOM Storage                 │   │
│  │ • ✅ Statistiques Globales                  │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
├─────────────────────────────────────────────────────┤
│                  [▶ Lancer Tous les Tests]          │
└─────────────────────────────────────────────────────┘
```

**Taille** : 90% viewport  
**Max-width** : 1200px  
**Background** : White avec overlay dark

#### Vue Tests en Cours

```
┌─────────────────────────────────────────────────────┐
│ 🔍 Diagnostic Complet DOM Storage              [×] │
├─────────────────────────────────────────────────────┤
│                                                     │
│                      ⏳                              │
│                   [Spinner]                         │
│                                                     │
│              Tests en cours...                      │
│             Veuillez patienter                      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Durée** : 1-2 secondes  
**Animation** : Spinner rotation infinie

#### Vue Résultats

```
┌─────────────────────────────────────────────────────┐
│ 🔍 Diagnostic Complet DOM Storage              [×] │
├─────────────────────────────────────────────────────┤
│                                                     │
│  📊 Résultats Globaux                               │
│  ┌──────────┬──────────┬──────────┬──────────┐     │
│  │    8     │    8     │    0     │  1234ms  │     │
│  │  Tests   │ Réussis  │ Échoués  │  Durée   │     │
│  └──────────┴──────────┴──────────┴──────────┘     │
│                                                     │
│  ┌──────────────────────────────────────────┐      │
│  │ ✅ Test 1: Vérification Managers   PASSÉ │      │
│  │ ────────────────────────────────────     │      │
│  │ ✓ domStorageManager: Manager chargé     │      │
│  │ ✓ domRestoreManager: Manager chargé     │      │
│  │ ✓ domAutoSave: Auto-Save chargé         │      │
│  └──────────────────────────────────────────┘      │
│                                                     │
│  ┌──────────────────────────────────────────┐      │
│  │ ✅ Test 2: DOM Storage Container   PASSÉ │      │
│  │ ────────────────────────────────────     │      │
│  │ ✓ Container existe                       │      │
│  │ ✓ Container caché (display:none)         │      │
│  │ • 2 session(s) trouvée(s)                │      │
│  │ • 5 table(s) sauvegardée(s)              │      │
│  └──────────────────────────────────────────┘      │
│                                                     │
│  [... autres tests ...]                             │
│                                                     │
├─────────────────────────────────────────────────────┤
│         [▶ Lancer Tous les Tests]  [📥 Export JSON] │
└─────────────────────────────────────────────────────┘
```

**Scroll** : Vertical si beaucoup de tests  
**Couleurs** :
- ✅ Vert : Test passé
- ❌ Rouge : Test échoué
- ⚠️ Jaune : Warning
- ℹ️ Bleu : Info

---

## 🗑️ BOUTON 2 : NETTOYER INDEXEDDB

### Apparence

```
┌──────────────────────────────┐
│  🗑️ Nettoyer IndexedDB       │
│                              │
│  Gradient: Pink → Red        │
│  #f093fb → #f5576c           │
│  Shadow: Glow 6px            │
└──────────────────────────────┘
```

### Workflow

```
[Clic] → [Confirmation Alert] → [Suppression] → [Rechargement]
          ↓
    ┌──────────────────────────────────┐
    │ ⚠️ ATTENTION                     │
    │                                  │
    │ Supprimer toutes les bases       │
    │ IndexedDB ?                      │
    │                                  │
    │ • FloTableDB                     │
    │ • clara_db                       │
    │                                  │
    │ Cette action est IRRÉVERSIBLE.   │
    │                                  │
    │   [Annuler]  [OK]                │
    └──────────────────────────────────┘
```

**Si OK** :
1. Suppression FloTableDB
2. Suppression clara_db
3. Vérification
4. Alert succès → Reload (2s)

**Si Annuler** :
- Rien ne se passe

---

## 🧹 BOUTON 3 : NETTOYER DOM STORAGE

### Apparence

```
┌──────────────────────────────┐
│  🧹 Nettoyer DOM Storage     │
│                              │
│  Gradient: Light Pink        │
│  #fad0c4 → #ffd1ff           │
│  Shadow: Glow 6px            │
└──────────────────────────────┘
```

### Workflow

```
[Clic] → [Confirmation] → [Suppression] → [Alert] → [Reload]
          ↓
    Supprimer TOUTES les tables
    du DOM Storage ?
    
    IRRÉVERSIBLE
```

**Action** :
```javascript
<div id="claraverse-dom-storage">
  <div data-session-id="xxx">
    <table>...</table>  ← Supprimé
    <table>...</table>  ← Supprimé
  </div>
</div>

// Devient:
<div id="claraverse-dom-storage">
  [vide]
</div>
```

---

## 💾 BOUTON 4 : NETTOYER LOCALSTORAGE

### Apparence

```
┌──────────────────────────────┐
│  💾 Nettoyer LocalStorage    │
│                              │
│  Gradient: Cyan → Pink       │
│  #a8edea → #fed6e3           │
│  Shadow: Glow 6px            │
└──────────────────────────────┘
```

### Workflow

```
[Clic] → [Confirmation] → [localStorage.clear()] → [Reload]
```

**Effet** :
- Toutes clés localStorage supprimées
- Sessions utilisateur réinitialisées
- Préférences perdues

---

## 📥 EXPORT JSON

### Déclenchement

**Apparition** : Après exécution tests (bouton caché avant)  
**Position** : Footer modal, à droite

### Format Fichier

**Nom** : `diagnostic-dom-storage-2026-09-12T10-30-45.json`

**Contenu** :
```json
{
  "timestamp": "2026-09-12T10:30:45.123Z",
  "tests": [...],      // 8 tests avec détails
  "systemInfo": {...}, // Navigateur, OS
  "domStorage": {...}, // Stats stockage
  "performance": {...} // Durée totale
}
```

### Notification

```
┌──────────────────────┐
│  ✅ JSON exporté !   │  ← Toast notification
└──────────────────────┘   3 secondes
  Position: Top-right
  Gradient purple
```

---

## 🎨 PALETTE COULEURS

### Boutons

| Bouton | Start | End | Usage |
|--------|-------|-----|-------|
| Diagnostic | #667eea | #764ba2 | Principal |
| IndexedDB | #f093fb | #f5576c | Destructif |
| DOM Storage | #fad0c4 | #ffd1ff | Nettoyage |
| LocalStorage | #a8edea | #fed6e3 | Alternatif |

### Status Tests

| Status | Couleur | Icône |
|--------|---------|-------|
| Passed | #22c55e | ✅ |
| Failed | #ef4444 | ❌ |
| Warning | #eab308 | ⚠️ |
| Info | #3b82f6 | ℹ️ |

---

## ⌨️ INTERACTIONS

### Hover Boutons

**Effet** :
```
Normal:   transform: scale(1)
          shadow: 0 6px 20px rgba(...)
          
Hover:    transform: scale(1.02) translateY(-2px)
          shadow: 0 8px 25px rgba(...)
          
Duration: 0.3s ease
```

### Click Boutons

**Feedback** : Immediate (pas de delay)  
**Action** : Fonction JavaScript directe

### Fermeture Modale

**Méthodes** :
1. Clic sur [×] (coin supérieur droit)
2. Clic sur overlay (background sombre)
3. Touche ESC (à implémenter si besoin)

---

## 📱 RESPONSIVE

### Desktop (> 1200px)

```
Modale: 90% largeur, max 1200px
Boutons: Pleine largeur, padding 14px 24px
Font: 15px
```

### Tablet (768px - 1200px)

```
Modale: 95% largeur
Boutons: Pleine largeur, padding 12px 20px
Font: 14px
```

### Mobile (< 768px)

```
Modale: 98% largeur, 95% hauteur
Boutons: Full width, padding 10px 16px
Font: 13px
Grid: 1 colonne (résultats)
```

---

## 🎯 QUICK ACTIONS

### Action 1 : Diagnostic Rapide
```
1. Clic "🔍 Diagnostic Complet"
2. Clic "▶ Lancer Tous les Tests"
3. Attendre 2 secondes
4. Vérifier 8/8 tests passés
```
**Durée** : 30 secondes

### Action 2 : Reset Complet
```
1. Clic "🗑️ Nettoyer IndexedDB" → OK
2. Clic "🧹 Nettoyer DOM Storage" → OK
3. Clic "💾 Nettoyer LocalStorage" → OK
4. Page recharge automatiquement
```
**Durée** : 1 minute

### Action 3 : Export Résultats
```
1. Ouvrir diagnostic
2. Lancer tests
3. Clic "📥 Export JSON"
4. Fichier téléchargé automatiquement
```
**Durée** : 1 minute

---

## 🔍 ÉTATS VISUELS

### Tests Passés (✅)

```
┌────────────────────────────────────┐
│ ✅ Nom du Test            [PASSÉ]  │
│ ────────────────────────────       │
│ ✓ Check 1: Message succès          │
│ ✓ Check 2: Message succès          │
└────────────────────────────────────┘

Border-left: 3px solid #22c55e
Background: white
Badge: Green background
```

### Tests Échoués (❌)

```
┌────────────────────────────────────┐
│ ❌ Nom du Test           [ÉCHOUÉ]  │
│ ────────────────────────────       │
│ ✗ Check 1: Message erreur          │
│ ✗ Check 2: Message erreur          │
└────────────────────────────────────┘

Border-left: 3px solid #ef4444
Background: white
Badge: Red background
```

### Infos (ℹ️)

```
┌────────────────────────────────────┐
│ • Check: Message informatif        │
└────────────────────────────────────┘

Color: #666
Icon: •
```

---

## ✅ CHECKLIST UTILISATION

### Première Utilisation

- [ ] Vérifier 4 boutons visibles coin supérieur droit
- [ ] Cliquer "🔍 Diagnostic Complet"
- [ ] Fenêtre modale s'ouvre
- [ ] Cliquer "▶ Lancer Tous les Tests"
- [ ] Tests s'exécutent (~2 secondes)
- [ ] Résultats s'affichent
- [ ] 8 tests présents
- [ ] Bouton "📥 Export JSON" visible
- [ ] Exporter JSON fonctionne
- [ ] Fichier téléchargé

### Utilisation Quotidienne

- [ ] Lancer diagnostic après modifications
- [ ] Vérifier tous tests passent
- [ ] Exporter JSON si problème
- [ ] Nettoyer storage si nécessaire

---

**Version** : 1.0  
**Date** : 12 Septembre 2026  
**Statut** : ✅ Guide Complet
