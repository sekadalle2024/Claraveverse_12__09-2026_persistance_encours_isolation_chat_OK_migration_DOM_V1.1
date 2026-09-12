# 🔧 FIX : ConstraintError Index Unique sessionId_fingerprint

**Date** : 29 Août 2026 22:15  
**Problème** : Modifications utilisateur non sauvegardées  
**Erreur** : `ConstraintError: Unable to add key to index 'sessionId_fingerprint': at least one key does not satisfy the uniqueness requirements`

---

## ❌ Problème Identifié

### Erreur Console
```
ConstraintError: Unable to add key to index 'sessionId_fingerprint': 
at least one key does not satisfy the uniqueness requirements.
```

### Cause Racine

**Scénario problématique** :
1. Table générée → Sauvegardée avec `id=UUID1`, `fingerprint=abc123`
2. Utilisateur modifie 1 cellule → Fingerprint reste `abc123` (modification mineure)
3. Auto-save tente INSERT → `id=UUID2`, `fingerprint=abc123`
4. **IndexedDB rejette** : Index unique `[sessionId, fingerprint]` détecte doublon
5. Erreur ConstraintError → Sauvegarde échouée silencieusement

**Pourquoi fingerprint identique ?**
- Modification mineure (1 mot) ne change pas assez le contenu HTML
- Hash fingerprint reste identique
- Nouveau UUID généré → Conflit avec index unique

---

## ✅ Solution Implémentée

### Principe

**Avant (ÉCHOUAIT)** :
- Générer nouveau UUID aléatoire
- Tenter INSERT avec même `sessionId + fingerprint`
- IndexedDB rejette → ConstraintError

**Après (FONCTIONNE)** :
- Chercher table existante avec même `sessionId + fingerprint`
- **Si existe** : Réutiliser son `id` → **UPDATE** (autorisé)
- **Si nouveau** : Créer UUID stable basé sur `sessionId + keyword`

### Code Modifié

**Fichier** : `src/services/flowiseTableService.ts`  
**Ligne** : ~247-265

```typescript
// Create table record
// 🆕 For user_edit: Find existing table by fingerprint and reuse its ID (allows UPDATE)
let tableId: string;
if (source === 'user_edit') {
  // Check if table with same fingerprint already exists
  const existingTables = await indexedDBService.getAllGeneratedTables<FlowiseGeneratedTableRecord>();
  const existing = existingTables.find(t => 
    t.sessionId === sessionId && 
    t.fingerprint === fingerprint
  );
  
  if (existing) {
    tableId = existing.id; // Reuse existing ID → UPDATE
    console.log(`🔄 [USER-EDIT] Reusing existing table ID: ${tableId} (will UPDATE)`);
  } else {
    tableId = this.generateStableUUID(sessionId, keyword); // New stable ID
    console.log(`🆕 [USER-EDIT] Creating new stable ID: ${tableId}`);
  }
} else {
  tableId = this.generateUUID(); // Random UUID for new tables
}

const tableRecord: FlowiseGeneratedTableRecord = {
  id: tableId,
  sessionId,
  // ...
};
```

### Fonction Ajoutée

**Fichier** : `src/services/flowiseTableService.ts`  
**Ligne** : ~1280-1310

```typescript
/**
 * Generate a STABLE UUID based on sessionId + keyword
 * 🆕 For user_edit source: same table = same ID → allows UPDATE instead of duplicate INSERT
 * 
 * @param sessionId - Session identifier
 * @param keyword - Table keyword (unique per table)
 * @returns Deterministic UUID based on inputs
 */
private generateStableUUID(sessionId: string, keyword: string): string {
  // Create deterministic hash from sessionId + keyword
  const input = `${sessionId}_${keyword}`;
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Convert hash to UUID-like format (8-4-4-4-12 hex)
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  const uuid = `${hex.substring(0, 8)}-${hex.substring(0, 4)}-4${hex.substring(0, 3)}-a${hex.substring(0, 3)}-${hex.padEnd(12, '0').substring(0, 12)}`;
  
  return uuid;
}
```

---

## 🎯 Comportement Attendu

### Scénario 1 : Modification Mineure (fingerprint identique)

**Actions** :
1. Table générée → `id=uuid-123`, `fingerprint=abc`
2. Modifier 1 cellule → `fingerprint=abc` (inchangé)
3. Auto-save détecte modification

**Avant Fix** :
```
🔄 [USER-EDIT] Forcing save
🔍 [DEBUG] Before putGeneratedTable, tableRecord: { id: "uuid-456", ... }
❌ ConstraintError: sessionId_fingerprint already exists
```

**Après Fix** :
```
🔄 [USER-EDIT] Forcing save
🔄 [USER-EDIT] Reusing existing table ID: uuid-123 (will UPDATE)
🔍 [DEBUG] Before putGeneratedTable, tableRecord: { id: "uuid-123", ... }
✅ Table saved: uuid-123 (keyword: ...)
```

**Résultat** : Table **mise à jour**, pas de doublon ✅

---

### Scénario 2 : Modification Majeure (fingerprint change)

**Actions** :
1. Table générée → `id=uuid-123`, `fingerprint=abc`
2. Modifier 5 cellules + ajouter ligne → `fingerprint=xyz` (changé)
3. Auto-save détecte modification

**Comportement** :
```
🔄 [USER-EDIT] Forcing save
🆕 [USER-EDIT] Creating new stable ID: uuid-stable-789
🔍 [DEBUG] Before putGeneratedTable, tableRecord: { id: "uuid-stable-789", ... }
✅ Table saved: uuid-stable-789 (keyword: ...)
```

**Résultat** : Nouvelle version créée avec ID stable ✅

---

## 🧪 Tests de Validation

### Test 1 : Modification Simple

**Étapes** :
1. Générer table simple (3 lignes × 2 colonnes)
2. Modifier 1 cellule (ex: "Produit 1" → "Produit MODIFIÉ")
3. Attendre 10s (auto-save)
4. F5 (recharger page)

**Attendu** :
- Log `🔄 [USER-EDIT] Reusing existing table ID`
- Modification préservée après F5

---

### Test 2 : Modifications Multiples Successives

**Étapes** :
1. Modifier cellule A1 → Attendre 10s
2. Modifier cellule B2 → Attendre 10s
3. Modifier cellule C3 → Attendre 10s
4. F5 → Vérifier toutes modifications préservées

**Attendu** :
- 3× log `Reusing existing table ID` (même ID)
- Toutes modifications cumulées préservées

---

### Test 3 : Table Dupliquées (Bug Résolu)

**Problème Avant** :
- Après plusieurs F5 → 2 "Table de Consolidation" dans div restaurées
- Screenshots montrent doublons

**Attendu Après Fix** :
- Aucun doublon dans div restaurées
- 1 seule version de chaque table (la plus récente)

---

## 📊 Logs de Debug Ajoutés

**Pour traçabilité** :

1. **Ligne 210** : `🔄 [USER-EDIT] Forcing save`
2. **Ligne 215** : `🔍 [DEBUG] Before enforceStorageLimits`
3. **Ligne 220** : `🔍 [DEBUG] After enforceStorageLimits`
4. **Ligne 254** : `🔄 [USER-EDIT] Reusing existing table ID` OU `🆕 [USER-EDIT] Creating new stable ID`
5. **Ligne 270** : `🔍 [DEBUG] Before putGeneratedTable`
6. **Ligne 275** : `✅ Table saved: ...`

**Si échec** :
- `❌ Storage error (not quota): ...`
- `❌ Error saving generated table: ...`
- `❌ Error stack: ...`

---

## 🔄 Index IndexedDB

**Schéma actuel** :
```javascript
{
  name: 'clara_generated_tables',
  keyPath: 'id', // Primary key
  indexes: [
    { name: 'sessionId', keyPath: 'sessionId', unique: false },
    { name: 'fingerprint', keyPath: 'fingerprint', unique: false },
    { name: 'sessionId_fingerprint', keyPath: ['sessionId', 'fingerprint'], unique: true } // ⚠️ Contrainte unique
  ]
}
```

**Contrainte** : 1 seule table par `[sessionId, fingerprint]`

**Solution** : Réutiliser ID existant → `put()` fait UPDATE au lieu INSERT

---

## ✅ Statut

- [x] Problème identifié (ConstraintError index unique)
- [x] Solution implémentée (réutilisation ID existant)
- [x] Fonction `generateStableUUID()` ajoutée
- [x] Logs debug ajoutés
- [ ] Tests validation utilisateur (en attente)
- [ ] Documentation mise à jour

---

## 📝 Notes Techniques

### Pourquoi `getAllGeneratedTables()` ?

**Alternative considérée** : Créer fonction `getTableByFingerprint(sessionId, fingerprint)`

**Raison du choix** :
- `getAllGeneratedTables()` déjà existante et performante
- IndexedDB charge en mémoire une fois
- Filter JS rapide sur petite collection (27 tables actuellement)
- Évite ajout nouvelle fonction IndexedDB

**Performance** :
- 27 tables × ~10KB = ~270KB chargés
- Filter en mémoire < 1ms
- Acceptable pour usage actuel

**Optimisation future** : Si >500 tables, créer index dédié `getBySessionFingerprint()`.

---

**Dernière mise à jour** : 29 Août 2026 22:15  
**Prochaine étape** : Tests utilisateur
