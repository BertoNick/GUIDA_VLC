// Variabili Globali
let currentLang = 'it';
let map = null;
let markersLayer = L.layerGroup(); 

// ======================================================================
// CONFIGURAZIONE ICONE PER TIPOLOGIA
// ======================================================================
const poiIcons = {
    architettura: { icon: "📐", color: "#3498db" },
    monumento: { icon: "🏛️", color: "#e67e22" },
    aeroporto: { icon: "✈️", color: "#95a5a6" },
    sport: { icon: "🏟️", color: "#d35400" },
    natura: { icon: "🌳", color: "#27ae60" },
    default: { icon: "📍", color: "#34495e" }
};

function createCustomIcon(tipologia) {
    const config = poiIcons[tipologia] || poiIcons.default;
    return L.divIcon({
        html: `<div style="background-color: white; border: 2px solid ${config.color}; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-size: 18px; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">${config.icon}</div>`,
        className: '',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16]
    });
}

// ======================================================================
// FUNZIONE DI NAVIGAZIONE INTERNA (JUMP)
// ======================================================================
function jumpTo(sectionId, elementId, poiName = null) {
    changeSection(sectionId);
    
    setTimeout(() => {
        if (sectionId === 'mappa' && poiName) {
            focusMarker(poiName);
        } else {
            const element = document.getElementById(elementId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                element.style.outline = "3px solid #e67e22";
                element.style.borderRadius = "12px";
                setTimeout(() => element.style.outline = "none", 2000);
            }
        }
    }, 300);
}

function focusMarker(nome) {
    if (!map) return;
    markersLayer.eachLayer(layer => {
        if (layer.options.title === nome) {
            map.setView(layer.getLatLng(), 15);
            layer.openPopup();
        }
    });
}

// ======================================================================
// DATI DEI PUNTI DI INTERESSE (POI)
// ======================================================================
const valenciaPOI = [
    {
        nome: "Hotel Camplus Valencia Towers",
        lat: 39.500115, 
        lon: -0.400300,
        immagine: "img/camplus.jpg", // Assicurati di avere una foto o usa una generica
        tipologia: "utility",    
        descrizione_IT: "Il nostro hotel. Fermata metro: Empalme.",
        descrizione_ES: "Nuestro hotel. Parada de metro: Empalme."
    },
    {
        nome: "Ristorante La Ferradura",
        lat: 39.488473, 
        lon: -0.325491,
        immagine: "img/ferradura.jpg",
        tipologia: "gastronomia",    
        descrizione_IT: "Ristorante tipico sulla spiaggia della Malvarrosa. Qui degusteremo la vera paella valenciana e di mare.",
        descrizione_ES: "Restaurante típico en la playa de la Malvarrosa. Aquí degustaremos la verdadera paella valenciana y de marisco."
    },
    {
        nome: "Casa-Museo di Blasco Ibáñez",
        lat: 39.482678, 
        lon: -0.325933,
        immagine: "img/blasco.jpg",
        tipologia: "cultura",    
        descrizione_IT: "Villa storica dello scrittore e politico valenciano Vicente Blasco Ibáñez, situata di fronte alla spiaggia della Malvarrosa.",
        descrizione_ES: "Chalet histórico del escritor y politico valenciano Vicente Blasco Ibáñez, situado frente a la playa de la Malvarrosa."
    },
    {
        nome: "Oceanogràfic",
        lat: 39.452683, 
        lon: -0.347966,
        immagine: "img/oceanografic.jpg",
        tipologia: "architettura",    
        descrizione_IT: "L'acquario più grande d'Europa. Un viaggio attraverso i principali ecosistemi marini del pianeta.",
        descrizione_ES: "El acuario más grande de Europa. Un viaje a través de los principales ecosistemas marinos del planeta."
    },
    {
        nome: "Città delle Arti e delle Scienze",
        lat: 39.45617, 
        lon: -0.3521,
        immagine: "img/cac.jpg",
        tipologia: "architettura",    
        descrizione_IT: "Un complesso architettonico di stile neofuturista progettato da Santiago Calatrava e inaugurato nel 1998. È il simbolo contemporaneo della città.",
        descrizione_ES: "Un complejo arquitectónico de estilo neofuturista diseñado por Santiago Calatrava e inaugurado en 1998. Es el símbolo contemporáneo de la ciudad."
    },
    {
        nome: "Mercato Centrale",
        lat: 39.47407, 
        lon: -0.37907,
        immagine: "img/mercato.jpg",
        tipologia: "monumento",
        descrizione_IT: "Uno dei mercati più grandi d'Europa, costruito nel 1914 e noto per la sua architettura modernista e i prodotti freschi locali.",
        descrizione_ES: "Uno de los mercados más grandes de Europa, construido en 1914 y conocido por su arquitectura modernista y sus productos frescos locales."
    },
    {
        nome: "Mercado de Colón",
        lat: 39.46899, 
        lon: -0.36836,
        immagine: "img/mercado_colon.jpg",
        tipologia: "monumento",
        descrizione_IT: "Inaugurato nel 1916, il Mercato di Colón è uno dei principali esempi del modernismo valenciano e un pezzo chiave del patrimonio industriale della città. Si distingue per l'imponente facciata in mattoni rossi, ceramiche policrome e dettagli in ferro battuto che rendono omaggio alla tradizione agricola valenciana. Dopo aver abbandonato la sua funzione originale di mercato annonario tradizionale, l'edificio è stato magistralmente riabilitato per trasformarsi in un centro gastronomico e culturale di riferimento, dove l'eleganza della sua architettura centenaria convive oggi con il fermento cosmopolita dei suoi caffè e delle sue terrazze.",
        descrizione_ES: "Inaugurado en 1916, el Mercado de Colón es uno de los máximos ejemplos del modernismo valenciano y una pieza clave del patrimonio industrial de la ciudad. Destaca por su imponente fachada de ladrillo rojo, cerámica policromada y detalles en forja que rinden homenaje a la huerta valenciana. Tras dejar atrás su función como mercado de abastos tradicional, el edificio fue rehabilitado con maestría para transformarse en un centro gastronómico y cultural de referencia, donde la elegancia de su arquitectura centenaria convive hoy con el bullicio cosmopolita de sus terrazas y cafeterías."
    },
    {
        nome: "La Lonja de la Seda",
        lat: 39.47459, 
        lon: -0.37830,
        immagine: "img/lonja.jpg",
        tipologia: "monumento",
        descrizione_IT: "Antica Borsa della Seta, costruita nel secolo XV, capolavoro del gotico civile valenciano e Patrimonio Mondiale dell'UNESCO.",
        descrizione_ES: "Antigua Bolsa de la Seda, construida en el siglo XV, obra maestra del gótico civil valenciano y Patrimonio de la Humanidad de la UNESCO."
    },
    {
        nome: "Aeroporto",
        lat: 39.49196, 
        lon: -0.48223,
        immagine: "img/aeroporto.jpg",
        tipologia: "aeroporto",
        descrizione_IT: "Aeroporto internazionale di Valencia-Manises.",
        descrizione_ES: "Aeropuerto Internacional de Valencia-Manises."
    },
    {
        nome: "Cattedrale",
        lat: 39.47536, 
        lon: -0.37548,
        immagine: "img/cattedrale.jpeg",
        tipologia: "monumento",
        descrizione_IT: "La Cattedrale di Valencia, conosciuta come la Seu, è un tempio prevalentemente in stile gotico valenciano consacrato nel 1238, che custodisce tesori come il Santo Graal e importanti dipinti del Quattrocento. La sua importanza storica risiede sia nella fusione di stili architettonici, sia nell'essere stata elevata a sede metropolitana sotto l'influenza della famiglia Borgia.",
        descrizione_ES: "La Catedral de Valencia, conocida como la Seu, es un templo de predominio gótico valenciano consagrado en 1238 que alberga tesoros como el Santo Cáliz y destacadas pinturas del Quattrocento. Su importancia histórica radica tanto en su mezcla de estilos arquitectónicos como en haber sido elevada a sede metropolitana bajo la influencia de la familia Borja.."
    },
    {
        nome: "Piazza dell’Ayuntamiento",
        lat: 39.46969,
        lon: -0.37641,
        immagine: "img/ayuntamiento.jpg",
        tipologia: "monumento",
        descrizione_IT: "La piazza dell’Ayuntamiento è uno degli spazi più scenografici e vibranti di Valencia, circondata da edifici monumentali di grande pregio architettonico come il Municipio stesso e il palazzo delle Poste (Correos). È il cuore pulsante della città e il palcoscenico principale delle famose mascletà, dove il fragore e la polvere da sparo diventano protagonisti assoluti durante la festa delle Fallas.",
        descrizione_ES: "La Plaza del Ayuntamiento es uno de los espacios más escénicos y vibrantes de Valencia, rodeada de edificios monumentales de gran valor arquitectónico como el propio Ayuntamiento y el edificio de Correos. Es el corazón social de la ciudad y el escenario principal de las famosas mascletás, donde el estruendo y la pólvora se convierten en protagonistas durante las Fallas."
    },
    {
        nome: "Edificio del Reloj - tinglados",
        lat: 39.46017, 
        lon: -0.3318,
        immagine: "img/reloj.jpg",
        tipologia: "monumento",
        descrizione_IT: "Costruito nel 1916, l'Edificio del Reloj è un elegante esempio di architettura eclettica con influenze francesi, nato originariamente come stazione marittima. Situato all'ingresso del porto accanto ai Tinglados —antichi magazzini modernisti decorati con mosaici di azulejos—, questo complesso architettonico simboleggia lo splendore commerciale di Valencia ed è oggi un importante centro culturale affacciato sul Mediterraneo.",
        descrizione_ES: "Construido en 1916, el Edificio del Reloj es un elegante ejemplo de arquitectura ecléctica con influencias francesas que servía originalmente como estación marítima. Presidiendo la entrada al puerto junto a los Tinglados —antiguos almacenes modernistas decorados con mosaicos de azulejos—, este conjunto arquitectónico simboliza el esplendor comercial de Valencia y es hoy un centro cultural clave frente al Mediterráneo."
    },
    {
        nome: "Veles e Vents",
        lat: 39.46102, 
        lon: -0.32409,
        immagine: "img/veles.jpg",
        tipologia: "architettura",
        descrizione_IT: "Inaugurato nel 2006, l'edificio Veles e Vents è un edificio minimalista, progettato originariamente per l'America's Cup. Situato nella Marina di Valencia, questo iconico belvedere dalle ampie terrazze bianche è stato anche un punto di osservazione privilegiato durante gli anni in cui il circuito cittadino del GP di Formula 1 attraversava le strade del porto, diventando il simbolo della modernità marittima della città.",
        descrizione_ES: "Inaugurado en 2006, el edificio Veles e Vents es una obra minimalista, diseñada originalmente para la America's Cup. Situado en la Marina de Valencia, este icónico mirador de grandes terrazas blancas fue también un punto de observación privilegiado durante los años en que el circuito urbano del GP de fómula 1 recorría las calles del puerto, convirtiéndose en el símbolo de la modernidad marítima de la ciudad.."
    },
    {
        nome: "Stadio Mestalla",
        lat: 39.47488,
        lon: -0.35847,
        immagine: "img/mestalla.jpg",
        tipologia: "sport",
        descrizione_IT: "Inaugurato nel 1923, lo Stadio di Mestalla è il più antico della Liga spagnola in Prima Divisione e si distingue per la sua spettacolare architettura verticale, con gradinate ripidissime che sembrano cadere sul campo creando un'atmosfera unica. Mentre lo storico impianto continua a battere con la passione del Valencia CF, il progetto del 'Nuevo Mestalla' rimane una sagoma incompiuta all'ingresso della città, in attesa di essere completato dopo anni di paralisi dei lavori.",
        descrizione_ES: "Inaugurado en 1923, el Estadio de Mestalla es el más antiguo de la Liga española en Primera División y destaca por su espectacular arquitectura vertical, con gradas que parecen caer sobre el césped creando una atmósfera única. Mientras el histórico recinto sigue latiendo con la pasión del Valencia CF, el proyecto del 'Nuevo Mestalla' permanece como una silueta inacabada en la entrada de la ciudad, esperando a ser completado tras años de paralización de las obras."
    },
    {
        nome: "Roig Arena",
        lat: 39.449186, 
        lon: -0.364241,
        immagine: "img/roig.jpeg",
        tipologia: "sport",
        descrizione_IT: "Inaugurato nel 2025, il Roig Arena è un avanguardistico spazio polifunzionale diventato uno dei centri per eventi più avanzati d'Europa. Con una capacità fino a 20.000 spettatori, questo colossale progetto è stato finanziato interamente da Juan Roig (proprietario di Mercadona) con un investimento di 400 milioni di euro, dotando la città di una sede d'élite per il basket e per i grandi tour internazionali..",
        descrizione_ES: "Inaugurado en 2025, el Roig Arena es un vanguardista recinto multiusos que se ha convertido en uno de los centros de eventos más avanzados de Europa. Con capacidad para hasta 20.000 espectadores, este colosal proyecto ha sido financiado íntegramente por Juan Roig (propietario de Mercadona) con una inversión de 400 millones de euros, dotando a la ciudad de una sede de élite para el baloncesto y grandes giras internacionales."
    },
    {
        nome: "Jardines del Real",
        lat: 39.47789,
        lon: -0.36699,
        immagine: "img/viveros.jpg",
        tipologia: "natura",
        descrizione_IT: "Conosciuti popolarmente come Viveros, i Jardines del Real occupano il sito dove anticamente sorgeva il maestoso Palazzo Reale, la residenza dei re della Corona d'Aragona che fu distrutta nel 1810 durante la Guerra d'Indipendenza. Oggi, questo parco è un'oasi di natura e cultura che conserva i resti archeologici dell'antico palazzo, unendo percorsi romantici, fontane e una grande varietà botanica nel cuore di Valencia.",
        descrizione_ES: "Conocidos popularmente como Viveros, los Jardines del Real ocupan el solar donde antiguamente se alzaba el majestuoso Palacio Real, la residencia de los reyes de la Corona de Aragón que fue destruida en 1810 durante la Guerra de la Independencia. Hoy en día, este parque es un oasis de naturaleza y cultura que conserva restos arqueológicos del antiguo palacio, combinando paseos románticos, fuentes y una gran variedad botánica en el corazón de Valencia."
    },
    {
        nome: "Palacio de la Exposición",
        lat: 39.47333, 
        lon: -0.36233,
        immagine: "img/exposicion.jpg",
        tipologia: "monumento",
        descrizione_IT: "Costruito in soli settanta giorni per l'Esposizione Regionale del 1909, il Palacio de la Exposición è uno splendido esempio di stile neogotico valenciano. Progettato da Francisco Mora, l'edificio ricrea lo splendore del passato medievale della città con una squisita decorazione di ceramiche, marmi e vetrate, rimanendo oggi uno degli spazi più eleganti per ricevimenti ed eventi istituzionali.",
        descrizione_ES: "Construido en apenas setenta días para la Exposición Regional de 1909, el Palacio de la Exposición es una deslumbrante muestra del estilo neogótico valenciano. Diseñado por Francisco Mora, el edificio recrea el esplendor del pasado medieval de la ciudad con una exquisita decoración de cerámica, mármol y vidrieras, permaneciendo hoy como uno de los espacios más elegantes para recepciones y eventos institucionales."
    },
    {
        nome: "Torres de Serrano",
        lat: 39.47938, 
        lon: -0.37597,
        immagine: "img/serranos.jpg",
        tipologia: "monumento",
        descrizione_IT: "Le Torri di Serrano e il loro ponte omonimo, costruiti tra la fine del XIV e la metà del XVI secolo, formano uno dei complessi monumentali più iconici di Valencia. Mentre il ponte in pietra (1518) fungeva da ingresso nobile sopra il fiume Turia, le torri —capolavoro del gotico valenciano— si ergevano come la porta principale delle mura; oggi, questo insieme non è solo un belvedere eccezionale, ma anche lo scenario in cui ogni anno si celebra 'la Crida' per dare inizio alla festa delle Fallas.",
        descrizione_ES: "Las Torres de Serranos y su puente homónimo, construidos entre finales del siglo XIV y mediados del XVI, forman uno de los conjuntos monumentales más icónicos de Valencia. Mientras el puente de piedra (1518) servía como entrada noble sobre el río Turia, las torres —obra maestra del gótico valenciano— se alzaban como la puerta principal de la muralla; hoy, este conjunto no solo es un mirador excepcional, sino también el escenario donde cada año se celebra 'la Crida' para dar comienzo a las Fallas."
    },
    {
        nome: "Torri di Quart",
        lat: 39.47597,
        lon: -0.38385,
        immagine: "img/quart.jpg",
        tipologia: "monumento",
        descrizione_IT: "Le Torri di Quart, costruite nel XV secolo in un imponente stile gotico tardo, erano la porta d'ingresso per chi proveniva dalla Castiglia. A differenza di quelle di Serranos, la loro facciata mostra una bellezza più austera e fiera, conservando ancora i segni e le cicatrici delle cannonate subite durante l'assedio delle truppe napoleoniche nella Guerra d'Indipendenza (1808), il che le rende una testimonianza viva della resistenza di Valencia.",
        descrizione_ES: "Las Torres de Quart, construidas en el siglo XV con un imponente estilo gótico tardío, eran la puerta de entrada para quienes venían de Castilla. A diferencia de las de Serranos, su fachada muestra una belleza más austera y guerrera, conservando todavía las huellas y cicatrices de los cañonazos sufridos durante el asedio de las tropas napoleónicas en la Guerra de la Independencia (1808), lo que las convierte en un testimonio vivo de la resistencia de Valencia."
    },
    {
        nome: "Giardino Botanico",
        lat: 39.47555, 
        lon: -0.38636,
        immagine: "img/botanico.jpg",
        tipologia: "natura",
        descrizione_IT: "Fondato originariamente nel 1567 e trasferito nella sua posizione attuale (l'Huerto de Tramoyeres) nel 1802, il Jardín Botánico dell'Università di Valencia è uno dei più antichi e importanti d'Europa. Questa oasi scientifica e paesaggistica si distingue per la sua storica collezione di palme, le sue serre in ferro del XIX secolo e il suo instancabile lavoro nella conservazione della biodiversità mediterranea, rappresentando un punto di riferimento internazionale nella ricerca botanica.",
        descrizione_ES: "Fundado originalmente en 1567 y trasladado a su ubicación actual (el Huerto de Tramoyeres) en 1802, el Jardín Botánico de la Universidad de Valencia es uno de los más antiguos e importantes de Europa. Este oasis científico y paisajístico destaca por su histórica colección de palmeras, sus invernaderos de hierro del siglo XIX y su incansable labor en la conservación de la biodiversidad mediterránea, siendo un referente internacional en la investigación botánica."
    },
    {
        nome: "Albufera",
        lat: 39.33488, 
        lon: -0.34642,
        immagine: "img/albufera.jpg",
        tipologia: "natura",
        descrizione_IT: "Situata a pochi chilometri dalla città, l'Albufera è il lago d'acqua dolce più grande di Spagna e un ecosistema dal valore incalcolabile. Questo paesaggio di risaie e canali è lo scenario del celebre romanzo naturalista 'Fango e canneti' (Cañas y Barro), dove Vicente Blasco Ibáñez —spesso considerato l'equivalente spagnolo di Giovanni Verga per il suo crudo realismo sociale— ritrae la lotta dell'uomo contro un ambiente ostile. L'opera trascende la narrativa regionale per diventare un potente simbolo del determinismo: il fango che dà vita al riso è lo stesso che intrappola e consuma le ambizioni dei personaggi, trasformando questo 'specchio' d'acqua in una testimonianza viva della dura storia della Valencia rurale.",
        descrizione_ES: "Situada a escasos kilómetros de la ciudad, la Albufera es el lago de agua dulce más grande de España y un ecosistema de valor incalculable. Este paisaje de arrozales y canales es el escenario de la célebre novela naturalista 'Cañas y Barro', donde Vicente Blasco Ibáñez —considerado a menudo el equivalente español de Giovanni Verga por su crudo realismo social— retrata la lucha del hombre contra un entorno hostil. La obra trasciende la narrativa regional para convertirse en un poderoso símbolo del determinismo: el barro que da vida al arroz es el mismo que atrapa y consume las ambiciones de sus personajes, convirtiendo este 'espejo' de agua en un testamento vivo de la dura historia de la Valencia rural."
    },
    {
        nome: "Puente de la solidaridad",
        lat: 39.43851,
        lon: -0.39354,
        immagine: "img/solidaridad.webp",
        tipologia: "monumento",
        descrizione_IT: "Il 29 ottobre 2024, Valencia è stata colpita dalla più devastante alluvione della sua storia, una catastrofe che ha fatto esondare i torrenti e sommerso decine di comuni, lasciando un tragico bilancio di oltre 200 vittime e danni incalcolabili. Nel mezzo del dolore, la passerella pedonale che unisce il quartiere di San Marcelino ai paesi del sud è stata ribattezzata Puente de la Solidaridad, in onore dei migliaia di volontari che, con pale e stivali di gomma, l'hanno attraversata a piedi ogni giorno per aiutare i propri vicini a spalare il fango e a ricostruire le proprie vite.",
        descrizione_ES: "El 29 de octubre de 2024, Valencia sufrió la DANA más devastadora de su historia, una catástrofe que desbordó barrancos y anegó decenas de municipios, dejando un trágico balance de más de 200 víctimas y daños incalculables. En medio del dolor, la pasarela peatonal que une el barrio de San Marcelino con los pueblos del sur fue rebautizada como Puente de la Solidaridad, en honor a los miles de voluntarios que, con palas y botas de agua, cruzaron a pie cada día para ayudar a sus vecinos a limpiar el barro y reconstruir sus vidas."
    },
    {
        nome: "Estación del Norte",
        lat: 39.46713,
        lon: -0.37720,
        immagine: "img/estacion.jpg",
        tipologia: "monumento",
        descrizione_IT: "Inaugurata nel 1917, la Estación del Norte è un gioiello del modernismo valenciano che accoglie i viaggiatori con una facciata decorata da motivi vegetali e arance, simboli dell'agricoltura locale. Oltre alla sua imponente struttura in ferro, la stazione nasconde la 'Sala dei Mosaici', un ambiente estremamente fotogenico interamente rivestito di piastrelle e ceramiche che rendono omaggio al folklore regionale. Questo spazio, antica caffetteria della stazione, è oggi uno degli angoli più iconici e ammirati per la sua bellezza ornamentale e la sua luce.",
        descrizione_ES: "Inaugurada en 1917, la Estación del Norte es una joya del modernismo valenciano que recibe a los viajeros con una fachada decorada con motivos vegetales y naranjas, símbolos de la agricultura local. Más allá de su imponente estructura de hierro, la estación esconde la 'Sala de los Mosaicos', una estancia sumamente fotogénica revestida por completo de azulejos y cerámicas que rinden homenaje al folclore regional. Este espacio, antigua cafetería de la estación, es hoy un de los rincones más icónicos y admirados por su belleza ornamental y su luz."
    },
    {
        nome: "Plaza de Toros",
        lat: 39.46674, 
        lon: -0.37614,
        immagine: "img/plaza_toros.jpeg",
        tipologia: "monumento",
        descrizione_IT: "Costruita tra il 1850 e il 1860, la Plaza de Toros di Valencia è un imponente edificio neoclassico ispirato all'architettura romana, in particolare al Colosseo. Con la sua caratteristica struttura ad archi in mattoni a vista, questa arena è una delle più grandi di Spagna e funge da maestoso passaggio tra il centro storico e l'ampliamento moderno della città. Oltre alla sua funzione taurina, la piazza è un vibrante centro per concerti e grandi eventi, integrandosi nel paesaggio urbano come un solido monumento alla storia sociale valenciana.",
        descrizione_ES: "Construida entre 1850 y 1860, la Plaza de Toros de Valencia es un imponente edificio neoclásico inspirado en la arquitectura romana, concretamente en el Coliseo. Con su característica estructura de arcos de ladrillo visto, este coso es uno de los más grandes de España y sirve como majestuosa transición entre el casco antiguo y el ensanche moderno de la ciudad. Además de su función taurina, la plaza es un vibrante centro para conciertos y grandes eventos, integrándose en el paisaje urbano como un sólido monumento a la historia social valenciana."
    },
    {
        nome: "Horchatería de Santa Catalina",
        lat: 39.47387, 
        lon: -0.37626,
        immagine: "img/santa_catalina.jpg",
        tipologia: "default",
        descrizione_IT: "Situata all'ingresso del pittoresco quartiere del Carmen, la Horchatería Santa Catalina è un tempio della tradizione valenciana con oltre due secoli di storia. Questo locale iconico non è famoso solo per la sua horchata artigianale e i suoi 'fartons', ma anche per la sua spettacolare decorazione in ceramica di Manises, che riveste le pareti con scene colorate che evocano la cultura locale. Sedersi ai suoi tavoli di marmo significa fare un viaggio nel tempo, godendo di un'atmosfera autentica e familiare nel cuore pulsante del centro storico, a pochi passi dall'omonima chiesa gotica.",
        _descrizione_ES: "Ubicada a las puertas del castizo barrio del Carmen, la Horchatería Santa Catalina es un templo de la tradición valenciana con más de dos siglos de historia. Este local icónico no solo es famoso por su horchata artesana y sus fartons, sino también por su espectacular decoración de cerámica de Manises, que reviste sus paredes con escenas coloridas que evocan la cultura local. Sentarse en sus mesas de mármol es realizar un viaje en el tiempo, disfrutando de una atmósfera auténtica y familiar en pleno corazón del casco antiguo, a solo unos pasos de la iglesia gótica homónima.",
        get descrizione_ES() {
            return this._descrizione_ES;
        },
        set descrizione_ES(value) {
            this._descrizione_ES = value;
        },
    },
    {
        nome: "Parc Gulliver",
        lat: 39.462732, 
        lon: -0.35949,
        immagine: "img/gulliver.jpeg",
        tipologia: "monumento",
        descrizione_IT: "Immerso nel Giardino del Turia, il Parco Gulliver è una delle aree gioco più creative e ammirate d'Europa. Ispirato all'opera di Jonathan Swift, il parco presenta una gigantesca figura distesa del naufrago Gulliver, lunga 70 metri, trasformata in un paesaggio di scivoli, rampe e scale. I visitatori, proprio come i lillipuziani del racconto, possono arrampicarsi ed esplorare il corpo del gigante, rendendo l'architettura ludica un'esperienza immersiva. È un punto di riferimento fondamentale per le famiglie e un simbolo del design urbano valenciano che invita a riscoprire la fantasia attraverso il gioco.",
        descrizione_ES: "Enclavado en el Jardín del Turia, el Parque Gulliver es una de las áreas de juegos más creativas y admiradas de Europa. Inspirado en la obra de Jonathan Swift, el parque presenta una gigantesca figura yacente del náufrago Gulliver, de 70 metros de largo, transformada en un paisaje de toboganes, rampas y escaleras. Los visitantes, al igual que los liliputienses del relato, pueden trepar y explorar el cuerpo del gigante, convirtiendo la arquitectura lúdica en una experiencia inmersiva. Es un referente fundamental para las familias y un símbolo del diseño urbano valenciano que invita a redescubrir la fantasía a través del juego."
    },
    {
        nome: "Centre d'Interpretació Racó de l'Olla - Parc Natural de l'Albufera",
        lat: 39.33938, 
        lon: -0.31971,
        immagine: "img/olla.jpeg",
        tipologia: "natura",
        descrizione_IT: "Situato nel cuore del Parco Naturale dell'Albufera, il Racó de l'Olla è un santuario della biodiversità e una tappa obbligatoria per gli amanti della natura. Questa zona di riserva protetta funge da punto di transito e nidificazione per innumerevoli specie di uccelli acquatici, offrendo sentieri didattici e torrette di osservazione con viste panoramiche privilegiate sulle lagune. È il luogo perfetto per staccare dal ritmo urbano e comprendere l'importanza ecologica del litorale valenciano, dove la quiete del paesaggio e il riflesso del sole sull'acqua creano un'atmosfera di pace assoluta.",
        descrizione_ES: "Situado en el corazón del Parque Natural de la Albufera, el Racó de l'Olla es un santuario de biodiversidad y una parada obligatoria para los amantes de la naturaleza. Esta zona de reserva protegida sirve como punto de tránsito y nidificación para innumerables especies de aves acuáticas, ofreciendo senderos didácticos y torres de observación con vistas panorámicas privilegiadas sobre las lagunas. Es el lugar perfecto para desconectar del ritmo urbano y comprender la importancia ecológica del litoral valenciano, donde la quietud del paisaje y el reflejo del sol sobre el agua crean una atmósfera de paz absoluta."
    }
];

// ======================================================================
// RENDERING MONUMENTI (CARD)
// ======================================================================
function renderMonuments() {
    const gridContainer = document.getElementById('punti-di-interesse-grid');
    if (!gridContainer) return;
    
    gridContainer.innerHTML = '';
    const descriptionKey = currentLang === 'it' ? 'descrizione_IT' : 'descrizione_ES';

    valenciaPOI.forEach(poi => {
        const description = poi[descriptionKey] || poi.descrizione_IT;
        const idCard = poi.nome.replace(/\s+/g, '-').toLowerCase();
        const promptMsg = currentLang === 'it' ? 'Vuoi vedere questo punto sulla mappa?' : '¿Quieres ver este punto en el mapa?';

        const cardHTML = `
            <div class="monument-card" id="${idCard}">
                <img src="${poi.immagine}" alt="${poi.nome}" class="card-image" onerror="this.src='https://via.placeholder.com/600x400?text=Foto+In+Arrivo'">
                <div class="card-body">
                    <small style="color: ${poiIcons[poi.tipologia]?.color || '#e67e22'}; font-weight: bold; text-transform: uppercase;">
                        ${poiIcons[poi.tipologia]?.icon || ''} ${poi.tipologia}
                    </small>
                    <h3 style="cursor:pointer; text-decoration:underline; text-decoration-style: dotted;" 
                        onclick="if(confirm('${promptMsg}')){ jumpTo('mappa', 'map-container', '${poi.nome}'); }">
                        ${poi.nome} 📍
                    </h3>
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
    { it: "carta di credito/debito", es: "Tarjeta de crédito/débito" },
    { it: "Denaro in contanti", es: "Dinero en efectivo" },
    { it: "Caricabatterie", es: "Cargador" },
    { it: "Scarpe comode", es: "Zapatos cómodos" },
    { it: "Vestiti comodi", es: "Ropa cómoda" },
    { it: "Powerbank", es: "Powerbank" },
    { it: "Controllare dati in roaming / fare e-sim", es: "Consultar los datos en roaming / Contratar una e-SIM" },
    { it: "Farmaci personali", es: "Medicamentos personales" },
    { it: "Voglia di camminare, di rispettare orari e regole e divertirsi 😄", es: "Ganas de caminar, de respetar horarios y normas y pasarlo bien 😄" },
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
    if (confirm(currentLang === 'it' ? 'Resettare la lista?' : '¿Restablecer lista?')) {
        localStorage.removeItem(STORAGE_KEY);
        renderChecklist();
    }
}

// ======================================================================
// LOGICA DI BASE (NAVIGAZIONE E LINGUA)
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
    if (document.getElementById('mappa').classList.contains('active')) addMarkers();
    if (document.getElementById('checklist').classList.contains('active')) renderChecklist();
}

// ======================================================================
// MAPPA E MARKER
// ======================================================================
function initMap() {
    if (map !== null) return;
    map = L.map('map-container').setView([39.4699, -0.3763], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(map);
    markersLayer.addTo(map);
}

function addMarkers() {
    if (map === null) return;
    markersLayer.clearLayers();

    valenciaPOI.forEach(poi => {
        const desc = currentLang === 'it' ? poi.descrizione_IT : poi.descrizione_ES;
        const idCard = poi.nome.replace(/\s+/g, '-').toLowerCase();
        const btnText = currentLang === 'it' ? 'Vai alla Card' : 'Ver detalles';
        const gMapsUrl = `https://www.google.com/maps/search/?api=1&query=${poi.lat},${poi.lon}`;

        L.marker([poi.lat, poi.lon], { 
            icon: createCustomIcon(poi.tipologia),
            title: poi.nome 
        })
        .addTo(markersLayer)
        .bindPopup(`
            <div style="text-align: center; min-width: 180px; font-family: sans-serif;">
                <b style="font-size: 1.1rem;">${poi.nome}</b><br>
                <p style="font-size: 0.85rem; margin: 8px 0; color: #555;">${desc.substring(0, 60)}...</p>
                <a href="${gMapsUrl}" target="_blank" 
                   style="display: block; background: #e67e22; color: white; text-decoration: none; padding: 6px; border-radius: 4px; font-weight: bold; margin-bottom: 5px; font-size: 0.8rem;">
                   📍 Google Maps
                </a>
                <button onclick="jumpTo('punti-di-interesse', '${idCard}')" 
                   style="width: 100%; background: #34495e; color: white; border: none; padding: 6px; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 0.8rem;">
                   📖 ${btnText}
                </button>
            </div>`);
    });
}

// ======================================================================
// INIZIALIZZAZIONE
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

document.addEventListener('DOMContentLoaded', () => {
    // Menu
    document.getElementById('menu-toggle').addEventListener('click', () => document.getElementById('menu-overlay').classList.add('open'));
    document.getElementById('menu-close').addEventListener('click', () => document.getElementById('menu-overlay').classList.remove('open'));
    
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', (e) => changeSection(e.target.dataset.section));
    });

    // Lingue
    document.querySelectorAll('.flag').forEach(flag => {
        flag.addEventListener('click', (e) => {
            const lang = e.target.getAttribute('data-lang') || e.target.dataset.lang;
            setLanguage(lang);
        });
    });

    // Checklist Reset
    const resetBtn = document.getElementById('reset-checklist');
    if(resetBtn) resetBtn.addEventListener('click', resetChecklist);

    setupTocScrolling();
    setLanguage('it');
    changeSection('home');
});