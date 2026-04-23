/**
 * upload.js - Subida de fotos a ImgBB + Firebase
 */

class PhotoUpload {

    // Verificar si la fecha/hora está permitida para subir fotos
    isUploadAllowed() {
        // Fecha y hora de la boda: 7 de Noviembre 2026, 1:00 PM
         const allowedDate = new Date('2026-04-21T00:00:00');
        const now = new Date();
        
        // Permitir subir fotos desde el 7 de Noviembre 1:00 PM hasta el 8 de Noviembre 11:59 PM
        const endDate = new Date('2026-11-08T23:59:59');
        
        if (now >= allowedDate && now <= endDate) {
            return { allowed: true, message: '' };
        } else if (now < allowedDate) {
            const days = Math.ceil((allowedDate - now) / (1000 * 60 * 60 * 24));
            return { 
                allowed: false, 
                message: `📸 Esta sección se habilitará el día (7 de Noviembre a la 1:00 PM). ¡Te esperamos para compartir tus fotos! Faltan ${days} días.`
            };
        } else {
            return { 
                allowed: false, 
                message: '📸 El tiempo para subir fotos de la boda ha terminado. ¡Gracias por compartir tus recuerdos!'
            };
        }
    }

    // Bloquear visualmente la zona de subida si no es la fecha
    checkUploadBlock() {
        const uploadCheck = this.isUploadAllowed();
        
        if (!uploadCheck.allowed) {
            // Deshabilitar dropzone visualmente
            if (this.dropzone) {
                this.dropzone.style.opacity = '0.6';
                this.dropzone.style.cursor = 'not-allowed';
                this.dropzone.style.pointerEvents = 'none';
                
                // Mostrar mensaje en el dropzone
                const dropzoneContent = this.dropzone.querySelector('.dropzone-content');
                if (dropzoneContent) {
                    dropzoneContent.innerHTML = `
                        <i class="fas fa-calendar-alt" style="font-size: 2rem; color: #d4af37;"></i>
                        <p style="margin-top: 0.5rem;">${uploadCheck.message}</p>
                        <small>Podrás subir tus fotos durante la boda</small>
                    `;
                }
            }
            
            // Deshabilitar botón de subida
            if (this.submitBtn) {
                this.submitBtn.disabled = true;
                this.submitBtn.style.opacity = '0.6';
                this.submitBtn.style.cursor = 'not-allowed';
            }
            
            // Deshabilitar botón de agregar más fotos
            if (this.addMoreBtn) {
                this.addMoreBtn.style.opacity = '0.6';
                this.addMoreBtn.style.cursor = 'not-allowed';
                this.addMoreBtn.style.pointerEvents = 'none';
            }
        }
    }

    constructor() {
        this.IMGBB_API_KEY = "a96612a0536b4af45245782b47a2a0ea";
        
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
        this.selectedFiles = [];
        this.maxFiles = 10;
        this.maxSizeMB = 10;
        
        this.dropzone = document.getElementById('dropzone');
        this.fileInput = document.getElementById('fileInput');
        this.previewGrid = document.getElementById('previewGrid');
        this.guestNameInput = document.getElementById('guestName');
        this.submitBtn = document.getElementById('submitUpload');
        this.addMoreBtn = document.getElementById('addMoreBtn');
        
        if (!this.dropzone) return;
        
        this.init();
    }

    async init() {
        await this.initFirebase();
        this.setupEventListeners();
        this.loadGuestPhotosDeck();
        this.checkUploadBlock(); // ← IMPORTANTE: bloquea si no es la fecha
    }
    
    async initFirebase() {
        if (typeof firebase === 'undefined') {
            await this.loadFirebaseScripts();
        }
        
        if (!firebase.apps.length) {
            firebase.initializeApp(this.firebaseConfig);
        }
        
        this.db = firebase.database();
        console.log('✅ Firebase lista');
    }
    
    loadFirebaseScripts() {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js';
            script.onload = () => {
                const scriptDB = document.createElement('script');
                scriptDB.src = 'https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js';
                scriptDB.onload = resolve;
                document.head.appendChild(scriptDB);
            };
            document.head.appendChild(script);
        });
    }
    
    setupEventListeners() {
        if (!this.dropzone) {
            console.error('❌ dropzone no encontrado');
            return;
        }
        if (!this.fileInput) {
            console.error('❌ fileInput no encontrado');
            return;
        }
        if (!this.submitBtn) {
            console.error('❌ submitBtn no encontrado');
            return;
        }

        // Clonar dropzone
        if (this.dropzone.parentNode) {
            const newDropzone = this.dropzone.cloneNode(true);
            this.dropzone.parentNode.replaceChild(newDropzone, this.dropzone);
            this.dropzone = newDropzone;
        }

        // Clonar fileInput
        if (this.fileInput.parentNode) {
            const newFileInput = this.fileInput.cloneNode(true);
            this.fileInput.parentNode.replaceChild(newFileInput, this.fileInput);
            this.fileInput = newFileInput;
        }

        // Reasignar referencias
        this.dropzone = document.getElementById('dropzone');
        this.fileInput = document.getElementById('fileInput');
        
        if (!this.dropzone || !this.fileInput) {
            console.error('❌ No se pudieron encontrar los elementos después de clonar');
            return;
        }

        // Evento click en dropzone
        this.dropzone.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (this.fileInput) {
                this.fileInput.click();
            }
        };
        
        // Evento change del fileInput
        if (this.fileInput) {
            this.fileInput.onclick = (e) => {
                e.stopPropagation();
            };
            
            this.fileInput.onchange = (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (e.target.files && e.target.files.length > 0) {
                    this.handleFiles(e.target.files);
                }
                this.fileInput.value = '';
            };
        }
        
        // Evento submit
        if (this.submitBtn) {
            this.submitBtn.onclick = (e) => {
                e.preventDefault();
                this.uploadPhotos();
            };
        }
        
        // Evento del botón "Agregar más fotos"
        if (this.addMoreBtn) {
            this.addMoreBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (this.fileInput) {
                    this.fileInput.click();
                }
            };
        }
        
        // Drag & drop
        if (this.dropzone) {
            this.dropzone.ondragover = (e) => {
                e.preventDefault();
                this.dropzone.style.borderColor = '#d4af37';
                this.dropzone.style.background = '#f5efe8';
            };
            
            this.dropzone.ondragleave = () => {
                if (this.dropzone) {
                    this.dropzone.style.borderColor = '#d4af37';
                    this.dropzone.style.background = '#fefaf5';
                }
            };
            
            this.dropzone.ondrop = (e) => {
                e.preventDefault();
                if (this.dropzone) {
                    this.dropzone.style.background = '#fefaf5';
                }
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    this.handleFiles(e.dataTransfer.files);
                }
            };
        }
    }
    
    handleFiles(files) {
        const filesArray = Array.from(files);
        
        if (this.selectedFiles.length + filesArray.length > this.maxFiles) {
            this.showToast(`Máximo ${this.maxFiles} fotos por vez`, 'error');
            return;
        }
        
        filesArray.forEach(file => {
            if (!file.type.startsWith('image/')) {
                this.showToast(`${file.name} no es una imagen`, 'error');
                return;
            }
            
            if (file.size > this.maxSizeMB * 1024 * 1024) {
                this.showToast(`${file.name} excede ${this.maxSizeMB}MB`, 'error');
                return;
            }
            
            this.selectedFiles.push(file);
        });
        
        this.updatePreview();
    }
    
    updatePreview() {
        this.previewGrid.innerHTML = '';
        
        if (this.selectedFiles.length === 0) {
            this.dropzone.style.display = 'flex';
            this.previewGrid.style.display = 'none';
            if (this.addMoreBtn) this.addMoreBtn.style.display = 'flex';
            return;
        }
        
        this.dropzone.style.display = 'none';
        this.previewGrid.style.display = 'grid';
        
        if (this.addMoreBtn) this.addMoreBtn.style.display = 'flex';
        
        const clearAllBtn = document.createElement('div');
        clearAllBtn.className = 'preview-clear-all';
        clearAllBtn.innerHTML = '<i class="fas fa-trash-alt"></i> Vaciar todo';
        clearAllBtn.style.cssText = `
            grid-column: 1 / -1;
            background: rgba(207, 140, 52, 0.9);
            color: white;
            padding: 8px 12px;
            border-radius: 30px;
            text-align: center;
            cursor: pointer;
            font-size: 0.8rem;
            font-family: 'Cormorant Garamond', serif;
            transition: all 0.2s ease;
            margin-top: 5px;
        `;
        clearAllBtn.onclick = (e) => {
            e.stopPropagation();
            this.selectedFiles = [];
            this.updatePreview();
            this.showToast('Selección vaciada', 'info');
        };
        this.previewGrid.appendChild(clearAllBtn);
        
        this.selectedFiles.forEach((file, index) => {
            const previewItem = document.createElement('div');
            previewItem.className = 'preview-item';
            
            const img = document.createElement('img');
            const reader = new FileReader();
            reader.onload = (e) => { img.src = e.target.result; };
            reader.readAsDataURL(file);
            
            const removeBtn = document.createElement('div');
            removeBtn.className = 'preview-remove';
            removeBtn.innerHTML = '<i class="fas fa-times"></i>';
            removeBtn.onclick = (e) => {
                e.stopPropagation();
                this.selectedFiles.splice(index, 1);
                this.updatePreview();
            };
            
            previewItem.appendChild(img);
            previewItem.appendChild(removeBtn);
            this.previewGrid.appendChild(previewItem);
        });
    }
    
    async uploadPhotos() {
        // ✅ VERIFICAR SI ESTÁ PERMITIDO SUBIR FOTOS
        const uploadCheck = this.isUploadAllowed();
        
        if (!uploadCheck.allowed) {
            this.showToast(uploadCheck.message, 'warning');
            return;
        }
        
        const guestName = this.guestNameInput.value.trim();
        
        if (!guestName) {
            this.showToast('Ingresa tu nombre', 'error');
            return;
        }
        
        if (this.selectedFiles.length === 0) {
            this.showToast('Selecciona al menos una foto', 'error');
            return;
        }
        
        this.submitBtn.disabled = true;
        this.submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subiendo...';
        
        let uploaded = 0;
        let errors = 0;
        
        for (const file of this.selectedFiles) {
            try {
                const formData = new FormData();
                formData.append('image', file);
                formData.append('key', this.IMGBB_API_KEY);
                
                const response = await fetch('https://api.imgbb.com/1/upload', {
                    method: 'POST',
                    body: formData
                });
                
                const data = await response.json();
                
                if (!data.success) throw new Error('Error en ImgBB');
                
                await this.db.ref('fotos').push({
                    nombre: guestName,
                    url: data.data.url,
                    thumbnail: data.data.thumb?.url || data.data.url,
                    fecha: new Date().toISOString(),
                    timestamp: Date.now()
                });
                
                uploaded++;
            } catch (error) {
                console.error(error);
                errors++;
            }
        }
        
        this.showToast(`✅ ${uploaded} fotos subidas`, 'success');
        
        this.selectedFiles = [];
        this.updatePreview();
        this.guestNameInput.value = '';
        this.submitBtn.disabled = false;
        this.submitBtn.innerHTML = '<i class="fas fa-upload"></i> Subir Fotos al Collage';
        await this.loadGuestPhotosDeck();
    }
    
    showFullImage(url, nombre) {
        let modal = document.querySelector('.foto-modal');
        
        if (modal) {
            const modalImg = modal.querySelector('img');
            if (modalImg) {
                modalImg.src = url;
                modalImg.alt = `Foto de ${nombre}`;
                modalImg.style.width = '90%';
                modalImg.style.height = '90%';
            }
            modal.style.display = 'flex';
            return;
        }
        
        modal = document.createElement('div');
        modal.className = 'foto-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            cursor: pointer;
        `;
        
        const closeBtn = document.createElement('span');
        closeBtn.className = 'close-modal';
        closeBtn.innerHTML = '×';
        closeBtn.style.cssText = `
            position: absolute;
            top: 20px;
            right: 30px;
            font-size: 40px;
            color: white;
            cursor: pointer;
            font-weight: bold;
            z-index: 10001;
        `;
        
        const modalImg = document.createElement('img');
        modalImg.src = url;
        modalImg.alt = `Foto de ${nombre}`;
        modalImg.style.cssText = `
            width: 90%;
            height: 90%;
            object-fit: contain;
            border-radius: 8px;
            cursor: zoom-in;
            transition: transform 0.3s ease;
        `;
        
        modal.appendChild(closeBtn);
        modal.appendChild(modalImg);
        document.body.appendChild(modal);
        
        modal.onclick = (e) => {
            if (e.target === modal || e.target === closeBtn) {
                modal.style.display = 'none';
            }
        };
        
        let scale = 1;
        modalImg.ondblclick = (e) => {
            e.stopPropagation();
            scale = scale === 1 ? 2 : 1;
            modalImg.style.transform = `scale(${scale})`;
            modalImg.style.cursor = scale === 2 ? 'zoom-out' : 'zoom-in';
        };
    }
    
    showToast(message, type) {
        let toast = document.querySelector('.toast-notification');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'toast-notification';
            toast.style.cssText = `
                position: fixed; bottom:100px; left:50%; transform:translateX(-50%);
                padding:12px 24px; border-radius:50px; z-index:9999; opacity:0;
                transition:opacity 0.3s; font-size:14px; white-space:nowrap;
                box-shadow:0 4px 12px rgba(0,0,0,0.15); pointer-events:none;
                font-family:'Cormorant Garamond', serif;
            `;
            document.body.appendChild(toast);
        }
        toast.style.background = type === 'error' ? '#e74c3c' : (type === 'info' ? '#f39c12' : '#5a6e46');
        toast.style.color = 'white';
        toast.textContent = message;
        toast.style.opacity = '1';
        setTimeout(() => toast.style.opacity = '0', 3000);
    }
    
    // ==================== DECK DE CARTAS ====================
    
    async loadGuestPhotosDeck() {
        const deckContainer = document.getElementById('guestPhotosDeck');
        if (!deckContainer) return;
        
        deckContainer.innerHTML = '<div class="loading-deck">📸 Cargando fotos de invitados...</div>';
        
        try {
            const snapshot = await this.db.ref('fotos').orderByChild('timestamp').once('value');
            let fotos = [];
            snapshot.forEach(child => { fotos.push({ id: child.key, ...child.val() }); });
            fotos.reverse();
            
            if (fotos.length === 0) {
                deckContainer.innerHTML = '<div class="loading-deck">🌟 Aún no hay fotos. ¡Sé el primero en subir una!</div>';
                return;
            }
            
            this.deckFotos = fotos;
            deckContainer.innerHTML = '';
            
            fotos.forEach((foto, index) => {
                const fecha = new Date(foto.fecha).toLocaleDateString('es-MX');
                const card = document.createElement('div');
                card.className = 'guest-photo-card';
                card.setAttribute('data-id', foto.id);
                
                card.style.position = 'absolute';
                card.style.top = '50%';
                card.style.left = '50%';
                
                card.innerHTML = `
                    <img src="${foto.thumbnail || foto.url}" alt="Foto de ${foto.nombre}" 
                         loading="lazy" draggable="false" 
                         style="width:100%; height:280px; object-fit:cover; pointer-events:none; user-select:none;">
                    <div class="guest-photo-info" style="padding:1rem; text-align:center; background:linear-gradient(135deg, #fff, #f9f5f0); pointer-events:none;">
                        <div class="guest-name" style="font-family:'Playfair Display', serif; font-size:0.9rem; color:#5a6e46; font-weight:600;">📸 ${foto.nombre}</div>
                        <div class="photo-date" style="font-size:0.7rem; color:#8b7355; margin-top:0.25rem;">${fecha}</div>
                    </div>
                `;
                
                let startX = 0;
                let hasMoved = false;
                
                card.addEventListener('pointerdown', (e) => {
                    startX = e.clientX;
                    hasMoved = false;
                });
                
                card.addEventListener('pointermove', (e) => {
                    if (Math.abs(e.clientX - startX) > 10) {
                        hasMoved = true;
                    }
                });
                
                card.addEventListener('pointerup', (e) => {
                    if (!hasMoved && Math.abs(e.clientX - startX) < 10) {
                        setTimeout(() => {
                            this.showFullImage(foto.url, foto.nombre);
                        }, 10);
                    }
                });
                
                deckContainer.appendChild(card);
            });
            
            this.initDeckSwipe();
            
        } catch (error) {
            console.error(error);
            deckContainer.innerHTML = '<div class="loading-deck">Error al cargar fotos</div>';
        }
    }
    
    initDeckSwipe() {
        const container = document.getElementById('guestPhotosDeck');
        if (!container) return;
        
        let startX = 0;
        
        const updateStackPositions = () => {
            const allCards = Array.from(container.querySelectorAll('.guest-photo-card'));
            const total = allCards.length;
            
            allCards.forEach((card, idx) => {
                const offsetY = idx * 5;
                const rotation = (idx % 2 === 0 ? 1 : -1) * Math.min(idx * 1, 8);
                const scale = Math.max(1 - idx * 0.015, 0.88);
                const transform = `translateY(${offsetY}px) rotate(${rotation}deg) scale(${scale})`;
                
                card.style.position = 'absolute';
                card.style.top = '50%';
                card.style.left = '50%';
                card.style.zIndex = total - idx;
                card.style.transform = transform;
                card.style.opacity = idx < 6 ? '1' : '0';
                card.style.transition = 'transform 0.25s ease';
                
                card.dataset.baseTransform = transform;
            });
        };
        
        const sendToBottom = (card) => {
            if (!card || !container) return;
            card.style.opacity = '0';
            setTimeout(() => {
                container.appendChild(card);
                updateStackPositions();
            }, 200);
        };
        
        const getTopCard = () => {
            const cards = Array.from(container.querySelectorAll('.guest-photo-card'));
            if (cards.length === 0) return null;
            return cards.reduce((top, card) => {
                const zTop = parseInt(top?.style.zIndex || 0);
                const zCard = parseInt(card.style.zIndex || 0);
                return zCard > zTop ? card : top;
            }, cards[0]);
        };
        
        const allCards = container.querySelectorAll('.guest-photo-card');
        allCards.forEach(card => {
            const img = card.querySelector('img');
            const nameDiv = card.querySelector('.guest-name');
            const fotoUrl = img ? img.src : '';
            const fotoNombre = nameDiv ? nameDiv.textContent.replace('📸 ', '') : '';
            
            const newCard = card.cloneNode(true);
            card.parentNode.replaceChild(newCard, card);
            
            newCard.style.cursor = 'grab';
            newCard.style.touchAction = 'none';
            
            let touchStartX = 0;
            let hasMoved = false;
            
            newCard.addEventListener('pointerdown', (e) => {
                if (newCard !== getTopCard()) return;
                touchStartX = e.clientX;
                hasMoved = false;
                newCard.style.cursor = 'grabbing';
            });
            
            newCard.addEventListener('pointermove', (e) => {
                if (!touchStartX) return;
                const deltaX = e.clientX - touchStartX;
                if (Math.abs(deltaX) > 10) {
                    hasMoved = true;
                    e.preventDefault();
                    const rotation = deltaX / 15;
                    newCard.style.transform = `${newCard.dataset.baseTransform} translateX(${deltaX}px) rotate(${rotation}deg)`;
                    newCard.style.transition = 'none';
                }
            });
            
            newCard.addEventListener('pointerup', (e) => {
                if (!touchStartX) return;
                
                const deltaX = e.clientX - touchStartX;
                
                if (hasMoved && Math.abs(deltaX) > 50) {
                    sendToBottom(newCard);
                } else if (!hasMoved || Math.abs(deltaX) <= 50) {
                    this.showFullImage(fotoUrl, fotoNombre);
                    newCard.style.transform = newCard.dataset.baseTransform;
                    newCard.style.transition = 'transform 0.2s ease';
                    setTimeout(() => {
                        newCard.style.cursor = 'grab';
                    }, 200);
                }
                
                touchStartX = 0;
                hasMoved = false;
            });
        });
        
        updateStackPositions();
    }
}

// Inicializar SOLO UNA VEZ
if (!window.photoUploadInstance) {
    window.photoUploadInstance = new PhotoUpload();
}
