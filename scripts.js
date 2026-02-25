// ==========================================
// FUNZIONI PRINCIPALI DEL SITO
// ==========================================

// 1. Ricerca nell'Header (Sidebar con dissolvenza + Pagina Corrente + Auto-Scroll)
function initHeader() {
    const searchInput = document.getElementById('searchInput');
    const contentArea = document.querySelector('.content');

    if (!searchInput || !contentArea) return;

    const originalContentHTML = contentArea.innerHTML;

    searchInput.addEventListener('input', function() {
        const query = this.value.trim().toLowerCase();
        
        // --- PARTE A: Filtra la Sidebar (Effetto Sbiadito) ---
        // Selezioniamo direttamente i link e i bottoni, non le righe (li) intere
        const elements = document.querySelectorAll('.sidebar a, .sidebar .menu-toggle');
        
        if (query === "") {
            // Se la ricerca è vuota, ripristina la visibilità di tutto
            elements.forEach(el => {
                el.style.opacity = '1';
                el.style.filter = 'none';
            });
        } else {
            // 1. Prima sbiadisce tutti gli elementi (opacità 35% e scala di grigi)
            elements.forEach(el => {
                el.style.opacity = '0.35';
                el.style.filter = 'grayscale(100%)';
                // Mantiene i vecchi display a blocchi per evitare che la sidebar si "chiuda"
                el.parentElement.style.display = ''; 
            });

            // 2. Poi "illumina" solo quelli che corrispondono e i loro genitori
            elements.forEach(el => {
                const text = el.textContent.trim().toLowerCase();
                
                if (text.includes(query)) {
                    // Accende l'elemento trovato
                    el.style.opacity = '1';
                    el.style.filter = 'none';

                    // Risale l'albero per assicurarsi che tutti i sottomenu siano aperti
                    // e che i "titoli" dei menu (es. "NPC") siano illuminati
                    let currentSubmenu = el.closest('.submenu');
                    while (currentSubmenu) {
                        currentSubmenu.style.display = 'block'; // Apre la tendina
                        
                        let parentToggle = currentSubmenu.previousElementSibling;
                        if (parentToggle && parentToggle.classList.contains('menu-toggle')) {
                            // Illumina il genitore di questo sottomenu
                            parentToggle.style.opacity = '1';
                            parentToggle.style.filter = 'none';
                            parentToggle.classList.add('aperto'); // Ruota la stellina
                        }
                        // Passa al sottomenu superiore (se esiste)
                        currentSubmenu = currentSubmenu.parentElement.closest('.submenu');
                    }
                }
            });
        }

        // --- PARTE B: Evidenzia nella Pagina Corrente ---
        contentArea.innerHTML = originalContentHTML;
        
        if (query === "") {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            // Riattiva gli script
            if (typeof initLightbox === "function") initLightbox();
            if (typeof initCalendar === "function") initCalendar();
            return;
        }

        const walker = document.createTreeWalker(contentArea, NodeFilter.SHOW_TEXT, null, false);
        const textNodes = [];
        let node;
        while (node = walker.nextNode()) {
            textNodes.push(node);
        }

        const escapeRegExp = string => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp("(" + escapeRegExp(query) + ")", "gi");

        textNodes.forEach(textNode => {
            const match = textNode.nodeValue.match(regex);
            if (match) {
                const span = document.createElement('span');
                span.innerHTML = textNode.nodeValue.replace(
                    regex, 
                    '<mark class="search-highlight" style="background-color: rgba(255, 179, 0, 0.4); color: var(--primary); border-radius: 3px; padding: 0 2px;">$1</mark>'
                );
                textNode.parentNode.replaceChild(span, textNode);
            }
        });

        // --- PARTE C: SCROLL AUTOMATICO ALLA PRIMA PAROLA ---
        const firstHighlight = contentArea.querySelector('.search-highlight');
        if (firstHighlight) {
            firstHighlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        // --- PARTE D: Riattiva script spezzati dal reset testuale ---
        if (typeof initLightbox === "function") initLightbox();
        if (typeof initCalendar === "function") initCalendar();
    });
}
/*function initHeader() {
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
}*/

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

// 4. Calendario Interattivo (Local Storage + Custom Modal)
function initCalendar() {
    const cells = document.querySelectorAll(".calendar-table td");
    
    // Se non c'è nessun calendario sulla pagina, interrompi lo script
    if (cells.length === 0) return; 

    // Crea l'HTML della nostra finestra personalizzata (se non esiste già)
    if (!document.querySelector('.custom-modal-overlay')) {
        const modalHTML = `
            <div class="custom-modal-overlay" id="calendar-modal">
                <div class="custom-modal-box">
                    <h3>Appunti del Giorno</h3>
                    <p style="font-size: 0.9rem; color: var(--text-muted); margin: 0;">Trascrivi o modifica le memorie per questa data.</p>
                    
                    <input type="text" id="calendar-input" class="modal-input" placeholder="Scrivi qui l'evento..." autocomplete="off">
                    
                    <div class="modal-buttons">
                        <button id="calendar-cancel" class="btn-secondary" style="margin-top: 0;">Annulla</button>
                        <button id="calendar-save" class="btn-primary" style="padding: 8px 20px;">Salva Ricordo</button>
                    </div>
                    
                    <button id="calendar-delete" class="btn-delete-event">Cancella Ricodo</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    const modal = document.getElementById('calendar-modal');
    const input = document.getElementById('calendar-input');
    const btnSave = document.getElementById('calendar-save');
    const btnCancel = document.getElementById('calendar-cancel');
    const btnDelete = document.getElementById('calendar-delete');

    let currentCell = null;
    let currentCellId = null;

    // Funzione per chiudere la finestra
    function closeModal() {
        modal.style.display = 'none';
        input.value = '';
        currentCell = null;
        currentCellId = null;
    }

    // Eventi dei pulsanti della finestra
    btnCancel.addEventListener('click', closeModal);

    btnSave.addEventListener('click', function() {
        const nota = input.value.trim();
        const existingUserEvent = currentCell.querySelector('.user-event');

        if (nota === "") {
            // Se si salva vuoto, equivale a eliminare
            if (existingUserEvent) existingUserEvent.remove();
            localStorage.removeItem(currentCellId); 
            if (!currentCell.querySelector('.event')) {
                currentCell.classList.remove('has-event');
            }
        } else {
            // Salva la nuova nota
            if (existingUserEvent) {
                existingUserEvent.innerText = nota;
            } else {
                let newEvent = document.createElement('span');
                newEvent.className = 'event user-event';
                newEvent.innerText = nota;
                currentCell.classList.add('has-event');
                currentCell.appendChild(newEvent);
            }
            localStorage.setItem(currentCellId, nota);
        }
        closeModal();
    });

    btnDelete.addEventListener('click', function() {
        const existingUserEvent = currentCell.querySelector('.user-event');
        if (existingUserEvent) existingUserEvent.remove();
        localStorage.removeItem(currentCellId); 
        if (!currentCell.querySelector('.event')) {
            currentCell.classList.remove('has-event');
        }
        closeModal();
    });

    // Permette di salvare premendo Invio sulla tastiera
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') btnSave.click();
    });

    // Inizializza le celle al caricamento
    cells.forEach((cell, index) => {
        const cellId = "calendario-giorno-" + index;
        const savedEvent = localStorage.getItem(cellId);
        
        // Ripristina note salvate
        if (savedEvent) {
            let eventSpan = document.createElement('span');
            eventSpan.className = 'event user-event';
            eventSpan.innerText = savedEvent;
            cell.classList.add('has-event');
            cell.appendChild(eventSpan);
        }

        // Click sulla cella del calendario
        cell.addEventListener("click", function() {
            currentCell = this;
            currentCellId = cellId;

            const existingUserEvent = this.querySelector('.user-event');
            
            // Popola il campo con l'evento esistente (se c'è)
            input.value = existingUserEvent ? existingUserEvent.innerText : "";
            
            // Mostra la finestra a tema
            modal.style.display = 'flex';
            input.focus(); // Seleziona subito la casella di testo
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