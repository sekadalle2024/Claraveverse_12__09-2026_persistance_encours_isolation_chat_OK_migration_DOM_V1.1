/**
 * DOM Auto-Save
 * Sauvegarde automatique lors des modifications de cellules
 * Migration IndexedDB → DOM Storage
 * Date: 12 Septembre 2026
 */

class DOMAutoSave {
  constructor() {
    this.saveTimeout = null;
    this.saveDelay = 1000; // ✅ 1000ms debounce (pour modifications multiples)
    this.observedTables = new WeakSet();
    this.init();
  }

  init() {
    // Observer toutes les tables existantes
    this.observeAllTables();

    // Observer nouvelles tables ajoutées
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.tagName === 'TABLE') {
              this.observeTable(node);
            }
            // Chercher tables dans le node
            if (node.querySelectorAll) {
              node.querySelectorAll('table').forEach(table => {
                this.observeTable(table);
              });
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    console.log('✅ [DOM Auto-Save] Initialisé');
  }

  observeAllTables() {
    const tables = document.querySelectorAll('table[data-keyword]');
    console.log(`👁️ [DOM Auto-Save] Observation de ${tables.length} table(s) existante(s)`);
    
    tables.forEach(table => {
      // Ne pas observer les tables du conteneur de stockage
      if (!table.closest('#claraverse-dom-storage')) {
        this.observeTable(table);
      }
    });
  }

  observeTable(table) {
    // Ne pas observer tables dans conteneur de stockage
    if (table.closest && table.closest('#claraverse-dom-storage')) {
      return;
    }

    if (this.observedTables.has(table)) {
      return; // Déjà observé
    }

    const tableObserver = new MutationObserver(() => {
      this.scheduleTableSave(table);
    });

    tableObserver.observe(table, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['style', 'class', 'data-keyword']
    });

    this.observedTables.add(table);
    console.log(`👁️ [DOM Auto-Save] Table observée: ${table.dataset.keyword || 'sans keyword'}`);
  }

  scheduleTableSave(table) {
    clearTimeout(this.saveTimeout);

    this.saveTimeout = setTimeout(() => {
      this.saveTable(table);
    }, this.saveDelay);
  }

  saveTable(table) {
    const keyword = table.dataset.keyword;
    
    if (!keyword) {
      console.warn('⚠️ [DOM Auto-Save] Table sans data-keyword, sauvegarde ignorée');
      return;
    }

    // Ne pas sauvegarder si c'est une table du conteneur de stockage
    if (table.closest && table.closest('#claraverse-dom-storage')) {
      return;
    }

    const sessionId = this.detectCurrentSessionId();

    if (window.domStorageManager) {
      const success = window.domStorageManager.saveTable(sessionId, keyword, table);
      
      if (success) {
        console.log(`💾 [DOM Auto-Save] Table sauvegardée: ${keyword}`);
        
        // Indicateur visuel temporaire (flash vert)
        const originalBoxShadow = table.style.boxShadow;
        table.style.transition = 'box-shadow 0.3s';
        table.style.boxShadow = '0 0 10px rgba(76, 175, 80, 0.6)';
        
        setTimeout(() => {
          table.style.boxShadow = originalBoxShadow;
        }, 300);
      }
    } else {
      console.error('❌ [DOM Auto-Save] DOM Storage Manager non disponible');
    }
  }

  detectCurrentSessionId() {
    // Méthode 1 : React State
    if (window.claraverseState?.currentSession?.id) {
      return window.claraverseState.currentSession.id;
    }

    // Méthode 2 : URL
    const urlParams = new URLSearchParams(window.location.search);
    const urlSessionId = urlParams.get('sessionId') || urlParams.get('session');
    if (urlSessionId) {
      return urlSessionId;
    }

    // Méthode 3 : DOM
    const sessionElement = document.querySelector('[data-session-id]');
    if (sessionElement) {
      return sessionElement.dataset.sessionId;
    }

    // Fallback : session non sauvegardée
    console.warn('⚠️ [DOM Auto-Save] SessionId non détecté, utilisation fallback');
    return 'session_unsaved';
  }

  /**
   * Forcer sauvegarde de toutes les tables
   */
  saveAllTables() {
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

    console.log(`💾 [DOM Auto-Save] ${savedCount} table(s) sauvegardée(s) manuellement`);
    return savedCount;
  }
}

// Initialiser après chargement DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.domAutoSave = new DOMAutoSave();
  });
} else {
  window.domAutoSave = new DOMAutoSave();
}

console.log('✅ [DOM Auto-Save] Script chargé');
