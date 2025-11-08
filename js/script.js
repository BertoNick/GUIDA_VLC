// Variabili Globali
        let currentLang = 'it';
        let map = null; 
        
        // ======================================================================
        // DATI DEI PUNTI DI INTERESSE (POI)
        // ======================================================================
        const valenciaPOI = [
            {
                nome: "Città delle Arti e delle Scienze",
                lat: 39.4627, 
                lon: -0.3546, 
                descrizione_IT: "Un complesso futuristico che ospita un oceanografico, un museo della scienza e un planetario. Un simbolo moderno di Valencia.",
                descrizione_ES: "Un complejo futurista que alberga un oceanográfico, un museo de las ciencias y un planetario. Un símbolo moderno de Valencia."
            },
            {
                nome: "Mercato Centrale",
                lat: 39.4727, 
                lon: -0.3780, 
                descrizione_IT: "Uno dei mercati più grandi d'Europa, noto per la sua architettura modernista e i prodotti freschi locali.",
                descrizione_ES: "Uno de los mercados más grandes de Europa, conocido por su arquitectura modernista y sus productos frescos locales."
            },
            {
                nome: "La Lonja de la Seda",
                lat: 39.4740, 
                lon: -0.3789, 
                descrizione_IT: "Antica Borsa della Seta, capolavoro del Gotico valenciano e Patrimonio Mondiale dell'UNESCO.",
                descrizione_ES: "Antigua Bolsa de la Seda, obra maestra del Gótico valenciano y Patrimonio Mundial de la UNESCO."
            }
        ];
        
        /**
         * Funzione che genera dinamicamente le card per la sezione Punti di Interesse.
         */
        function renderMonuments() {
            // ID AGGIORNATO
            const gridContainer = document.getElementById('punti-di-interesse-grid'); 
            if (!gridContainer) return; 
            
            // Pulisci il contenuto precedente prima di renderizzare
            gridContainer.innerHTML = ''; 

            // Determina la chiave della descrizione in base alla lingua attiva
            const descriptionKey = currentLang === 'it' ? 'descrizione_IT' : 'descrizione_ES';

            valenciaPOI.forEach(poi => {
                
                const description = poi[descriptionKey] || poi.descrizione_IT; // Fallback IT
                
                // Crea la struttura HTML della singola card
                const cardHTML = `
                    <div class="monument-card">
                        <img 
                            src="https://via.placeholder.com/600x400?text=${poi.nome.replace(/\s/g, '+')}" 
                            alt="${poi.nome}" 
                            class="card-image"
                        >
                        <div class="card-body">
                            <h3>${poi.nome}</h3>
                            <p>${description}</p>
                        </div>
                    </div>
                `;
                
                // Inserisce il codice HTML della card nel contenitore
                gridContainer.innerHTML += cardHTML;
            });
        }
        
        // ======================================================================
        // LOGICA DI BASE (Navigazione, Lingua)
        // ======================================================================

        /**
         * Funzione che gestisce la visualizzazione delle diverse sezioni.
         */
        function changeSection(targetSectionId) {
            // 1. Nascondi tutte le sezioni e mostra la target
            document.querySelectorAll('.section').forEach(section => {
                section.classList.remove('active');
            });
            const targetSection = document.getElementById(targetSectionId);
            if (targetSection) {
                targetSection.classList.add('active');
            }
            
            // 2. Chiudi il menu
            document.getElementById('menu-overlay').classList.remove('open');

            // 3. Gestione Rendering Sezioni Speciali
            if (targetSectionId === 'mappa') {
                if (map === null) {
                    initMap();
                }
                
                // FIX JS: Forza Leaflet a ricalcolare le dimensioni DOPO che il div è visibile
                if (map !== null) {
                    setTimeout(() => {
                        map.invalidateSize(); 
                        addMarkers(); 
                    }, 10); 
                }
            } else if (targetSectionId === 'punti-di-interesse') { // ID AGGIORNATO
                // Genera le card dei punti di interesse
                renderMonuments(); 
            }
        }

        /**
         * Funzione che imposta la lingua attiva e aggiorna i testi.
         */
        function setLanguage(lang) {
            currentLang = lang;
            
            // Aggiorna lo stato visivo delle bandiere
            document.querySelectorAll('.flag').forEach(flag => {
                flag.classList.remove('active');
            });
            document.querySelector(`.flag.${lang}`).classList.add('active');

            // Logica di Traduzione (usando data-attributes)
            document.querySelectorAll('[data-it]').forEach(element => {
                const textIT = element.getAttribute('data-it');
                const textES = element.getAttribute('data-es');
                
                // Aggiorna il testo dell'elemento in base alla lingua
                element.textContent = lang === 'it' ? textIT : textES;
            });
            
            // Aggiornamento del titolo in Header
            document.getElementById('title').textContent = lang === 'it' ? 'Guida Valencia' : 'Guía Valencia';
            
            // Aggiorna la griglia dei punti di interesse se la sezione è attiva 
            if (document.getElementById('punti-di-interesse').classList.contains('active')) { // ID AGGIORNATO
                renderMonuments(); 
            }
            
            // Ricarica i marker per aggiornare la lingua del popup (se la mappa è aperta)
            if (map !== null && document.getElementById('mappa').classList.contains('active')) {
                addMarkers(); 
            }
        }
        
        // Listener per i pulsanti del menu
        document.getElementById('menu-toggle').addEventListener('click', () => {
            document.getElementById('menu-overlay').classList.add('open');
        });

        document.getElementById('menu-close').addEventListener('click', () => {
            document.getElementById('menu-overlay').classList.remove('open');
        });

        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const sectionId = e.target.dataset.section;
                changeSection(sectionId);
            });
        });

        document.querySelectorAll('.flag').forEach(flag => {
            flag.addEventListener('click', (e) => {
                const lang = e.target.dataset.lang;
                setLanguage(lang);
            });
        });

        // ======================================================================
        // LOGICA LEAFLET (MAPPA E MARKER) - (Nessuna modifica qui)
        // ======================================================================
        function initMap() {
            if (map !== null) return;
            
            const VALENCIA_COORDS = [39.4699, -0.3763]; 
            map = L.map('map-container').setView(VALENCIA_COORDS, 13);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
        }

        /**
         * Funzione che itera sui dati e aggiunge/aggiorna i marker alla mappa.
         */
        function addMarkers() {
            if (map === null) return;

            // Rimuovi tutti i marker esistenti
            map.eachLayer(layer => {
                if (layer instanceof L.Marker) {
                    map.removeLayer(layer);
                }
            });

            // Iterazione sui POI e creazione dei Marker
            valenciaPOI.forEach(poi => {
                
                // Determina quale descrizione usare in base alla lingua attiva
                const descriptionKey = currentLang === 'it' ? 'descrizione_IT' : 'descrizione_ES';
                const description = poi[descriptionKey] || poi.descrizione_IT; // Fallback IT
                
                // Contenuto HTML del popup
                const popupContent = `
                    <div style="font-family: 'Montserrat', sans-serif;">
                        <strong>${poi.nome}</strong>
                        <hr style="margin: 5px 0;">
                        <p>${description}</p>
                    </div>
                `;

                // Creazione del Marker e aggiunta del Popup
                L.marker([poi.lat, poi.lon])
                    .addTo(map)
                    .bindPopup(popupContent);
            });
        }
        // ======================================================================
// LOGICA TOC INTERNO (MICRO-NAVIGAZIONE)
// ======================================================================

/**
 * Gestisce lo scorrimento fluido alla sottosezione quando si clicca un elemento TOC.
 */
function setupTocScrolling() {
    // Seleziona tutti i link del TOC nelle sezioni lunghe
    document.querySelectorAll('.section-toc .toc-item a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault(); // Impedisce il salto istantaneo del browser
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                // Scorrimento fluido all'elemento target, all'interno del contenitore scorrevole
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start' // Allinea in cima
                });
            }
        });
    });
}


/**
 * Crea e gestisce l'Intersection Observer per evidenziare la sezione attiva nel TOC.
 */
function setupIntersectionObserver() {
    // Le opzioni definiscono quando l'Observer deve reagire.
    // Attiva quando il 50% superiore del viewport è intersecato
    const options = {
        root: null, // viewport come root
        rootMargin: '0px 0px -50% 0px', 
        threshold: 0.1 
    };

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            // Controlliamo solo gli elementi che stanno entrando (o uscendo)
            if (entry.isIntersecting) {
                
                const targetId = entry.target.id;
                
                // Trova l'elemento <li> corrispondente nel TOC usando l'attributo data-target
                const tocItem = document.querySelector(`.toc-item[data-target="${targetId}"]`);
                
                if (tocItem) {
                    // 1. Trova il TOC genitore (per non influenzare gli altri TOC)
                    const parentToc = tocItem.closest('.toc-list');
                    if (parentToc) {
                        // 2. Rimuovi la classe attiva da tutti gli elementi dello stesso TOC
                        parentToc.querySelectorAll('.toc-item').forEach(item => {
                            item.classList.remove('active');
                        });
                        // 3. Aggiungi la classe attiva all'elemento corrente
                        tocItem.classList.add('active');
                    }
                }
            }
        });
    }, options);

    // Osserva tutti i sottotitoli H3 che hanno un ID all'interno dei contenitori scorrevoli
    document.querySelectorAll('.scroll-content h3[id]').forEach(h3 => {
        observer.observe(h3);
    });
}

        // Inizializza la lingua e la sezione all'avvio
        document.addEventListener('DOMContentLoaded', () => {
            // Partiamo da 'home'
            changeSection('home'); 
            // Inizializza la lingua su 'it'
            setLanguage('it');

            // **********************************************
            // CHIAMATE AGGIUNTE PER IL TOC E LO SCROLL
            // **********************************************
            setupTocScrolling();
            setupIntersectionObserver();
        });
