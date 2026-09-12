# 🔧 GUIDE DE DÉPANNAGE RAPIDE - Système de Persistance

**Date** : 12 Septembre 2026  
**Type** : Guide pratique  
**Durée** : 5-10 minutes  

---

## 🎯 DIAGNOSTIC EXPRESS

### Étape 1 : Vérifier IndexedDB (30 secondes)

**Ouvrir DevTools** :
1. Appuyer sur `F12`
2. Onglet **Application** (Chrome) ou **Storage** (Firefox)
3. **IndexedDB** → `clara_db` → `clara_generated_tables`

**✅ Attendu** :
- Base de données visible
- Enregistrements présents avec structure complète
- Champs : `id`, `sessionId`, `keyword`, `html`, etc.

**❌ Problème détecté** :
- Base absente → Aller à [Section A](#section-a-indexeddb-absent)
- Base vide → Aller à [Section B](#section-b-indexeddb-vide)
- Données corrompues → Aller à [Section C](#section-c-données-corrompues)

---

### Étape 2 : Vérifier localStorage (15 secondes)

**Console JavaScript** :
```javascript
localStorage.getItem('claraverse_tables_data')
```

**✅ Attendu** :
- `null` ou `undefined`
- localStorage N'EST PAS utilisé

**❌ Problème détecté** :
- Données présentes → Aller à [Section D](#section-d-localstorage-actif)

---

### Étape 3 : Vérifier attributs DOM (30 secondes)

**Console JavaScript** :
```javascript
// Lister tables avec data-keyword
document.querySelectorAll('table[data-keyword]').forEach(t => {
  console.log(t.dataset.keyword, t.dataset.tableId);
});
```

**✅ Attendu** :
- Tables listées avec `data-keyword`
- Exemple : `Table_Consolidation table_consolidation_1726166400`

**❌ Problème détecté** :
- Aucune table → Aller à [Section E](#section-e-pas-de-tables-dom)
- Tables sans attributs → Aller à [Section F](#section-f-attributs-manquants)

---

### Étape 4 : Diagnostic automatique (30 secondes)

**Console JavaScript** :
```javascript
runDiagnostic()
```

**✅ Attendu** :
- 8 tests passent (✅)
- Résumé : "Système opérationnel"

**❌ Problème détecté** :
- Tests échouent → Consulter rapport détaillé

---

## 🚨 PROBLÈMES FRÉQUENTS ET SOLUTIONS

### <a name="section-a"></a>Section A : IndexedDB Absent

**Symptôme** :
- Base `clara_db` n'existe pas dans DevTools
- Erreur console : `Failed to open database`

**Causes possibles** :
1. Navigation privée activée
2. IndexedDB désactivé dans navigateur
3. Quota de stockage plein
4. Extension bloquant IndexedDB

**Solutions** :

#### Solution 1 : Vérifier mode navigation
```
✅ Action : Désactiver mode privé/incognito
✅ Recharger la page
```

#### Solution 2 : Vérifier paramètres navigateur
```
Chrome :
  Settings → Privacy and Security → Site Settings
  → Content → Cookies and site data
  ✅ "Allow sites to save and read cookie data" activé

Firefox :
  about:preferences#privacy
  ✅ "Custom" → "Cookies and Site Data" autorisés
```

#### Solution 3 : Nettoyer cache navigateur
```javascript
// Console
await indexedDB.deleteDatabase('clara_db');
location.reload();
```

---

### <a name="section-b"></a>Section B : IndexedDB Vide

**Symptôme** :
- Base `clara_db` existe
- Store `clara_generated_tables` est vide
- Tables ne se sauvegardent pas

**Causes possibles** :
1. Service `flowiseTableBridge` non initialisé
2. Événements de sauvegarde non déclenchés
3. Erreur silencieuse dans sauvegarde

**Solutions** :

#### Solution 1 : Vérifier initialisation
```javascript
// Console
console.log('Bridge:', window.flowiseTableBridge);
console.log('Service:', window.flowiseTableService);
```

**Attendu** : Objets définis

#### Solution 2 : Forcer sauvegarde manuelle
```javascript
// Modifier une table (ajouter ligne via menu)
// Observer console pour logs de sauvegarde

// Attendu :
// "💾 [Bridge] Handling save request for: xxx"
// "✅ Table saved successfully: uuid"
```

#### Solution 3 : Vérifier quota
```javascript
// Console
if (navigator.storage && navigator.storage.estimate) {
  navigator.storage.estimate().then(estimate => {
    const percent = (estimate.usage / estimate.quota * 100).toFixed(2);
    console.log(`Quota utilisé: ${percent}%`);
    console.log(`Usage: ${(estimate.usage / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Quota: ${(estimate.quota / 1024 / 1024).toFixed(2)} MB`);
  });
}
```

**Action si quota plein** :
```javascript
// Nettoyer tables orphelines
await flowiseTableService.cleanupOrphanedTables();

// Nettoyer sessions temporaires
await flowiseTableBridge.cleanupTemporarySessions();
```

---

### <a name="section-c"></a>Section C : Données Corrompues

**Symptôme** :
- Erreurs lors de la lecture IndexedDB
- Tables restaurées vides ou incomplètes
- Console : `Error parsing table data`

**Causes possibles** :
1. Corruption de la base de données
2. Format de données obsolète
3. Migration incomplète

**Solutions** :

#### Solution 1 : Recréer la base (⚠️ PERTE DE DONNÉES)
```javascript
// Console
await indexedDB.deleteDatabase('clara_db');
location.reload();
```

#### Solution 2 : Export/Import manuel
```javascript
// 1. Exporter données existantes
const req = indexedDB.open('clara_db', 12);
req.onsuccess = (e) => {
  const db = e.target.result;
  const tx = db.transaction(['clara_generated_tables'], 'readonly');
  const store = tx.objectStore('clara_generated_tables');
  const getAll = store.getAll();
  getAll.onsuccess = () => {
    const backup = JSON.stringify(getAll.result);
    console.log('Backup créé:', backup.length, 'caractères');
    // Copier dans presse-papier
    navigator.clipboard.writeText(backup);
  };
};

// 2. Recréer base
await indexedDB.deleteDatabase('clara_db');
location.reload();

// 3. Importer backup (à implémenter selon besoin)
```

---

### <a name="section-d"></a>Section D : localStorage Actif

**Symptôme** :
- `localStorage.getItem('claraverse_tables_data')` retourne des données
- Migration localStorage → IndexedDB incomplète

**Causes possibles** :
1. Ancien code encore actif
2. Script `conso.js` non à jour
3. Conflit entre systèmes

**Solutions** :

#### Solution 1 : Vérifier version conso.js
```javascript
// Chercher dans conso.js (ligne 195-215)
// Doit contenir :
console.log("⚠️ [CONSO] Auto-save désactivé (utilise flowiseTableBridge)");
```

**Si absent** : Fichier `conso.js` obsolète → Mettre à jour

#### Solution 2 : Nettoyer localStorage manuellement
```javascript
// Console
localStorage.removeItem('claraverse_tables_data');
localStorage.removeItem('claraverse_tables_data_unsaved');

// Nettoyer toutes les clés Claraverse
Object.keys(localStorage).forEach(key => {
  if (key.startsWith('claraverse_')) {
    localStorage.removeItem(key);
    console.log('Supprimé:', key);
  }
});

location.reload();
```

---

### <a name="section-e"></a>Section E : Pas de Tables DOM

**Symptôme** :
- `document.querySelectorAll('table').length` retourne 0
- Aucune table visible dans l'interface

**Causes possibles** :
1. Chat vide (aucune table générée)
2. Tables générées mais non affichées
3. Erreur React/DOM

**Solutions** :

#### Solution 1 : Vérifier chat actif
```
✅ Envoyer un message au chatbot
✅ Demander génération d'une table
✅ Vérifier que Flowise répond
```

#### Solution 2 : Vérifier conteneur React
```javascript
// Console
console.log('Root React:', document.querySelector('#root'));
console.log('Conteneur chat:', document.querySelector('[data-session-id]'));
```

#### Solution 3 : Forcer restauration
```javascript
// Console
forceRestore()
```

---

### <a name="section-f"></a>Section F : Attributs Manquants

**Symptôme** :
- Tables présentes dans DOM
- Mais pas d'attributs `data-keyword`
- Restauration ne fonctionne pas

**Causes possibles** :
1. Script `conso.js` n'ajoute pas les attributs
2. Tables générées avant mise à jour du code
3. Conflit avec Flowise.js

**Solutions** :

#### Solution 1 : Ajouter attributs manuellement
```javascript
// Console - Patcher toutes les tables
document.querySelectorAll('table').forEach((table, index) => {
  if (!table.dataset.keyword) {
    table.setAttribute('data-keyword', `Table_${index}`);
    table.setAttribute('data-table-id', `table_${Date.now()}_${index}`);
    console.log('Patché:', table);
  }
});

// Sauvegarder
document.dispatchEvent(new CustomEvent('flowise:table:save:request', {
  detail: {
    table: document.querySelector('table'),
    sessionId: 'session_actuel',
    keyword: 'Table_0',
    source: 'manual'
  }
}));
```

#### Solution 2 : Recharger Flowise
```
✅ Fermer chat actuel
✅ Ouvrir nouveau chat
✅ Regénérer tables
✅ Vérifier attributs présents
```

---

## 📋 CHECKLIST DE VALIDATION

Après corrections, valider tous les points :

- [ ] **IndexedDB** : Base `clara_db` présente et peuplée
- [ ] **localStorage** : Vide ou absent
- [ ] **Attributs DOM** : Tables ont `data-keyword` et `data-table-id`
- [ ] **Sauvegarde** : Modifications persistent après F5
- [ ] **Restauration** : Tables restaurées automatiquement
- [ ] **Isolation** : Chat1 et Chat2 ont données séparées
- [ ] **Logs** : Aucune erreur dans console
- [ ] **Diagnostic** : `runDiagnostic()` passe tous les tests

---

## 🔍 COMMANDES UTILES

### Diagnostic
```javascript
// Diagnostic complet
runDiagnostic()

// Inspecter IndexedDB
checkIndexedDB()

// Lister tables DOM
listTables()

// Forcer restauration
forceRestore()
```

### Nettoyage
```javascript
// Nettoyer localStorage
Object.keys(localStorage).forEach(key => {
  if (key.startsWith('claraverse_')) {
    localStorage.removeItem(key);
  }
});

// Nettoyer IndexedDB (⚠️ PERTE DE DONNÉES)
await indexedDB.deleteDatabase('clara_db');
location.reload();

// Nettoyer tables orphelines
await flowiseTableService.cleanupOrphanedTables();

// Nettoyer sessions temporaires
await flowiseTableBridge.cleanupTemporarySessions();
```

### Information
```javascript
// Session actuelle
console.log('Session:', flowiseTableBridge.getCurrentSession());

// Quota de stockage
navigator.storage.estimate().then(estimate => {
  console.log('Utilisé:', (estimate.usage / 1024 / 1024).toFixed(2), 'MB');
  console.log('Quota:', (estimate.quota / 1024 / 1024).toFixed(2), 'MB');
  console.log('Disponible:', ((estimate.quota - estimate.usage) / 1024 / 1024).toFixed(2), 'MB');
});

// Cache LRU
console.log('Cache stats:', flowiseTableCache.getStats());
```

---

## 📞 SUPPORT AVANCÉ

### Logs détaillés

Activer logs détaillés dans console :
```javascript
// Avant de reproduire le problème
localStorage.setItem('debug', 'claraverse:*');
location.reload();
```

### Rapport de bug

Informations à collecter :
```javascript
// 1. Version navigateur
navigator.userAgent

// 2. État système
runDiagnostic()

// 3. Contenu IndexedDB
checkIndexedDB()

// 4. Tables DOM
listTables()

// 5. Logs console (copier tout)

// 6. Quota
navigator.storage.estimate()
```

---

## 🎓 RÉFÉRENCES RAPIDES

### Fichiers clés
- `public/conso.js` (ligne 195-215) : Désactivation localStorage
- `public/conso.js` (ligne 838) : Ajout data-keyword Table_Consolidation
- `public/conso.js` (ligne 1528) : Ajout data-keyword Table_Resultat
- `src/services/flowiseTableService.ts` : Service sauvegarde
- `src/services/flowiseTableBridge.ts` : Pont coordination

### Documentation
- `00_RAPPORT_ANALYSE_MIGRATION_DOM_VS_INDEXEDDB.md` : Analyse complète
- `01_GUIDE_ARCHITECTURE_SYSTEME_PERSISTANCE.md` : Architecture détaillée
- `DOCUMENTATION_COMPLETE_SOLUTION.md` : Solution complète

### Événements clés
- `flowise:table:save:request` : Demande sauvegarde
- `flowise:table:restore:request` : Demande restauration
- `flowise:table:structure:changed` : Table modifiée
- `claraverse:session:changed` : Changement de chat

---

**Date de création** : 12 Septembre 2026  
**Auteur** : Kiro AI  
**Version** : 1.0  

---

*Fin du guide de dépannage*
