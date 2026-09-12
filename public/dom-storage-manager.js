/**
 * DOM Storage Manager
 * Gestionnaire de stockage basé sur le DOM
 * Migration IndexedDB → DOM Storage
 * Date: 12 Septembre 2026
 */

class DOMStorageManager {
  constructor() {
    this.storageContainerId = 'claraverse-dom-storage';
    this.init();
  }

  /**
   * Initialiser le conteneur de stockage
   */
  init() {
    let storageContainer = document.getElementById(this.storageContainerId);
    
    if (!storageContainer) {
      storageContainer = document.createElement('div');
      storageContainer.id = this.storageContainerId;
      storageContainer.style.cssText = 'display: none !important;';
      storageContainer.setAttribute('data-claraverse-storage', 'true');
      document.body.appendChild(storageContainer);
      
      console.log('✅ [DOM Storage] Conteneur créé');
    } else {
      console.log('✅ [DOM Storage] Conteneur existant trouvé');
    }
  }

  /**
   * Obtenir ou créer un conteneur de session
   */
  getSessionContainer(sessionId) {
    const storageContainer = document.getElementById(this.storageContainerId);
    let sessionContainer = storageContainer.querySelector(`[data-session-id="${sessionId}"]`);
    
    if (!sessionContainer) {
      sessionContainer = document.createElement('div');
      sessionContainer.setAttribute('data-session-id', sessionId);
      sessionContainer.setAttribute('data-created-at', new Date().toISOString());
      storageContainer.appendChild(sessionContainer);
      
      console.log(`✅ [DOM Storage] Conteneur session créé: ${sessionId}`);
    }
    
    return sessionContainer;
  }

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

  /**
   * Restaurer une table depuis le DOM
   */
  restoreTable(sessionId, keyword) {
    try {
      const sessionContainer = this.getSessionContainer(sessionId);
      const storedTable = sessionContainer.querySelector(`table[data-keyword="${keyword}"]`);
      
      if (storedTable) {
        console.log(`✅ [DOM Storage] Table trouvée: ${keyword}`);
        return storedTable.cloneNode(true);
      } else {
        console.log(`⚠️ [DOM Storage] Table non trouvée: ${keyword}`);
        return null;
      }
    } catch (error) {
      console.error('❌ [DOM Storage] Erreur restauration:', error);
      return null;
    }
  }

  /**
   * Restaurer toutes les tables d'une session
   */
  restoreAllTables(sessionId) {
    try {
      const sessionContainer = this.getSessionContainer(sessionId);
      const storedTables = sessionContainer.querySelectorAll('table[data-keyword]');
      
      const tables = Array.from(storedTables).map(table => ({
        keyword: table.dataset.keyword,
        tableId: table.dataset.tableId,
        element: table.cloneNode(true),
        savedAt: table.dataset.savedAt,
        updatedAt: table.dataset.updatedAt
      }));
      
      console.log(`📋 [DOM Storage] ${tables.length} table(s) restaurée(s)`);
      return tables;
    } catch (error) {
      console.error('❌ [DOM Storage] Erreur restauration complète:', error);
      return [];
    }
  }

  /**
   * Supprimer une table
   */
  deleteTable(sessionId, keyword) {
    try {
      const sessionContainer = this.getSessionContainer(sessionId);
      const storedTable = sessionContainer.querySelector(`table[data-keyword="${keyword}"]`);
      
      if (storedTable) {
        storedTable.remove();
        console.log(`🗑️ [DOM Storage] Table supprimée: ${keyword}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ [DOM Storage] Erreur suppression:', error);
      return false;
    }
  }

  /**
   * Supprimer toutes les tables d'une session
   */
  clearSession(sessionId) {
    try {
      const storageContainer = document.getElementById(this.storageContainerId);
      const sessionContainer = storageContainer.querySelector(`[data-session-id="${sessionId}"]`);
      
      if (sessionContainer) {
        sessionContainer.remove();
        console.log(`🧹 [DOM Storage] Session nettoyée: ${sessionId}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ [DOM Storage] Erreur nettoyage:', error);
      return false;
    }
  }

  /**
   * Obtenir statistiques
   */
  getStats() {
    const storageContainer = document.getElementById(this.storageContainerId);
    const sessions = storageContainer.querySelectorAll('[data-session-id]');
    const totalTables = storageContainer.querySelectorAll('table[data-keyword]').length;
    
    const stats = {
      totalSessions: sessions.length,
      totalTables: totalTables,
      sessions: []
    };
    
    sessions.forEach(session => {
      const sessionId = session.dataset.sessionId;
      const tables = session.querySelectorAll('table[data-keyword]');
      
      stats.sessions.push({
        sessionId,
        tableCount: tables.length,
        keywords: Array.from(tables).map(t => t.dataset.keyword),
        createdAt: session.dataset.createdAt
      });
    });
    
    return stats;
  }

  /**
   * Diagnostic complet
   */
  diagnose() {
    console.log('🔍 [DOM Storage] Diagnostic');
    console.log('─────────────────────────────────');
    
    const stats = this.getStats();
    console.log(`📊 Sessions totales: ${stats.totalSessions}`);
    console.log(`📊 Tables totales: ${stats.totalTables}`);
    
    stats.sessions.forEach(session => {
      console.log(`\n📁 Session: ${session.sessionId}`);
      console.log(`   Tables: ${session.tableCount}`);
      console.log(`   Keywords: ${session.keywords.join(', ')}`);
      console.log(`   Créée: ${session.createdAt}`);
    });
    
    return stats;
  }
}

// Export singleton
window.domStorageManager = new DOMStorageManager();

console.log('✅ [DOM Storage Manager] Chargé et initialisé');
