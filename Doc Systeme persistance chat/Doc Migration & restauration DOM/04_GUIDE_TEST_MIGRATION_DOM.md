# 🧪 GUIDE DE TEST - Migration DOM Storage

**Date** : 12 Septembre 2026  
**Objectif** : Valider la migration IndexedDB → DOM Storage  
**Durée** : 30-45 minutes  

---

## 🎯 OBJECTIFS DES TESTS

1. ✅ Confirmer que le stockage DOM fonctionne
2. ✅ Vérifier absence de doublons
3. ✅ Valider persistance des modifications
4. ✅ Tester isolation entre sessions
5. ✅ Confirmer désactivation IndexedDB

---

## 📋 PRÉ-REQUIS

Avant de commencer les tests, vérifier :

```javascript
// Console (F12)

// 1. Managers DOM chargés
console.log('Storage:', window.domStorageManager);
console.log('Restore:', window.domRestoreManager);
console.log('Auto-save:', window.domAutoSave);

// Attendu : 3 objets définis

// 2. Conteneur DOM créé
document.getElementById('claraverse-dom-storage');

// Attendu : Element <div> avec display: none
```

---

## 🧪 SUITE DE TESTS

### TEST 1 : Création du Conteneur DOM (2 min)

#### Objectif
Vérifier que le conteneur de stockage DOM existe et est fonctionnel.

#### Procédure
```javascript
// Console
const storage = document.getElementById('claraverse-dom-storage');
console.log('Conteneur:', storage);
console.log('Style:', storage.style.display);
console.log('Attribut:', storage.getAttribute('data-claraverse-storage'));
```

#### Résultat attendu
```
✅ Conteneur: <div id="claraverse-dom-storage">
✅ Style: none
✅ Attribut: true
```

#### ❌ En cas d'échec
- Vérifier que `dom-storage-manager.js` est chargé dans `index.html`
- Vérifier ordre de chargement (avant autres scripts)
- Recharger la page (F5)

---

### TEST 2 : Sauvegarde Manuelle (3 min)

#### Objectif
Tester la sauvegarde d'une table dans le DOM Storage.

#### Procédure
```javascript
// Console

// 1. Créer une table de test
const testTable = document.createElement('table');
testTable.innerHTML = `
  <tr><th>Col1</th><th>Col2</th></tr>
  <tr><td>A1</td><td>B1</td></tr>
  <tr><td>A2</td><td>B2</td></tr>
`;
testTable.setAttribute('data-keyword', 'Test_Table');
testTable.setAttribute('data-table-id', 'test_table_001');

// 2. Sauvegarder
const success = window.domStorageManager.saveTable(
  'test_session',
  'Test_Table',
  testTable
);

console.log('Sauvegarde:', success);

// 3. Vérifier dans le conteneur
window.domStorageManager.diagnose();
```

#### Résultat attendu
```
✅ Sauvegarde: true
💾 [DOM Storage] Table sauvegardée: Test_Table

📊 Sessions totales: 1
📊 Tables totales: 1
📁 Session: test_session
   Tables: 1
   Keywords: Test_Table
```

#### ❌ En cas d'échec
- Vérifier que `domStorageManager` est défini
- Vérifier logs d'erreur dans console
- Inspecter DOM : `#claraverse-dom-storage > [data-session-id="test_session"]`

---

### TEST 3 : Restauration Manuelle (3 min)

#### Objectif
Tester la restauration d'une table depuis le DOM Storage.

#### Procédure
```javascript
// Console (suite du TEST 2)

// 1. Restaurer la table
const restoredTable = window.domStorageManager.restoreTable(
  'test_session',
  'Test_Table'
);

console.log('Table restaurée:', restoredTable);
console.log('Keyword:', restoredTable?.dataset?.keyword);
console.log('HTML:', restoredTable?.innerHTML);

// 2. Insérer dans UI pour visualisation
if (restoredTable) {
  document.body.appendChild(restoredTable);
  restoredTable.style.cssText = 'margin: 20px; border: 2px solid green;';
}
```

#### Résultat attendu
```
✅ Table restaurée: <table>
✅ Keyword: Test_Table
✅ HTML: (contenu correct avec 2 lignes)
✅ Table visible dans body avec bordure verte
```

#### ❌ En cas d'échec
- Vérifier que TEST 2 a réussi
- Vérifier logs de restauration
- Inspecter le conteneur DOM manuellement

---

### TEST 4 : Auto-Save sur Modifications (5 min)

#### Objectif
Vérifier que les modifications de tables sont sauvegardées automatiquement.

#### Procédure
```
1. Ouvrir un chat avec une table existante (ex: Table_Consolidation)
2. Ouvrir console (F12)
3. Clic droit sur table → "Insérer ligne"
4. Observer console pendant 1 seconde
5. Modifier une cellule de la table
6. Observer console pendant 1 seconde
```

#### Résultat attendu
```
✅ Logs apparaissent dans console :
   👁️ [DOM Auto-Save] Table observée: Table_Consolidation
   💾 [DOM Auto-Save] Table sauvegardée: Table_Consolidation
```

#### Vérification supplémentaire
```javascript
// Console
window.domStorageManager.diagnose();
// Attendu : Table_Consolidation listée dans session actuelle
```

#### ❌ En cas d'échec
- Vérifier que `dom-auto-save.js` est chargé
- Vérifier que table a attribut `data-keyword`
- Vérifier logs d'erreur

---

### TEST 5 : Persistance après Rechargement (5 min)

#### Objectif
Confirmer que les tables survivent au rechargement de page (F5).

#### Procédure
```
1. Dans un chat, créer/modifier une table
2. Observer console : "💾 [DOM Auto-Save] Table sauvegardée"
3. Noter le contenu modifié (ex: cellule "Test123")
4. Recharger page (F5)
5. Attendre 2-3 secondes (restauration automatique)
6. Vérifier que la table est restaurée avec modifications
```

#### Résultat attendu
```
✅ Après F5 :
   - Table apparaît dans body (sous zone de saisie)
   - Table a attribut data-restored="true"
   - Contenu modifié ("Test123") est préservé
   - Console : "🔄 [DOM Restore] Début restauration"
   - Console : "✅ [DOM Restore] Table UI créée: xxx"
```

#### Vérification manuelle
```javascript
// Console après F5
document.querySelectorAll('[data-restored="true"]').length;
// Attendu : > 0
```

#### ❌ En cas d'échec
- Vérifier que `dom-restore-manager.js` est chargé
- Vérifier que `force-restore-on-load.js` utilise DOM Storage
- Vérifier logs de restauration dans console

---

### TEST 6 : Isolation entre Chats (7 min)

#### Objectif
Confirmer qu'il n'y a pas de contamination entre chats différents.

#### Procédure
```
CHAT 1 :
1. Ouvrir Chat 1
2. Créer une table avec contenu "Chat1_Data"
3. Observer console : sauvegarde confirmée
4. Noter sessionId : console.log(window.domStorageManager.getStats())

CHAT 2 :
5. Passer à Chat 2 (nouveau chat)
6. Vérifier : table "Chat1_Data" N'apparaît PAS
7. Créer une table avec contenu "Chat2_Data"
8. Observer console : sauvegarde confirmée
9. Noter sessionId (doit être différent de Chat1)

RETOUR CHAT 1 :
10. Revenir à Chat 1
11. Vérifier : table "Chat1_Data" réapparaît
12. Vérifier : table "Chat2_Data" N'apparaît PAS
```

#### Résultat attendu
```
✅ Chat 1 : Table avec "Chat1_Data" visible
✅ Chat 2 : Seulement table "Chat2_Data" visible
✅ Retour Chat 1 : Seulement "Chat1_Data" visible
✅ SessionIds différents entre Chat1 et Chat2
```

#### Vérification détaillée
```javascript
// Console
const stats = window.domStorageManager.getStats();
console.log('Sessions:', stats.sessions.map(s => ({
  id: s.sessionId,
  tables: s.keywords
})));

// Attendu : 2 sessions avec tables différentes
```

#### ❌ En cas d'échec
- Vérifier détection sessionId (React State / URL / DOM)
- Vérifier que `auto-restore-chat-change.js` fonctionne
- Inspecter conteneur DOM pour voir structure des sessions

---

### TEST 7 : Absence de Doublons (5 min)

#### Objectif
Confirmer qu'il n'y a plus de problème de doublons.

#### Procédure
```
1. Ouvrir un chat
2. Créer une table avec keyword "Test_Duplicate"
3. Sauvegarder : menu clic droit → action quelconque
4. Attendre 1 seconde
5. Sauvegarder à nouveau (même keyword)
6. Vérifier DOM Storage
```

#### Vérification
```javascript
// Console
const storage = document.getElementById('claraverse-dom-storage');
const sessionContainer = storage.querySelector('[data-session-id]');
const tables = sessionContainer.querySelectorAll('table[data-keyword="Test_Duplicate"]');

console.log('Nombre de tables avec keyword "Test_Duplicate":', tables.length);

// Attendu : 1 (pas de doublon)
```

#### Résultat attendu
```
✅ Une seule table avec keyword "Test_Duplicate"
✅ Console : "🔄 [DOM Storage] Table mise à jour: Test_Duplicate"
   (pas "Table sauvegardée" en doublon)
```

#### ❌ En cas d'échec
- Vérifier logique dans `dom-storage-manager.js` (ligne ~45-65)
- Vérifier que keyword est unique par session

---

### TEST 8 : Désactivation IndexedDB (3 min)

#### Objectif
Confirmer qu'IndexedDB n'est plus utilisé.

#### Procédure
```
1. Ouvrir DevTools (F12)
2. Onglet Application (Chrome) ou Storage (Firefox)
3. IndexedDB → Chercher "clara_db"
4. Vérifier état de la base
```

#### Résultat attendu
```
✅ Option A : Base "clara_db" n'existe plus
✅ Option B : Base existe mais vide (stores vides)
✅ Console : ⚠️ messages de désactivation IndexedDB
```

#### Vérification console
```javascript
// Console
console.log('flowiseTableService:', window.flowiseTableService);
console.log('flowiseTableBridge:', window.flowiseTableBridge);

// Attendu : undefined ou objets désactivés avec warnings
```

#### ❌ En cas d'échec
- Vérifier que services IndexedDB sont commentés/désactivés
- Vérifier que scripts n'utilisent plus événements IndexedDB
- Nettoyer manuellement IndexedDB si nécessaire

---

### TEST 9 : Performance et Rapidité (3 min)

#### Objectif
Vérifier que le système DOM est plus rapide qu'IndexedDB.

#### Procédure
```javascript
// Console

// Test de sauvegarde (10 tables)
console.time('DOM Save 10 tables');
for (let i = 0; i < 10; i++) {
  const table = document.createElement('table');
  table.innerHTML = '<tr><td>Data</td></tr>';
  table.setAttribute('data-keyword', `Test_${i}`);
  
  window.domStorageManager.saveTable('perf_session', `Test_${i}`, table);
}
console.timeEnd('DOM Save 10 tables');

// Test de restauration (10 tables)
console.time('DOM Restore 10 tables');
const tables = window.domStorageManager.restoreAllTables('perf_session');
console.timeEnd('DOM Restore 10 tables');

console.log('Tables restaurées:', tables.length);
```

#### Résultat attendu
```
✅ DOM Save 10 tables: < 5ms
✅ DOM Restore 10 tables: < 2ms
✅ Tables restaurées: 10
```

#### Comparaison
- **IndexedDB (ancien)** : 50-100ms pour 10 tables
- **DOM Storage (nouveau)** : < 5ms pour 10 tables
- **Gain** : ~20x plus rapide

---

### TEST 10 : Modifications Complexes (5 min)

#### Objectif
Tester persistance avec modifications complexes (styles, classes, etc.).

#### Procédure
```
1. Ouvrir un chat avec table
2. Modifier cellule : changer texte
3. Ajouter style : cellule.style.backgroundColor = 'yellow'
4. Ajouter classe : cellule.classList.add('highlight')
5. Attendre auto-save (1 seconde)
6. Recharger page (F5)
7. Vérifier que TOUTES les modifications sont préservées
```

#### Résultat attendu
```
✅ Texte modifié : préservé
✅ Style backgroundColor : préservé (jaune)
✅ Classe 'highlight' : préservée
✅ Structure complète : identique
```

#### ❌ En cas d'échec
- Vérifier que `cloneNode(true)` est utilisé
- Vérifier que innerHTML + attributs sont copiés
- Inspecter table restaurée dans DevTools

---

## 📊 TABLEAU DE SYNTHÈSE

| Test | Objectif | Durée | Statut |
|------|----------|-------|--------|
| 1. Conteneur DOM | Vérifier création conteneur | 2 min | ⬜ |
| 2. Sauvegarde manuelle | Tester sauvegarde basique | 3 min | ⬜ |
| 3. Restauration manuelle | Tester restauration basique | 3 min | ⬜ |
| 4. Auto-save | Vérifier sauvegarde auto | 5 min | ⬜ |
| 5. Persistance F5 | Tester rechargement page | 5 min | ⬜ |
| 6. Isolation sessions | Vérifier pas de contamination | 7 min | ⬜ |
| 7. Absence doublons | Confirmer pas de doublons | 5 min | ⬜ |
| 8. Désactivation IndexedDB | Vérifier IndexedDB désactivé | 3 min | ⬜ |
| 9. Performance | Mesurer rapidité | 3 min | ⬜ |
| 10. Modifications complexes | Tester styles/classes | 5 min | ⬜ |

**Total** : ~41 minutes

---

## ✅ CRITÈRES DE SUCCÈS

### Succès Total (10/10)
- ✅ Tous les tests passent
- ✅ Aucun doublon observé
- ✅ Modifications persistantes à 100%
- ✅ Isolation parfaite entre sessions
- ✅ Performance > IndexedDB

**→ Migration réussie !**

### Succès Partiel (7-9/10)
- ⚠️ Quelques tests échouent
- ⚠️ Problèmes mineurs identifiés
- 🔧 Corrections nécessaires

**→ Consulter guide de dépannage**

### Échec (< 7/10)
- ❌ Tests critiques échouent
- ❌ Système non fonctionnel
- 🔙 Revenir à phase précédente

**→ Revoir plan d'implémentation**

---

## 🔧 COMMANDES DE DÉBOGAGE

### Diagnostic complet
```javascript
// État DOM Storage
window.domStorageManager.diagnose()

// État Restore Manager
console.log('Is restoring:', window.domRestoreManager.isRestoring)
console.log('Last restore:', window.domRestoreManager.lastRestoreTime)

// État Auto-Save
console.log('Observed tables:', window.domAutoSave?.observedTables)
```

### Inspection manuelle
```javascript
// Voir contenu brut du conteneur
const storage = document.getElementById('claraverse-dom-storage');
console.log('HTML:', storage.innerHTML);

// Compter tables par session
storage.querySelectorAll('[data-session-id]').forEach(session => {
  const sessionId = session.dataset.sessionId;
  const tableCount = session.querySelectorAll('table').length;
  console.log(`Session ${sessionId}: ${tableCount} table(s)`);
});
```

### Nettoyage de test
```javascript
// Supprimer session de test
window.domStorageManager.clearSession('test_session');
window.domStorageManager.clearSession('perf_session');

// Réinitialiser conteneur (⚠️ PERTE DE DONNÉES)
document.getElementById('claraverse-dom-storage').innerHTML = '';
location.reload();
```

---

## 📋 RAPPORT DE TEST

À remplir après exécution :

```
Date des tests : _______________
Testeur : _______________

RÉSULTATS :
- Test 1 : ⬜ Réussi  ⬜ Échoué
- Test 2 : ⬜ Réussi  ⬜ Échoué
- Test 3 : ⬜ Réussi  ⬜ Échoué
- Test 4 : ⬜ Réussi  ⬜ Échoué
- Test 5 : ⬜ Réussi  ⬜ Échoué
- Test 6 : ⬜ Réussi  ⬜ Échoué
- Test 7 : ⬜ Réussi  ⬜ Échoué
- Test 8 : ⬜ Réussi  ⬜ Échoué
- Test 9 : ⬜ Réussi  ⬜ Échoué
- Test 10 : ⬜ Réussi  ⬜ Échoué

SCORE : ___/10

STATUT MIGRATION : ⬜ Réussie  ⬜ Partielle  ⬜ Échec

NOTES :
_________________________________
_________________________________
_________________________________
```

---

**Ce guide permet de valider complètement la migration vers DOM Storage**

*Durée totale : 30-45 minutes*
