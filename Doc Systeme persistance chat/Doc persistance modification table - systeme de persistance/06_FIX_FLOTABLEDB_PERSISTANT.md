# 🔧 FIX : FloTableDB Se Recrée Automatiquement

**Date** : 30 Août 2026 02:00  
**Problème** : FloTableDB supprimé mais recréé au rechargement  
**Cause** : Scripts diagnostics ouvrent FloTableDB (crée automatiquement si absent)  
**Statut** : ⏳ SOLUTION TEMPORAIRE

---

## ❌ Problème

**Séquence** :
1. User clique "🧹 Nettoyer IndexedDB"
2. FloTableDB et clara_db supprimés ✅
3. Page recharge
4. **FloTableDB revient !** ❌

**Pourquoi ?**
- Scripts de diagnostic font `indexedDB.open('FloTableDB', 2)`
- Si base n'existe pas → **IndexedDB la crée automatiquement**
- Même si on ne sauvegarde rien, la base vide existe

---

## 🔍 Scripts Coupables

**Scripts qui ouvrent FloTableDB** (8 fichiers) :
1. `clean-indexeddb.js` (outil nettoyage)
2. `diagnostic-complet-fusionne.js` ← **CHARGÉ auto**
3. `diagnostic-indexeddb-visual.js`
4. `diagnostic-restauration-visual.js`
5. `diagnostic-unifie.js` ← **CHARGÉ auto**
6. `init-indexeddb.js` (déjà désactivé ✅)
7. `test-diagnostic-complet.js`
8. `test-phase-3-persistance.js` ← **CHARGÉ auto**

**Chargés dans index.html** :
- Ligne 193 : `test-phase-3-persistance.js`
- Ligne 194 : `diagnostic-complet-fusionne.js`
- Ligne 197 : `diagnostic-unifie.js`

---

## ✅ Solution A : Désactiver Scripts Diagnostics (TEMPORAIRE)

**Désactiver dans `index.html`** :

```html
<!-- 🧪 TESTS PAR PHASE - DÉSACTIVÉ (ouvrent FloTableDB) -->
<!-- <script src="/test-phase-1-diagnostic.js"></script> -->
<!-- <script src="/test-phase-2-modifications.js"></script> -->
<!-- <script src="/test-phase-3-persistance.js"></script> -->
<!-- <script src="/diagnostic-complet-fusionne.js"></script> -->

<!-- 🔍 DIAGNOSTIC UNIFIÉ - DÉSACTIVÉ (ouvre FloTableDB) -->
<!-- <script src="/diagnostic-unifie.js"></script> -->
```

**Impact** :
- ✅ FloTableDB ne se recrée plus
- ❌ Fonctions diagnostics perdues (temporaire)

---

## ✅ Solution B : Migrer Scripts vers clara_db (DÉFINITIF)

**Modifier tous les scripts** :

**Avant** :
```javascript
const dbRequest = indexedDB.open('FloTableDB', 2);
```

**Après** :
```javascript
const dbRequest = indexedDB.open('clara_db', 12);
// ...
const store = transaction.objectStore('clara_generated_tables');
```

**Fichiers à modifier** (8) :
1. `diagnostic-complet-fusionne.js`
2. `diagnostic-indexeddb-visual.js`
3. `diagnostic-restauration-visual.js`
4. `diagnostic-unifie.js`
5. `test-diagnostic-complet.js`
6. `test-phase-3-persistance.js`
7. `clean-indexeddb.js`
8. `init-indexeddb.js` (déjà désactivé)

---

## ✅ Solution C : Hook onupgradeneeded (ÉLÉGANT)

**Principe** : Intercepter création FloTableDB → Abort

**Code dans index.html** (avant tous scripts) :

```html
<script>
// 🚫 Bloquer création FloTableDB
const originalOpen = IDBFactory.prototype.open;
IDBFactory.prototype.open = function(name, version) {
  if (name === 'FloTableDB') {
    console.warn('🚫 Blocage création FloTableDB, utilise clara_db à la place');
    return originalOpen.call(this, 'clara_db', 12);
  }
  return originalOpen.call(this, name, version);
};
console.log('✅ Hook IndexedDB installé (FloTableDB → clara_db)');
</script>
```

**Avantages** :
- ✅ Aucune modification scripts
- ✅ Redirection transparente FloTableDB → clara_db
- ✅ 1 ligne de code

**Inconvénients** :
- ⚠️ Scripts accèdent `generatedTables` mais clara_db a `clara_generated_tables`
- ⚠️ Peut échouer silencieusement

---

## 🎯 Solution Recommandée : A + C (Hybride)

**Phase 1** : Désactiver scripts diagnostics (immédiat)
**Phase 2** : Ajouter hook anti-FloTableDB (protection)
**Phase 3** : Migrer scripts vers clara_db (définitif)

---

## 🔧 Implémentation

### Étape 1 : Désactiver Scripts (Fait Manuellement)

**User doit commenter** dans `index.html` :

Lignes 191-197 :
```html
<!-- <script src="/test-phase-1-diagnostic.js"></script> -->
<!-- <script src="/test-phase-2-modifications.js"></script> -->
<!-- <script src="/test-phase-3-persistance.js"></script> -->
<!-- <script src="/diagnostic-complet-fusionne.js"></script> -->
<!-- <script src="/diagnostic-unifie.js"></script> -->
```

---

### Étape 2 : Hook Anti-FloTableDB (Code Prêt)

**Ajouter dans `index.html` ligne 12** (après backendConfig.js) :

```html
<!-- 🚫 HOOK ANTI-FLOTABLEDB -->
<script>
// Bloquer création FloTableDB, rediriger vers clara_db
(function() {
  const originalOpen = IDBFactory.prototype.open;
  IDBFactory.prototype.open = function(name, version) {
    if (name === 'FloTableDB') {
      console.warn('🚫 FloTableDB bloqué, utilise clara_db');
      // Retourne erreur au lieu de rediriger (plus sûr)
      return {
        onsuccess: null,
        onerror: function(handler) { 
          if (handler) handler({ target: { error: new Error('FloTableDB deprecated, use clara_db') } }); 
        },
        addEventListener: function() {}
      };
    }
    return originalOpen.call(this, name, version);
  };
  console.log('✅ Hook anti-FloTableDB installé');
})();
</script>
```

---

### Étape 3 : Test Validation

**Après implémentation** :

1. **F5** (recharger)
2. **Console** : Chercher `✅ Hook anti-FloTableDB installé`
3. **Cliquer "📊 Vérifier Bases"**
4. **Devrait afficher** :
   ```
   Bases existantes:
   1. ClaraverseDB (v1)
   2. clara_db (v12)
   
   ✅ Configuration CORRECTE
   ```

**Si FloTableDB revient** : Hook échoué, passer Solution B (migration)

---

## 📝 Prochaines Étapes

**Court terme** (maintenant) :
1. ⏳ User commente scripts diagnostics
2. ⏳ User ajoute hook anti-FloTableDB
3. ⏳ User teste (F5 + Vérifier Bases)

**Moyen terme** (si hook ne suffit pas) :
4. ⏳ Migrer `diagnostic-complet-fusionne.js` vers clara_db
5. ⏳ Migrer `test-phase-3-persistance.js` vers clara_db
6. ⏳ Migrer `diagnostic-unifie.js` vers clara_db

**Long terme** (nettoyage complet) :
7. ⏳ Supprimer tous scripts FloTableDB
8. ⏳ Documenter migration
9. ⏳ Tests complets

---

**Dernière mise à jour** : 30 Août 2026 02:00  
**Statut** : ⏳ ATTENTE IMPLÉMENTATION USER

**FIN DOCUMENTATION**
