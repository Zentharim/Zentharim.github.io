// ==========================================
// FUNZIONI PRINCIPALI DEL SITO
// ==========================================

// 1. Ricerca nell'Header
function initHeader() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase();
            const items = document.querySelectorAll('.sidebar li');
            items.forEach(li => {
                const text = li.textContent.trim().toLowerCase();
                if (text.includes(query)) {
                    li.style.display = '';
                    let parent = li.parentElement;
                    while (parent && parent.classList.contains('submenu')) {
                        parent.style.display = 'block';
                        parent = parent.parentElement.closest('li');
                    }
                } else {
                    li.style.display = 'none';
                }
            });
        });
    }
}

// 2. Menu a tendina della Sidebar
function initSidebar() {
    const toggles = document.querySelectorAll('.menu-toggle');
    toggles.forEach(toggle => {
        // Pulisce eventuali vecchie frecce testuali
        toggle.innerHTML = toggle.innerHTML.replace('▼', '').replace('▲', '').trim();
        
        toggle.addEventListener('click', function() {
            const sottomenu = this.nextElementSibling;
            if (sottomenu) sottomenu.classList.toggle('aperto');
            this.classList.toggle('aperto'); 
        });
    });
}

// 3. Immagini a Schermo Intero (Lightbox)
function initLightbox() {
    const images = document.querySelectorAll('.content img');
    
    // Se non ci sono immagini nella pagina, interrompi lo script per risparmiare risorse
    if (images.length === 0) return;

    // Crea la struttura HTML se non esiste
    if (!document.querySelector('.lightbox')) {
        const lightboxHTML = `
            <div class="lightbox">
                <button class="lightbox-close">&times;</button>
                <div class="lightbox-content">
                    <img src="" alt="Immagine a schermo intero">
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', lightboxHTML);
    }

    const lightbox = document.querySelector('.lightbox');
    const lightboxImg = lightbox.querySelector('.lightbox-content img');
    const closeBtn = document.querySelector('.lightbox-close');

    // Rende cliccabili le immagini
    images.forEach(img => {
        img.style.cursor = 'pointer';
        img.addEventListener('click', function() {
            lightboxImg.src = this.src;
            lightbox.classList.add('active');
        });
    });

    // Chiusura
    closeBtn.addEventListener('click', () => lightbox.classList.remove('active'));
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target === lightbox.querySelector('.lightbox-content')) {
            lightbox.classList.remove('active');
        }
    });
}

// 4. Calendario Interattivo (Local Storage)
function initCalendar() {
    const cells = document.querySelectorAll(".calendar-table td");
    
    // Se non c'è nessun calendario sulla pagina, interrompi lo script
    if (cells.length === 0) return; 

    cells.forEach((cell, index) => {
        const cellId = "calendario-giorno-" + index;
        const savedEvent = localStorage.getItem(cellId);
        
        if (savedEvent) {
            let eventSpan = document.createElement('span');
            eventSpan.className = 'event user-event';
            eventSpan.innerText = savedEvent;
            cell.classList.add('has-event');
            cell.appendChild(eventSpan);
        }

        cell.addEventListener("click", function(e) {
            const existingUserEvent = this.querySelector('.user-event');
            const currentText = existingUserEvent ? existingUserEvent.innerText : "";
            
            const nota = prompt("Aggiungi o modifica un evento (lascia vuoto per eliminare):", currentText);
            
            if (nota !== null) { 
                if (nota.trim() === "") {
                    if (existingUserEvent) existingUserEvent.remove();
                    localStorage.removeItem(cellId); 
                    if (!this.querySelector('.event')) {
                        this.classList.remove('has-event');
                    }
                } else {
                    if (existingUserEvent) {
                        existingUserEvent.innerText = nota;
                    } else {
                        let newEvent = document.createElement('span');
                        newEvent.className = 'event user-event';
                        newEvent.innerText = nota;
                        this.classList.add('has-event');
                        this.appendChild(newEvent);
                    }
                    localStorage.setItem(cellId, nota);
                }
            }
        });
    });
}

// ==========================================
// AVVIO AUTOMATICO DEGLI SCRIPT
// ==========================================
document.addEventListener("DOMContentLoaded", function() {
    // Carica Header e Sidebar simultaneamente
    Promise.all([
        fetch('header.html').then(r => r.text()),
        fetch('sidebar.html').then(r => r.text())
    ]).then(([headerHTML, sidebarHTML]) => {
        const headerContainer = document.getElementById('header-container');
        const sidebarContainer = document.getElementById('sidebar-container');

        if (headerContainer) headerContainer.innerHTML = headerHTML;
        if (sidebarContainer) sidebarContainer.innerHTML = sidebarHTML;
        
        // Avvia tutte le funzioni necessarie!
        initHeader();
        initSidebar();
        initLightbox();
        initCalendar();
        
    }).catch(error => {
        console.error("Errore nel caricamento dell'interfaccia:", error);
    });
});