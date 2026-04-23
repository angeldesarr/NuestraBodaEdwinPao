/**
 * app.js
 * Única responsabilidad: Inicializar todos los módulos
 */

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar cortina
    if (typeof CurtainScroll !== 'undefined') new CurtainScroll();
    
    // Inicializar UI
    if (typeof WeddingUI !== 'undefined') new WeddingUI();
    
    // Inicializar galería principal (si existe)
    if (typeof GalleryDeck !== 'undefined' && document.getElementById('deckContainer')) {
        new GalleryDeck();
    }
    
    // Inicializar galería de la iglesia
    if (typeof MultipleGalleryDeck !== 'undefined') {
        const churchImages = [
            'img/iglesia.jpg',
        ];
        new MultipleGalleryDeck('churchDeckContainer', churchImages);
        
        // Inicializar galería del salón
        const venueImages = [
            'img/salon.jpeg',
            'img/ceremonia2.png',

        ];
        new MultipleGalleryDeck('venueDeckContainer', venueImages);
    }
    
    // Inicializar upload de fotos
    if (typeof PhotoUpload !== 'undefined') new PhotoUpload();
    
    console.log('✅ App inicializada correctamente');
});