// Dades base extretes del dataclean.json (ITB Leaks 2024 - Gener 2025)
const bases = {
    electricitat: 4500.5, // kWh/mes (Font: Plant Report_ITB_01-2025)
    aigua: 48.33,         // m3/mes (Font: Mitjana factures Aigües de Barcelona 2024)
    paper: 40,            // paquets/comanda (Font: Factures Lyreco 2024)
    neteja: 120,          // unitats/factura (Font: Factures Neteges 2024)
    manteniment: 50       // kg RAEE i residus (Estimat per a projecte IT)
};

// Cicles Estacionals i Tendències Temporals (Multiplicadors per mes)
// Gener=0, Febrer=1, ..., Desembre=11
const estacionalitat = {
    electricitat: [1.1, 1.1, 1.0, 0.9, 0.9, 0.8, 0.3, 0.2, 0.9, 1.0, 1.1, 1.2],
    aigua:        [0.9, 0.9, 1.0, 1.1, 1.2, 1.2, 0.5, 0.1, 1.0, 0.9, 0.9, 0.9],
    paper:        [1.0, 1.0, 1.2, 1.0, 1.2, 1.5, 0.2, 0.0, 1.5, 1.0, 1.0, 1.0],
    neteja:       [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.2, 0.0, 1.2, 1.0, 1.0, 1.0],
    manteniment:  [1.0, 1.05, 0.95, 1.0, 1.02, 0.98, 1.0, 0.5, 1.05, 1.0, 0.98, 1.0]
};

// Funció per calcular el consum segons els mesos seleccionats
function calcularConsum(mesosActius) {
    let totals = { electricitat: 0, aigua: 0, paper: 0, neteja: 0, manteniment: 0 };

    for (let i = 0; i < 12; i++) {
        if (mesosActius.includes(i)) {
            totals.electricitat += bases.electricitat * estacionalitat.electricitat[i];
            totals.aigua += bases.aigua * estacionalitat.aigua[i];
            totals.paper += bases.paper * estacionalitat.paper[i];
            totals.neteja += bases.neteja * estacionalitat.neteja[i];
            totals.manteniment += bases.manteniment * estacionalitat.manteniment[i];
        }
    }
    return totals;
}

// Generar el HTML de resultats (Inclou el càlcul normal i l'objectiu -30%)
function mostrarResultats(titol, totals) {
    const divResultats = document.getElementById('results');
    divResultats.innerHTML = `<h3>Resultats: ${titol}</h3>`;
    divResultats.classList.remove('hidden');

    const dadesMostrar = [
        { nom: '⚡ Electricitat', valor: totals.electricitat, unitat: 'kWh' },
        { nom: '💧 Aigua', valor: totals.aigua, unitat: 'm³' },
        { nom: '📄 Paper', valor: totals.paper, unitat: 'paquets' },
        { nom: '🧴 Neteja', valor: totals.neteja, unitat: 'unitats' },
        { nom: '🖥️ Manteniment i RAEE', valor: totals.manteniment, unitat: 'kg' }
    ];

    dadesMostrar.forEach(dada => {
        // Càlcul del -30% segons el pla de millora de la Fase 2
        const valorMillorat = dada.valor * 0.70;

        divResultats.innerHTML += `
            <div class="result-item">
                <h4>${dada.nom}</h4>
                <p>Consum projectat: <strong>${dada.valor.toFixed(2)} ${dada.unitat}</strong></p>
                <div class="result-item reduced" style="margin-top: 10px; padding: 10px;">
                    <small>Amb Pla Reducció "Green IT" (-30%):</small><br>
                    <strong style="color: var(--primary-green);">${valorMillorat.toFixed(2)} ${dada.unitat}</strong>
                </div>
            </div>
        `;
    });
}

// Event Listeners dels botons
document.getElementById('btn-year').addEventListener('click', () => {
    // Tots els 12 mesos
    const mesosAny = Array.from({length: 12}, (_, i) => i);
    const resultatsAny = calcularConsum(mesosAny);
    mostrarResultats("Pròxim Any (Gener a Desembre)", resultatsAny);
});

document.getElementById('btn-course').addEventListener('click', () => {
    // Setembre(8) a Juny(5)
    const mesosCurs = [8, 9, 10, 11, 0, 1, 2, 3, 4, 5];
    const resultatsCurs = calcularConsum(mesosCurs);
    mostrarResultats("Curs Escolar (Setembre a Juny)", resultatsCurs);
});

// =========================================
// 🌙 LÒGICA DE L'ECO-MODE (DARK MODE)
// =========================================
const ecoBtn = document.getElementById('eco-toggle');
const body = document.body;

// 1. Comprovar si l'usuari ja tenia l'Eco-Mode guardat al navegador
if (localStorage.getItem('ecoMode') === 'enabled') {
    body.classList.add('eco-mode');
    ecoBtn.innerHTML = '☀️ Normal Mode';
}

// 2. Afegir l'esdeveniment de clic al botó
ecoBtn.addEventListener('click', () => {
    // Activa o desactiva la classe 'eco-mode' al <body>
    body.classList.toggle('eco-mode');

    // Comprova l'estat actual i guarda'l al localStorage
    if (body.classList.contains('eco-mode')) {
        localStorage.setItem('ecoMode', 'enabled');
        ecoBtn.innerHTML = '☀️ Normal Mode';
    } else {
        localStorage.setItem('ecoMode', 'disabled');
        ecoBtn.innerHTML = '🌙 Eco-Mode';
    }
});