// 🔥 FIREBASE INTEGRATION - CORREÇÃO EMERGENCIAL PARA 3 USUÁRIOS
// Arquivo: firebase-integration.js
// ✅ CORRIGIDO: teacheralex, nicolete, testy - todos veem progresso!

// ========== ✅ CORREÇÃO 1: LISTA ATUALIZADA COM OS 3 USUÁRIOS ==========
const FIREBASE_USERS = ['testy', 'nicolete', 'teacheralex']; // ← ADICIONADO teacheralex!

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

// ========== ✅ CORREÇÃO 2: VERIFICAÇÃO DE USUÁRIO FIREBASE ==========
function isFirebaseUser(username) {
    const isUser = FIREBASE_USERS.includes(username.toLowerCase());
    console.log(`🔍 Verificando usuário ${username}: ${isUser ? 'Firebase ✅' : 'localStorage apenas 📱'}`);
    return isUser;
}

// ========== ✅ CORREÇÃO 3: CARREGAMENTO ASYNC COM LOGS DETALHADOS ==========
async function loadFromFirebase(username) {
    try {
        if (typeof database !== 'undefined' && database && isFirebaseUser(username)) {
            console.log(`☁️ Tentando carregar dados do Firebase para ${username}...`);
            const userRef = database.ref(`users/${username}/progress`);
            const snapshot = await userRef.once('value');
            if (snapshot.exists()) {
                const data = snapshot.val();
                console.log(`✅ Dados carregados do Firebase para ${username}:`, data);
                return data;
            } else {
                console.log(`📭 Nenhum backup encontrado no Firebase para ${username}`);
            }
        } else if (!isFirebaseUser(username)) {
            console.log(`📱 ${username} não é usuário Firebase (normal)`);
        }
    } catch (error) {
        console.log('📡 Firebase load offline:', error.message);
    }
    return null;
}

// ========== FUNÇÃO PARA SALVAR NO FIREBASE ==========
async function syncToFirebase(username, progressData) {
    try {
        if (typeof database !== 'undefined' && database && isFirebaseUser(username)) {
            console.log(`🔄 Salvando no Firebase para ${username}...`);
            const userRef = database.ref(`users/${username}/progress`);
            await userRef.set({
                ...progressData,
                lastSync: new Date().toISOString(),
                syncDevice: 'web-prod'
            });
            console.log(`✅ Backup Firebase realizado para ${username}!`);
            showNotification('☁️ Progresso salvo na nuvem!', 'success');
            return true;
        }
    } catch (error) {
        console.log('❌ Erro Firebase:', error.message);
        return false;
    }
    return false;
}

// ========== ✅ CORREÇÃO 4: FUNÇÃO HÍBRIDA UNIVERSAL ==========
function saveProgressWithFirebase(progressData, username) {
    console.log(`💾 Salvando progresso para ${username}...`);
    
    // 1. SEMPRE salva no localStorage primeiro (PRIORITÁRIO)
    const progressKey = `progress_${username}`;
    localStorage.setItem(progressKey, JSON.stringify(progressData));
    console.log(`✅ Dados salvos no localStorage para ${username}`);
    
    // 2. Se for usuário Firebase, salva na nuvem também
    if (isFirebaseUser(username)) {
        console.log(`☁️ Iniciando backup Firebase para ${username}...`);
        syncToFirebase(username, progressData);
    } else {
        console.log(`📱 ${username}: apenas localStorage (usuário normal)`);
    }
}

// ========== ✅ CORREÇÃO 5: CARREGAMENTO HÍBRIDO ASYNC ==========
async function loadProgressWithFirebase(username) {
    console.log(`📊 Carregando progresso para ${username}...`);
    
    try {
        // 1. Tentar Firebase primeiro (para os 3 usuários)
        if (isFirebaseUser(username)) {
            console.log(`☁️ Usuário Firebase detectado: ${username}`);
            const firebaseData = await loadFromFirebase(username);
            if (firebaseData) {
                console.log(`✅ Dados carregados do Firebase para ${username}`);
                // Salvar também no localStorage como backup
                const progressKey = `progress_${username}`;
                localStorage.setItem(progressKey, JSON.stringify(firebaseData));
                showNotification('☁️ Progresso sincronizado da nuvem!', 'success');
                return firebaseData;
            } else {
                console.log(`📭 Nenhum backup Firebase encontrado para ${username}`);
            }
        }
        
        // 2. Fallback para localStorage
        const progressKey = `progress_${username}`;
        const saved = localStorage.getItem(progressKey);
        if (saved) {
            const data = JSON.parse(saved);
            console.log(`💾 Dados carregados do localStorage para ${username}`);
            return data;
        } else {
            console.log(`🆕 Nenhum dado encontrado, criando dados padrão para ${username}`);
            return null; // Retorna null para criar dados padrão
        }
    } catch (error) {
        console.error('❌ Erro ao carregar progresso:', error);
        return null;
    }
}

// ========== FUNÇÕES AUXILIARES ==========

// Mostrar notificações
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    const bgColor = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6';
    
    notification.style.cssText = `
        position: fixed; top: 80px; right: 20px; z-index: 10001;
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

// ========== ✅ CORREÇÃO 6: CLASSE DE PROGRESSO ATUALIZADA ==========
class ProgressTrackerFixed {
    constructor() {
        this.studentId = sessionStorage.getItem('studentUsername') || 'student';
        this.progressKey = `progress_${this.studentId}`;
        this.data = null;
        console.log(`🎯 ProgressTracker criado para ${this.studentId}`);
    }

    // ✅ MÉTODO ASYNC CORRIGIDO
    async loadProgress() {
        console.log(`📊 Carregando progresso para ${this.studentId}...`);
        
        try {
            // Usar a função híbrida
            this.data = await loadProgressWithFirebase(this.studentId);
            
            // Se não encontrou dados, criar padrão
            if (!this.data) {
                this.createDefaultData();
            }
            
            // Garantir compatibilidade com estruturas antigas
            this.ensureDataCompatibility();
            
            console.log(`✅ Progresso carregado para ${this.studentId}:`, this.data);
        } catch (error) {
            console.error('❌ Erro ao carregar progresso:', error);
            this.createDefaultData();
        }
    }

    createDefaultData() {
        this.data = {
            listening: { lessonsCompleted: [], bestScores: {}, totalAttempts: 0, badges: [] },
            reading: { chaptersCompleted: [], bestScores: {}, totalAttempts: 0, badges: [] },
            roommate: { chaptersCompleted: [], bestScores: {}, totalAttempts: 0, badges: [] },
            neighbor: { chaptersCompleted: [], bestScores: {}, totalAttempts: 0, badges: [] },
            globalBadges: [], 
            lastActivity: null, 
            joinDate: new Date().toISOString(), 
            totalStudyTime: 0
        };
        console.log(`✨ Dados padrão criados para ${this.studentId}`);
    }

    ensureDataCompatibility() {
        // Garantir que todas as estruturas existam
        if (!this.data.roommate) {
            this.data.roommate = { chaptersCompleted: [], bestScores: {}, totalAttempts: 0, badges: [] };
        }
        if (!this.data.neighbor) {
            this.data.neighbor = { chaptersCompleted: [], bestScores: {}, totalAttempts: 0, badges: [] };
        }
        if (!this.data.globalBadges) {
            this.data.globalBadges = [];
        }
        if (!this.data.totalStudyTime) {
            this.data.totalStudyTime = 0;
        }
    }

    // ✅ MÉTODO DE SALVAMENTO HÍBRIDO
    saveProgress() {
        this.data.lastActivity = new Date().toISOString();
        saveProgressWithFirebase(this.data, this.studentId);
    }

    getStats() {
        const listeningLessons = this.data.listening.lessonsCompleted.length;
        const readingChapters = this.data.reading.chaptersCompleted.length;
        const roommateChapters = this.data.roommate ? this.data.roommate.chaptersCompleted.length : 0;
        const neighborChapters = this.data.neighbor ? this.data.neighbor.chaptersCompleted.length : 0;
        const totalChapters = readingChapters + roommateChapters + neighborChapters;
        const totalBadges = this.data.listening.badges.length + 
                          this.data.reading.badges.length + 
                          (this.data.roommate ? this.data.roommate.badges.length : 0) +
                          (this.data.neighbor ? this.data.neighbor.badges.length : 0) +
                          this.data.globalBadges.length;
        const studyTimeHours = Math.floor(this.data.totalStudyTime / (1000 * 60 * 60));

        return {
            lessonsCompleted: listeningLessons,
            chaptersRead: totalChapters,
            totalBadges: totalBadges,
            studyTime: studyTimeHours
        };
    }
}

// ========== ✅ CORREÇÃO 7: FUNÇÃO DEBUG UNIVERSAL ==========
function createDebugButtonForFirebaseUsers() {
    const studentName = sessionStorage.getItem('studentUsername');
    if (studentName && ['nicolete', 'testy', 'teacheralex'].includes(studentName.toLowerCase())) {
        const debugBtn = document.createElement('button');
        debugBtn.textContent = '🔧 Debug Firebase';
        debugBtn.style.cssText = `
            position: fixed; bottom: 20px; right: 20px; z-index: 10000;
            background: #6b7280; color: white; padding: 10px 20px;
            border-radius: 10px; border: none; cursor: pointer;
            font-weight: 600; box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            transition: all 0.3s ease;
        `;
        
        debugBtn.onmouseover = () => debugBtn.style.background = '#4b5563';
        debugBtn.onmouseout = () => debugBtn.style.background = '#6b7280';
        
        debugBtn.onclick = async function() {
            console.log('🔍 Iniciando debug completo...');
            
            // Criar nova instância e carregar dados
            const tracker = new ProgressTrackerFixed();
            await tracker.loadProgress();
            
            console.log('🔍 DEBUG COMPLETO:');
            console.table({
                'Usuário': studentName,
                'É Firebase?': isFirebaseUser(studentName),
                'Listening': tracker.data.listening.lessonsCompleted.length + ' lições',
                'Reading': tracker.data.reading.chaptersCompleted.length + ' capítulos',
                'Roommate': tracker.data.roommate.chaptersCompleted.length + ' capítulos',
                'Neighbor': tracker.data.neighbor.chaptersCompleted.length + ' capítulos',
                'Total Badges': tracker.getStats().totalBadges + ' badges'
            });
            
            console.log('📊 Dados completos:', tracker.data);
            
            if (confirm('Forçar sincronização com Firebase?')) {
                console.log('🔄 Forçando sincronização...');
                await syncToFirebase(studentName, tracker.data);
                alert('✅ Sincronização forçada!');
                location.reload();
            }
        };
        
        document.body.appendChild(debugBtn);
        console.log(`🔧 Botão debug adicionado para ${studentName}`);
    }
}

// ========== ✅ CORREÇÃO 8: VERIFICAÇÃO DE BACKUP MAIS RECENTE ==========
async function checkForNewerBackup(username) {
    try {
        if (!isFirebaseUser(username)) return null;
        
        const firebaseData = await loadFromFirebase(username);
        const localData = JSON.parse(localStorage.getItem(`progress_${username}`) || '{}');
        
        if (!firebaseData) return null;
        
        // Compara a última atividade para ver se Firebase é mais recente
        const firebaseLastActivity = new Date(firebaseData.lastActivity || 0);
        const localLastActivity = new Date(localData.lastActivity || 0);
        
        if (firebaseLastActivity > localLastActivity) {
            console.log(`☁️ Backup mais recente encontrado na nuvem para ${username}`);
            return firebaseData;
        }
        
        return null;
    } catch (error) {
        console.log('🔍 Erro ao verificar backup:', error.message);
        return null;
    }
}

// ========== INTERFACE DE RECUPERAÇÃO OPCIONAL ==========
async function showRecoveryOption(username) {
    const newerBackup = await checkForNewerBackup(username);
    
    if (newerBackup) {
        console.log(`🆘 Mostrando opção de recuperação para ${username}`);
        
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

// ✅ FUNÇÃO CORRIGIDA - Não perde login mais!
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
            
            // ✅ CORRIGIDO: Atualizar página preservando login
            setTimeout(() => {
                location.reload();
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

// ========== ✅ TESTE MANUAL PARA OS 3 USUÁRIOS ==========
async function testFirebaseConnection() {
    const username = sessionStorage.getItem('studentUsername') || 'teste';
    
    console.log('🧪 Testando conexão Firebase...');
    console.log(`👤 Usuário: ${username}`);
    console.log(`☁️ É Firebase? ${isFirebaseUser(username)}`);
    
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
    
    if (isFirebaseUser(username)) {
        const success = await syncToFirebase(username, testData);
        
        if (success) {
            console.log('✅ TESTE PASSOU! Firebase funcionando perfeitamente!');
            showNotification('✅ Firebase conectado e funcionando!', 'success');
            
            // Testar carregamento também
            const loadedData = await loadFromFirebase(username);
            if (loadedData) {
                console.log('✅ TESTE LOAD PASSOU! Dados carregados:', loadedData);
                showNotification('☁️ Teste de carregamento OK!', 'success');
            }
        } else {
            console.log('❌ TESTE FALHOU! Firebase offline');
            showNotification('📡 Firebase offline', 'error');
        }
    } else {
        console.log(`📱 ${username} não é usuário Firebase (normal)`);
        showNotification(`📱 ${username}: apenas localStorage`, 'info');
    }
}

// ========== INICIALIZAÇÃO AUTOMÁTICA ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Firebase Integration carregado!');
    
    // Adicionar botão debug para usuários Firebase
    setTimeout(() => {
        createDebugButtonForFirebaseUsers();
    }, 1000);
    
    // Verificar se há backup mais recente (só depois que a página carregar)
    setTimeout(async () => {
        const username = sessionStorage.getItem('studentUsername');
        if (username && isFirebaseUser(username)) {
            await showRecoveryOption(username);
        }
    }, 3000); // Aguarda 3 segundos para não interferir na experiência
});

// ========== EXPOR FUNÇÕES GLOBALMENTE ==========
window.isFirebaseUser = isFirebaseUser;
window.loadFromFirebase = loadFromFirebase;
window.syncToFirebase = syncToFirebase;
window.saveProgressWithFirebase = saveProgressWithFirebase;
window.loadProgressWithFirebase = loadProgressWithFirebase;
window.ProgressTrackerFixed = ProgressTrackerFixed;
window.testFirebaseConnection = testFirebaseConnection;
window.recoverFromCloud = recoverFromCloud;
window.continueWithLocal = continueWithLocal;

console.log('🔥 Firebase Integration CORRIGIDO! Use testFirebaseConnection() para testar.');
console.log('👥 Usuários Firebase ativos:', FIREBASE_USERS);
