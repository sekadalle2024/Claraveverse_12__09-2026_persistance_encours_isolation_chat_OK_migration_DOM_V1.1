# 🧪 GUIDE DE TEST - PERSISTANCE MODELISED_TABLE

**Date** : 12 Septembre 2026  
**Objectif** : Valider la persistance complète des tables [Modelised_table] après corrections  
**Durée estimée** : 30 minutes  

---

## 📋 CHECKLIST PRÉ-TEST

Avant de commencer, vérifier :

- [ ] Les modifications de code sont appliquées :
  - [ ] `conso.js` - Sauvegardes immédiates (Assertion/Conclusion/Ctr)
  - [ ] `dom-storage-manager.js` - Logs détaillés
  - [ ] `dom-auto-save.js` - Debounce 1000ms
  - [ ] `dom-checkpoint-saver.js` - Nouveau fichier créé
  - [ ] `index.html` - Checkpoint saver chargé

- [ ] Application démarrée (front-end + back-end)
- [ ] DevTools Console ouvert (F12)
- [ ] Navigateur sur page de chat Claraverse

---

## 🧪 TEST 1 : SAUVEGARDE IMMÉDIATE ASSERTION

### Objectif
Vérifier que la sélection d'une assertion déclenche une sauvegarde immédiate.

### Procédure

1. **Générer une table [Modelised_table]**
   - Envoyer un prompt au chatbot pour générer une table avec colonnes : 
     - Compte, Libellé, N-1, N, Écart, Assertion, Conclusion, Ctr
   - Attendre la génération complète

2. **Cliquer sur une cellule "Assertion"**
   - Choisir n'importe quelle ligne
   - Cliquer sur la cellule de la colonne "Assertion"
   - Menu déroulant devrait apparaître

3. **Sélectionner "Validité"**
   - Cliquer sur "Validité" dans le menu

4. **Vérifier les logs Console immédiatement**
   - Chercher dans la console :
   ```
   💾 [CRITIQUE] Sauvegarde IMMÉDIATE depuis assertion
   💾 [CONSO] Début de sauvegarde immédiate
   🆔 ID de table pour sauvegarde: table_xxxxx
   📝 [DOM Storage] Tentative sauvegarde: sessionId=xxx, keyword=Table_x_xxx
   ✅ [DOM Storage] Sauvegarde confirmée: Table_x_xxx
   ✅ [DOM Storage] Timestamp: 2026-09-12T...
   ✅ [DOM Storage] Taille: xxxx chars
   💾 [CRITIQUE] Double sauvegarde DOM Storage assertion OK
   ```

5. **Inspecter le DOM Storage**
   - DevTools > Elements
   - Chercher `<div id="claraverse-dom-storage">`
   - Expand : trouver `<div data-session-id="...">`
   - Expand : trouver `<table data-keyword="Table_x_xxx">`
   - Vérifier que la cellule Assertion contient bien "Validité"

6. **Recharger la page** (F5)

7. **Vérifier la restauration**
   - Tables restaurées sous la zone de saisie
   - Badge "✅ Table Restaurée"
   - Cellule Assertion contient toujours "Validité"

### Résultat Attendu
✅ Logs présents dans console  
✅ Table sauvegardée dans DOM Storage  
✅ Valeur "Validité" persistée après rechargement  

### En Cas d'Échec
- Vérifier que `conso.js` a bien été modifié
- Vérifier que `window.domStorageManager` existe (taper dans console)
- Vérifier que la table a bien un `data-keyword` (inspecter dans Elements)

---

## 🧪 TEST 2 : SAUVEGARDE IMMÉDIATE CONCLUSION

### Objectif
Vérifier que la sélection d'une conclusion déclenche une sauvegarde immédiate.

### Procédure

1. **Utiliser la même table du TEST 1** (ou en générer une nouvelle)

2. **Cliquer sur une cellule "Conclusion"**
   - Choisir une ligne différente
   - Cliquer sur la cellule de la colonne "Conclusion"

3. **Sélectionner "Non-Satisfaisant"**
   - Cliquer sur "Non-Satisfaisant" dans le menu

4. **Vérifier les logs Console**
   ```
   💾 [CRITIQUE] Sauvegarde IMMÉDIATE depuis conclusion
   📝 [DOM Storage] Tentative sauvegarde: ...
   ✅ [DOM Storage] Sauvegarde confirmée: ...
   💾 [CRITIQUE] Double sauvegarde DOM Storage conclusion OK
   ```

5. **Recharger la page** (F5)

6. **Vérifier la restauration**
   - Cellule Conclusion contient "Non-Satisfaisant"
   - Cellule rouge (backgroundColor = "#fee")

### Résultat Attendu
✅ Logs présents  
✅ Valeur "Non-Satisfaisant" persistée  
✅ Style (couleur rouge) persisté  

---

## 🧪 TEST 3 : SAUVEGARDE IMMÉDIATE CTR

### Objectif
Vérifier que la sélection d'un contrôle déclenche une sauvegarde immédiate.

### Procédure

1. **Cliquer sur une cellule "Ctr1" (ou Ctr2, Ctr3...)**

2. **Sélectionner "+"**
   - Cliquer sur "+" dans le menu

3. **Vérifier les logs Console**
   ```
   💾 [CRITIQUE] Sauvegarde IMMÉDIATE depuis CTR
   📝 [DOM Storage] Tentative sauvegarde: ...
   ✅ [DOM Storage] Sauvegarde confirmée: ...
   💾 [CRITIQUE] Double sauvegarde DOM Storage CTR OK
   ```

4. **Recharger la page** (F5)

5. **Vérifier**
   - Cellule Ctr contient "+"
   - Cellule verte (backgroundColor = "#e8f5e8")

### Résultat Attendu
✅ Valeur "+" persistée  
✅ Style (couleur verte) persisté  

---

## 🧪 TEST 4 : MODIFICATIONS MULTIPLES RAPIDES

### Objectif
Vérifier que des modifications rapides successives sont toutes sauvegardées.

### Procédure

1. **Cliquer rapidement dans 5 cellules différentes** (dans 5 secondes)
   - Cellule 1 Assertion → "Exhaustivité"
   - Cellule 2 Conclusion → "Satisfaisant"
   - Cellule 3 Ctr1 → "-"
   - Cellule 4 Assertion → "Formalisation"
   - Cellule 5 Conclusion → "Limitation"

2. **Attendre 2 secondes** (laisser le debounce se terminer)

3. **Vérifier Console**
   - Au moins 5 lignes `💾 [CRITIQUE] Sauvegarde IMMÉDIATE depuis...`

4. **Recharger la page** (F5)

5. **Vérifier TOUTES les modifications**
   - Cellule 1 : "Exhaustivité"
   - Cellule 2 : "Satisfaisant"
   - Cellule 3 : "-"
   - Cellule 4 : "Formalisation"
   - Cellule 5 : "Limitation"

### Résultat Attendu
✅ TOUTES les 5 modifications persistées  
✅ Ordre des modifications respecté  
✅ Styles corrects  

---

## 🧪 TEST 5 : INSERTION LIGNES + MODIFICATIONS

### Objectif
Vérifier que l'insertion de lignes ET les modifications de cellules sont persistées ensemble.

### Procédure

1. **Insérer 2 nouvelles lignes**
   - Clic droit sur table → "Insérer ligne en dessous"
   - Répéter une fois

2. **Remplir la ligne 1 ajoutée**
   - Compte : "411000"
   - Libellé : "Clients"
   - N : "1000000"
   - Assertion : "Validité"
   - Conclusion : "Satisfaisant"
   - Ctr1 : "+"

3. **Remplir la ligne 2 ajoutée**
   - Compte : "401000"
   - Libellé : "Ventes"
   - N : "5000000"
   - Assertion : "Exhaustivité"
   - Conclusion : "Non-Satisfaisant"
   - Ctr1 : "-"

4. **Attendre 2 secondes**

5. **Recharger page** (F5)

6. **Vérifier**
   - Les 2 lignes sont présentes
   - Toutes les valeurs saisies sont présentes
   - Les sélections de menus déroulants sont présentes

### Résultat Attendu
✅ Structure (2 lignes ajoutées) persistée  
✅ Contenu texte (Compte, Libellé, montants) persisté  
✅ Sélections menus (Assertion, Conclusion, Ctr) persistées  

---

## 🧪 TEST 6 : CHECKPOINT AVANT NAVIGATION

### Objectif
Vérifier que le checkpoint sauvegarde automatiquement avant changement de chat.

### Procédure

1. **Modifier 3 cellules**
   - Assertion : "Application"
   - Conclusion : "Limitation"
   - Ctr2 : "N/A"

2. **IMMÉDIATEMENT après (sans attendre)** → Cliquer sur "Nouveau Chat"

3. **Vérifier Console pendant navigation**
   ```
   🔄 [DOM Checkpoint] Sauvegarde checkpoint...
   📝 [DOM Storage] Tentative sauvegarde: ...
   💾 [DOM Checkpoint] XX table(s) sauvegardée(s) en checkpoint
   ```

4. **Revenir au chat précédent**
   - Utiliser historique ou liste des chats

5. **Vérifier les modifications**
   - Assertion = "Application"
   - Conclusion = "Limitation"
   - Ctr2 = "N/A"

### Résultat Attendu
✅ Checkpoint déclenché automatiquement  
✅ Modifications sauvegardées avant navigation  
✅ Données présentes au retour  

---

## 🧪 TEST 7 : LOGS DE TRAÇABILITÉ

### Objectif
Vérifier que tous les logs sont présents pour diagnostiquer les problèmes.

### Procédure

1. **Effacer Console** (Ctrl+L ou bouton Clear)

2. **Modifier une cellule Assertion** → "Permanence"

3. **Capturer et analyser les logs**

### Logs Attendus (dans l'ordre)

```
💾 [CRITIQUE] Sauvegarde IMMÉDIATE depuis assertion
💾 [CONSO] Début de sauvegarde immédiate
🆔 ID de table pour sauvegarde: table_abc123
📂 Données existantes chargées, nombre de tables: 0
📝 Données de la table préparées: {type: "Modelisée", headers: 8, cells: 45, timestamp: "..."}
⚠️ [CONSO] saveTableDataNow: Logique métier OK, sauvegarde localStorage skippée (flowiseTableBridge)
💾 [CONSO] Table sauvegardée dans DOM Storage: Table_7_xxx
📝 [DOM Storage] Tentative sauvegarde: sessionId=session_xxx, keyword=Table_7_xxx
📝 [DOM Storage] Contenu table: ...
🔄 [DOM Storage] Table mise à jour: Table_7_xxx (21:45:32)
✅ [DOM Storage] Sauvegarde confirmée: Table_7_xxx
✅ [DOM Storage] Timestamp: 2026-09-12T21:45:32.123Z
✅ [DOM Storage] Taille: 8765 chars
💾 [CONSO] Table sauvegardée dans DOM Storage: Table_7_xxx
💾 [CRITIQUE] Double sauvegarde DOM Storage assertion OK
```

### Résultat Attendu
✅ Logs complets présents  
✅ Traçabilité complète du flux  
✅ Pas d'erreurs  

---

## 🧪 TEST 8 : DIAGNOSTIC BUTTON

### Objectif
Vérifier que le bouton diagnostic fonctionne correctement.

### Procédure

1. **Cliquer sur le bouton "🔍 Diagnostic DOM Storage"**
   - Bouton en bas à droite de l'écran

2. **Télécharger le rapport JSON**
   - Fichier `diagnostic-dom-storage-YYYY-MM-DDTHH-MM-SS.json`

3. **Ouvrir le fichier JSON**

4. **Vérifier les données**
   ```json
   {
     "timestamp": "2026-09-12T...",
     "tests": [
       {
         "id": "test1",
         "name": "Vérification Chargement Managers",
         "passed": true,
         "details": [...]
       },
       ...
     ],
     "domStorage": {
       "totalSessions": 1,
       "totalTables": 12,
       "sessions": [...]
     }
   }
   ```

5. **Analyser**
   - `tests` : Tous passés (`"passed": true`)
   - `domStorage.totalTables` : Nombre correct de tables
   - `domStorage.sessions[0].keywords` : Contient vos tables

### Résultat Attendu
✅ Bouton fonctionne  
✅ Rapport JSON généré  
✅ Tous les tests passés  
✅ Tables listées correctement  

---

## 📊 RAPPORT DE TEST

### Template à Remplir

```
═══════════════════════════════════════════════
🧪 RAPPORT DE TEST - PERSISTANCE MODELISED_TABLE
═══════════════════════════════════════════════

Date : _________________
Testeur : _________________
Version Claraverse : _________________

─────────────────────────────────────────────
TEST 1 : SAUVEGARDE IMMÉDIATE ASSERTION
─────────────────────────────────────────────
✅ / ❌  Logs présents
✅ / ❌  Sauvegardé dans DOM Storage
✅ / ❌  Restauré après rechargement

Commentaires : _________________________________
________________________________________________

─────────────────────────────────────────────
TEST 2 : SAUVEGARDE IMMÉDIATE CONCLUSION
─────────────────────────────────────────────
✅ / ❌  Logs présents
✅ / ❌  Valeur persistée
✅ / ❌  Style persisté (couleur)

Commentaires : _________________________________
________________________________________________

─────────────────────────────────────────────
TEST 3 : SAUVEGARDE IMMÉDIATE CTR
─────────────────────────────────────────────
✅ / ❌  Logs présents
✅ / ❌  Valeur persistée
✅ / ❌  Style persisté (couleur)

Commentaires : _________________________________
________________________________________________

─────────────────────────────────────────────
TEST 4 : MODIFICATIONS MULTIPLES RAPIDES
─────────────────────────────────────────────
✅ / ❌  5 sauvegardes immédiates
✅ / ❌  Toutes les modifications persistées
✅ / ❌  Ordre respecté

Commentaires : _________________________________
________________________________________________

─────────────────────────────────────────────
TEST 5 : INSERTION LIGNES + MODIFICATIONS
─────────────────────────────────────────────
✅ / ❌  Lignes ajoutées persistées
✅ / ❌  Contenu texte persisté
✅ / ❌  Sélections menus persistées

Commentaires : _________________________________
________________________________________________

─────────────────────────────────────────────
TEST 6 : CHECKPOINT AVANT NAVIGATION
─────────────────────────────────────────────
✅ / ❌  Checkpoint déclenché
✅ / ❌  Modifications sauvegardées
✅ / ❌  Données présentes au retour

Commentaires : _________________________________
________________________________________________

─────────────────────────────────────────────
TEST 7 : LOGS DE TRAÇABILITÉ
─────────────────────────────────────────────
✅ / ❌  Logs complets
✅ / ❌  Flux tracé
✅ / ❌  Pas d'erreurs

Commentaires : _________________________________
________________________________________________

─────────────────────────────────────────────
TEST 8 : DIAGNOSTIC BUTTON
─────────────────────────────────────────────
✅ / ❌  Bouton fonctionne
✅ / ❌  Rapport généré
✅ / ❌  Tests passés

Commentaires : _________________________________
________________________________________________

═══════════════════════════════════════════════
RÉSULTAT GLOBAL
═══════════════════════════════════════════════

Tests réussis : ___ / 8

✅ SUCCÈS : Tous les tests passés
⚠️  PARTIEL : XX tests échoués (voir détails)
❌ ÉCHEC : Problèmes majeurs détectés

═══════════════════════════════════════════════
```

---

## 🔧 RÉSOLUTION DES PROBLÈMES

### Problème : Logs "💾 [CRITIQUE]" absents

**Diagnostic** :
```javascript
// Dans Console
window.claraverseProcessor.setupAssertionCell.toString()
```

**Vérifier** : La fonction contient `saveTableDataNow` (pas `saveTableData`)

**Solution** : Re-appliquer les modifications de `conso.js`

---

### Problème : Table non sauvegardée dans DOM Storage

**Diagnostic** :
```javascript
// Dans Console
const tables = document.querySelectorAll('table[data-keyword]');
console.log(tables);
```

**Vérifier** : Les tables ont bien un attribut `data-keyword`

**Solution** : Vérifier que `conso.js` assigne bien `data-keyword` aux tables

---

### Problème : Checkpoint non déclenché

**Diagnostic** :
```javascript
// Dans Console
console.log(window.domCheckpointSaver);
```

**Vérifier** : L'objet existe

**Solution** : Vérifier que `dom-checkpoint-saver.js` est chargé dans `index.html`

---

## 📞 SUPPORT

En cas de problème persistant :

1. **Capturer les logs console** (clic droit → "Save as...")
2. **Exporter le diagnostic** (bouton "🔍 Diagnostic DOM Storage")
3. **Faire une capture d'écran** de la table avant/après rechargement
4. **Documenter** les étapes exactes pour reproduire

---

**Bonne chance pour les tests !** 🚀

