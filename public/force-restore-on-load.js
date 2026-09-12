/**
 * Force la restauration des tables au chargement de la page
 * MIGRÉ vers DOM Storage (ancien système IndexedDB désactivé)
 * À inclure dans index.html AVANT menu.js et conso.js
 */

(function () {
    'use strict';

    console.log('%c🔄 SCRIPT DE RESTAURATION DOM STORAGE CHARGÉ', 'background: #4CAF50; color: white; font-size: 14px; padding: 5px;');

    let restorationComplete = false;
    let restorationPromise = null;

    // Fonction de restauration DOM Storage
    async function forceRestoreNow() {
        if (restorationComplete) {
            console.log('✅ Restauration déjà effectuée');
            return true;
        }

        if (restorationPromise) {
            console.log('⏳ Restauration en cours, attente...');
            return restorationPromise;
        }

        restorationPromise = (async () => {
            try {
                console.log('🔄 Démarrage restauration DOM Storage...');

                // Attendre que DOM Storage Manager soit disponible
                let attempts = 0;
                while (attempts < 50 && !window.domRestoreManager) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    attempts++;
                }

                if (!window.domRestoreManager) {
                    console.error('❌ DOM Restore Manager non disponible après 5 secondes');
                    return false;
                }

                // Détecter sessionId
                let sessionId = null;

                // Méthode 1 : sessionStorage
                sessionId = sessionStorage.getItem('claraverse_stable_session');

                // Méthode 2 : React State
                if (!sessionId && window.claraverseState?.currentSession?.id) {
                    sessionId = window.claraverseState.currentSession.id;
                }

                // Méthode 3 : URL
                if (!sessionId) {
                    const urlParams = new URLSearchParams(window.location.search);
                    sessionId = urlParams.get('sessionId') || urlParams.get('session');
                }

                // Méthode 4 : DOM
                if (!sessionId) {
                    const sessionElement = document.querySelector('[data-session-id]');
                    if (sessionElement) {
                        sessionId = sessionElement.dataset.sessionId;
                    }
                }

                if (!sessionId) {
                    console.log('ℹ️ Pas de session détectée, pas de restauration');
                    restorationComplete = true;
                    return false;
                }

                console.log(`📋 Session détectée: ${sessionId}`);

                // Restaurer depuis DOM Storage
                await window.domRestoreManager.restoreSessionTables(sessionId);

                restorationComplete = true;

                // Émettre événement global
                const event = new CustomEvent('claraverse:tables:restored', {
                    detail: { sessionId, timestamp: Date.now(), source: 'dom-storage' }
                });
                document.dispatchEvent(event);
                window.dispatchEvent(event);

                console.log('%c✅ RESTAURATION DOM STORAGE TERMINÉE', 'background: #4CAF50; color: white; font-size: 14px; padding: 5px;');
                return true;

            } catch (error) {
                console.error('❌ Erreur restauration DOM Storage:', error);
                return false;
            }
        })();

        return restorationPromise;
    }

    // Exposer l'API globale
    window.claraverseRestore = {
        forceRestore: forceRestoreNow,
        isComplete: () => restorationComplete,
        waitForRestore: () => {
            if (restorationComplete) {
                return Promise.resolve(true);
            }
            return new Promise((resolve) => {
                document.addEventListener('claraverse:tables:restored', () => resolve(true), { once: true });
                // Timeout après 10 secondes
                setTimeout(() => resolve(false), 10000);
            });
        }
    };

    // Démarrer la restauration dès que possible
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(forceRestoreNow, 500);
        });
    } else {
        setTimeout(forceRestoreNow, 500);
    }

    console.log('%c✅ API DE RESTAURATION DOM EXPOSÉE: window.claraverseRestore', 'background: #4CAF50; color: white; font-size: 14px; padding: 5px;');
})();

