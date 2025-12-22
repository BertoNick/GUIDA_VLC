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

// ======================================================================
// RENDERING MONUMENTI
// ======================================================================
function renderMonuments() {
    const gridContainer = document.getElementById('punti-di-interesse-grid');
    if (!gridContainer) return;
    
    gridContainer.innerHTML = '';
    const descriptionKey = currentLang === 'it' ? 'descrizione_IT' : 'descrizione_ES';

    valenciaPOI.forEach(poi => {
        const description = poi[descriptionKey] || poi.descrizione_IT;
        const cardHTML = `
            <div class="monument-card">
                <img src="https://via.placeholder.com/600x400?text=${poi.nome.replace(/\s/g, '+')}" alt="${poi.nome}" class="card-image">
                <div class="card-body">
                    <h3>${poi.nome}</h3>
                    <p>${description}</p>
                </div>
            </div>`;
        gridContainer.innerHTML += cardHTML;
    });
}

// ======================================================================
// LOGICA CHECKLIST
// ======================================================================
const checklistData = [
    { it: "Passaporto/Carta d'identità", es: "Pasaporte/DNI" },
    { it: "Prenotazioni (voli, hotel)", es: "Reservas (vuelos, hotel)" },
    { it: "Assicurazione di viaggio", es: "Seguro de viaje" },
    { it: "Adattatore di corrente", es: "Adaptador de corriente" },
    { it: "Scarpe comode", es: "Zapatos cómodos" },
    { it: "Abbigliamento per il clima mediterraneo", es: "Ropa para clima mediterráneo" },
    { it: "Crema solare", es: "Crema solar" },
    { it: "Farmaci personali", es: "Medicamentos personales" },
    { it: "Contanti e carte di credito", es: "Efectivo y tarjetas" },
];

const STORAGE_KEY = 'valencia_checklist_status';

function loadChecklistStatus() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
}

function saveChecklistStatus(status) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(status));
}

function renderChecklist() {
    const container = document.getElementById('checklist-list');
    if (!container) return;
    let status = loadChecklistStatus();
    container.innerHTML = checklistData.map((item, index) => {
        const itemText = currentLang === 'it' ? item.it : item.es;
        const isChecked = status[index] === true;
        return `
            <label class="checklist-item" data-index="${index}">
                <input type="checkbox" ${isChecked ? 'checked' : ''}>
                <span class="checklist-label">${itemText}</span>
            </label>`;
    }).join('');

    container.querySelectorAll('.checklist-item input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const index = parseInt(e.target.closest('.checklist-item').dataset.index);
            status[index] = e.target.checked;
            saveChecklistStatus(status);
        });
    });
}

function resetChecklist() {
    if (confirm(currentLang === 'it' ? 'Sei sicuro di voler resettare tutta la checklist?' : '¿Estás seguro/a de querer restablecer toda la lista?')) {
        localStorage.removeItem(STORAGE_KEY);
        renderChecklist();
    }
}

// ======================================================================
// LOGICA DI BASE (Navigazione, Lingua)
// ======================================================================
function changeSection(targetSectionId) {
    document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
    const targetSection = document.getElementById(targetSectionId);
    if (targetSection) targetSection.classList.add('active');
    
    document.getElementById('menu-overlay').classList.remove('open');

    if (targetSectionId === 'mappa') {
        if (map === null) initMap();
        setTimeout(() => { 
            if (map) {
                map.invalidateSize(); 
                addMarkers(); 
            }
        }, 100);
    } else if (targetSectionId === 'punti-di-interesse') {
        renderMonuments();
    } else if (targetSectionId === 'checklist') {
        renderChecklist();
    }
}

function setLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('.flag').forEach(flag => flag.classList.remove('active'));
    document.querySelector(`.flag.${lang}`).classList.add('active');

    document.querySelectorAll('[data-it]').forEach(element => {
        element.innerHTML = lang === 'it' ? element.getAttribute('data-it') : element.getAttribute('data-es');
    });
    
    document.getElementById('title').textContent = lang === 'it' ? 'Guida Valencia' : 'Guía Valencia';
    if (document.getElementById('punti-di-interesse').classList.contains('active')) renderMonuments();
}

// ======================================================================
// MAPPA
// ======================================================================
function initMap() {
    if (map !== null) return;
    map = L.map('map-container').setView([39.4699, -0.3763], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
    }).addTo(map);
}

function addMarkers() {
    if (map === null) return;
    map.eachLayer(layer => { if (layer instanceof L.Marker) map.removeLayer(layer); });
    valenciaPOI.forEach(poi => {
        const desc = currentLang === 'it' ? poi.descrizione_IT : poi.descrizione_ES;
        L.marker([poi.lat, poi.lon]).addTo(map).bindPopup(`<b>${poi.nome}</b><br>${desc}`);
    });
}

// ======================================================================
// TOC SCROLLING
// ======================================================================
function setupTocScrolling() {
    document.querySelectorAll('.section-toc .toc-item a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// ======================================================================
// INIZIALIZZAZIONE (DOM CONTENT LOADED)
// ======================================================================
document.addEventListener('DOMContentLoaded', () => {
    // Listener Menu Hamburger
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

    // Listener Lingua
    document.querySelectorAll('.flag').forEach(flag => {
        flag.addEventListener('click', (e) => {
            setLanguage(e.target.dataset.lang);
        });
    });

    // Listener Reset Checklist
    document.getElementById('reset-checklist').addEventListener('click', resetChecklist);

    // Setup iniziale
    setupTocScrolling();
    setLanguage('it');
    changeSection('home');
});