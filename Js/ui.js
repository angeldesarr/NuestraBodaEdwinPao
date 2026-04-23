/**
 * ui.js
 * Responsabilidades: Interfaz de usuario, música, countdown, mapas, video, timeline
 */

class WeddingUI {
    constructor() {
        console.log('🟢 Inicializando WeddingUI...');
        this.initCountdown();
        this.setupMusic();
        this.setupCalendar();
        this.setupMapsChurch();  
        this.setupMapsVenue();   
        this.setupRippleEffects();
        this.setupTimelineAnimation();
        this.setupTimelineProgress();
        this.setupVideo();  // ← NUEVO: video integrado en la clase
        this.setupParallax();
    }

    // ----- LÍNEA PROGRESIVA - DEFINITIVA -----
setupTimelineProgress() {
    const itinerarySection = document.querySelector('.itinerary-section');
    
    if (!itinerarySection) return;
    
    let ticking = false;
    
    const updateProgress = () => {
        const rect = itinerarySection.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        let progress = 0;
        
        const trigger = windowHeight * 0.5;
        const distance = trigger - rect.top;
        const total = rect.height;
        progress = distance / total;
        
        if (rect.bottom <= 0) progress = 1;
        progress = Math.min(Math.max(progress, 0), 1);
        
        const style = document.getElementById('timeline-progress-style');
        if (style) style.remove();
        
        const newStyle = document.createElement('style');
        newStyle.id = 'timeline-progress-style';
        newStyle.textContent = `
            .timeline-modern::after {
                height: ${progress * 100}% !important;
            }
        `;
        document.head.appendChild(newStyle);
        
        ticking = false;
    };
    
    const onScroll = () => {
        if (!ticking) {
            requestAnimationFrame(updateProgress);
            ticking = true;
        }
    };
    
    window.addEventListener('scroll', onScroll);
    window.addEventListener('resize', updateProgress);
    updateProgress();
}
    
    // ----- COUNTDOWN CON MENSAJES DINÁMICOS -----
    initCountdown() {
        const misaDate = new Date('2026-11-07T13:00:00').getTime();
        const celebracionDate = new Date('2026-11-07T15:00:00').getTime();
        
        const daysEl = document.getElementById('days');
        const hoursEl = document.getElementById('hours');
        const minutesEl = document.getElementById('minutes');
        const secondsEl = document.getElementById('seconds');
        const countdownEl = document.getElementById('countdown');
        
        let messageEl = document.querySelector('.countdown-message');
        if (!messageEl && countdownEl) {
            messageEl = document.createElement('div');
            messageEl.className = 'countdown-message';
            messageEl.style.cssText = `
                text-align: center;
                margin-top: 1.5rem;
                padding: 1rem;
                border-radius: 12px;
                font-weight: 500;
                transition: all 0.3s ease;
            `;
            countdownEl.parentNode.appendChild(messageEl);
        }

        if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

        const update = () => {
            const now = new Date().getTime();
            const distanceToMisa = misaDate - now;
            const distanceToCelebracion = celebracionDate - now;
            
            let message = '';
            let messageType = '';
            
            if (distanceToMisa > 3600000) {
                const days = Math.floor(distanceToMisa / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distanceToMisa % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distanceToMisa % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distanceToMisa % (1000 * 60)) / 1000);
                
                daysEl.textContent = days.toString().padStart(3, '0');
                hoursEl.textContent = hours.toString().padStart(2, '0');
                minutesEl.textContent = minutes.toString().padStart(2, '0');
                secondsEl.textContent = seconds.toString().padStart(2, '0');
                
                message = `✨ ¡Faltan ${days} días, ${hours} horas y ${minutes} minutos para nuestra boda! ✨`;
                messageType = 'normal';
            }
            else if (distanceToMisa > 0 && distanceToMisa <= 3600000) {
                const hours = Math.floor(distanceToMisa / (1000 * 60 * 60));
                const minutes = Math.floor((distanceToMisa % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distanceToMisa % (1000 * 60)) / 1000);
                
                daysEl.textContent = '000';
                hoursEl.textContent = hours.toString().padStart(2, '0');
                minutesEl.textContent = minutes.toString().padStart(2, '0');
                secondsEl.textContent = seconds.toString().padStart(2, '0');
                
                message = `⏰ ¡La misa está por comenzar! Falta ${hours} hora(s) y ${minutes} minutos ⏰`;
                messageType = 'urgent';
            }
            else if (distanceToMisa <= 0 && distanceToCelebracion > 0) {
                const hoursToCelebration = Math.floor(distanceToCelebracion / (1000 * 60 * 60));
                const minutesToCelebration = Math.floor((distanceToCelebracion % (1000 * 60 * 60)) / (1000 * 60));
                const hours = Math.floor(distanceToCelebracion / (1000 * 60 * 60));
                const minutes = Math.floor((distanceToCelebracion % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distanceToCelebracion % (1000 * 60)) / 1000);
                
                daysEl.textContent = '000';
                hoursEl.textContent = hours.toString().padStart(2, '0');
                minutesEl.textContent = minutes.toString().padStart(2, '0');
                secondsEl.textContent = seconds.toString().padStart(2, '0');
                
                if (hoursToCelebration >= 1) {
                    message = `🎉 ¡La misa ya comenzó! Pero aún llegas a la celebración en ${hoursToCelebration} hora(s) y ${minutesToCelebration} minutos 🎉`;
                } else if (minutesToCelebration > 30) {
                    message = `💃 ¡La misa está en curso! La celebración comienza en ${minutesToCelebration} minutos, ¡aún estás a tiempo! 💃`;
                } else if (minutesToCelebration > 0) {
                    message = `🏃‍♂️ ¡Corre! La celebración está por empezar en ${minutesToCelebration} minutos 🏃‍♀️`;
                } else {
                    message = `🎊 ¡La celebración está por comenzar! Prepárate para festejar 🎊`;
                }
                messageType = 'warning';
            }
            else if (distanceToCelebracion <= 0 && distanceToCelebracion > -7200000) {
                const minutesLate = Math.floor(Math.abs(distanceToCelebracion) / (1000 * 60));
                
                daysEl.textContent = '000';
                hoursEl.textContent = '00';
                minutesEl.textContent = Math.abs(Math.floor((distanceToCelebracion % (1000 * 60 * 60)) / (1000 * 60))).toString().padStart(2, '0');
                secondsEl.textContent = Math.abs(Math.floor((distanceToCelebracion % (1000 * 60)) / 1000)).toString().padStart(2, '0');
                
                message = `🎵 ¡Ya comenzó la celebración! Llegas con ${minutesLate} minutos de retraso, ¡no faltes más! 🎵`;
                messageType = 'late';
            }
            else if (distanceToCelebracion < -7200000) {
                daysEl.textContent = '000';
                hoursEl.textContent = '00';
                minutesEl.textContent = '00';
                secondsEl.textContent = '00';
                
                message = `💒 ¡Gracias por ser parte de nuestro día especial! La fiesta continúa en nuestros corazones 💒`;
                messageType = 'ended';
            }
            
            if (messageEl) {
                messageEl.textContent = message;
                
                switch(messageType) {
                    case 'urgent':
                        messageEl.style.background = 'linear-gradient(135deg, #fff3cd, #ffe69e)';
                        messageEl.style.color = '#856404';
                        messageEl.style.border = '1px solid #ffc107';
                        messageEl.style.fontWeight = 'bold';
                        break;
                    case 'warning':
                        messageEl.style.background = 'linear-gradient(135deg, #ffe6e6, #ffcccc)';
                        messageEl.style.color = '#721c24';
                        messageEl.style.border = '1px solid #f5c6cb';
                        messageEl.style.fontWeight = 'bold';
                        break;
                    case 'late':
                        messageEl.style.background = 'linear-gradient(135deg, #d4edda, #c3e6cb)';
                        messageEl.style.color = '#155724';
                        messageEl.style.border = '1px solid #c3e6cb';
                        messageEl.style.fontWeight = 'bold';
                        break;
                    case 'ended':
                        messageEl.style.background = 'linear-gradient(135deg, #d1ecf1, #bee5eb)';
                        messageEl.style.color = '#0c5460';
                        messageEl.style.border = '1px solid #bee5eb';
                        messageEl.style.fontWeight = 'normal';
                        break;
                    default:
                        messageEl.style.background = 'linear-gradient(135deg, #f9f5f0, #fff)';
                        messageEl.style.color = '#5a6e46';
                        messageEl.style.border = '1px solid rgba(212, 175, 55, 0.3)';
                        messageEl.style.fontWeight = 'normal';
                }
            }
        };

        update();
        setInterval(update, 1000);
    }

    // ----- MÚSICA -----
    setupMusic() {
    const toggle = document.getElementById('musicToggle');
    const audio = document.getElementById('weddingMusic');
    
    if (!toggle || !audio) return;

    let isPlaying = false;
    
    // Verificar si la música ya está sonando (por el autoplay)
    const checkPlaying = () => {
        isPlaying = !audio.paused;
        toggle.innerHTML = isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-music"></i>';
    };
    
    audio.addEventListener('play', () => {
        isPlaying = true;
        toggle.innerHTML = '<i class="fas fa-pause"></i>';
    });
    
    audio.addEventListener('pause', () => {
        isPlaying = false;
        toggle.innerHTML = '<i class="fas fa-music"></i>';
    });

    toggle.addEventListener('click', () => {
        if (isPlaying) {
            audio.pause();
        } else {
            audio.play().catch(() => {
                console.log('Error al reproducir');
            });
        }
    });
}

    // ----- CALENDARIO -----
    setupCalendar() {
        const btn = document.getElementById('btnCalendar');
        if (!btn) {
            console.log('⚠️ Botón de calendario no encontrado');
            return;
        }

        btn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('📅 Abriendo calendario...');

            const title = encodeURIComponent('Boda de Edwin García González & Paola');
            const details = encodeURIComponent(
                'Ceremonia religiosa y celebración de boda.\n\n' +
                'Misa: 1:00 PM\n' +
                'Celebración: 3:00 PM\n\n' +
                '¡Te esperamos!'
            );
            const location = encodeURIComponent('Parroquia de San Lorenzo Almecatla, Puebla');
            const startDate = '20261107T130000';
            const endDate = '20261107T200000';

            const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${startDate}/${endDate}`;
            window.open(url, '_blank');
        });
    }

    // ----- GOOGLE MAPS PARA IGLESIA -----
    setupMapsChurch() {
        const mapsBtn = document.getElementById('btnMapsChurch');
        
        if (!mapsBtn) {
            console.log('⚠️ Botón de Maps para iglesia no encontrado');
            return;
        }

        mapsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const direccion = 'Parroquia de San Lorenzo Almecatla, 72710 San Lorenzo Almecatla, Puebla';
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`;
            window.open(mapsUrl, '_blank');
            this.showToastMessage('Abriendo ubicación de la iglesia...');
        });
    }

// ----- GOOGLE MAPS PARA SALÓN (con navegación directa) -----
setupMapsVenue() {
    const mapsBtn = document.getElementById('btnMapsVenue');
    
    if (!mapsBtn) {
        console.log('⚠️ Botón de Maps para salón no encontrado');
        return;
    }

    mapsBtn.addEventListener('click', (e) => {
        e.preventDefault();
        // Coordenadas exactas del salón (según tu enlace)
        const lat = 19.1412838;
        const lng = -98.2366371;
        // Enlace que inicia la navegación
        const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
        window.open(mapsUrl, '_blank');
        this.showToastMessage('Abriendo ruta al salón...');
    });
}

    // ----- TOAST PARA FEEDBACK -----
    showToastMessage(message) {
        let toast = document.querySelector('.maps-toast');
        
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'maps-toast';
            toast.style.cssText = `
                position: fixed;
                bottom: 100px;
                left: 50%;
                transform: translateX(-50%);
                background: #4285f4;
                color: white;
                padding: 12px 24px;
                border-radius: 50px;
                font-size: 14px;
                z-index: 9999;
                opacity: 0;
                transition: opacity 0.3s ease;
                pointer-events: none;
                white-space: nowrap;
                font-family: system-ui, -apple-system, sans-serif;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            `;
            document.body.appendChild(toast);
        }
        
        toast.textContent = message;
        toast.style.opacity = '1';
        
        setTimeout(() => {
            toast.style.opacity = '0';
        }, 2000);
    }

    // ----- RIPPLE EFFECT -----
    setupRippleEffects() {
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', this.createRipple);
        });
    }

    createRipple(e) {
        const button = e.currentTarget;
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        const ripple = document.createElement('span');
        ripple.className = 'ripple-effect';
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.6);
            transform: scale(0);
            animation: ripple 0.6s linear;
            width: ${size}px;
            height: ${size}px;
            top: ${y}px;
            left: ${x}px;
            pointer-events: none;
        `;

        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    }

    // ----- ANIMACIÓN TIMELINE -----
    setupTimelineAnimation() {
        const items = document.querySelectorAll('.timeline-item');
        if (!items.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('show');
                    }, index * 200);
                }
            });
        }, { threshold: 0.2 });

        items.forEach(item => observer.observe(item));
    }

    // ----- VIDEO DIVERTIDO (integrado en la clase) -----
    setupVideo() {
        const video = document.getElementById('video-divertido');
        const musicAudio = document.getElementById('weddingMusic');
        const musicToggle = document.getElementById('musicToggle');
        
        if (!video || !musicAudio) return;
        
        let wasMusicPlaying = false;
        
        video.addEventListener('play', () => {
            if (!musicAudio.paused) {
                wasMusicPlaying = true;
                musicAudio.pause();
                console.log('🎵 Música pausada - Video iniciado');
                if (musicToggle) musicToggle.style.opacity = '0.5';
            } else {
                wasMusicPlaying = false;
            }
        });
        
        video.addEventListener('ended', () => {
            if (wasMusicPlaying) {
                musicAudio.play().catch(e => console.log('Error al reanudar música:', e));
                console.log('🎵 Música reanudada - Video terminado');
                if (musicToggle) musicToggle.style.opacity = '1';
            }
            wasMusicPlaying = false;
            this.mostrarMensajeVideo('😂 ¡Esperamos que te haya gustado!');
        });
        
        video.addEventListener('pause', () => {
            if (!video.ended && wasMusicPlaying) {
                musicAudio.play().catch(e => console.log('Error al reanudar música:', e));
                console.log('🎵 Música reanudada - Video pausado');
                if (musicToggle) musicToggle.style.opacity = '1';
            }
        });
        
        const savedTime = localStorage.getItem('videoProgress');
        if (savedTime && !video.ended) {
            video.currentTime = parseFloat(savedTime);
        }
        
        video.addEventListener('timeupdate', () => {
            localStorage.setItem('videoProgress', video.currentTime);
        });
        
        video.addEventListener('ended', () => {
            localStorage.removeItem('videoProgress');
        });
    }

    mostrarMensajeVideo(msg) {
        let toast = document.querySelector('.video-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'video-toast';
            toast.style.cssText = `
                position: fixed;
                bottom: 100px;
                left: 50%;
                transform: translateX(-50%);
                background: #5a6e46;
                color: white;
                padding: 10px 20px;
                border-radius: 50px;
                z-index: 9999;
                font-size: 14px;
                opacity: 0;
                transition: opacity 0.3s;
                pointer-events: none;
                white-space: nowrap;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            `;
            document.body.appendChild(toast);
        }
        toast.textContent = msg;
        toast.style.opacity = '1';
        setTimeout(() => toast.style.opacity = '0', 3000);
    }

// ----- PARALLAX LIGERO (solo para móviles/desktop) -----
setupParallax() {
    // Ahora apuntamos a .cover-image en lugar de .cover-section
    const sections = document.querySelectorAll('.cover-image, .itinerary-section, .countdown-section, .gift-section, .video-section');
    
    let ticking = false;
    
    const updateParallax = () => {
        const scrollY = window.scrollY;
        const speed = 0.4;
        
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const sectionTop = rect.top + scrollY;
            const sectionHeight = rect.height;
            const windowHeight = window.innerHeight;
            
            const scrollPassed = scrollY - sectionTop;
            const totalScrollable = sectionHeight + windowHeight;
            
            let progress = scrollPassed / totalScrollable;
            progress = Math.min(Math.max(progress, 0), 1);
            
            let translateY = - (progress * 12);
            
            // Para la portada, un poco más de efecto
            if (section.classList.contains('cover-image')) {
                translateY = - (progress * 20);
            }
            
            section.style.transform = `translateY(${translateY}%)`;
        });
        
        ticking = false;
    };
    
    const onScroll = () => {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    };
    
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => requestAnimationFrame(updateParallax));
    updateParallax();
}
}   