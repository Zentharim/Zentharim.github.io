// Lightbox globale per immagini
let lightbox;
let currentImageIndex = 0;
let images = [];
let currentImageSrc = '';

function setupLightbox() {
    // Crea il lightbox
    lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
        <div class="lightbox-content">
            <button class="lightbox-close">&times;</button>
            <button class="lightbox-prev">&#10094;</button>
            <img id="lightbox-img" src="" alt="">
            <button class="lightbox-next">&#10095;</button>
        </div>
    `;
    document.body.appendChild(lightbox);

    // Event listeners per i pulsanti del lightbox
    document.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    document.querySelector('.lightbox-prev').addEventListener('click', prevImage);
    document.querySelector('.lightbox-next').addEventListener('click', nextImage);

    // Chiudi cliccando sullo sfondo
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) closeLightbox();
    });

    // Chiudi con ESC e naviga con frecce
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') prevImage();
        if (e.key === 'ArrowRight') nextImage();
    });

    initLightbox();
}

function initLightbox() {
    // Seleziona tutte le immagini nella pagina (escludendo logo, etc)
    const pageImages = document.querySelectorAll('main img, article img');
    images = Array.from(pageImages);
    
    // Aggiungi event listener a ogni immagine
    images.forEach((img, index) => {
        if (!img.hasAttribute('data-lightbox-init')) {
            img.addEventListener('click', function() {
                currentImageIndex = images.indexOf(this);
                openLightbox(this.src);
            });
            img.style.cursor = 'pointer';
            img.setAttribute('data-lightbox-init', 'true');
        }
    });
}

function openLightbox(src) {
    currentImageSrc = src;
    document.getElementById('lightbox-img').src = src;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function nextImage() {
    if (images.length > 0) {
        currentImageIndex = (currentImageIndex + 1) % images.length;
        openLightbox(images[currentImageIndex].src);
    }
}

function prevImage() {
    if (images.length > 0) {
        currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
        openLightbox(images[currentImageIndex].src);
    }
}

// Inizializza quando la pagina è caricata
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupLightbox);
} else {
    setupLightbox();
}

// Se le immagini vengono caricate dinamicamente, reinizializza
if (document.querySelector('main')) {
    const observer = new MutationObserver(() => {
        initLightbox();
    });

    observer.observe(document.querySelector('main'), {
        childList: true,
        subtree: true
    });
}
