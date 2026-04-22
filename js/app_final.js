/* =========================================
   1. CONFIGURACIÓN Y DATOS BASE
   ========================================= */
const BASE_DATA = {
    elec:   { val: 54000, unit: 'kWh', name: 'Electricidad', color: '#f59e0b', costPerUnit: 0.16 },
    aigua:  { val: 576,   unit: 'm³',  name: 'Agua', color: '#3b82f6', costPerUnit: 2.15 },
    paper:  { val: 1866,  unit: '€',   name: 'Oficina', color: '#10b981', costPerUnit: 1 },
    neteja: { val: 4982.4,unit: '€',   name: 'Limpieza', color: '#8b5cf6', costPerUnit: 1 }
};

const ACTIONS = [
    { id: 'e1', cat: 'elec', label: 'Iluminación LED + Sensores', savings: 0.15 },
    { id: 'e2', cat: 'elec', label: 'Instalación Placas Solares', savings: 0.40 },
    { id: 'e3', cat: 'elec', label: 'GPOs: Apagado Automático', savings: 0.10 },
    { id: 'a1', cat: 'aigua', label: 'Sensores en grifos', savings: 0.15 },
    { id: 'a2', cat: 'aigua', label: 'Optimización y cisternas', savings: 0.15 },
    { id: 'p1', cat: 'paper', label: 'Cultura "Zero Paper"', savings: 0.20 },
    { id: 'p2', cat: 'paper', label: 'Digitalización de Trámites', savings: 0.10 },
    { id: 'n1', cat: 'neteja', label: 'Optimización de servicios', savings: 0.20 },
    { id: 'n2', cat: 'neteja', label: 'Uso de químicos eco-concentrados', savings: 0.10 }
];

const YEARS_LABELS = ['Año Base (24-25)', 'Año 1 (25-26)', 'Año 2 (26-27)', 'Año 3 (27-28)'];
const PROGRESSION = [0, 0.333, 0.666, 1];

let currentTab = 'all';
let selectedActions = new Set(ACTIONS.map(a => a.id));
let chartInstance = null;
let previousValues = {};

/* =========================================
   2. ANIMACIONES
   ========================================= */
function animateValue(element, start, end, duration, decimals = 0) {
    if (!element) return;
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 4);
        const current = start + (end - start) * easeProgress;

        element.innerHTML = new Intl.NumberFormat('es-ES', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(current);

        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            element.parentElement.classList.remove('number-pop');
            void element.parentElement.offsetWidth;
            element.parentElement.classList.add('number-pop');
        }
    };
    window.requestAnimationFrame(step);
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('header').classList.add('animate-on-load');
    document.querySelector('.tabs').classList.add('animate-on-load', 'delay-1');
    document.querySelector('.dashboard-grid').classList.add('animate-on-load', 'delay-2');
    document.querySelector('.table-container').classList.add('animate-on-load', 'delay-3');
    document.querySelector('.summary-grid').classList.add('animate-on-load', 'delay-4');

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            currentTab = e.currentTarget.dataset.cat;
            renderActions();
            updateDashboard();
        });
    });

    renderActions();
    updateDashboard();
});

function renderActions() {
    const container = document.getElementById('actions-container');
    container.innerHTML = '';
    let visibleActions = currentTab !== 'all' ? ACTIONS.filter(a => a.cat === currentTab) : ACTIONS;

    if(visibleActions.length === 0) {
        container.innerHTML = `<p style="color:var(--text-secondary); font-size:0.9rem;">No hay acciones específicas para esta vista.</p>`;
        return;
    }

    visibleActions.forEach(action => {
        const isChecked = selectedActions.has(action.id);
        const div = document.createElement('label');
        div.className = `action-item ${isChecked ? 'active' : ''}`;
        div.innerHTML = `
            <input type="checkbox" value="${action.id}" ${isChecked ? 'checked' : ''}>
            <div class="action-info">
                <h4>${action.label}</h4>
                <p>Impacto potencial: <span class="action-badge">-${Math.round(action.savings * 100)}%</span></p>
            </div>
        `;

        const checkbox = div.querySelector('input');
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                selectedActions.add(action.id);
                div.classList.add('active');
            } else {
                selectedActions.delete(action.id);
                div.classList.remove('active');
            }
            updateDashboard();
        });
        container.appendChild(div);
    });
}

function getMaxSavingsForCategory(catKey) {
    return ACTIONS.filter(a => a.cat === catKey && selectedActions.has(a.id)).reduce((sum, a) => sum + a.savings, 0);
}

function getProjectionData(catKey) {
    let baseData = [0, 0, 0, 0];
    let projectedData = [0, 0, 0, 0];
    let unit = catKey === 'all' ? '€ (Coste Estimado)' : BASE_DATA[catKey].unit;

    if (catKey === 'all') {
        Object.keys(BASE_DATA).forEach(key => {
            const maxSavings = getMaxSavingsForCategory(key);
            const costBase = BASE_DATA[key].val * BASE_DATA[key].costPerUnit;
            for (let i = 0; i < 4; i++) {
                baseData[i] += costBase;
                projectedData[i] += costBase * (1 - (maxSavings * PROGRESSION[i]));
            }
        });
    } else {
        const maxSavings = getMaxSavingsForCategory(catKey);
        const baseValue = BASE_DATA[catKey].val;
        for (let i = 0; i < 4; i++) {
            baseData[i] = baseValue;
            projectedData[i] = baseValue * (1 - (maxSavings * PROGRESSION[i]));
        }
    }
    return { baseData, projectedData, unit };
}

const formatNum = (num, decimals = 0) => new Intl.NumberFormat('es-ES', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(num);

/* =========================================
   3. ACTUALIZACIÓN DEL DASHBOARD
   ========================================= */
function updateDashboard() {
    const { baseData, projectedData, unit } = getProjectionData(currentTab);
    document.getElementById('chart-unit-badge').innerText = `Métrica actual: ${unit}`;

    // Gráfica
    const ctx = document.getElementById('impactChart').getContext('2d');
    const color = currentTab === 'all' ? '#0ea5e9' : BASE_DATA[currentTab].color;

    if (chartInstance) chartInstance.destroy();
    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: YEARS_LABELS,
            datasets: [
                { label: '🔴 Sin Sostenibilidad (Baseline)', data: baseData, borderColor: '#ef4444', borderDash: [5, 5], borderWidth: 2, pointRadius: 4, fill: false, tension: 0.1 },
                { label: '🟢 Con Mejoras Aplicadas', data: projectedData, borderColor: color, backgroundColor: color + '20', borderWidth: 4, pointRadius: 6, pointBackgroundColor: '#fff', fill: true, tension: 0.4 }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false, animation: { duration: 1200, easing: 'easeOutQuart' }, interaction: { mode: 'index', intersect: false },
            plugins: { legend: { position: 'top', labels: { font: { family: 'Inter', size: 13 } } }, tooltip: { callbacks: { label: (context) => ` ${context.dataset.label}: ${formatNum(context.parsed.y, 1)} ${unit}` } } },
            scales: { y: { beginAtZero: true, grid: { color: 'rgba(150, 150, 150, 0.1)' } }, x: { grid: { display: false } } }
        }
    });

    // Tabla
    const tbody = document.getElementById('calculator-body');
    tbody.innerHTML = '';
    for (let i = 0; i < 4; i++) {
        const base = baseData[i]; const proj = projectedData[i]; const saved = base - proj; const percent = base > 0 ? (saved / base) * 100 : 0;
        tbody.innerHTML += `<tr>
            <td style="font-weight: 600; color: var(--text-primary);">${YEARS_LABELS[i]}</td>
            <td>${formatNum(base, 1)} <small>${unit}</small></td>
            <td class="td-highlight">${formatNum(proj, 1)} <small>${unit}</small></td>
            <td class="td-highlight" style="color: #10b981;">-${formatNum(saved, 1)} <small>${unit}</small></td>
            <td><span style="background: ${percent > 0 ? 'rgba(16,185,129,0.1)' : 'var(--bg-body)'}; color: ${percent > 0 ? '#10b981' : 'var(--text-secondary)'}; padding: 4px 8px; border-radius: 6px; font-weight: bold;">-${percent.toFixed(1)}%</span></td>
        </tr>`;
    }

    updateSummaryCards();
}

/* =========================================
   4. TARJETAS DE RESUMEN EXACTAS A LA IMAGEN
   ========================================= */
function updateSummaryCards() {
    const container = document.getElementById('summary-cards');
    const isFirstRender = container.innerHTML === '';
    const keys = ['elec', 'aigua', 'paper', 'neteja'];
    const icons = ['lightning', 'drop', 'copy', 'spray-bottle'];

    if (isFirstRender) {
        keys.forEach((key, index) => {
            container.innerHTML += `
                <div class="summary-card sc-${key}">
                    <div class="sc-header">
                        <h3>${BASE_DATA[key].name}</h3>
                        <i class="ph ph-${icons[index]} sc-icon" style="color: ${BASE_DATA[key].color}; font-size: 1.2rem; background: rgba(0,0,0,0.03); padding: 6px; border-radius: 6px;"></i>
                    </div>
                    <div class="sc-data">
                        <div class="sc-big-value" style="margin-bottom: 1.5rem;">
                            <span id="val-actual-${key}">0</span>
                            <span style="font-size:0.9rem; color:var(--text-secondary); font-weight: 500;">${BASE_DATA[key].unit}/año</span>
                        </div>

                        <div class="sc-row">
                            <span style="color: var(--text-secondary);">Proyección Año 3:</span>
                            <span class="sc-value"><span id="val-proj-${key}">0</span> ${BASE_DATA[key].unit}</span>
                        </div>
                        <div class="sc-row">
                            <span style="color: var(--text-secondary);">Ahorro Anual (Año 3):</span>
                            <span class="sc-value sc-green">-<span id="val-ahorro-anual-${key}">0</span> ${BASE_DATA[key].unit}</span>
                        </div>
                        <div class="sc-row" style="padding-top: 8px;">
                            <strong style="color: var(--text-primary);">Ahorro Total Acumulado<br>(3 años):</strong>
                            <strong class="sc-value sc-green" style="font-size: 1.1rem;">-<span id="val-saved-${key}">0</span> ${BASE_DATA[key].unit}</strong>
                        </div>
                    </div>
                </div>
            `;
        });
    }

    // Calcular y animar números
    keys.forEach(key => {
        const data = getProjectionData(key);
        const actual = data.baseData[0];
        const futuro = data.projectedData[3];
        const ahorroAnual = data.baseData[3] - data.projectedData[3];
        const ahorroAcumulado = (data.baseData[1] - data.projectedData[1]) + (data.baseData[2] - data.projectedData[2]) + (data.baseData[3] - data.projectedData[3]);

        const oldActual = previousValues[`actual_${key}`] || 0;
        const oldFuturo = previousValues[`proj_${key}`] || 0;
        const oldAhorroAnual = previousValues[`ahorro_anual_${key}`] || 0;
        const oldAhorroAcum = previousValues[`saved_${key}`] || 0;

        animateValue(document.getElementById(`val-actual-${key}`), oldActual, actual, 800, 0);
        animateValue(document.getElementById(`val-proj-${key}`), oldFuturo, futuro, 800, 0);
        animateValue(document.getElementById(`val-ahorro-anual-${key}`), oldAhorroAnual, ahorroAnual, 800, 0);
        animateValue(document.getElementById(`val-saved-${key}`), oldAhorroAcum, ahorroAcumulado, 800, 0);

        previousValues[`actual_${key}`] = actual;
        previousValues[`proj_${key}`] = futuro;
        previousValues[`ahorro_anual_${key}`] = ahorroAnual;
        previousValues[`saved_${key}`] = ahorroAcumulado;
    });
}

/* =========================================
   MODO OSCURO Y MASCOTA HOJA (Actualizado para F5)
   ========================================= */
// Esta variable se borra cada vez que recargas la página
let mascotShown = false;

function toggleTheme() {
    const html = document.documentElement;
    const icon = document.getElementById('theme-icon');
    const text = document.getElementById('theme-text'); // Solo existe en la calculadora

    // Comprobamos si estamos pasando a modo oscuro
    const isGoingDark = html.getAttribute('data-theme') === 'light';

    if (isGoingDark) {
        html.setAttribute('data-theme', 'dark');
        icon.className = 'ph ph-sun';
        if(text) text.innerText = 'Modo Claro';

        // LÓGICA DE LA MASCOTA HOJA
        if (!mascotShown) {
            const mascot = document.getElementById('leaf-mascot');
            if (mascot) {
                // Aparece con la animación saltarina
                mascot.classList.remove('hidden');

                // Guardamos en la variable temporal que ya la hemos visto
                mascotShown = true;

                // Desaparece sola a los 8 segundos
                setTimeout(() => {
                    mascot.classList.add('hidden');
                }, 15000);
            }
        }
    } else {
        html.setAttribute('data-theme', 'light');
        icon.className = 'ph ph-moon';
        if(text) text.innerText = 'Modo Oscuro';
    }

    // Actualizar los colores de la gráfica si estamos en la Calculadora
    if (typeof chartInstance !== 'undefined' && chartInstance) {
        const isDark = html.getAttribute('data-theme') === 'dark';
        const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
        const textColor = isDark ? '#94a3b8' : '#64748b';

        chartInstance.options.scales.x.ticks.color = textColor;
        chartInstance.options.scales.y.ticks.color = textColor;
        chartInstance.options.scales.y.grid.color = gridColor;
        chartInstance.options.plugins.legend.labels.color = textColor;
        chartInstance.update();
    }
}
// Hacer la función global por si acaso
window.toggleTheme = toggleTheme;