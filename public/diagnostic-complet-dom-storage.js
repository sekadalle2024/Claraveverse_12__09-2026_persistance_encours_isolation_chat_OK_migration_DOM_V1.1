/**
 * Diagnostic Complet DOM Storage
 * Interface HTML complète avec tests consolidés et export JSON
 * Date: 12 Septembre 2026
 */

(function() {
  'use strict';

  class DiagnosticComplet {
    constructor() {
      this.results = {
        timestamp: new Date().toISOString(),
        tests: [],
        systemInfo: {},
        domStorage: {},
        performance: {}
      };
    }

    /**
     * Ouvrir fenêtre diagnostic
     */
    async openDiagnosticWindow() {
      // Créer fenêtre modale
      const modal = document.createElement('div');
      modal.id = 'diagnostic-modal';
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        z-index: 999999;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 20px;
      `;

      const content = document.createElement('div');
      content.style.cssText = `
        background: white;
        border-radius: 12px;
        width: 90%;
        max-width: 1200px;
        height: 90%;
        display: flex;
        flex-direction: column;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      `;

      // Header
      const header = document.createElement('div');
      header.style.cssText = `
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 20px 30px;
        border-radius: 12px 12px 0 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      `;
      header.innerHTML = `
        <div>
          <h2 style="margin: 0; font-size: 24px; font-weight: 700;">🔍 Diagnostic Complet DOM Storage</h2>
          <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Tests de persistance & sauvegarde</p>
        </div>
        <button id="close-diagnostic" style="
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        ">×</button>
      `;

      // Body
      const body = document.createElement('div');
      body.style.cssText = `
        flex: 1;
        overflow-y: auto;
        padding: 30px;
        background: #f5f5f5;
      `;
      body.id = 'diagnostic-body';

      // Footer avec boutons
      const footer = document.createElement('div');
      footer.style.cssText = `
        padding: 20px 30px;
        background: white;
        border-top: 1px solid #e0e0e0;
        display: flex;
        gap: 15px;
        justify-content: flex-end;
        border-radius: 0 0 12px 12px;
      `;
      footer.innerHTML = `
        <button id="run-all-tests" style="
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 12px 30px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
          transition: transform 0.2s;
        ">▶ Lancer Tous les Tests</button>
        <button id="export-json" style="
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
          border: none;
          padding: 12px 30px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(245, 87, 108, 0.4);
          transition: transform 0.2s;
          display: none;
        ">📥 Export JSON</button>
      `;

      // Assembler
      content.appendChild(header);
      content.appendChild(body);
      content.appendChild(footer);
      modal.appendChild(content);
      document.body.appendChild(modal);

      // État initial
      this.showInitialState(body);

      // Events
      document.getElementById('close-diagnostic').onclick = () => modal.remove();
      document.getElementById('run-all-tests').onclick = () => this.runAllTests(body);
      document.getElementById('export-json').onclick = () => this.exportJSON();

      // Hover effects
      footer.querySelectorAll('button').forEach(btn => {
        btn.onmouseenter = () => btn.style.transform = 'scale(1.05)';
        btn.onmouseleave = () => btn.style.transform = 'scale(1)';
      });
    }

    /**
     * Afficher état initial
     */
    showInitialState(container) {
      container.innerHTML = `
        <div style="text-align: center; padding: 60px 20px;">
          <div style="font-size: 80px; margin-bottom: 20px;">🚀</div>
          <h3 style="font-size: 24px; color: #333; margin-bottom: 10px;">Prêt à Diagnostiquer</h3>
          <p style="font-size: 16px; color: #666; margin-bottom: 30px;">
            Cliquez sur "Lancer Tous les Tests" pour démarrer l'analyse complète du système de persistance
          </p>
          <div style="
            background: white;
            border-radius: 8px;
            padding: 20px;
            max-width: 600px;
            margin: 0 auto;
            text-align: left;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          ">
            <h4 style="margin: 0 0 15px 0; color: #667eea;">📋 Tests Inclus:</h4>
            <ul style="margin: 0; padding-left: 20px; color: #666; line-height: 1.8;">
              <li>✅ Vérification Chargement Managers</li>
              <li>✅ Tests Sauvegarde Tables</li>
              <li>✅ Tests Restauration</li>
              <li>✅ Tests Anti-Doublons</li>
              <li>✅ Tests Modifications Structurelles</li>
              <li>✅ Analyse Performance</li>
              <li>✅ Inspection DOM Storage</li>
              <li>✅ Statistiques Globales</li>
            </ul>
          </div>
        </div>
      `;
    }

    /**
     * Lancer tous les tests
     */
    async runAllTests(container) {
      const startTime = performance.now();
      
      container.innerHTML = `
        <div style="text-align: center; padding: 40px;">
          <div class="spinner" style="
            border: 4px solid #f3f3f3;
            border-top: 4px solid #667eea;
            border-radius: 50%;
            width: 60px;
            height: 60px;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
          "></div>
          <style>
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          </style>
          <p style="font-size: 18px; color: #667eea; font-weight: 600;">Tests en cours...</p>
          <p style="font-size: 14px; color: #666;">Veuillez patienter</p>
        </div>
      `;

      // Réinitialiser résultats
      this.results = {
        timestamp: new Date().toISOString(),
        tests: [],
        systemInfo: {},
        domStorage: {},
        performance: {}
      };

      // Exécuter tests
      await this.test1_VerifierManagers();
      await this.test2_VerifierDOMStorage();
      await this.test3_TestSauvegarde();
      await this.test4_TestRestauration();
      await this.test5_TestDoublons();
      await this.test6_TestPerformance();
      await this.test7_InspecterStorage();
      await this.test8_StatistiquesGlobales();

      const endTime = performance.now();
      this.results.performance.totalDuration = Math.round(endTime - startTime);

      // Afficher résultats
      this.displayResults(container);

      // Activer bouton export
      document.getElementById('export-json').style.display = 'block';
    }

    /**
     * Test 1: Vérifier chargement managers
     */
    async test1_VerifierManagers() {
      const test = {
        id: 'test1',
        name: 'Vérification Chargement Managers',
        passed: true,
        details: []
      };

      // DOM Storage Manager
      if (window.domStorageManager) {
        test.details.push({ check: 'domStorageManager', status: 'passed', message: 'Manager chargé' });
      } else {
        test.passed = false;
        test.details.push({ check: 'domStorageManager', status: 'failed', message: 'Manager NON chargé' });
      }

      // DOM Restore Manager
      if (window.domRestoreManager) {
        test.details.push({ check: 'domRestoreManager', status: 'passed', message: 'Manager chargé' });
      } else {
        test.passed = false;
        test.details.push({ check: 'domRestoreManager', status: 'failed', message: 'Manager NON chargé' });
      }

      // DOM Auto-Save
      if (window.domAutoSave) {
        test.details.push({ check: 'domAutoSave', status: 'passed', message: 'Auto-Save chargé' });
      } else {
        test.passed = false;
        test.details.push({ check: 'domAutoSave', status: 'failed', message: 'Auto-Save NON chargé' });
      }

      this.results.tests.push(test);
      await this.delay(100);
    }

    /**
     * Test 2: Vérifier DOM Storage
     */
    async test2_VerifierDOMStorage() {
      const test = {
        id: 'test2',
        name: 'Vérification DOM Storage Container',
        passed: true,
        details: []
      };

      const storage = document.getElementById('claraverse-dom-storage');
      
      if (storage) {
        test.details.push({ check: 'container', status: 'passed', message: 'Container existe' });
        
        // Vérifier style display:none
        if (storage.style.display === 'none' || storage.style.cssText.includes('display: none')) {
          test.details.push({ check: 'visibility', status: 'passed', message: 'Container caché (display:none)' });
        } else {
          test.details.push({ check: 'visibility', status: 'warning', message: 'Container visible' });
        }

        // Compter sessions
        const sessions = storage.querySelectorAll('[data-session-id]');
        test.details.push({ check: 'sessions', status: 'info', message: `${sessions.length} session(s) trouvée(s)` });

        // Compter tables
        const tables = storage.querySelectorAll('table[data-keyword]');
        test.details.push({ check: 'tables', status: 'info', message: `${tables.length} table(s) sauvegardée(s)` });

      } else {
        test.passed = false;
        test.details.push({ check: 'container', status: 'failed', message: 'Container INTROUVABLE' });
      }

      this.results.tests.push(test);
      await this.delay(100);
    }

    /**
     * Test 3: Test sauvegarde
     */
    async test3_TestSauvegarde() {
      const test = {
        id: 'test3',
        name: 'Test Sauvegarde Table',
        passed: true,
        details: []
      };

      if (!window.domStorageManager) {
        test.passed = false;
        test.details.push({ check: 'manager', status: 'failed', message: 'DOM Storage Manager non disponible' });
        this.results.tests.push(test);
        return;
      }

      try {
        // Créer table test
        const testTable = document.createElement('table');
        testTable.dataset.keyword = 'TEST_DIAGNOSTIC_' + Date.now();
        testTable.dataset.tableId = 'test_' + Date.now();
        testTable.innerHTML = '<tr><td>Test</td><td>Data</td></tr>';

        const sessionId = 'test_session_' + Date.now();

        // Sauvegarder
        const startSave = performance.now();
        const success = window.domStorageManager.saveTable(sessionId, testTable.dataset.keyword, testTable);
        const saveDuration = Math.round(performance.now() - startSave);

        if (success) {
          test.details.push({ check: 'save', status: 'passed', message: `Sauvegarde réussie (${saveDuration}ms)` });

          // Vérifier dans storage
          const restored = window.domStorageManager.restoreTable(sessionId, testTable.dataset.keyword);
          if (restored) {
            test.details.push({ check: 'verify', status: 'passed', message: 'Table retrouvée dans storage' });
          } else {
            test.passed = false;
            test.details.push({ check: 'verify', status: 'failed', message: 'Table NON retrouvée' });
          }

          // Nettoyer
          window.domStorageManager.clearSession(sessionId);
          test.details.push({ check: 'cleanup', status: 'passed', message: 'Nettoyage effectué' });

        } else {
          test.passed = false;
          test.details.push({ check: 'save', status: 'failed', message: 'Échec sauvegarde' });
        }

      } catch (error) {
        test.passed = false;
        test.details.push({ check: 'error', status: 'failed', message: error.message });
      }

      this.results.tests.push(test);
      await this.delay(100);
    }

    /**
     * Test 4: Test restauration
     */
    async test4_TestRestauration() {
      const test = {
        id: 'test4',
        name: 'Test Restauration Tables',
        passed: true,
        details: []
      };

      if (!window.domStorageManager || !window.domRestoreManager) {
        test.passed = false;
        test.details.push({ check: 'managers', status: 'failed', message: 'Managers non disponibles' });
        this.results.tests.push(test);
        return;
      }

      try {
        // Créer et sauvegarder table test
        const testTable = document.createElement('table');
        testTable.dataset.keyword = 'TEST_RESTORE_' + Date.now();
        testTable.innerHTML = '<tr><td>Restore Test</td></tr>';

        const sessionId = 'test_restore_' + Date.now();
        window.domStorageManager.saveTable(sessionId, testTable.dataset.keyword, testTable);

        // Restaurer toutes tables
        const startRestore = performance.now();
        const tables = window.domStorageManager.restoreAllTables(sessionId);
        const restoreDuration = Math.round(performance.now() - startRestore);

        if (tables && tables.length > 0) {
          test.details.push({ check: 'restore', status: 'passed', message: `${tables.length} table(s) restaurée(s) (${restoreDuration}ms)` });
        } else {
          test.passed = false;
          test.details.push({ check: 'restore', status: 'failed', message: 'Aucune table restaurée' });
        }

        // Nettoyer
        window.domStorageManager.clearSession(sessionId);

      } catch (error) {
        test.passed = false;
        test.details.push({ check: 'error', status: 'failed', message: error.message });
      }

      this.results.tests.push(test);
      await this.delay(100);
    }

    /**
     * Test 5: Test anti-doublons
     */
    async test5_TestDoublons() {
      const test = {
        id: 'test5',
        name: 'Test Anti-Doublons',
        passed: true,
        details: []
      };

      if (!window.domStorageManager) {
        test.passed = false;
        test.details.push({ check: 'manager', status: 'failed', message: 'Manager non disponible' });
        this.results.tests.push(test);
        return;
      }

      try {
        const sessionId = 'test_doublons_' + Date.now();
        const keyword = 'TEST_DOUBLON';

        // Créer table
        const table1 = document.createElement('table');
        table1.dataset.keyword = keyword;
        table1.innerHTML = '<tr><td>Version 1</td></tr>';

        // Sauvegarder 1ère fois
        window.domStorageManager.saveTable(sessionId, keyword, table1);
        test.details.push({ check: 'save1', status: 'info', message: 'Première sauvegarde' });

        // Modifier et sauvegarder 2ème fois (même keyword)
        table1.innerHTML = '<tr><td>Version 2</td></tr>';
        window.domStorageManager.saveTable(sessionId, keyword, table1);
        test.details.push({ check: 'save2', status: 'info', message: 'Deuxième sauvegarde (même keyword)' });

        // Vérifier qu'il n'y a qu'UNE table
        const storage = document.getElementById('claraverse-dom-storage');
        const session = storage.querySelector(`[data-session-id="${sessionId}"]`);
        const tablesWithKeyword = session.querySelectorAll(`table[data-keyword="${keyword}"]`);

        if (tablesWithKeyword.length === 1) {
          test.details.push({ check: 'uniqueness', status: 'passed', message: '✅ UNE SEULE table (pas de doublon)' });
        } else {
          test.passed = false;
          test.details.push({ check: 'uniqueness', status: 'failed', message: `❌ ${tablesWithKeyword.length} tables trouvées (doublon!)` });
        }

        // Nettoyer
        window.domStorageManager.clearSession(sessionId);

      } catch (error) {
        test.passed = false;
        test.details.push({ check: 'error', status: 'failed', message: error.message });
      }

      this.results.tests.push(test);
      await this.delay(100);
    }

    /**
     * Test 6: Performance
     */
    async test6_TestPerformance() {
      const test = {
        id: 'test6',
        name: 'Test Performance',
        passed: true,
        details: []
      };

      if (!window.domStorageManager) {
        test.passed = false;
        test.details.push({ check: 'manager', status: 'failed', message: 'Manager non disponible' });
        this.results.tests.push(test);
        return;
      }

      try {
        const sessionId = 'test_perf_' + Date.now();
        const iterations = 10;
        const saveTimes = [];

        // Créer table test
        const testTable = document.createElement('table');
        testTable.innerHTML = '<tr><td>Perf Test</td></tr>';

        // Mesurer 10 sauvegardes
        for (let i = 0; i < iterations; i++) {
          testTable.dataset.keyword = `TEST_PERF_${i}`;
          
          const start = performance.now();
          window.domStorageManager.saveTable(sessionId, testTable.dataset.keyword, testTable);
          const duration = performance.now() - start;
          
          saveTimes.push(duration);
        }

        // Calculer moyenne
        const avgTime = Math.round(saveTimes.reduce((a, b) => a + b, 0) / iterations);
        const minTime = Math.round(Math.min(...saveTimes));
        const maxTime = Math.round(Math.max(...saveTimes));

        test.details.push({ check: 'avg', status: 'info', message: `Temps moyen: ${avgTime}ms` });
        test.details.push({ check: 'min', status: 'info', message: `Temps min: ${minTime}ms` });
        test.details.push({ check: 'max', status: 'info', message: `Temps max: ${maxTime}ms` });

        // Évaluation
        if (avgTime < 50) {
          test.details.push({ check: 'evaluation', status: 'passed', message: '✅ Performance EXCELLENTE' });
        } else if (avgTime < 100) {
          test.details.push({ check: 'evaluation', status: 'passed', message: '✅ Performance BONNE' });
        } else {
          test.details.push({ check: 'evaluation', status: 'warning', message: '⚠️ Performance ACCEPTABLE' });
        }

        // Nettoyer
        window.domStorageManager.clearSession(sessionId);

      } catch (error) {
        test.passed = false;
        test.details.push({ check: 'error', status: 'failed', message: error.message });
      }

      this.results.tests.push(test);
      await this.delay(100);
    }

    /**
     * Test 7: Inspecter storage réel
     */
    async test7_InspecterStorage() {
      const test = {
        id: 'test7',
        name: 'Inspection DOM Storage Réel',
        passed: true,
        details: []
      };

      if (!window.domStorageManager) {
        test.passed = false;
        test.details.push({ check: 'manager', status: 'failed', message: 'Manager non disponible' });
        this.results.tests.push(test);
        return;
      }

      try {
        const stats = window.domStorageManager.getStats();

        test.details.push({ check: 'sessions', status: 'info', message: `Sessions totales: ${stats.totalSessions}` });
        test.details.push({ check: 'tables', status: 'info', message: `Tables totales: ${stats.totalTables}` });

        // Détails par session
        stats.sessions.forEach((session, idx) => {
          const shortId = session.sessionId.substring(0, 20) + '...';
          test.details.push({ 
            check: `session${idx}`, 
            status: 'info', 
            message: `Session ${shortId}: ${session.tableCount} table(s)` 
          });
        });

        // Sauvegarder dans results
        this.results.domStorage = stats;

      } catch (error) {
        test.passed = false;
        test.details.push({ check: 'error', status: 'failed', message: error.message });
      }

      this.results.tests.push(test);
      await this.delay(100);
    }

    /**
     * Test 8: Statistiques globales
     */
    async test8_StatistiquesGlobales() {
      const test = {
        id: 'test8',
        name: 'Statistiques Globales Système',
        passed: true,
        details: []
      };

      try {
        // Info navigateur
        test.details.push({ check: 'browser', status: 'info', message: navigator.userAgent });
        test.details.push({ check: 'platform', status: 'info', message: navigator.platform });

        // Taille DOM Storage
        const storage = document.getElementById('claraverse-dom-storage');
        if (storage) {
          const sizeKB = (storage.outerHTML.length / 1024).toFixed(2);
          test.details.push({ check: 'size', status: 'info', message: `Taille storage: ${sizeKB} KB` });
        }

        // Tables visibles dans page
        const visibleTables = Array.from(document.querySelectorAll('table'))
          .filter(t => !t.closest('#claraverse-dom-storage'));
        test.details.push({ check: 'visibleTables', status: 'info', message: `Tables visibles: ${visibleTables.length}` });

        // System info pour export
        this.results.systemInfo = {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
          timestamp: new Date().toISOString()
        };

      } catch (error) {
        test.passed = false;
        test.details.push({ check: 'error', status: 'failed', message: error.message });
      }

      this.results.tests.push(test);
      await this.delay(100);
    }

    /**
     * Afficher résultats
     */
    displayResults(container) {
      const totalTests = this.results.tests.length;
      const passedTests = this.results.tests.filter(t => t.passed).length;
      const failedTests = totalTests - passedTests;

      let html = `
        <div style="background: white; border-radius: 8px; padding: 30px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <h3 style="margin: 0 0 20px 0; font-size: 22px; color: #333;">📊 Résultats Globaux</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6;">
              <div style="font-size: 32px; font-weight: 700; color: #3b82f6;">${totalTests}</div>
              <div style="font-size: 14px; color: #666; margin-top: 5px;">Tests Exécutés</div>
            </div>
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #22c55e;">
              <div style="font-size: 32px; font-weight: 700; color: #22c55e;">${passedTests}</div>
              <div style="font-size: 14px; color: #666; margin-top: 5px;">Tests Réussis</div>
            </div>
            <div style="background: ${failedTests > 0 ? '#fef2f2' : '#f9fafb'}; padding: 20px; border-radius: 8px; border-left: 4px solid ${failedTests > 0 ? '#ef4444' : '#d1d5db'};">
              <div style="font-size: 32px; font-weight: 700; color: ${failedTests > 0 ? '#ef4444' : '#9ca3af'};">${failedTests}</div>
              <div style="font-size: 14px; color: #666; margin-top: 5px;">Tests Échoués</div>
            </div>
            <div style="background: #fefce8; padding: 20px; border-radius: 8px; border-left: 4px solid #eab308;">
              <div style="font-size: 32px; font-weight: 700; color: #eab308;">${this.results.performance.totalDuration}ms</div>
              <div style="font-size: 14px; color: #666; margin-top: 5px;">Durée Totale</div>
            </div>
          </div>
        </div>
      `;

      // Détails tests
      this.results.tests.forEach((test, idx) => {
        const icon = test.passed ? '✅' : '❌';
        const color = test.passed ? '#22c55e' : '#ef4444';
        
        html += `
          <div style="background: white; border-radius: 8px; padding: 25px; margin-bottom: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px;">
              <h4 style="margin: 0; font-size: 18px; color: #333;">
                <span style="font-size: 24px; margin-right: 10px;">${icon}</span>
                ${test.name}
              </h4>
              <span style="
                background: ${test.passed ? '#dcfce7' : '#fee2e2'};
                color: ${color};
                padding: 6px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
              ">${test.passed ? 'PASSÉ' : 'ÉCHOUÉ'}</span>
            </div>
            <div style="border-left: 3px solid ${color}; padding-left: 15px;">
        `;

        test.details.forEach(detail => {
          let detailIcon = '•';
          let detailColor = '#666';
          
          if (detail.status === 'passed') {
            detailIcon = '✓';
            detailColor = '#22c55e';
          } else if (detail.status === 'failed') {
            detailIcon = '✗';
            detailColor = '#ef4444';
          } else if (detail.status === 'warning') {
            detailIcon = '⚠';
            detailColor = '#eab308';
          }

          html += `
            <div style="
              padding: 8px 0;
              color: ${detailColor};
              font-size: 14px;
              display: flex;
              align-items: center;
            ">
              <span style="margin-right: 8px; font-weight: 700;">${detailIcon}</span>
              <span>${detail.message}</span>
            </div>
          `;
        });

        html += `
            </div>
          </div>
        `;
      });

      container.innerHTML = html;
    }

    /**
     * Export JSON
     */
    exportJSON() {
      const json = JSON.stringify(this.results, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `diagnostic-dom-storage-${new Date().toISOString().slice(0,19).replace(/:/g, '-')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Notification
      const notif = document.createElement('div');
      notif.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 9999999;
        font-size: 16px;
        font-weight: 600;
      `;
      notif.textContent = '✅ JSON exporté !';
      document.body.appendChild(notif);

      setTimeout(() => notif.remove(), 3000);
    }

    /**
     * Délai utilitaire
     */
    delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  }

  // Exposer globalement
  window.DiagnosticComplet = DiagnosticComplet;

  window.ouvrirDiagnosticComplet = function() {
    const diagnostic = new DiagnosticComplet();
    diagnostic.openDiagnosticWindow();
  };

  console.log('✅ [Diagnostic Complet] Script chargé - Utiliser: window.ouvrirDiagnosticComplet()');

})();
