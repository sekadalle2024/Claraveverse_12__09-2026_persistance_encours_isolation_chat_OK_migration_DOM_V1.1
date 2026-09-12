# 🔧 RÉSOLUTION PERSISTANCE MODELISED_TABLE

**Date** : 12 Septembre 2026  
**Problème** : La table [Modelised_table] n'est pas entièrement persistée (seules les insertions de lignes, pas les modifications de cellules via menus déroulants)  
**Impact** : Les utilisateurs perdent leurs modifications dans les colonnes Assertion/Conclusion/Ctr après rechargement  

---

## 🔍 DIAGNOSTIC

### Symptômes Observés
- ✅ Tables standard : 100% persistées
- ✅ Insertion de lignes dans [Modelised_table] : Persistée
- ❌ Modifications de cellules (menus déroulants) : **NON persistées**
- ❌ Sélections Assertion/Conclusion/Ctr : **Perdues au rechargement**

### Cause Racine

**Problème 1 : Timing de sauvegarde**
```javascript
// dom-auto-save.js ligne 88
this.saveDelay = 500; // 500ms debounce

// Le menu déroulant met environ 300-400ms à se fermer et mettre à jour la cellule
// Si l'utilisateur clique dans plusieurs cellules rapidement, le debounce annule
// les sauvegardes précédentes
```

**Problème 2 : Flash visuel perturbe MutationObserver**
```javascript
// conso.js ligne 680 - setupAssertionCell()
cell.style.backgroundColor = "#e8f5e8"; // Changement de style
debug.log(`Assertion sélectionnée: ${value}`);
// Sauvegarde déclenchée
const parentTable = this.findParentTable(cell);
if (parentTable) {
  debug.log("💾 Déclenchement sauvegarde depuis assertion");
  this.saveTableData(parentTable); // ← Avec debounce 500ms
}
```

Le flash visuel (changement backgroundColor) déclenche le MutationObserver de `dom-auto-save.js`, mais le debounce peut empêcher la sauvegarde finale si l'utilisateur continue à cliquer.

**Problème 3 : Pas de sauvegarde forcée après fermeture menu**
Les menus déroulants (Assertion/Conclusion/Ctr) ne forcent pas une sauvegarde immédiate après sélection.

---

## 🎯 SOLUTION PROPOSÉE

### Stratégie Multi-Niveau

#### Niveau 1 : Sauvegarde Immédiate après Menu Déroulant (CRITIQUE)
Forcer une sauvegarde **sans debounce** après chaque sélection dans un menu déroulant.

#### Niveau 2 : Augmenter Debounce DOM Auto-Save
Passer de 500ms à 1000ms pour laisser le temps aux modifications multiples.

#### Niveau 3 : Checkpoint avant Navigation
Sauvegarder toutes les tables avant changement de page/session.

#### Niveau 4 : Logs de Traçabilité
Améliorer les logs pour tracer exactement quand les sauvegardes échouent.

---

## 🛠️ IMPLÉMENTATION

### MODIFICATION 1 : `conso.js` - Sauvegarde Immédiate Menus Déroulants

#### A. Fonction Assertion Cell (ligne ~670)

**AVANT** :
```javascript
setupAssertionCell(cell) {
  cell.style.cursor = "pointer";
  cell.style.backgroundColor = cell.style.backgroundColor || "#f8f9fa";
  cell.title = "Cliquez pour sélectionner une assertion";

  cell.addEventListener("click", (e) => {
    e.stopPropagation();
    this.showAssertionMenu(
      cell,
      (value) => {
        cell.textContent = value;
        cell.style.backgroundColor = "#e8f5e8";
        debug.log(`Assertion sélectionnée: ${value}`);
        // Sauvegarder après modification
        const parentTable = this.findParentTable(cell);
        if (parentTable) {
          debug.log("💾 Déclenchement sauvegarde depuis assertion");
          this.saveTableData(parentTable); // ← DEBOUNCE 500ms
        } else {
          debug.warn("⚠️ Table parente non trouvée pour sauvegarde");
        }
      },
    );
  });
}
```

**APRÈS** :
```javascript
setupAssertionCell(cell) {
  cell.style.cursor = "pointer";
  cell.style.backgroundColor = cell.style.backgroundColor || "#f8f9fa";
  cell.title = "Cliquez pour sélectionner une assertion";

  cell.addEventListener("click", (e) => {
    e.stopPropagation();
    this.showAssertionMenu(
      cell,
      (value) => {
        cell.textContent = value;
        cell.style.backgroundColor = "#e8f5e8";
        debug.log(`Assertion sélectionnée: ${value}`);
        
        // ✅ MODIFICATION : Sauvegarde IMMÉDIATE (sans debounce)
        const parentTable = this.findParentTable(cell);
        if (parentTable) {
          debug.log("💾 [CRITIQUE] Sauvegarde IMMÉDIATE depuis assertion");
          this.saveTableDataNow(parentTable); // ← IMMÉDIAT
          
          // ✅ Double sécurité : Sauvegarder aussi via DOM Storage directement
          if (window.domStorageManager && parentTable.dataset.keyword) {
            const sessionId = this.detectCurrentSessionId();
            window.domStorageManager.saveTable(sessionId, parentTable.dataset.keyword, parentTable);
            debug.log("💾 [CRITIQUE] Double sauvegarde DOM Storage assertion OK");
          }
        } else {
          debug.warn("⚠️ Table parente non trouvée pour sauvegarde");
        }
      },
    );
  });
}
```

#### B. Fonction Conclusion Cell (ligne ~730)

**AVANT** :
```javascript
setupConclusionCell(cell, table) {
  cell.style.cursor = "pointer";
  cell.style.backgroundColor = cell.style.backgroundColor || "#f8f9fa";
  cell.title = "Cliquez pour sélectionner une conclusion";

  cell.addEventListener("click", (e) => {
    e.stopPropagation();
    this.showDropdown(
      cell,
      ["Satisfaisant", "Non-Satisfaisant", "Limitation", "Non-Applicable"],
      (value) => {
        cell.textContent = value;

        if (value === "Non-Satisfaisant" || value === "Limitation") {
          cell.style.backgroundColor = "#fee";
          debug.log(`Conclusion défavorable sélectionnée: ${value}`);
          this.scheduleConsolidation(table);
        } else {
          cell.style.backgroundColor = "#efe";
        }
        // Sauvegarder après modification
        debug.log("💾 Déclenchement sauvegarde depuis conclusion");
        this.saveTableData(table); // ← DEBOUNCE 500ms
      },
    );
  });
}
```

**APRÈS** :
```javascript
setupConclusionCell(cell, table) {
  cell.style.cursor = "pointer";
  cell.style.backgroundColor = cell.style.backgroundColor || "#f8f9fa";
  cell.title = "Cliquez pour sélectionner une conclusion";

  cell.addEventListener("click", (e) => {
    e.stopPropagation();
    this.showDropdown(
      cell,
      ["Satisfaisant", "Non-Satisfaisant", "Limitation", "Non-Applicable"],
      (value) => {
        cell.textContent = value;

        if (value === "Non-Satisfaisant" || value === "Limitation") {
          cell.style.backgroundColor = "#fee";
          debug.log(`Conclusion défavorable sélectionnée: ${value}`);
          this.scheduleConsolidation(table);
        } else {
          cell.style.backgroundColor = "#efe";
        }
        
        // ✅ MODIFICATION : Sauvegarde IMMÉDIATE (sans debounce)
        debug.log("💾 [CRITIQUE] Sauvegarde IMMÉDIATE depuis conclusion");
        this.saveTableDataNow(table); // ← IMMÉDIAT
        
        // ✅ Double sécurité : Sauvegarder aussi via DOM Storage directement
        if (window.domStorageManager && table.dataset.keyword) {
          const sessionId = this.detectCurrentSessionId();
          window.domStorageManager.saveTable(sessionId, table.dataset.keyword, table);
          debug.log("💾 [CRITIQUE] Double sauvegarde DOM Storage conclusion OK");
        }
      },
    );
  });
}
```

#### C. Fonction CTR Cell (ligne ~760)

**AVANT** :
```javascript
setupCtrCell(cell) {
  cell.style.cursor = "pointer";
  cell.style.backgroundColor = cell.style.backgroundColor || "#f8f9fa";
  cell.title = "Cliquez pour sélectionner un contrôle";

  cell.addEventListener("click", (e) => {
    e.stopPropagation();
    this.showDropdown(cell, ["+", "-", "N/A"], (value) => {
      cell.textContent = value;
      cell.style.backgroundColor =
        value === "+" ? "#e8f5e8" : value === "-" ? "#fee8e8" : "#f5f5f5";
      // Sauvegarder après modification
      const parentTable = this.findParentTable(cell);
      if (parentTable) {
        debug.log("💾 Déclenchement sauvegarde depuis CTR");
        this.saveTableData(parentTable); // ← DEBOUNCE 500ms
      } else {
        debug.warn("⚠️ Table parente non trouvée pour sauvegarde");
      }
    });
  });
}
```

**APRÈS** :
```javascript
setupCtrCell(cell) {
  cell.style.cursor = "pointer";
  cell.style.backgroundColor = cell.style.backgroundColor || "#f8f9fa";
  cell.title = "Cliquez pour sélectionner un contrôle";

  cell.addEventListener("click", (e) => {
    e.stopPropagation();
    this.showDropdown(cell, ["+", "-", "N/A"], (value) => {
      cell.textContent = value;
      cell.style.backgroundColor =
        value === "+" ? "#e8f5e8" : value === "-" ? "#fee8e8" : "#f5f5f5";
      
      // ✅ MODIFICATION : Sauvegarde IMMÉDIATE (sans debounce)
      const parentTable = this.findParentTable(cell);
      if (parentTable) {
        debug.log("💾 [CRITIQUE] Sauvegarde IMMÉDIATE depuis CTR");
        this.saveTableDataNow(parentTable); // ← IMMÉDIAT
        
        // ✅ Double sécurité : Sauvegarder aussi via DOM Storage directement
        if (window.domStorageManager && parentTable.dataset.keyword) {
          const sessionId = this.detectCurrentSessionId();
          window.domStorageManager.saveTable(sessionId, parentTable.dataset.keyword, parentTable);
          debug.log("💾 [CRITIQUE] Double sauvegarde DOM Storage CTR OK");
        }
      } else {
        debug.warn("⚠️ Table parente non trouvée pour sauvegarde");
      }
    });
  });
}
```

---

### MODIFICATION 2 : `dom-auto-save.js` - Augmenter Debounce

**AVANT** (ligne 7) :
```javascript
constructor() {
  this.saveTimeout = null;
  this.saveDelay = 500; // 500ms debounce
  this.observedTables = new WeakSet();
  this.init();
}
```

**APRÈS** :
```javascript
constructor() {
  this.saveTimeout = null;
  this.saveDelay = 1000; // ✅ 1000ms debounce (pour modifications multiples)
  this.observedTables = new WeakSet();
  this.init();
}
```

**Raison** : Laisser plus de temps pour les modifications rapides successives avant de sauvegarder.

---

### MODIFICATION 3 : `dom-storage-manager.js` - Logs Améliorés

Ajouter des logs de trace pour savoir **exactement** quand une table est sauvegardée.

**À ajouter après ligne 79** :
```javascript
/**
 * Sauvegarder une table dans le DOM
 */
saveTable(sessionId, keyword, tableElement) {
  try {
    const sessionContainer = this.getSessionContainer(sessionId);
    
    // ✅ NOUVEAU : Log détaillé AVANT sauvegarde
    console.log(`📝 [DOM Storage] Tentative sauvegarde: sessionId=${sessionId}, keyword=${keyword}`);
    console.log(`📝 [DOM Storage] Contenu table: ${tableElement.textContent.substring(0, 100)}...`);
    
    // Chercher table existante
    let storedTable = sessionContainer.querySelector(`table[data-keyword="${keyword}"]`);
    
    if (storedTable) {
      // Mettre à jour contenu existant
      storedTable.innerHTML = tableElement.innerHTML;
      
      // Copier tous les attributs
      Array.from(tableElement.attributes).forEach(attr => {
        if (attr.name !== 'data-keyword') {
          storedTable.setAttribute(attr.name, attr.value);
        }
      });
      
      storedTable.setAttribute('data-updated-at', new Date().toISOString());
      console.log(`🔄 [DOM Storage] Table mise à jour: ${keyword} (${new Date().toLocaleTimeString()})`);
    } else {
      // Créer nouvelle table
      storedTable = tableElement.cloneNode(true);
      storedTable.setAttribute('data-keyword', keyword);
      storedTable.setAttribute('data-table-id', tableElement.dataset.tableId || `table_${Date.now()}`);
      storedTable.setAttribute('data-saved-at', new Date().toISOString());
      sessionContainer.appendChild(storedTable);
      console.log(`💾 [DOM Storage] Table sauvegardée: ${keyword} (${new Date().toLocaleTimeString()})`);
    }
    
    // ✅ NOUVEAU : Log détaillé APRÈS sauvegarde
    console.log(`✅ [DOM Storage] Sauvegarde confirmée: ${keyword}`);
    console.log(`✅ [DOM Storage] Timestamp: ${new Date().toISOString()}`);
    console.log(`✅ [DOM Storage] Taille: ${storedTable.outerHTML.length} chars`);
    
    return true;
  } catch (error) {
    console.error('❌ [DOM Storage] Erreur sauvegarde:', error);
    console.error('❌ [DOM Storage] Keyword:', keyword);
    console.error('❌ [DOM Storage] SessionId:', sessionId);
    return false;
  }
}
```

---

### MODIFICATION 4 : Sauvegarde Checkpoint Avant Navigation

Créer un nouveau fichier `dom-checkpoint-saver.js` pour sauvegarder avant changement de page.

**Fichier** : `h:\Claraverse_1_0\public\dom-checkpoint-saver.js`

```javascript
/**
 * DOM Checkpoint Saver
 * Sauvegarde automatique avant navigation/fermeture
 * Date: 12 Septembre 2026
 */

class DOMCheckpointSaver {
  constructor() {
    this.init();
  }

  init() {
    // Sauvegarder avant déchargement de la page
    window.addEventListener('beforeunload', (e) => {
      this.saveAllTablesCheckpoint();
    });

    // Sauvegarder avant navigation (pour SPA)
    window.addEventListener('popstate', () => {
      this.saveAllTablesCheckpoint();
    });

    // Sauvegarder avant changement de session
    document.addEventListener('claraverse:session:changed', () => {
      this.saveAllTablesCheckpoint();
    });

    console.log('✅ [DOM Checkpoint] Initialisé');
  }

  saveAllTablesCheckpoint() {
    console.log('🔄 [DOM Checkpoint] Sauvegarde checkpoint...');

    const tables = document.querySelectorAll('table[data-keyword]');
    const sessionId = this.detectCurrentSessionId();
    let savedCount = 0;

    tables.forEach(table => {
      // Ignorer tables du conteneur de stockage
      if (!table.closest || !table.closest('#claraverse-dom-storage')) {
        if (window.domStorageManager) {
          const success = window.domStorageManager.saveTable(sessionId, table.dataset.keyword, table);
          if (success) savedCount++;
        }
      }
    });

    console.log(`💾 [DOM Checkpoint] ${savedCount} table(s) sauvegardée(s) en checkpoint`);
    return savedCount;
  }

  detectCurrentSessionId() {
    // Méthode 1 : sessionStorage
    let sessionId = sessionStorage.getItem('claraverse_stable_session');
    if (sessionId) return sessionId;

    // Méthode 2 : React State
    if (window.claraverseState?.currentSession?.id) {
      return window.claraverseState.currentSession.id;
    }

    // Méthode 3 : URL
    const urlParams = new URLSearchParams(window.location.search);
    sessionId = urlParams.get('sessionId') || urlParams.get('session');
    if (sessionId) return sessionId;

    // Méthode 4 : DOM
    const sessionElement = document.querySelector('[data-session-id]');
    if (sessionElement) {
      return sessionElement.dataset.sessionId;
    }

    // Fallback
    console.warn('⚠️ [DOM Checkpoint] SessionId non détecté');
    return 'session_unsaved';
  }

  /**
   * API publique pour forcer un checkpoint
   */
  forceCheckpoint() {
    return this.saveAllTablesCheckpoint();
  }
}

// Initialiser
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.domCheckpointSaver = new DOMCheckpointSaver();
  });
} else {
  window.domCheckpointSaver = new DOMCheckpointSaver();
}

console.log('✅ [DOM Checkpoint Saver] Script chargé');
```

---

### MODIFICATION 5 : `index.html` - Charger Checkpoint Saver

Ajouter après la ligne des autres scripts DOM (ligne ~100) :

```html
<!-- ⭐ NOUVEAU SYSTÈME DOM STORAGE ⭐ -->
<script src="/dom-storage-manager.js"></script>
<script src="/dom-restore-manager.js"></script>
<script src="/dom-auto-save.js"></script>
<!-- ✅ NOUVEAU : Checkpoint avant navigation -->
<script src="/dom-checkpoint-saver.js"></script>
```

---

## 🧪 TESTS DE VALIDATION

### Test 1 : Sauvegarde Immédiate Menus Déroulants

**Procédure** :
1. Générer une table [Modelised_table] avec GPT
2. Cliquer sur une cellule Assertion → Sélectionner "Validité"
3. **Immédiatement** ouvrir DevTools Console
4. Chercher `💾 [CRITIQUE] Sauvegarde IMMÉDIATE depuis assertion`
5. Chercher `💾 [CRITIQUE] Double sauvegarde DOM Storage assertion OK`
6. Inspecter `#claraverse-dom-storage` → Vérifier contenu table

**Résultat attendu** :
```
💾 [CRITIQUE] Sauvegarde IMMÉDIATE depuis assertion
📝 [DOM Storage] Tentative sauvegarde: sessionId=session_xxx, keyword=Table_7_xxx
✅ [DOM Storage] Sauvegarde confirmée: Table_7_xxx
💾 [CRITIQUE] Double sauvegarde DOM Storage assertion OK
```

---

### Test 2 : Modifications Multiples Rapides

**Procédure** :
1. Générer table [Modelised_table]
2. Cliquer rapidement dans 5 cellules Conclusion différentes
3. Sélectionner différentes valeurs ("Satisfaisant", "Non-Satisfaisant", etc.)
4. Attendre 2 secondes
5. Recharger page
6. Vérifier toutes les modifications sont présentes

**Résultat attendu** :
✅ Toutes les 5 cellules ont conservé leurs valeurs

---

### Test 3 : Checkpoint Avant Navigation

**Procédure** :
1. Générer table [Modelised_table]
2. Modifier 3 cellules (Assertion + Conclusion + Ctr)
3. **Immédiatement** cliquer sur "Nouveau Chat" (navigation)
4. Revenir au chat précédent
5. Vérifier les modifications

**Résultat attendu** :
```
🔄 [DOM Checkpoint] Sauvegarde checkpoint...
💾 [DOM Checkpoint] 12 table(s) sauvegardée(s) en checkpoint
```
✅ Modifications présentes au retour

---

### Test 4 : Logs de Traçabilité

**Procédure** :
1. Générer table [Modelised_table]
2. Modifier cellule Assertion
3. Observer console

**Résultat attendu** :
```
💾 [CRITIQUE] Sauvegarde IMMÉDIATE depuis assertion
💾 [CONSO] Début de sauvegarde immédiate
🆔 ID de table pour sauvegarde: table_abc123
💾 [CONSO] Table sauvegardée dans DOM Storage: Table_7_xxx
📝 [DOM Storage] Tentative sauvegarde: sessionId=session_xxx, keyword=Table_7_xxx
📝 [DOM Storage] Contenu table: ...
✅ [DOM Storage] Sauvegarde confirmée: Table_7_xxx
✅ [DOM Storage] Timestamp: 2026-09-12T21:30:45.123Z
✅ [DOM Storage] Taille: 5432 chars
💾 [CRITIQUE] Double sauvegarde DOM Storage assertion OK
```

---

## 📊 CHECKLIST IMPLÉMENTATION

### Phase 1 : Modifications Code
- [ ] Modifier `conso.js` → `setupAssertionCell()` (sauvegarde immédiate)
- [ ] Modifier `conso.js` → `setupConclusionCell()` (sauvegarde immédiate)
- [ ] Modifier `conso.js` → `setupCtrCell()` (sauvegarde immédiate)
- [ ] Modifier `dom-auto-save.js` → Augmenter debounce à 1000ms
- [ ] Modifier `dom-storage-manager.js` → Ajouter logs détaillés
- [ ] Créer `dom-checkpoint-saver.js` (nouveau fichier)
- [ ] Modifier `index.html` → Charger checkpoint saver

### Phase 2 : Tests Validation
- [ ] Test 1 : Sauvegarde immédiate menus déroulants
- [ ] Test 2 : Modifications multiples rapides
- [ ] Test 3 : Checkpoint avant navigation
- [ ] Test 4 : Logs de traçabilité

### Phase 3 : Documentation
- [ ] Mettre à jour `09_RAPPORT_MIGRATION_COMPLETE_12_SEPT_2026.md`
- [ ] Créer rapport de test
- [ ] Documenter logs de débogage

---

## 🎯 RÉSULTAT ATTENDU

Après implémentation :

✅ **Persistance 100%** des modifications [Modelised_table]  
✅ **Sauvegarde immédiate** après sélection menu déroulant  
✅ **Double sécurité** (saveTableDataNow + domStorageManager direct)  
✅ **Checkpoint automatique** avant navigation  
✅ **Logs détaillés** pour traçabilité  

---

**Date de création** : 12 Septembre 2026  
**Auteur** : Kiro AI  
**Version** : 1.0  
**Statut** : Prêt pour implémentation

