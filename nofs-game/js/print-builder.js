// ============================================
// PRINT & PLAY BUILDER SCRIPT
// Automatically builds print sheets from TASK_DATA
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('print-sheets');
    if (!container) return;

    // --- Helper to build cost HTML (Simplified for print) ---
    // This only shows the BASE cost
    const buildCostHtml = (cost) => {
        const p = cost.physical || 0;
        const s = cost.social || 0;
        const m = cost.mental || 0;

        let baseHtml = `
            ${p > 0 ? '⚡'.repeat(p) : ''}
            ${s > 0 ? '👥'.repeat(s) : ''}
            ${m > 0 ? '🧠'.repeat(m) : ''}
        `;
        if (baseHtml.trim() === '') baseHtml = '0'; 
        return `<span>${baseHtml}</span>`;
    };

    // --- Helper to build a single card's HTML ---
    const buildTaskCardHtml = (task) => {
        return `
        <div class="card task-card" style="background-image: url('${task.image}')">
            <div class="card-header">
                <div class="card-title">${task.name}</div>
                <div class="card-cost">${buildCostHtml(task.cost)}</div>
            </div>
            <div class="card-content-middle">
                <div class="card-time">${task.time}</div>
                ${task.flavor ? `<div class="card-flavor">"${task.flavor}"</div>` : ''}
            </div>
            ${task.effect ? `<div class="card-effect">${task.effect.text}</div>` : ''}
        </div>`;
    };

    // === 1. Build F-Card Sheet ===
    let fCardPage = document.createElement('div');
    fCardPage.className = 'print-page';
    
    const fCards = [
        { type: 'physical', symbol: '⚡' },
        { type: 'social', symbol: '👥' },
        { type: 'mental', symbol: '🧠' }
    ];

    fCards.forEach(card => {
        // Add 3 copies of each F-Card to fill the first 9 slots
        for (let i=0; i < 3; i++) {
            fCardPage.innerHTML += `
            <div class="card f-card ${card.type}" 
                 style="background-image: url('assets/images/f_cards/${card.type}.png')">
                <div class="f-card-symbol">${card.symbol}</div>
                <div class="f-card-label">${card.type.toUpperCase()} F</div>
            </div>`;
        }
    });
    container.appendChild(fCardPage);

    // === 2. Build Task Card Sheets ===
    let allTasks = [...TASK_DATA];
    let pageCount = 0;
    let currentPage = null;

    allTasks.forEach((task, index) => {
        // Create a new page every 9 cards
        if (index % 9 === 0) {
            pageCount++;
            currentPage = document.createElement('div');
            currentPage.className = 'print-page';
            container.appendChild(currentPage);
        }
        currentPage.innerHTML += buildTaskCardHtml(task);
    });
    
    // Fill in any blank spots on the last page
    while (currentPage.childElementCount < 9) {
        currentPage.innerHTML += '<div></div>'; // Empty div
    }


    // === 3. Build Card Back Sheet ===
    let backPage = document.createElement('div');
    backPage.className = 'print-page';
    for (let i = 0; i < 9; i++) {
        backPage.innerHTML += '<div class="card card-back"></div>';
    }
    container.appendChild(backPage);
});
