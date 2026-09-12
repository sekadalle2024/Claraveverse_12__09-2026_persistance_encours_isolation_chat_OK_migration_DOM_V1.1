# 🚀 GUIDE DE DÉMARRAGE RAPIDE - DOM Storage

**Pour** : Développeurs & Testeurs  
**Durée** : 5 minutes  
**Date** : 12 Septembre 2026

---

## ⚡ QUICK START

### 1. Vérifier Installation (30 secondes)

Ouvrez la console (F12) et tapez :

```javascript
// Vérifier que les managers sont chargés
console.log(window.domStorageManager)    // Doit afficher: DOMStorageManager {}
console.log(window.domRestoreManager)    // Doit afficher: DOMRestoreManager {}
console.log(window.domAutoSave)          // Doit afficher: DOMAutoSave {}
```

✅ **Si les 3 existent** : Installation OK  
❌ **Si undefined** : Vérifier `index.html` lignes 95-110

---

### 2. Premier Test (2 minutes)

#### A. Générer une table

1. Dans le chat, demandez au GPT : "Crée une table budget avec 3 lignes"
2. La table apparaît
3. Console : Chercher `💾 [DOM Auto-Save] Table sauvegardée`

#### B. Vérifier stockage

```javascript
// Voir toutes les tables sauvegardées
window.domStorageManager.diagnose()
```

**Résultat attendu** :
```
🔍 [DOM Storage] Diagnostic
─────────────────────────────────
📊 Sessions totales: 1
📊 Tables totales: 1

📁 Session: session_abc123
   Tables: 1
   Keywords: Table_Budget
   Créée: 2026-09-12T10:00:00Z
```

#### C. Tester persistance

1. Modifier une cellule de la table
2. Attendre 500ms (debounce)
3. **Recharger la page** (F5)
4. La table réapparaît avec badge "✅ Table Restaurée"

---

### 3. Commandes Utiles (2 minutes)

#### Diagnostic Complet
```javascript
window.domStorageManager.diagnose()
```

#### Statistiques
```javascript
const stats = window.domStorageManager.getStats()
console.log(stats)
// {
//   totalSessions: 1,
//   totalTables: 3,
//   sessions: [...]
// }
```

#### Forcer Sauvegarde Table
```javascript
const table = document.querySelector('table[data-keyword]')
const sessionId = sessionStorage.getItem('claraverse_stable_session')
window.domStorageManager.saveTable(sessionId, table.dataset.keyword, table)
```

#### Forcer Restauration
```javascript
const sessionId = sessionStorage.getItem('claraverse_stable_session')
window.domRestoreManager.forceRestore(sessionId)
```

#### Nettoyer Session
```javascript
const sessionId = sessionStorage.getItem('claraverse_stable_session')
window.domStorageManager.clearSession(sessionId)
```

#### Inspecter DOM Storage
```javascript
// DevTools Elements tab
document.getElementById('claraverse-dom-storage')
```

---

## 🧪 SCÉNARIOS DE TEST

### Test 1 : Sauvegarde Simple
**Durée** : 1 minute

1. Générer table
2. Modifier cellule
3. Console : `💾 [DOM Auto-Save] Table sauvegardée: Table_X`
4. F5 recharger
5. ✅ Table réapparaît

### Test 2 : Modifications Structurelles
**Durée** : 2 minutes

1. Clic droit sur table → Insérer ligne
2. Console : `💾 [Menu] Table sauvegardée dans DOM Storage`
3. Clic droit → Insérer colonne
4. Console : `💾 [Menu] Table sauvegardée`
5. F5 recharger
6. ✅ Ligne et colonne toujours présentes

### Test 3 : Anti-Doublons
**Durée** : 2 minutes

1. Générer table "Table_Budget"
2. Modifier cellule
3. Générer à nouveau "Table_Budget"
4. Exécuter : `window.domStorageManager.diagnose()`
5. ✅ Vérifier UNE SEULE table "Table_Budget" dans résultat

### Test 4 : Multi-Tables
**Durée** : 2 minutes

1. Générer 3 tables différentes
2. Modifier une cellule dans chaque
3. Exécuter : `window.domStorageManager.getStats()`
4. ✅ Vérifier `totalTables: 3`
5. F5 recharger
6. ✅ Les 3 tables réapparaissent

---

## 🔍 DEBUGGING

### Problème : Tables non sauvegardées

**Symptômes** :
- Modification cellule
- Pas de message `💾 [DOM Auto-Save]` dans console

**Solutions** :
```javascript
// 1. Vérifier table a keyword
const table = document.querySelector('table')
console.log(table.dataset.keyword) // Doit exister

// 2. Vérifier MutationObserver actif
console.log(window.domAutoSave.observedTables) // Doit contenir tables

// 3. Forcer sauvegarde manuelle
const sessionId = sessionStorage.getItem('claraverse_stable_session')
window.domStorageManager.saveTable(sessionId, table.dataset.keyword, table)
```

### Problème : Tables non restaurées

**Symptômes** :
- F5 recharger
- Tables disparaissent

**Solutions** :
```javascript
// 1. Vérifier sessionId
const sessionId = sessionStorage.getItem('claraverse_stable_session')
console.log(sessionId) // Doit exister

// 2. Vérifier tables dans stockage
window.domStorageManager.diagnose()

// 3. Forcer restauration
window.domRestoreManager.forceRestore(sessionId)
```

### Problème : Doublons tables

**Symptômes** :
- Même table apparaît 2 fois

**Solutions** :
```javascript
// 1. Diagnostic
window.domStorageManager.diagnose()

// 2. Chercher doublons
const storage = document.getElementById('claraverse-dom-storage')
const session = storage.querySelector('[data-session-id]')
const keywords = Array.from(session.querySelectorAll('table[data-keyword]'))
  .map(t => t.dataset.keyword)

const duplicates = keywords.filter((k, i) => keywords.indexOf(k) !== i)
console.log('Doublons:', duplicates)

// 3. Si doublons trouvés, supprimer manuellement
// (normalement impossible avec architecture DOM)
```

---

## 📊 INDICATEURS SANTÉ SYSTÈME

### Checks Console (À Vérifier au Démarrage)

✅ **Bon** : Ces messages doivent apparaître
```
✅ [DOM Storage Manager] Chargé et initialisé
✅ [DOM Storage] Conteneur créé
✅ [DOM Restore Manager] Chargé et initialisé
✅ [DOM Auto-Save] Script chargé
✅ [DOM Auto-Save] Initialisé
```

⚠️ **Attention** : Ces warnings sont normaux (anciens services)
```
⚠️ [FlowiseTableService] Système IndexedDB deprecated, migrez vers DOM Storage
⚠️ [FlowiseTableBridge] Système IndexedDB deprecated, migrez vers DOM Storage
⚠️ [IndexedDB Service] Système IndexedDB deprecated, migrez vers DOM Storage
```

❌ **Problème** : Ces erreurs ne doivent PAS apparaître
```
❌ [DOM Storage] Erreur sauvegarde
❌ [DOM Restore] Erreur restauration
❌ DOM Storage Manager non disponible
```

---

## 🎯 MÉTRIQUES DE PERFORMANCE

### Temps de Sauvegarde
```javascript
// Test performance sauvegarde
const table = document.querySelector('table[data-keyword]')
const sessionId = sessionStorage.getItem('claraverse_stable_session')

console.time('Save')
window.domStorageManager.saveTable(sessionId, table.dataset.keyword, table)
console.timeEnd('Save')
// Attendu : ~5-15ms
```

### Temps de Restauration
```javascript
// Test performance restauration
const sessionId = sessionStorage.getItem('claraverse_stable_session')

console.time('Restore')
window.domRestoreManager.restoreSessionTables(sessionId)
console.timeEnd('Restore')
// Attendu : ~50-200ms (selon nombre tables)
```

### Taille Stockage
```javascript
// Mesurer taille stockage DOM
const storage = document.getElementById('claraverse-dom-storage')
const sizeKB = (storage.outerHTML.length / 1024).toFixed(2)
console.log(`Taille stockage: ${sizeKB} KB`)
// Attendu : <100KB pour 10 tables moyennes
```

---

## 🛠️ CONFIGURATION AVANCÉE

### Modifier Délai Auto-Save

Par défaut : 500ms  
Modifier dans `/public/dom-auto-save.js` ligne 7 :

```javascript
this.saveDelay = 500; // Changer cette valeur
```

Recommandations :
- **Performance** : 250ms (sauvegarde plus fréquente)
- **Économie ressources** : 1000ms (sauvegarde moins fréquente)

### Désactiver Flash Vert

Modifier `/public/dom-auto-save.js` lignes 107-114 :

```javascript
// Commenter ces lignes pour désactiver flash
// const originalBoxShadow = table.style.boxShadow;
// table.style.transition = 'box-shadow 0.3s';
// table.style.boxShadow = '0 0 10px rgba(76, 175, 80, 0.6)';
// 
// setTimeout(() => {
//   table.style.boxShadow = originalBoxShadow;
// }, 300);
```

### Personnaliser Badge Restauration

Modifier `/public/dom-restore-manager.js` lignes 81-84 :

```javascript
badge.textContent = '✅ Table Restaurée'; // Changer texte
badge.style.cssText = '...background: #4CAF50...'; // Changer couleur
```

---

## 📚 RESSOURCES

### Documentation Complète
- `00_RAPPORT_ANALYSE_MIGRATION_DOM_VS_INDEXEDDB.md` - Analyse
- `03_PLAN_MIGRATION_INDEXEDDB_VERS_DOM.md` - Plan migration
- `05_API_REFERENCE_DOM_STORAGE.md` - Référence API
- `09_RAPPORT_MIGRATION_COMPLETE_12_SEPT_2026.md` - Rapport final

### Scripts Principaux
- `/public/dom-storage-manager.js` - Gestionnaire stockage
- `/public/dom-restore-manager.js` - Gestionnaire restauration
- `/public/dom-auto-save.js` - Sauvegarde automatique

### Points d'Entrée Code
- `conso.js` ligne 2300 - Sauvegarde conso
- `menu.js` ligne 9680 - Sauvegarde menu
- `index.html` ligne 95 - Chargement scripts

---

## ✅ CHECKLIST POST-INSTALLATION

- [ ] Console : 3 managers chargés (domStorageManager, domRestoreManager, domAutoSave)
- [ ] Test 1 : Générer table → Modifier → F5 → Table réapparaît
- [ ] Test 2 : Insérer ligne → F5 → Ligne toujours présente
- [ ] Test 3 : `diagnose()` affiche tables sauvegardées
- [ ] Test 4 : Pas de doublons dans `diagnose()`
- [ ] Console : Warnings IndexedDB deprecated (normal)
- [ ] DevTools Elements : `#claraverse-dom-storage` visible

---

## 🆘 SUPPORT RAPIDE

### Commande Urgence : Tout Réparer
```javascript
// 1. Nettoyer tout
const storage = document.getElementById('claraverse-dom-storage')
if (storage) storage.innerHTML = ''

// 2. Recharger page
location.reload()

// 3. Régénérer tables
// (demander à GPT de recréer les tables)
```

### Commande Urgence : Export Backup
```javascript
// Sauvegarder état actuel avant reset
const storage = document.getElementById('claraverse-dom-storage')
const backup = storage.outerHTML
console.log(backup)
// Copier résultat console, sauvegarder dans fichier .html
```

### Commande Urgence : Restaurer Backup
```javascript
// Restaurer depuis backup sauvegardé
const backupHTML = '...' // Coller contenu backup
const storage = document.getElementById('claraverse-dom-storage')
storage.outerHTML = backupHTML
```

---

**Version** : 1.0  
**Dernière mise à jour** : 12 Septembre 2026  
**Statut** : ✅ Production Ready
