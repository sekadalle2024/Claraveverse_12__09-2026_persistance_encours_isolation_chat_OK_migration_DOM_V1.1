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
