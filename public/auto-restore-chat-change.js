// Restauration automatique lors du changement de chat
// MIGRÉ vers DOM Storage (ancien système IndexedDB désactivé)

(function () {
    console.log('🔄 AUTO RESTORE CHAT CHANGE (DOM Storage) - Démarrage');

    let lastTableCount = 0;
    let restoreTimeout = null;
    let lastRestoreTime = 0;
    const MIN_RESTORE_INTERVAL = 5000;

    // === FONCTION DE RESTAURATION DOM STORAGE ===
    async function restoreCurrentSession() {
        const now = Date.now();
        if (now - lastRestoreTime < MIN_RESTORE_INTERVAL) {
            console.log('⏭️ Restauration trop récente, skip');
            return;
        }

        // Activer le flag pour ignorer les mutations pendant la restauration
        isRestoring = true;

        lastRestoreTime = now;
        console.log('🎯 === RESTAURATION DOM STORAGE ===');

        try {
            // Vérifier disponibilité DOM Restore Manager
            if (!window.domRestoreManager) {
                console.error('❌ DOM Restore Manager non disponible');
                return;
            }

            // Essayer d'obtenir le sessionId depuis sessionStorage
            let sessionId = sessionStorage.getItem('claraverse_stable_session');

            // Ou depuis l'URL
            if (!sessionId) {
                const urlParams = new URLSearchParams(window.location.search);
                sessionId = urlParams.get('session') || urlParams.get('sessionId');
            }

            // Ou depuis le DOM
            if (!sessionId) {
                const sessionElement = document.querySelector('[data-session-id]');
                if (sessionElement) {
                    sessionId = sessionElement.getAttribute('data-session-id');
                }
            }

            // Ou depuis React State
            if (!sessionId && window.claraverseState?.currentSession?.id) {
                sessionId = window.claraverseState.currentSession.id;
            }

            if (!sessionId) {
                console.log('⚠️ Pas de session détectée, skip restauration');
                return;
            }

            console.log(`📍 Session: ${sessionId}`);

            // Appel direct au DOM Restore Manager (pas d'événement)
            await window.domRestoreManager.restoreSessionTables(sessionId);

            console.log('✅ Restauration DOM Storage terminée');
            console.log('🎯 === FIN ===');

        } catch (error) {
            console.error('❌ Erreur:', error);
        } finally {
            // Désactiver le flag après un délai pour laisser le DOM se stabiliser
            setTimeout(() => {
                isRestoring = false;
                console.log('🔓 Flag de restauration désactivé');
            }, 2000);
        }
    }

    // === DÉTECTER LES CHANGEMENTS ===
    function checkForChanges() {
        const currentTableCount = document.querySelectorAll('table').length;

        if (currentTableCount !== lastTableCount && currentTableCount > 0) {
            console.log(`📊 Nombre de tables changé: ${lastTableCount} → ${currentTableCount}`);
            lastTableCount = currentTableCount;
            scheduleRestore();
        }

        lastTableCount = currentTableCount;
    }

    function scheduleRestore() {
        console.log('⏰ Restauration planifiée dans 5 secondes');

        if (restoreTimeout) {
            clearTimeout(restoreTimeout);
        }

        restoreTimeout = setTimeout(() => {
            console.log('⏰ Timeout écoulé - Lancement');
            restoreCurrentSession();
            restoreTimeout = null;
        }, 5000);
    }

    // === INITIALISATION ===

    // Vérifier périodiquement (DÉSACTIVÉ - utilise uniquement MutationObserver)
    // setInterval(checkForChanges, 500);

    // Flag pour éviter les boucles de restauration
    let isRestoring = false;

    // Observer DOM
    const observer = new MutationObserver((mutations) => {
        // Ignorer les mutations pendant la restauration
        if (isRestoring) {
            return;
        }

        const hasTableChanges = mutations.some(m => {
            return Array.from(m.addedNodes).some(node => {
                if (node.nodeType === 1) {
                    // Ignorer les tables déjà restaurées
                    if (node.tagName === 'TABLE') {
                        const container = node.closest('[data-restored-content="true"]');
                        if (container) {
                            return false; // Table déjà restaurée, ignorer
                        }
                        return true;
                    }
                    // Vérifier les sous-éléments
                    const tables = node.querySelectorAll?.('table');
                    if (tables && tables.length > 0) {
                        // Vérifier si au moins une table n'est pas restaurée
                        return Array.from(tables).some(table => {
                            const container = table.closest('[data-restored-content="true"]');
                            return !container;
                        });
                    }
                }
                return false;
            });
        });

        if (hasTableChanges) {
            console.log('🔄 Nouvelles tables NON restaurées détectées');
            scheduleRestore();
        }
    });

    setTimeout(() => {
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        console.log('👀 Observer activé');
    }, 1000);

    // Exposer pour tests
    window.restoreCurrentSession = restoreCurrentSession;

    console.log('✅ Auto Restore Chat Change activé');
    console.log('💡 Test: window.restoreCurrentSession()');
})();
