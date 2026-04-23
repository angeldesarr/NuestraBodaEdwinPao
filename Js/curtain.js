/**
 * curtain.js
 * Única responsabilidad: Control de apertura de cortinas por scroll
 */

// 🚨 SOLUCIÓN REAL: evitar que el navegador restaure el scroll
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

// Forzar scroll arriba cuando carga la página
window.addEventListener('load', () => {
    window.scrollTo(0, 0);
});

class CurtainScroll {
    constructor() {
        this.trigger = document.getElementById('curtain-trigger');
        this.left = document.querySelector('.curtain-left');
        this.right = document.querySelector('.curtain-right');
        this.content = document.querySelector('.invitation-content');
        this.indicator = document.querySelector('.scroll-indicator');
        this.musicTriggered = false;
        
        this.ticking = false;

        if (!this.trigger || !this.left || !this.right || !this.content) return;

        this.init();
    }

    init() {
        this.onScroll = this.onScroll.bind(this);
        window.addEventListener('scroll', this.onScroll, { passive: true });
        this.onScroll();
    }

    onScroll() {
        if (!this.ticking) {
            requestAnimationFrame(() => {
                this.updateCurtains();
                this.ticking = false;
            });
            this.ticking = true;
        }
    }

    updateCurtains() {
        const scrollY = window.scrollY;
        const triggerHeight = this.trigger.offsetHeight;
        const progress = Math.min(Math.max(scrollY / triggerHeight, 0), 1);

        const offset = progress * 100;
        this.left.style.transform = `translateX(-${offset}%)`;
        this.right.style.transform = `translateX(${offset}%)`;

        if (progress > 0.6) {
            if (!this.content.classList.contains('visible')) {
                this.content.classList.add('visible');
                
                if (!this.musicTriggered) {
                    this.musicTriggered = true;
                    
                    const startMusic = () => {
                        const audio = document.getElementById('weddingMusic');
                        if (audio) {
                            audio.play().then(() => {
                                console.log('🎵 Música iniciada correctamente');
                                const toggle = document.getElementById('musicToggle');
                                if (toggle) toggle.innerHTML = '<i class="fas fa-pause"></i>';
                            }).catch(e => console.log('Error al reproducir:', e));
                        }
                        document.removeEventListener('click', startMusic);
                        document.removeEventListener('touchstart', startMusic);
                    };
                    
                    document.addEventListener('click', startMusic);
                    document.addEventListener('touchstart', startMusic);
                    this.showMusicReadyHint();
                }
            }
            
            if (this.indicator) this.indicator.classList.add('hidden');
        } else {
            this.content.classList.remove('visible');
            if (this.indicator) this.indicator.classList.remove('hidden');
        }
    }

    showMusicReadyHint() {
        const hint = document.createElement('div');
        hint.className = 'music-ready-hint';
        hint.innerHTML = '🎵 Toca en cualquier lugar para activar la música';
        hint.style.cssText = `
            position: fixed;
            bottom: 120px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(90, 110, 70, 0.95);
            color: #f5e6d3;
            padding: 10px 20px;
            border-radius: 50px;
            font-size: 14px;
            z-index: 1002;
            text-align: center;
            white-space: nowrap;
            font-family: 'Cormorant Garamond', serif;
            font-weight: 500;
            letter-spacing: 1px;
            backdrop-filter: blur(4px);
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            border: 1px solid rgba(212, 175, 55, 0.5);
            transition: opacity 0.5s ease;
            pointer-events: none;
        `;
        document.body.appendChild(hint);
        
        setTimeout(() => {
            if (hint && hint.remove) hint.remove();
        }, 4000);
        
        const removeHint = () => {
            if (hint && hint.remove) hint.remove();
            document.removeEventListener('click', removeHint);
            document.removeEventListener('touchstart', removeHint);
        };
        document.addEventListener('click', removeHint);
        document.addEventListener('touchstart', removeHint);
    }
}