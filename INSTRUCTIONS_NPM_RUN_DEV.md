# 🚀 INSTRUCTIONS URGENTES - Lancer Serveur Dev

**Date** : 29 Août 2026  
**Problème** : Code modifié mais pas compilé → Sauvegardes échouent

---

## ⚠️ SITUATION ACTUELLE

**Symptôme** :
- ✅ Système auto-save actif (diagnostic OK)
- ✅ 6 tables en attente
- ✅ Force Save dit "SUCCÈS"
- ❌ **Mais données pas sauvées** (problème fingerprint skip)

**Cause** :
- Fix appliqué dans `flowiseTableService.ts` ✅
- **Mais code pas recompilé** ❌
- Application utilise ancien code (sans fix) ❌

---

## ✅ SOLUTION : Lancer npm run dev

### Étape 1 : Ouvrir Terminal PowerShell

**Dans VS Code** :
- Menu : Terminal → New Terminal
- OU Raccourci : `Ctrl + ù`

**Vous devriez voir** :
```
PS H:\Claverse_1>
```

---

### Étape 2 : Taper la Commande

**Tapez exactement** :
```bash
npm run dev
```

**Appuyez sur Entrée**

---

### Étape 3 : Attendre Message de Succès

**Vous devriez voir** (après 5-10 secondes) :
```
  VITE v5.x.x  ready in XXXms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

**✅ SI VOUS VOYEZ ÇA** → Serveur démarré avec succès !

---

### Étape 4 : Observer Navigateur

**Le navigateur va** :
- Recharger automatiquement la page
- Compiler le nouveau code TypeScript
- Appliquer le fix fingerprint

**Attendez** 2-3 secondes pour la recompilation.

---

### Étape 5 : Tester à Nouveau

**Après rechargement** :
1. Modifier une cellule de table
2. Cliquer **"🔧 Force Save"** (bouton violet)
3. **Vérifier console F12** → Chercher log `🔄 [USER-EDIT] Forcing save`
4. Si log présent → Fix actif ! ✅
5. F5 → Modification préservée ✅

---

## 🆘 Si Erreurs

### Erreur : "npm not found"
**Cause** : Node.js pas installé

**Solution** :
1. Installer Node.js : https://nodejs.org/
2. Redémarrer VS Code
3. Retry `npm run dev`

---

### Erreur : "Port 5173 already in use"
**Cause** : Autre instance Vite déjà lancée

**Solution** :
```bash
# Tuer processus existant
Get-Process -Name node | Stop-Process -Force

# Relancer
npm run dev
```

---

### Erreur : "Cannot find module..."
**Cause** : node_modules manquants

**Solution** :
```bash
# Installer dépendances
npm install

# Relancer
npm run dev
```

---

## 📊 Différence npm run build vs npm run dev

| Commande | Usage | Recompilation | Quand Utiliser |
|----------|-------|---------------|----------------|
| `npm run build` | Production | ❌ Manuel | Déploiement final |
| `npm run dev` | Développement | ✅ Automatique | **Développement actif** |

**Pour votre cas** : Utilisez **`npm run dev`** car vous modifiez le code.

---

## ✅ Validation Fix Actif

**Après `npm run dev` lancé**, vérifier dans console F12 :

**Modifier cellule** → Attendre 10s → Chercher :
```
🔄 [USER-EDIT] Forcing save (user modification, ignoring fingerprint check)
✅ Table saved: xxx (keyword: ...)
```

**Si vous voyez ces logs** → Fix actif ! ✅

**Si vous voyez** :
```
ℹ️ Table with same fingerprint already exists, skipping save
```
→ Fix pas actif ❌ (npm run dev pas lancé ou erreur)

---

## 🎯 Checklist Complète

- [ ] Terminal PowerShell ouvert
- [ ] Commande `npm run dev` tapée
- [ ] Message "VITE ready" visible
- [ ] Page navigateur rechargée automatiquement
- [ ] Modification cellule testée
- [ ] Log `[USER-EDIT]` visible dans console
- [ ] F5 → Modification préservée

**Toutes coches validées** → Problème 1 RÉSOLU ! 🎉

---

**Dernière mise à jour** : 29 Août 2026 23:59
