// Dades base ITB Leaks
const bases = {
    electricitat: 4500.5,
    aigua: 48.33,
    paper: 40,
    neteja: 120,
    manteniment: 50
};

// ESTRATÈGIES RUBRICA: Tendències i Cicles Estacionals
const estacionalitat = {
    electricitat: [1.1, 1.1, 1.0, 0.9, 0.9, 0.8, 0.3, 0.2, 0.9, 1.0, 1.1, 1.2],
    aigua:        [0.9, 0.9, 1.0, 1.1, 1.2, 1.4, 0.8, 0.1, 1.2, 1.0, 0.9, 0.9],
    paper:        [1.0, 1.0, 1.2, 1.0, 1.2, 1.5, 0.1, 0.0, 1.8, 1.1, 1.0, 1.0],
    neteja:       [1.0, 1.0, 1.0, 1.0, 1.0, 1.2, 0.3, 0.1, 1.4, 1.0, 1.0, 1.0],
    manteniment:  [1.0, 1.0, 1.0, 1.0, 1.0, 1.5, 0.5, 0.1, 1.2, 1.0, 1.0, 1.0]
};

function calcularConsum(mesosActius) {
    let totals = { electricitat: 0, aigua: 0, paper: 0, neteja: 0, manteniment: 0 };

    // Càlcul base del consum D'UN SOL ANY (o període) aplicant l'estacionalitat
    for (let i = 0; i < 12; i++) {
        if (mesosActius.includes(i)) {
            totals.electricitat += bases.electricitat * estacionalitat.electricitat[i];
            totals.aigua += bases.aigua * estacionalitat.aigua[i];
            totals.paper += bases.paper * estacionalitat.paper[i];
            totals.neteja += bases.neteja * estacionalitat.neteja[i];
            totals.manteniment += bases.manteniment * estacionalitat.manteniment[i];
        }
    }

    // Com molt bé has deduït, JA NO MULTIPLIQUEM. Ens quedem amb el consum d'AQUELL any.
    return totals;
}

function mostrarResultats(titol, totals) {
    const divResultats = document.getElementById('results');
    const selectAnys = document.getElementById('input-years');
    const seleccioText = selectAnys.options[selectAnys.selectedIndex].text;
    const numYears = parseInt(selectAnys.value);

    let descompte = 0;
    if (numYears === 1) descompte = 0.10;
    else if (numYears === 2) descompte = 0.20;
    else if (numYears >= 3) descompte = 0.30;

    const textPercentatge = `-${descompte * 100}%`;

    divResultats.innerHTML = `<h3 style="width: 100%; grid-column: 1 / -1; margin-bottom: 15px; color: var(--primary-green); border-bottom: 2px dashed var(--light-green);">
        Resultats d'aquell any (${titol}) - ${seleccioText.replace('👉 ', '').replace('⭐ ', '')}
    </h3>`;
    divResultats.classList.remove('hidden');

    // Els detalls EXACTES de les factures ITB Leaks
    const dadesMostrar = [
        { nom: '⚡ Consum Elèctric', valor: totals.electricitat, unitat: 'kWh', detalls: "Consum aules informàtica, servidors i inversors solars (Plant Report)." },
        { nom: '💧 Consum d\'Aigua', valor: totals.aigua, unitat: 'm³', detalls: "Consum instal·lacions, lavabos i neteja (Aigües de Barcelona)." },
        { nom: '📄 Consumibles d\'Oficina', valor: totals.paper, unitat: 'paquets', detalls: "Paper Navigator A4, Marcadors Pilot Begreen i esborradors Faibo (Lyreco)." },
        { nom: '🧴 Productes Neteja', valor: totals.neteja, unitat: 'unitats', detalls: "Rotlles industrials secamans, Gel WC, lleixiu i bosses escombraries." },
        { nom: '🖥️ Manteniment (RAEE)', valor: totals.manteniment, unitat: 'kg', detalls: "Renovació equips (Discs SSD NVMe, RAM) i reciclatge de peces desclassificades." }
    ];

    dadesMostrar.forEach(dada => {
        const valorMillorat = dada.valor * (1 - descompte);

        divResultats.innerHTML += `
            <div class="result-item" style="padding: 15px; border: 1px solid var(--accent-green); border-radius: 8px; background: #fafafa; display: flex; flex-direction: column;">
                <h4 style="font-size: 1rem;">${dada.nom}</h4>
                <p style="margin-bottom: 5px;">Sense Pla IT: <br><strong>${dada.valor.toFixed(1)} ${dada.unitat}</strong></p>
                
                <details class="desglossament" style="margin-bottom: 10px;">
                    <summary>ℹ️ Què s'està calculant?</summary>
                    <ul style="list-style-type: disc;">
                        <li>${dada.detalls}</li>
                    </ul>
                </details>

                <div style="margin-top: auto; padding: 10px; background: #e8f5e9; border: 1px solid var(--primary-green); border-radius: 5px;">
                    <small>Amb Pla IT (${textPercentatge}):</small><br>
                    <strong style="color: var(--primary-green); font-size: 1.1rem;">${valorMillorat.toFixed(1)} ${dada.unitat}</strong>
                </div>
            </div>
        `;
    });
}

// Botó: Any Sencer
document.getElementById('btn-year').addEventListener('click', () => {
    const mesosAny = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    const resultatsAny = calcularConsum(mesosAny);
    mostrarResultats(`Any Complet`, resultatsAny);
});

// Botó: Curs Escolar
document.getElementById('btn-course').addEventListener('click', () => {
    const mesosCurs = [8, 9, 10, 11, 0, 1, 2, 3, 4, 5];
    const resultatsCurs = calcularConsum(mesosCurs);
    mostrarResultats(`Període Set. a Juny`, resultatsCurs);
});

// LÒGICA ECO-MODE
const ecoBtn = document.getElementById('eco-toggle');
const body = document.body;

if (localStorage.getItem('ecoMode') === 'enabled') {
    body.classList.add('eco-mode');
    ecoBtn.innerHTML = '☀️ Mode Normal';
}

ecoBtn.addEventListener('click', () => {
    body.classList.toggle('eco-mode');
    if (body.classList.contains('eco-mode')) {
        localStorage.setItem('ecoMode', 'enabled');
        ecoBtn.innerHTML = '☀️ Mode Normal';
    } else {
        localStorage.setItem('ecoMode', 'disabled');
        ecoBtn.innerHTML = '🌙 Eco-Mode';
    }
});