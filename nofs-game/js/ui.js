// ============================================
// UI RENDERING FUNCTIONS
// All screen generation and display logic
// ============================================

let game = null;
let isProcessing = false; // Hardening: Prevents double-clicks/ghost actions
let hasAgreedToTerms = false; // Hardening: Persists agreement state across renders
const selectedConditions = new Set();

/**
 * Hardening: Wrapper for all game actions to prevent 
 * state desync during processing.
 */
async function handleAction(actionFn) {
    if (isProcessing) return;
    isProcessing = true;
    try {
        await actionFn();
    } catch (e) {
        console.error("Game Action Error:", e);
    } finally {
        isProcessing = false;
        render();
    }
}

// Generate the setup/welcome screen
function setupScreen() {
    let themeOptions = '';
    for (const [id, theme] of Object.entries(THEME_REGISTRY)) {
        themeOptions += `<option value="${id}" ${id === AppConfig.currentThemeId ? 'selected' : ''}>${theme.name}</option>`;
    }

    const themeSelector = `
        <div class="theme-selector">
            <label for="theme-select">Current Theme:</label>
            <select id="theme-select" onchange="handleAction(() => changeTheme(this.value))">
                ${themeOptions}
            </select>
        </div>
    `;

    return `
        <div class="setup-screen">
            ${themeSelector} 
            
            <h2 style="color: var(--brand);">🎮 NO Fs TO GIVE</h2>

            <p>Select a Game Mode:</p>
            <div class="mode-select">
                <button class="condition-option ${game?.mode === 'day' ? 'selected' : ''}" onclick="selectMode('day')">
                    <h3>Single Day</h3>
                    <p>A quick 4-turn game.</p>
                </button>
                <button class="condition-option ${game?.mode === 'week' || !game ? 'selected' : ''}" onclick="selectMode('week')">
                    <h3>Full Week</h3>
                    <p>Standard 7-day challenge.</p>
                </button>
                <button class="condition-option ${game?.mode === 'life' ? 'selected' : ''}" onclick="selectMode('life')">
                    <h3>Life Mode</h3>
                    <p>Survive as long as possible.</p>
                </button>
            </div>

            <p>Select Conditions (Willpower vs. Wiring):</p>
            <div class="condition-select">
                ${Object.entries(AppConfig.rules.conditionDetails).map(([key, details]) => `
                    <div class="condition-option ${selectedConditions.has(key) ? 'selected' : ''}" 
                         onclick="toggleCondition('${key}')" id="cond-${key}">
                        <h3>${details.name}</h3>
                        <p>${details.rule}</p>
                    </div>
                `).join('')}
            </div>
            
            <div class="rules">
                <h3>Rules of Play</h3>
                <ul>
                    ${AppConfig.rules.rulesOfPlay.map(rule => `<li>${rule}</li>`).join('')}
                </ul>
            </div>

            <div class="agreement">
                <input type="checkbox" id="agreementCheckbox" ${hasAgreedToTerms ? 'checked' : ''} 
                       onclick="hasAgreedToTerms = this.checked; render();">
                <label for="agreementCheckbox">
                    I acknowledge that "No Fs TO GIVE" and all NOFNWAY branding are proprietary intellectual property. 
                </label>
            </div>

            <div class="buttons">
                <button onclick="handleAction(startGame)" id="startButton" ${!hasAgreedToTerms ? 'disabled' : ''}>START GAME</button>
            </div>
        </div>
    `;
}

// Generate the game over screen
function gameOverScreen() {
    let title = 'GAME OVER';
    if (game.message.includes('Fantastic!')) title = '🎉 Fantastic! (A+)';
    else if (game.message.includes('Great Job!')) title = '👍 Great Job! (B)';
    else if (game.message.includes('Survived')) title = '😓 You Survived. (C)';
    else if (game.message.includes('Overwhelmed')) title = '💔 Overwhelmed. (D)';
    else if (game.message.includes('BURNOUT')) title = '😡 BURNOUT';

    return `
        <div class="game-over">
            <h2>${title}</h2>
            <p style="margin-top: 20px;">${game.message}</p>
            <p><strong>Final Stress:</strong> ${game.stress}</p>
            
            <div class="buttons" style="justify-content: center; margin-top: 30px;">
                <button onclick="handleAction(resetGame)">🔄 Play Again</button>
                <button class="secondary" onclick="game = null; render();">⚙️ Settings</button>
            </div>
        </div>
    `;
}

// Generate the main game screen
function gameScreen() {
    // Hardening: Handle Life Mode Day Count
    let dayText = game.mode === 'day' ? "Day 1/1" : game.mode === 'week' ? `Day ${game.day}/7` : `Day ${game.day}`;
    let turnName = ["Morning", "Midday", "Afternoon", "Evening"][game.turn - 1] || "End of Day";
    
    const allTasksAttempted = game.currentTasks.length === 0;
    let headerStressClass = (game.burntOut || game.stress >= 5) ? 'stress-danger' : (game.stress >= 3 ? 'stress-warning' : '');

    /**
     * Scannability Fix: Added (xN) multipliers for faster ADHD processing.
     */
    const buildCostHtml = (cost, modifiedCost) => {
        const icons = { physical: '⚡', social: '👥', mental: '🧠' };
        
        const renderGroup = (c) => {
            return Object.entries(icons)
                .map(([key, sym]) => c[key] > 0 ? `<span>${sym}<small>x${c[key]}</small></span>` : '')
                .join('') || '0';
        };

        const isModified = JSON.stringify(cost) !== JSON.stringify(modifiedCost);
        const base = renderGroup(cost);
        const mod = renderGroup(modifiedCost);

        return isModified ? `<span class="base-cost">${base}</span> → <span class="mod-cost">${mod}</span>` : `<span>${base}</span>`;
    };

    return `
        <div class="header ${game.burntOut ? 'burnt-out' : ''}">
            <h1>${dayText} - ${turnName}</h1>
            <div class="stats">
                <div class="stat"><strong>Done:</strong> ${game.completedTasks.length}</div>
                <div class="stat"><strong>Hand:</strong> ${game.hand.length}</div>
                <div class="stat ${headerStressClass}"><strong>Stress:</strong> ${game.stress}/7</div>
            </div>
        </div>
        
        ${game.message ? `<div class="message">${game.message}</div>` : ''}
        
        <div class="game-area">
            <div class="section">
                <h2>📋 Current Tasks</h2>
                <div class="task-card-area">
                    ${game.currentTasks.map((task, i) => {
                        const isSelected = game.selectedTask === i;
                        const modCost = game.getModifiedCost(task);
                        const taskData = AppConfig.tasks.find(t => t.name === task.name) || { flavor: "N/A" };
                        return `
                        <div class="card task-card ${isSelected ? 'selected' : ''}" onclick="handleAction(() => selectTask(${i}))">
                            <div class="card-header">
                                <div class="card-title">${task.name}</div>
                                <div class="card-cost">${buildCostHtml(task.cost, modCost)}</div>
                            </div>
                            <div class="card-content-middle">
                                <div class="card-time">${task.time}</div>
                                <div class="card-flavor">"${taskData.flavor}"</div>
                            </div>
                            ${task.effect ? `<div class="card-effect">${task.effect.text}</div>` : ''}
                        </div>`;
                    }).join('')}
                </div>
            </div>
            
            <div class="section">
                <h2>🃏 Your Hand</h2>
                <div class="f-card-area">
                    ${game.hand.map((card, i) => {
                        const isSelected = game.selectedCards.includes(i);
                        let sym = card.type === 'physical' ? '⚡' : card.type === 'social' ? '👥' : '🧠';
                        return `
                        <div class="card f-card ${card.type} ${isSelected ? 'selected' : ''}" onclick="handleAction(() => selectCard(${i}))">
                            <div class="f-card-symbol">${sym}</div>
                            <div class="f-card-label">${card.type.toUpperCase()}</div>
                        </div>`;
                    }).join('')}
                </div>
                
                <div class="buttons">
                    <button onclick="handleAction(attemptTask)" ${game.selectedTask === null || allTasksAttempted || game.selectedCards.length === 0 ? 'disabled' : ''}>✅ Complete</button>
                    <button class="secondary" onclick="handleAction(skipTask)" ${game.selectedTask === null || allTasksAttempted ? 'disabled' : ''}>⏭️ Skip</button>
                    <button class="secondary" onclick="handleAction(endTurn)">⏩ End Turn</button>
                </div>
            </div>
        </div>
    `;
}

// Main render function
function render() {
    const app = document.getElementById('app');
    if (!app) return; 

    // Hardening: Explicit Error Check
    if (!AppConfig || !AppConfig.rules || !AppConfig.tasks) {
        app.innerHTML = `<div class="error-screen"><h2>Critical Error</h2><p>AppConfig data is missing or corrupted.</p></div>`;
        return;
    }

    if (!game) {
        app.innerHTML = setupScreen();
        return;
    }
    
    // Hardening: Ensure game over logic doesn't hide the board entirely if needed
    app.innerHTML = game.gameOver ? gameOverScreen() + gameScreen() : gameScreen();
}
