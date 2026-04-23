/**
 * RSVP Tree 
 */

// Variable global
const RSVP_CONFIG = {
    IMGBB_API_KEY: "a96612a0536b4af45245782b47a2a0ea"
};

class RSVPTreeComplete {
    constructor() {
        this.IMGBB_API_KEY = RSVP_CONFIG.IMGBB_API_KEY;
        
        // Configuración de Firebase
        this.firebaseConfig = {
            apiKey: "AIzaSyCwUxv69D7pmn01aQ9saexCjgspt67-V6Q",
            authDomain: "bodaedwinpao.firebaseapp.com",
            databaseURL: "https://bodaedwinpao-default-rtdb.firebaseio.com",
            projectId: "bodaedwinpao",
            storageBucket: "bodaedwinpao.firebasestorage.app",
            messagingSenderId: "694267174311",
            appId: "1:694267174311:web:a004c925ee021cb50d2a82"
        };
        
        this.db = null;
        this.confirmations = [];
        this.whatsappNumber = "5212226835204";
        
        // Elementos del DOM
        this.form = document.getElementById('rsvpTreeForm');
        this.nameInput = document.getElementById('guestFullName');
        this.leavesContainer = document.getElementById('leavesContainer');
        
        this.init();
    }
    
    async init() {
        console.log('🚀 Inicializando RSVP Tree...');
        
        if (!this.form) {
            console.error('❌ No se encontró el formulario');
            return;
        }
        
        // Inicializar Firebase
        await this.initFirebase();
        
        // Cargar confirmaciones existentes
        await this.loadConfirmations();
        
        // Configurar evento del formulario
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        console.log('✅ Formulario configurado');
        
        // Mostrar contador admin
        if (window.location.search.includes('admin=true')) {
            const counter = document.getElementById('guestCounter');
            if (counter) counter.style.display = 'block';
        }
    }
    
    async initFirebase() {
        console.log('🔥 Inicializando Firebase...');
        
        if (typeof firebase === 'undefined') {
            console.error('❌ Firebase no está cargado');
            return;
        }
        
        if (!firebase.apps.length) {
            firebase.initializeApp(this.firebaseConfig);
            console.log('✅ Firebase inicializado');
        }
        
        this.db = firebase.database();
        console.log('✅ Database lista');
    }
    
    async loadConfirmations() {
        if (!this.db) return;
        
        try {
            this.db.ref('wedding_confirmations').on('value', (snapshot) => {
                const data = snapshot.val();
                this.confirmations = [];
                
                if (data) {
                    Object.keys(data).forEach(key => {
                        this.confirmations.push({ id: key, ...data[key] });
                    });
                }
                
                console.log(`📋 ${this.confirmations.length} confirmaciones`);
                this.drawAllLeaves();
                this.updateCounter();
            });
        } catch (error) {
            console.error('Error:', error);
        }
    }
    
    drawAllLeaves() {
        if (!this.leavesContainer) return;
        
        this.leavesContainer.innerHTML = '';
        
        const positions = [
            { left: '15%', top: '35%', rotate: -10 }, { left: '25%', top: '45%', rotate: -5 },
            { left: '20%', top: '55%', rotate: -8 }, { left: '75%', top: '35%', rotate: 10 },
            { left: '65%', top: '45%', rotate: 5 }, { left: '70%', top: '55%', rotate: 8 },
            { left: '45%', top: '25%', rotate: 0 }, { left: '48%', top: '38%', rotate: 3 },
            { left: '35%', top: '30%', rotate: -6 }, { left: '55%', top: '30%', rotate: 6 },
            { left: '30%', top: '40%', rotate: -12 }, { left: '60%', top: '40%', rotate: 12 },
            { left: '40%', top: '28%', rotate: -4 }, { left: '52%', top: '28%', rotate: 4 },
            { left: '18%', top: '50%', rotate: -15 }, { left: '72%', top: '50%', rotate: 15 }
        ];
        
        this.confirmations.forEach((conf, index) => {
            const pos = positions[index % positions.length];
            const leaf = this.createLeaf(conf.name, pos);
            this.leavesContainer.appendChild(leaf);
        });
    }
    
    createLeaf(name, position) {
        const leaf = document.createElement('div');
        leaf.className = 'leaf';
        leaf.style.left = position.left;
        leaf.style.top = position.top;
        leaf.style.transform = `rotate(${position.rotate}deg)`;
        
        const leafContent = document.createElement('div');
        leafContent.className = 'leaf-content';
        leafContent.textContent = name.length > 18 ? name.substring(0, 16) + '...' : name;
        leafContent.title = name;
        
        leaf.appendChild(leafContent);
        return leaf;
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        const name = this.nameInput.value.trim();
        
        if (!name) {
            this.showMessage('Ingresa tu nombre', 'error');
            return;
        }
        
        if (name.length < 3) {
            this.showMessage('Ingresa nombre completo', 'error');
            return;
        }
        
        const yaExiste = this.confirmations.some(
            c => c.name.toLowerCase() === name.toLowerCase()
        );
        
        if (yaExiste) {
            this.showMessage(`${name}, ya confirmaste`, 'warning');
            return;
        }
        
        const btn = this.form.querySelector('button');
        const textoOriginal = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
        
        try {
            const nuevaConf = {
                name: name,
                timestamp: Date.now(),
                date: new Date().toISOString()
            };
            
            await this.db.ref('wedding_confirmations').push(nuevaConf);
            
            this.showMessage(`✨ ¡confirmado ${name}! ✨`, 'success');
            this.nameInput.value = '';
            
            const mensaje = `Hola Edwin y Pao, soy ${name}. Muchas felicidades  ¡ahi estaremos! <3`;
            const url = `https://wa.me/${this.whatsappNumber}?text=${encodeURIComponent(mensaje)}`;
            
            setTimeout(() => window.open(url, '_blank'), 500);
            
        } catch (error) {
            console.error(error);
            this.showMessage('Error al guardar', 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = textoOriginal;
        }
    }
    
    updateCounter() {
        const totalSpan = document.getElementById('totalConfirmations');
        if (totalSpan) totalSpan.textContent = this.confirmations.length;
        
        const guestsSpan = document.getElementById('totalGuests');
        if (guestsSpan) guestsSpan.textContent = this.confirmations.length;
    }
    
    showMessage(msg, type) {
        let toast = document.querySelector('.rsvp-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'rsvp-toast';
            toast.style.cssText = `
                position: fixed; bottom: 100px; left: 50%; transform: translateX(-50%);
                padding: 12px 24px; border-radius: 50px; z-index: 9999;
                opacity: 0; transition: opacity 0.3s; font-size: 14px;
                white-space: nowrap; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                pointer-events: none;
            `;
            document.body.appendChild(toast);
        }
        
        const colores = { success: '#5a6e46', error: '#e74c3c', warning: '#f39c12', info: '#d4af37' };
        toast.style.background = colores[type] || colores.info;
        toast.style.color = 'white';
        toast.textContent = msg;
        toast.style.opacity = '1';
        
        setTimeout(() => toast.style.opacity = '0', 3000);
    }
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 Iniciando...');
    window.rsvpTree = new RSVPTreeComplete();
});