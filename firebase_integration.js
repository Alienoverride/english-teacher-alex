// 🔥 FIREBASE INTEGRATION - ETAPA 1: BACKUP SILENCIOSO
// Arquivo: firebase-integration.js
// Cole este arquivo na raiz do seu projeto (mesma pasta que index.html)

// ========== CONFIGURAÇÃO FIREBASE (JÁ FUNCIONANDO!) ==========
const firebaseConfig = {
    apiKey: "AIzaSyA24XdemfJ-rqVCJRUkRJLyW0xkGQ2vFOw",
    authDomain: "teacher-alex-test.firebaseapp.com",
    databaseURL: "https://teacher-alex-test-default-rtdb.firebaseio.com",
    projectId: "teacher-alex-test",
    storageBucket: "teacher-alex-test.firebasestorage.app",
    messagingSenderId: "295683510906",
    appId: "1:295683510906:web:14ae9edbdb69f02645a1c3"
};

// Inicializar Firebase (só se não estiver inicializado)
let app, database;
try {
    if (typeof firebase !== 'undefined') {
        if (!firebase.apps.length) {
            app = firebase.initializeApp(firebaseConfig);
        } else {
            app = firebase.app();
        }
        database = firebase.database();
        console.log('✅ Firebase conectado com sucesso!');
    }
} catch (error) {
    console.log('📡 Firebase offline:', error.message);
}

// ========== FUNÇÕES DE SYNC SILENCIOSAS (100% SEGURAS) ==========

// Função para salvar no Firebase (NUNCA quebra o localStorage)
async function syncToFirebase(username, progressData) {
    try {
        if (typeof database !== 'undefined' && database) {
            const userRef = database.ref(`users/${username}/progress`);
            await userRef.set({
                ...progressData,
                lastSync: new Date().toISOString(),
                syncDevice: 'web'
            });
            console.log(`✅ Backup Firebase realizado para ${username}`);
            return true;
        }
    } catch (error) {
        // SILENCIOSO - nunca quebra o sistema
        console.log('📡 Firebase backup offline:', error.message);
        return false;
    }
    return false;
}

// Função para carregar do Firebase (só quando solicitado)
async function loadFromFirebase(username) {
    try {
        if (typeof database !== 'undefined' && database) {
            const userRef = database.ref(`users/${username}/progress`);
            const snapshot = await userRef.once('value');
            if (snapshot.exists()) {
                const data = snapshot.val();
                console.log(`📥 Dados carregados do Firebase para ${username}`);
                return data;
            }
        }
    } catch (error) {
        console.log('📡 Firebase load offline:', error.message);
    }
    return null;
}

// ========== MODIFICAÇÃO DAS CLASSES DE PROGRESSO EXISTENTES ==========

// Esta função vai SUBSTITUIR a função saveProgress() em cada arquivo
function saveProgressWithFirebase(progressData, username) {
    // 1. SEMPRE salva no localStorage primeiro (PRIORITÁRIO)
    const progressKey = `progress_${username}`;
    localStorage.setItem(progressKey, JSON.stringify(progressData));
    
    // 2. Backup silencioso no Firebase (não quebra se falhar)
    syncToFirebase(username, progressData);
    
    // 3. Log para debug (opcional)
    console.log(`💾 Progresso salvo: Local ✅ | Firebase: tentativa realizada`);
}

// Função para verificar se há backup mais recente no Firebase
async function checkForNewerBackup(username) {
    try {
        const firebaseData = await loadFromFirebase(username);
        const localData = JSON.parse(localStorage.getItem(`progress_${username}`) || '{}');
        
        if (!firebaseData) return null;
        
        // Compara a última atividade para ver se Firebase é mais recente
        const firebaseLastActivity = new Date(firebaseData.lastActivity || 0);
        const localLastActivity = new Date(localData.lastActivity || 0);
        
        if (firebaseLastActivity > localLastActivity) {
            return firebaseData;
        }
        
        return null;
    } catch (error) {
        console.log('🔍 Erro ao verificar backup:', error.message);
        return null;
    }
}

// ========== INTERFACE DE RECUPERAÇÃO OPCIONAL ==========

// Função para mostrar opção de recuperação (se houver backup mais novo)
async function showRecoveryOption(username) {
    const newerBackup = await checkForNewerBackup(username);
    
    if (newerBackup) {
        // Criar interface de recuperação
        const recoveryDiv = document.createElement('div');
        recoveryDiv.id = 'firebase-recovery-overlay';
        recoveryDiv.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.7); z-index: 10000;
            display: flex; align-items: center; justify-content: center;
            backdrop-filter: blur(5px);
        `;
        
        recoveryDiv.innerHTML = `
            <div style="
                background: white; border-radius: 20px; padding: 40px; max-width: 500px; margin: 20px;
                box-shadow: 0 25px 60px rgba(0,0,0,0.3); text-align: center;
                border: 3px solid #1e3a8a;
            ">
                <div style="font-size: 3em; margin-bottom: 20px;">☁️</div>
                <div style="font-size: 1.4em; font-weight: 800; color: #1e3a8a; margin-bottom: 15px;">
                    Progresso encontrado na nuvem!
                </div>
                <div style="color: #6b7280; margin-bottom: 25px; line-height: 1.5;">
                    Encontramos um backup mais recente do seu progresso salvo na nuvem. 
                    Deseja recuperar este progresso?
                </div>
                <div style="display: flex; gap: 15px; justify-content: center;">
                    <button onclick="recoverFromCloud('${username}')" style="
                        background: linear-gradient(135deg, #10b981, #059669); color: white;
                        border: none; padding: 12px 25px; border-radius: 10px; font-weight: 700;
                        cursor: pointer; font-size: 1em;
                    ">
                        ☁️ Recuperar da Nuvem
                    </button>
                    <button onclick="continueWithLocal()" style="
                        background: #6b7280; color: white;
                        border: none; padding: 12px 25px; border-radius: 10px; font-weight: 700;
                        cursor: pointer; font-size: 1em;
                    ">
                        📱 Continuar Local
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(recoveryDiv);
        
        // Salvar dados para recuperação
        window.pendingRecoveryData = newerBackup;
    }
}

// Função para recuperar do Firebase
async function recoverFromCloud(username) {
    try {
        const recoveryData = window.pendingRecoveryData;
        if (recoveryData) {
            // Salvar dados do Firebase no localStorage
            const progressKey = `progress_${username}`;
            localStorage.setItem(progressKey, JSON.stringify(recoveryData));
            
            // Fechar interface
            const overlay = document.getElementById('firebase-recovery-overlay');
            if (overlay) overlay.remove();
            
            // Mostrar sucesso
            showNotification('✅ Progresso recuperado com sucesso!', 'success');
            
            // Recarregar página para aplicar mudanças
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        }
    } catch (error) {
        console.log('❌ Erro na recuperação:', error.message);
        showNotification('❌ Erro ao recuperar progresso', 'error');
    }
}

// Função para continuar com dados locais
function continueWithLocal() {
    const overlay = document.getElementById('firebase-recovery-overlay');
    if (overlay) overlay.remove();
}

// ========== FUNÇÕES AUXILIARES ==========

// Mostrar notificações
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    const bgColor = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6';
    
    notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 10001;
        background: ${bgColor}; color: white; padding: 15px 25px;
        border-radius: 10px; font-weight: 600; box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        animation: slideInRight 0.5s ease-out;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Adicionar animação CSS
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    setTimeout(() => {
        if (document.body.contains(notification)) {
            document.body.removeChild(notification);
        }
    }, 3000);
}

// ========== INICIALIZAÇÃO AUTOMÁTICA ==========
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se há backup mais recente (só depois que a página carregar)
    setTimeout(async () => {
        const username = sessionStorage.getItem('studentUsername');
        if (username && username !== 'testeuser') {
            await showRecoveryOption(username);
        }
    }, 2000); // Aguarda 2 segundos para não interferir na experiência
});

// ========== TESTE MANUAL (TEMPORÁRIO) ==========
// Função para testar manualmente (remover depois)
async function testFirebaseConnection() {
    const username = sessionStorage.getItem('studentUsername') || 'teste';
    const testData = {
        listening: { lessonsCompleted: ['lesson_1'], bestScores: { lesson_1: 5 }, totalAttempts: 1, badges: ['first_try'] },
        reading: { chaptersCompleted: [], bestScores: {}, totalAttempts: 0, badges: [] },
        roommate: { chaptersCompleted: [], bestScores: {}, totalAttempts: 0, badges: [] },
        neighbor: { chaptersCompleted: [], bestScores: {}, totalAttempts: 0, badges: [] },
        globalBadges: [],
        lastActivity: new Date().toISOString(),
        joinDate: new Date().toISOString(),
        totalStudyTime: 300000
    };
    
    console.log('🧪 Testando conexão Firebase...');
    const success = await syncToFirebase(username, testData);
    
    if (success) {
        console.log('✅ TESTE PASSOU! Firebase funcionando perfeitamente!');
        showNotification('✅ Firebase conectado e funcionando!', 'success');
    } else {
        console.log('❌ TESTE FALHOU! Firebase offline');
        showNotification('📡 Firebase offline (localStorage funcionando)', 'info');
    }
}

// Expor função de teste globalmente (temporário)
window.testFirebaseConnection = testFirebaseConnection;

console.log('🔥 Firebase Integration carregado! Use testFirebaseConnection() para testar.');

// ========== ATENÇÃO TEACHER ALEX ==========
// Este é o arquivo firebase-integration.js que você precisa criar!
// NÃO é o exact_modification.js que você viu!