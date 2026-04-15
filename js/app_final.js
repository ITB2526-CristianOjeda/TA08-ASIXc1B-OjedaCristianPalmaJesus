// 1. Dades base ITB Leaks (Solo lo que genera gasto real)
const bases = {
    electricitat: 4500.5,
    aigua: 48.33,
    paper: 155.50,
    neteja: 415.20
};

const estacionalitat = {
    electricitat: [1.1, 1.1, 1.0, 0.9, 0.9, 0.8, 0.3, 0.2, 0.9, 1.0, 1.1, 1.2],
    aigua:        [0.9, 0.9, 1.0, 1.1, 1.2, 1.4, 0.8, 0.1, 1.2, 1.0, 0.9, 0.9],
    paper:        [1.0, 1.0, 1.2, 1.0, 1.2, 1.5, 0.1, 0.0, 1.8, 1.1, 1.0, 1.0],
    neteja:       [1.0, 1.0, 1.0, 1.0, 1.0, 1.2, 0.3, 0.1, 1.4, 1.0, 1.0, 1.0]
};

function formatearParaPantalla(numero) {
    return numero.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function calcularConsum(mesosActius) {
    let totals = { electricitat: 0, aigua: 0, paper: 0, neteja: 0 };
    for (let i = 0; i < 12; i++) {
        if (mesosActius.includes(i)) {
            totals.electricitat += bases.electricitat * estacionalitat.electricitat[i];
            totals.aigua += bases.aigua * estacionalitat.aigua[i];
            totals.paper += bases.paper * estacionalitat.paper[i];
            totals.neteja += bases.neteja * estacionalitat.neteja[i];
        }
    }
    return totals;
}

function mostrarResultats(periodo, totals) {
    const divResultats = document.getElementById('results');
    const anysSeleccionats = parseInt(document.getElementById('input-years').value);

    let descompte = 0;
    let textPercentatge = "0%";
    if (anysSeleccionats === 1) { descompte = 0.10; textPercentatge = "-10%"; }
    else if (anysSeleccionats === 2) { descompte = 0.20; textPercentatge = "-20%"; }
    else if (anysSeleccionats >= 3) { descompte = 0.30; textPercentatge = "-30%"; }

    divResultats.innerHTML = `<h3 style="grid-column: 1/-1; border-bottom: 2px solid var(--accent-green); padding-bottom: 10px;">Resultados para: ${periodo}</h3>`;
    divResultats.classList.remove('hidden');

    const dadesMostrar = [
        {
            nom: '<i class="ph ph-lightning"></i> Consumo Eléctrico',
            valor: totals.electricitat,
            unitat: 'kWh',
            detalls: "<li>Consumo aulas informática y servidores.</li><li>Datos de los inversores fotovoltaicos (Plant Report).</li>"
        },
        {
            nom: '<i class="ph ph-drop"></i> Consumo de Agua',
            valor: totals.aigua,
            unitat: 'm³',
            detalls: "<li>Consumo de instalaciones (Aguas de BCN).</li><li>Lavabos y servicio general de limpieza.</li>"
        },
        {
            nom: '<i class="ph ph-copy"></i> Gastos de Oficina',
            valor: totals.paper,
            unitat: '€',
            detalls: "<li>Media de 22,5 paq. papel (rango 15-30).</li><li>Marcadores Pilot Begreen.</li><li>Borradores Faibo y Recambios.</li>"
        },
        {
            nom: '<i class="ph ph-spray-bottle"></i> Gastos de Limpieza',
            valor: totals.neteja,
            unitat: '€',
            detalls: "<li>120 Rollos secamanos industriales.</li><li>Gel WC y Lejía limpiadora.</li><li>Bolsas de basura grandes.</li><li style='margin-top: 5px; list-style: none; color: var(--text-muted);'><small><i>*No incluye los 1.400€ del personal.</i></small></li>"
        }
    ];

    dadesMostrar.forEach(dada => {
        const valorMillorat = dada.valor * (1 - descompte);
        const textoSinPlan = formatearParaPantalla(dada.valor);
        const textoConPlan = formatearParaPantalla(valorMillorat);

        divResultats.innerHTML += `
            <div class="result-item" style="padding: 15px; border: 1px solid var(--accent-green); border-radius: 8px; background: var(--surface-color); display: flex; flex-direction: column;">
                <h4 style="font-size: 1rem;">${dada.nom}</h4>
                <p style="margin-bottom: 5px;">Sin Plan IT: <br><strong>${textoSinPlan} ${dada.unitat}</strong></p>
                
                <details class="desglossament" style="margin-bottom: 10px;">
                    <summary><i class="ph ph-info"></i> Desglose de elementos</summary>
                    <ul style="list-style-type: disc; padding-left: 20px; font-size: 0.85rem; margin-top: 5px;">
                        ${dada.detalls}
                    </ul>
                </details>

                <div style="margin-top: auto; padding: 10px; background: var(--light-green); border: 1px solid var(--primary-green); border-radius: 5px;">
                    <small>Con Plan IT (${textPercentatge}):</small><br>
                    <strong style="color: var(--primary-green); font-size: 1.1rem;">${textoConPlan} ${dada.unitat}</strong>
                </div>
            </div>
        `;
    });
}

// Botones y Eco-mode se mantienen igual...
document.getElementById('btn-year').addEventListener('click', () => {
    mostrarResultats(`Año Completo`, calcularConsum([0,1,2,3,4,5,6,7,8,9,10,11]));
});

document.getElementById('btn-course').addEventListener('click', () => {
    mostrarResultats(`Curso Escolar (Sep-Jun)`, calcularConsum([8,9,10,11,0,1,2,3,4,5]));
});

const ecoBtn = document.getElementById('eco-toggle');
ecoBtn.addEventListener('click', () => {
    document.body.classList.toggle('eco-mode');
    ecoBtn.innerHTML = document.body.classList.contains('eco-mode') ? '☀️ Modo Normal' : '🌙 Modo Eco';
});