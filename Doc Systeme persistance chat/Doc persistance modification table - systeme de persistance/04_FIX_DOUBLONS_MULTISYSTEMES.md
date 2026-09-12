# 🔧 FIX : Doublons Tables (Conflit Multi-Systèmes)

**Date** : 29 Août 2026 23:00  
**Problème** : Deux versions de la même table après F5  
**Cause** : 2 systèmes de sauvegarde actifs simultanément

---

## ❌ Problème Observé

### Symptômes

1. **Modifications pas toujours préservées** après 1er F5
2. **Plusieurs F5 nécessaires** pour voir modifications
3. **Tables dupliquées** dans div restaurées (ex: 2× "Table de Consolidation")

### Logs Révélateurs

```
[Système 1 - Bridge] ✅ Fonctionne
🔄 [USER-EDIT] Forcing save
🆕 [USER-EDIT] Creating new stable ID: 13002b77-...
✅ Table saved: 13002b77-...
✅ [AUTO-SAVE] Table "Table_8_..." sauvegardée

[Système 2 - Conso.js] ⚠️ Interfère
🚨 [DIAGNOSTIC] Événement save:request reçu via conso.js
💾 [Bridge] Handling save request for: Rubrique
💾 Sauvegarde table: session=..., keyword=Table_Consolidation
```

---

## 🔍 Cause Racine

### Deux Systèmes Concurrents

**Système 1 : flowiseTableBridge.ts** (NOUVEAU)
- Auto-save toutes les 10 secondes
- Dirty tracking avec MutationObserver
- Sauvegarde dans IndexedDB
- Force UPDATE pour user_edit ✅

**Système 2 : conso.js** (ANCIEN)
- Auto-save toutes les 30 secondes
- Scan toutes les tables
- Sauvegarde dans localStorage **ET** émet événements
- Crée nouvelles entrées IndexedDB ❌

### Conflit

1. **User modifie cellule** → Bridge détecte → Sauvegarde ID1
2. **30s après** → conso.js auto-save → Sauvegarde ID2 (doublon)
3. **F5** → Restaure ID1 OU ID2 (aléatoire)
4. **Résultat** : Version incorrecte affichée ou doublons

---

## ✅ Solution Implémentée

### Désactivation conso.js Auto-Save

**Fichier** : `public/conso.js`

#### Fix 1 : Désactiver Interval (Ligne 226)

**Avant** :
```javascript
// Sauvegarder périodiquement
this.autoSaveIntervalId = setInterval(() => {
  this.autoSaveAllTables();
}, 30000); // Sauvegarde automatique toutes les 30 secondes
```

**Après** :
```javascript
// Sauvegarder périodiquement
// 🚫 DÉSACTIVÉ : Conflit avec flowiseTableBridge auto-save
// Gardons uniquement le nouveau système de persistance
/*
this.autoSaveIntervalId = setInterval(() => {
  this.autoSaveAllTables();
}, 30000);
*/
console.log("⚠️ [CONSO] Auto-save désactivé (utilise flowiseTableBridge)");
```

#### Fix 2 : Désactiver saveTableDataNow (Ligne 2212)

**Avant** :
```javascript
saveTableDataNow(table) {
  if (!table) {
    debug.warn("⚠️ saveTableDataNow: table est null");
    return;
  }
  
  // ... logique sauvegarde localStorage + événements ...
}
```

**Après** :
```javascript
saveTableDataNow(table) {
  if (!table) {
    debug.warn("⚠️ saveTableDataNow: table est null");
    return;
  }
  
  // 🚫 Ne plus sauvegarder ici, déléguer à flowiseTableBridge
  console.log("⚠️ [CONSO] saveTableDataNow désactivé (utilise flowiseTableBridge)");
  return;
}
```

---

## 🎯 Comportement Attendu

### Avant Fix (DOUBLONS)

**Timeline** :
```
T0s  : User modifie cellule
T1s  : Bridge détecte → dirty tracking
T10s : Bridge auto-save → IndexedDB entry ID1
T30s : conso.js auto-save → IndexedDB entry ID2 (DOUBLON)
F5   : Restaure ID1 OU ID2 (aléatoire)
```

**Résultat** : Modifications perdues 50% du temps

---

### Après Fix (PROPRE)

**Timeline** :
```
T0s  : User modifie cellule
T1s  : Bridge détecte → dirty tracking
T10s : Bridge auto-save → IndexedDB UPDATE ID1
T30s : conso.js fait RIEN (désactivé)
F5   : Restaure ID1 (toujours la bonne version)
```

**Résultat** : Modifications toujours préservées ✅

---

## 🧪 Tests de Validation

### Test 1 : Modification Simple

**Étapes** :
1. Modifier 1 cellule
2. Attendre 15 secondes (pas de conflit conso.js)
3. F5

**Attendu** :
- ✅ 1 seule version sauvegardée
- ✅ Modification préservée
- ✅ Aucun doublon dans restauration

---

### Test 2 : Modifications Successives

**Étapes** :
1. Modifier cellule A → Attendre 10s
2. Modifier cellule B → Attendre 10s
3. Modifier cellule C → Attendre 10s
4. F5

**Attendu** :
- ✅ 3 UPDATEs avec même ID
- ✅ Toutes modifications présentes
- ✅ Aucune régression

---

### Test 3 : Attente Longue (>30s)

**Étapes** :
1. Modifier 1 cellule
2. **Attendre 35 secondes** (avant : conso.js se déclenchait)
3. F5

**Attendu** :
- ✅ Pas d'auto-save conso.js (log `désactivé`)
- ✅ Seul Bridge a sauvegardé
- ✅ Modification préservée

---

## 📊 Impact sur Fonctionnalités

### Fonctions conso.js Préservées ✅

**Conservées** (appels manuels uniquement) :
- `claraverseCommands.saveNow()` - Sauvegarde manuelle
- `claraverseCommands.saveAllNow()` - Sauvegarde toutes tables
- `claraverseCommands.restoreAll()` - Restauration
- `claraverseCommands.exportData()` - Export JSON
- `claraverseCommands.importData()` - Import JSON

**Désactivées** (automatiques) :
- Auto-save interval 30s ❌
- `saveTableDataNow()` automatique ❌

### Système Unique : flowiseTableBridge ✅

**Responsable de** :
- Détection modifications (MutationObserver)
- Dirty tracking (Set)
- Auto-save 10s
- Sauvegarde IndexedDB
- UPDATE intelligent (même ID)

---

## 🔄 Migration

### Données Existantes

**Tables déjà sauvegardées par conso.js** :
- Conservées en localStorage
- Restaurées normalement
- Futures modifications via Bridge uniquement

**Pas de perte de données** ✅

---

## 📝 Notes Techniques

### Pourquoi Désactiver saveTableDataNow ?

**Raison** : Émet événement `flowise:table:save:request` qui déclenche Bridge → Boucle infinie potentielle.

**Solution** : Return early dans fonction → Aucun effet secondaire.

### Pourquoi Garder Fonction ?

**Raison** : Autres modules appellent peut-être `processor.saveTableDataNow()`.

**Solution** : Fonction existe mais ne fait rien (log warning).

---

## ✅ Checklist Validation

- [x] Interval 30s désactivé
- [x] `saveTableDataNow()` return early
- [x] Logs warning ajoutés
- [x] Fonctions manuelles préservées
- [ ] Tests utilisateur confirmés
- [ ] Documentation mise à jour

---

## 🎯 Prochaines Étapes

1. **Recharger page** (F5) pour charger nouveau conso.js
2. **Modifier cellule** → Attendre 35s (aucun log conso)
3. **F5** → Vérifier modification préservée
4. **Vérifier** : Aucun doublon dans tables restaurées

---

**Dernière mise à jour** : 29 Août 2026 23:00  
**Statut** : Fix implémenté, tests en attente
