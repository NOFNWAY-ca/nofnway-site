// ============================================
// UI RENDERING FUNCTIONS
// All screen generation and display logic
// ============================================

let game = null;
const selectedConditions = new Set();

// Generate the setup/welcome screen
function setupScreen() {
    
    let themeOptions = '';
    for (const [id, theme] of Object.entries(THEME_REGISTRY)) {
        themeOptions += `<option value="${id}" ${id === AppConfig.currentThemeId ? 'selected' : ''}>${theme.name}</option>`;
    }
    const themeSelector = `
        <div class="theme-selector">
            <label for="theme-select">Current Theme:</label>
            <select id="theme-select" onchange="changeTheme(this.value)">
                ${themeOptions}
            </select>
        </div>
    `;

    return `
        <div class="setup-screen">
            ${themeSelector} 
            
            <h2 style="color: var(--brand);">🎮 No Fs TO GIVE</h2>

            <p>Select a Game Mode:</p>
            <div class="mode-select">
                <button class="condition-option" id="mode-day" onclick="selectMode('day')">
                    <h3>Single Day</h3>
                    <p>A quick 4-turn game.</p>
                </button>
                <button class="condition-option selected" id="mode-week" onclick="selectMode('week')">
                    <h3>Full Week</h3>
                    <p>The standard 7-day (28-turn) challenge.</p>
                </button>
                <button class="condition-option" id="mode-life" onclick="selectMode('life')">
                    <h3>Life Mode</h3>
                    <p>Survive for as many days as you can.</p>
                </button>
            </div>

            <p>Select conditions (Willpower vs. Wiring):</p>
            
            <div class="condition-select">
                <div class="condition-option" onclick="toggleCondition('depression')" id="cond-depression">
                    <h3>${AppConfig.rules.conditionDetails.depression.name}</h3>
                    <p>${AppConfig.rules.conditionDetails.depression.rule}</p>
                </div>
                <div class="condition-option" onclick="toggleCondition('adhd')" id="cond-adhd">
                    <h3>${AppConfig.rules.conditionDetails.adhd.name}</h3>
                    <p>${AppConfig.rules.conditionDetails.adhd.rule}</p>
                </div>
                <div class="condition-option" onclick="toggleCondition('anxiety')" id="cond-anxiety">
                    <h3>${AppConfig.rules.conditionDetails.anxiety.name}</h3>
                    <p>${AppConfig.rules.conditionDetails.anxiety.rule}</p>
                </div>
                <div class="condition-option" onclick="toggleCondition('execDys')" id="cond-execDys">
                    <h3>${AppConfig.rules.conditionDetails.execDys.name}</h3>
                    <p>${AppConfig.rules.conditionDetails.execDys.rule}</p>
                </div>
                <div class="condition-option" onclick="toggleCondition('dyslexia')" id="cond-dyslexia">
                    <h3>${AppConfig.rules.conditionDetails.dyslexia.name}</h3>
                    <p>${AppConfig.rules.conditionDetails.dyslexia.rule}</p>
                </div>
                <div class="condition-option" onclick="toggleCondition('asd')" id="cond-asd">
                    <h3>${AppConfig.rules.conditionDetails.asd.name}</h3>
                    <p>${AppConfig.rules.conditionDetails.asd.rule}</p>
                </div>
            </div>
            
            <div class="rules">
                <h3>Rules of Play</h3>
                <ul>
                    ${AppConfig.rules.rulesOfPlay.map(rule => `<li>${rule}</li>`).join('')}
                </ul>
            </div>

            <div class="agreement">
                <input type="checkbox" id="agreementCheckbox" onclick="checkAgreement()">
                <label for="agreementCheckbox">
                    I acknowledge that "No Fs TO GIVE" and all NOFNWAY branding are proprietary intellectual property. 
                </label>
            </div>

            <div class="buttons">
                <button onclick="startGame()" id="startButton" disabled>START GAME</button>
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
                <button onclick="resetGame()">🔄 Play Again</button>
                <button class="secondary" onclick="game = null; render();">⚙️ Settings</button>
            </div>
        </div>
    `;
}

// Generate the main game screen
function gameScreen() {
    let dayText = game.mode === 'day' ? "Day 1/1" : game.mode === 'week' ? `Day ${game.day}/7` : `Day ${game.day}`;
    let turnName = ["Morning", "Midday", "Afternoon", "Evening"][game.turn - 1];
    
    const allTasksAttempted = game.currentTasks.length === 0;
    let headerStressClass = game.burntOut || game.stress >= 5 ? 'stress-danger' : game.stress >= 3 ? 'stress-warning' : '';

    const buildCostHtml = (cost, modifiedCost) => {
        const p = cost.physical || 0, s = cost.social || 0, m = cost.mental || 0;
        const mp = modifiedCost.physical || 0, ms = modifiedCost.social || 0, mm = modifiedCost.mental || 0;
        const isModified = (p !== mp) || (s !== ms) || (m !== mm);

        let base = `${p > 0 ? '⚡'.repeat(p) : ''}${s > 0 ? '👥'.repeat(s) : ''}${m > 0 ? '🧠'.repeat(m) : ''}`;
        if (base === '') base = '0'; 

        let mod = `${mp > 0 ? '⚡'.repeat(mp) : ''}${ms > 0 ? '👥'.repeat(ms) : ''}${mm > 0 ? '🧠'.repeat(mm) : ''}`;
        if (mod === '') mod = '0';

        return isModified ? `<span class="base-cost">${base}</span> → <span class="mod-cost">${mod}</span>` : `<span>${base}</span>`;
    };

    return `
        <div class="header ${game.burntOut ? 'burnt-out' : ''}">
            <h1>${dayText} - ${turnName}</h1>
            <div class="stats">
                <div class="stat"><strong>Completed:</strong> ${game.completedTasks.length}</div>
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
                        const taskData = AppConfig.tasks.find(t => t.name === task.name);
                        return `
                        <div class="card task-card ${isSelected ? 'selected' : ''}" onclick="selectTask(${i})">
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
                        <div class="card f-card ${card.type} ${isSelected ? 'selected' : ''}" onclick="selectCard(${i})">
                            <div class="f-card-symbol">${sym}</div>
                            <div class="f-card-label">${card.type.toUpperCase()}</div>
                        </div>`;
                    }).join('')}
                </div>
                
                <div class="buttons">
                    <button onclick="attemptTask()" ${game.selectedTask === null || allTasksAttempted || game.selectedCards.length === 0 ? 'disabled' : ''}>✅ Complete</button>
                    <button class="secondary" onclick="skipTask()" ${game.selectedTask === null || allTasksAttempted ? 'disabled' : ''}>⏭️ Skip</button>
                    <button class="secondary" onclick="endTurn()">⏩ End Turn</button>
                </div>
            </div>
        </div>
    `;
}

// Main render function
function render() {
    const app = document.getElementById('app');
    if (!app) return; 

    if (!AppConfig.rules || !AppConfig.tasks) {
        app.innerHTML = `<h2>Loading...</h2>`;
        return;
    }

    if (!game) {
        app.innerHTML = setupScreen();
        return;
    }
    
    app.innerHTML = game.gameOver ? gameOverScreen() + gameScreen() : gameScreen();
}
