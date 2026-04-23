/**
 * multiple-gallery.js
 * Responsabilidad: Múltiples galerías tipo deck 3D
 */

class MultipleGalleryDeck {
    constructor(containerId, images) {
        this.deckContainer = document.getElementById(containerId);
        if (!this.deckContainer) return;

        this.cards = [];
        this.startX = 0;
        this.currentX = 0;
        this.isDragging = false;
        this.images = images;

        this.init();
    }

    init() {
        this.createCards();
        this.layout();
        this.bindEvents();
    }

    createCards() {
        this.deckContainer.innerHTML = '';
        this.cards = [];
        
        this.images.forEach((src, index) => {
            const card = document.createElement('div');
            card.className = 'deck-card';

            const img = document.createElement('img');
            img.src = src;
            img.alt = `Foto ${index + 1}`;
            img.draggable = false;

            card.appendChild(img);
            this.deckContainer.appendChild(card);
            this.cards.push(card);
        });
    }

    layout() {
        this.cards.forEach((card, index) => {
            card.style.zIndex = this.cards.length - index;

            card.style.transform = `
                translate(-50%, -50%)
                translateY(${index * 6}px)
                rotate(${(index % 2 ? 1 : -1) * index * 1.5}deg)
                scale(${1 - index * 0.03})
            `;

            card.style.opacity = index < 4 ? 1 : 0;
            card.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
        });
    }

    bindEvents() {
        if (!this.cards[0]) return;

        const topCard = this.cards[0];

        topCard.addEventListener('pointerdown', this.onPointerDown.bind(this));
        topCard.addEventListener('pointermove', this.onPointerMove.bind(this));
        topCard.addEventListener('pointerup', this.onPointerUp.bind(this));
        topCard.addEventListener('pointercancel', this.onPointerUp.bind(this));
    }

    onPointerDown(e) {
        const card = this.cards[0];
        if (!card) return;

        this.startX = e.clientX;
        this.isDragging = true;
        card.setPointerCapture(e.pointerId);
        card.style.transition = 'none';
    }

    onPointerMove(e) {
        if (!this.isDragging) return;
        
        const card = this.cards[0];
        if (!card) return;

        this.currentX = e.clientX - this.startX;

        card.style.transform = `
            translate(-50%, -50%)
            translateX(${this.currentX}px)
            rotate(${this.currentX / 10}deg)
        `;
    }

    onPointerUp(e) {
        if (!this.isDragging) return;
        
        const card = this.cards[0];
        if (!card) return;

        this.isDragging = false;

        if (Math.abs(this.currentX) > 80) {
            this.sendCardBack(this.currentX > 0 ? 1 : -1);
        } else {
            this.layout();
        }

        this.startX = 0;
        this.currentX = 0;
        card.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
    }

    sendCardBack(direction) {
        const card = this.cards[0];
        if (!card) return;

        card.style.transition = 'transform 0.3s ease, opacity 0.3s ease';

        card.style.transform = `
            translate(-50%, -50%)
            translateX(${direction * 400}px)
            rotate(${direction * 25}deg)
        `;

        card.style.opacity = 0;

        setTimeout(() => {
            this.cards.push(this.cards.shift());
            card.style.opacity = 1;
            this.layout();
            this.bindEvents();
        }, 300);
    }
}