// ============================================
// PRINT & PLAY BUILDER SCRIPT
// Automatically builds print sheets from TASK_DATA
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('print-sheets');
    if (!container) return;

    // --- Time slot → CSS class ---
    const timeClass = {
        'Morning':   't-morning',
        'Midday':    't-midday',
        'Afternoon': 't-afternoon',
        'Evening':   't-evening'
    };

    // --- Cost pips HTML ---
    const buildCostHtml = (cost) => {
        const pips = [
            { key: 'physical', sym: '⚡' },
            { key: 'social',   sym: '👥' },
            { key: 'mental',   sym: '🧠' }
        ];
        const html = pips
            .filter(p => cost[p.key] > 0)
            .map(p => `<span class="cost-pip ${p.key}">${p.sym} ×${cost[p.key]}</span>`)
            .join('');
        return html || '<span class="cost-pip">0</span>';
    };

    // --- Single task card HTML ---
    const buildTaskCardHtml = (task) => {
        const tc = timeClass[task.time] || '';
        return `
        <div class="card task-card ${tc}">
            <div class="time-stripe"></div>
            <div class="card-body">
                <div class="card-name">${task.name}</div>
                <div class="card-meta">
                    <div class="card-cost">${buildCostHtml(task.cost)}</div>
                    <span class="time-badge">${task.time}</span>
                </div>
                <div class="divider"></div>
                ${task.flavor ? `<div class="card-flavor">"${task.flavor}"</div>` : ''}
            </div>
            ${task.effect ? `<div class="card-effect">${task.effect.text}</div>` : ''}
            <div class="card-footer"><span class="nofn-watermark">NOFNWAY</span></div>
        </div>`;
    };

    // === 1. F-Card Sheet ===
    const fCardPage = document.createElement('div');
    fCardPage.className = 'print-page';

    const fCards = [
        { type: 'physical', symbol: '⚡', label: 'Physical', desc: 'Spend to complete tasks with physical cost' },
        { type: 'social',   symbol: '👥', label: 'Social',   desc: 'Spend to complete tasks with social cost'   },
        { type: 'mental',   symbol: '🧠', label: 'Mental',   desc: 'Spend to complete tasks with mental cost'   }
    ];

    fCards.forEach(card => {
        for (let i = 0; i < 3; i++) {
            fCardPage.innerHTML += `
            <div class="card f-card ${card.type}">
                <div class="f-stripe"></div>
                <div class="f-body">
                    <div class="f-icon-wrap"><span class="f-icon">${card.symbol}</span></div>
                    <div class="f-type">${card.label}</div>
                    <div class="f-desc">${card.desc}</div>
                </div>
                <div class="f-footer">
                    <span class="f-count">×3 in deck</span>
                    <span class="nofn-watermark">NOFNWAY</span>
                </div>
            </div>`;
        }
    });
    container.appendChild(fCardPage);

    // === 2. Task Card Sheets (9 per page) ===
    let currentPage = null;
    TASK_DATA.forEach((task, index) => {
        if (index % 9 === 0) {
            currentPage = document.createElement('div');
            currentPage.className = 'print-page';
            container.appendChild(currentPage);
        }
        currentPage.innerHTML += buildTaskCardHtml(task);
    });

    // Fill any blank spots on the last page
    while (currentPage && currentPage.childElementCount < 9) {
        currentPage.innerHTML += '<div></div>';
    }

    // === 3. Task Card Back Sheet ===
    const backPage = document.createElement('div');
    backPage.className = 'print-page';
    for (let i = 0; i < 9; i++) {
        backPage.innerHTML += `
        <div class="card card-back">
            <div class="back-frame"></div>
            <div class="back-content">
                <div class="back-eyebrow">NOFNWAY</div>
                <div class="back-divider"></div>
                <div class="back-no">NO</div>
                <div class="back-fs">Fs TO</div>
                <div class="back-to-give">GIVE</div>
                <div class="back-divider"></div>
                <div class="back-tagline">Willpower vs. Wiring</div>
            </div>
        </div>`;
    }
    container.appendChild(backPage);

    // === 4. F-Card Back Sheet ===
    const fBackPage = document.createElement('div');
    fBackPage.className = 'print-page';
    for (let i = 0; i < 9; i++) {
        fBackPage.innerHTML += `
        <div class="card f-card-back">
            <div class="back-frame"></div>
            <div class="f-back-content">
                <div class="f-back-letter">F</div>
                <div class="f-back-label">NOFNWAY</div>
            </div>
        </div>`;
    }
    container.appendChild(fBackPage);
});
