// ============================================
// UI RENDERING FUNCTIONS
// All screen generation and display logic
// ============================================

let game = null;
let isProcessing = false;
const selectedConditions = new Set();

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

// ----------------------------------------
// SETUP SCREEN
// ----------------------------------------

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
        </div>`;

    // Build condition cards — neurotypical first as a special "clear all" option
    const conditionCards = Object.entries(AppConfig.rules.conditionDetails).map(([key, details]) => {
        const isNeurotypical = key === 'neurotypical';
        const isSelected = isNeurotypical
            ? selectedConditions.size === 0
            : selectedConditions.has(key);

        const clickHandler = isNeurotypical
            ? `onclick="clearConditions()"`
            : `onclick="toggleCondition('${key}')"`;

        return `
            <div class="condition-option ${isSelected ? 'selected' : ''}" id="cond-${key}" ${clickHandler}>
                <h3>${details.name}</h3>
                ${details.penalty ? `<p class="condition-penalty">⚠️ ${details.penalty}</p>` : ''}
                ${details.positive ? `<p class="condition-positive">✨ ${details.positive}</p>` : ''}
            </div>`;
    }).join('');

    return `
        <div class="setup-screen">
            ${themeSelector}

            <h2 style="color: var(--brand);">🎮 NO Fs TO GIVE</h2>

            <p>Select a Game Mode:</p>
            <div class="mode-select">
                <button class="condition-option ${selectedMode === 'day'  ? 'selected' : ''}" onclick="selectMode('day')">
                    <h3>Single Day</h3>
                    <p>A quick 4-turn game.</p>
                </button>
                <button class="condition-option ${selectedMode === 'week' ? 'selected' : ''}" onclick="selectMode('week')">
                    <h3>Full Week</h3>
                    <p>Standard 7-day challenge.</p>
                </button>
                <button class="condition-option ${selectedMode === 'life' ? 'selected' : ''}" onclick="selectMode('life')">
                    <h3>Life Mode</h3>
                    <p>Survive as long as possible.</p>
                </button>
            </div>

            <p>Select a Condition (Willpower vs. Wiring):</p>
            <div class="condition-select">
                ${conditionCards}
            </div>

            <div class="rules">
                <h3>Rules of Play</h3>
                <ul>
                    ${AppConfig.rules.rulesOfPlay.map(rule => `<li>${rule}</li>`).join('')}
                </ul>
            </div>

            <div class="buttons">
                <button onclick="handleAction(startGame)" id="startButton">START GAME</button>
            </div>

            <p class="copyright">NO Fs TO GIVE and all NOFNWAY branding are proprietary intellectual property. &copy; 2026 NOFNWAY</p>
        </div>`;
}

// ----------------------------------------
// GAME OVER SCREEN
// ----------------------------------------

function gameOverScreen() {
    let title = 'GAME OVER';
    if (game.message.includes('Fantastic!'))  title = '🎉 Fantastic! (A+)';
    else if (game.message.includes('Great Job!')) title = '👍 Great Job! (B)';
    else if (game.message.includes('Survived'))   title = '😓 You Survived. (C)';
    else if (game.message.includes('Overwhelmed')) title = '💔 Overwhelmed. (D)';
    else if (game.message.includes('BURNOUT'))     title = '😡 BURNOUT';

    return `
        <div class="game-over">
            <h2>${title}</h2>
            <p style="margin-top: 20px;">${game.message}</p>
            <p><strong>Final Stress:</strong> ${game.stress}</p>

            <div class="buttons" style="justify-content: center; margin-top: 30px;">
                <button onclick="handleAction(resetGame)">🔄 Play Again</button>
                <button class="secondary" onclick="game = null; render();">⚙️ Settings</button>
            </div>
        </div>`;
}

// ----------------------------------------
// GAME SCREEN
// ----------------------------------------

function gameScreen() {
    const dayText  = game.mode === 'day' ? "Day 1/1"
                   : game.mode === 'week' ? `Day ${game.day}/7`
                   : `Day ${game.day}`;
    const turnName = ["Morning", "Midday", "Afternoon", "Evening"][game.turn - 1] || "End of Day";

    const allTasksDone       = game.currentTasks.length === 0;
    const headerStressClass  = (game.burntOut || game.stress >= 5) ? 'stress-danger'
                             : (game.stress >= 3 ? 'stress-warning' : '');

    // Bipolar episode banner
    let bipolarBanner = '';
    if (game.conditions.includes('bipolar') && game.bipolarState) {
        const isManic = game.bipolarState === 'manic';
        bipolarBanner = `<div class="bipolar-banner ${isManic ? 'manic' : 'depressive'}">
            ${isManic
                ? '⚡ MANIC EPISODE — +2 draw, 3 tasks, discard 3 at end of turn'
                : '🌧️ DEPRESSIVE EPISODE — -1 draw, skipping tasks costs 0 Stress'}
        </div>`;
    }

    const buildCostHtml = (cost, modifiedCost) => {
        const icons = { physical: '⚡', social: '👥', mental: '🧠' };
        const renderPips = (c, extraClass = '') =>
            Object.entries(icons)
                .map(([key, sym]) => c[key] > 0
                    ? `<span class="cost-pip ${key} ${extraClass}">${sym} ×${c[key]}</span>`
                    : '')
                .join('');

        const isModified = JSON.stringify(cost) !== JSON.stringify(modifiedCost);
        if (isModified) {
            return renderPips(cost, 'base-cost') + renderPips(modifiedCost);
        }
        return renderPips(cost) || '<span class="cost-pip">0</span>';
    };

    // --- Special ability buttons ---
    const hasAdhd    = game.conditions.includes('adhd');
    const hasAnxiety = game.conditions.includes('anxiety');

    const specialButtons = [];

    if (hasAdhd) {
        specialButtons.push(`
            <button class="secondary ability-btn"
                    onclick="handleAction(useHyperfocus)"
                    ${game.hyperfocusUsed || game.selectedTask === null || allTasksDone ? 'disabled' : ''}>
                ⚡ Hyperfocus${game.hyperfocusUsed ? ' (used)' : ''}
            </button>`);
    }

    if (hasAnxiety) {
        specialButtons.push(`
            <button class="secondary ability-btn"
                    onclick="handleAction(anxietyPeek)"
                    ${game.anxietyPeekUsed ? 'disabled' : ''}>
                👁️ Peek${game.anxietyPeekUsed ? ' (used)' : ''}
            </button>`);
    }

    // OCD bonus indicator
    let ocdBonusNote = '';
    if (game.conditions.includes('ocd') && game.nextTurnOcdBonus) {
        ocdBonusNote = `<div class="ocd-bonus-note">✨ OCD: Perfect turn! Drawing +2 next turn.</div>`;
    }

    return `
        <div class="header ${game.burntOut ? 'burnt-out' : ''}">
            <h1>${dayText} - ${turnName}</h1>
            <div class="stats">
                <div class="stat"><strong>Done:</strong> ${game.completedTasks.length}</div>
                <div class="stat"><strong>Hand:</strong> ${game.hand.length}</div>
                <div class="stat ${headerStressClass}"><strong>Stress:</strong> ${game.stress}/7
                    ${game.stressShield > 0 ? ` <span class="shield-badge">🛡️${game.stressShield}</span>` : ''}
                </div>
            </div>
        </div>

        ${bipolarBanner}
        ${game.message ? `<div class="message">${game.message}</div>` : ''}
        ${ocdBonusNote}

        <div class="game-area">
            <div class="section">
                <h2>📋 Current Tasks</h2>
                <div class="task-card-area">
                    ${game.currentTasks.map((task, i) => {
                        const isSelected  = game.selectedTask === i;
                        const modCost     = game.getModifiedCost(task);
                        const taskData    = AppConfig.tasks.find(t => t.name === task.name) || { flavor: "" };
                        const timeClass   = { Morning: 't-morning', Midday: 't-midday', Afternoon: 't-afternoon', Evening: 't-evening' }[task.time] || '';
                        return `
                        <div class="card task-card ${timeClass} ${isSelected ? 'selected' : ''}" onclick="handleAction(() => selectTask(${i}))">
                            <div class="time-stripe"></div>
                            <div class="card-body">
                                <div class="card-name">${task.name}</div>
                                <div class="card-meta">
                                    <div class="card-cost">${buildCostHtml(task.cost, modCost)}</div>
                                    <span class="time-badge">${task.time}</span>
                                </div>
                                <div class="divider"></div>
                                ${taskData.flavor ? `<div class="card-flavor">"${taskData.flavor}"</div>` : ''}
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
                        const sym = card.type === 'physical' ? '⚡' : card.type === 'social' ? '👥' : '🧠';
                        return `
                        <div class="card f-card ${card.type} ${isSelected ? 'selected' : ''}" onclick="handleAction(() => selectCard(${i}))">
                            <div class="f-stripe"></div>
                            <div class="f-body">
                                <div class="f-icon-wrap"><span class="f-icon">${sym}</span></div>
                                <div class="f-type">${card.type}</div>
                            </div>
                        </div>`;
                    }).join('')}
                </div>

                <div class="buttons">
                    <button onclick="handleAction(attemptTask)"
                            ${game.selectedTask === null || allTasksDone || game.selectedCards.length === 0 ? 'disabled' : ''}>
                        ✅ Complete
                    </button>
                    <button class="secondary" onclick="handleAction(skipTask)"
                            ${game.selectedTask === null || allTasksDone ? 'disabled' : ''}>
                        ⏭️ Skip
                    </button>
                    <button class="secondary" onclick="handleAction(discardToDraw)"
                            ${game.discardToDrawUsed || game.selectedCards.length !== 2 ? 'disabled' : ''}>
                        ♻️ Discard 2 / Draw 2${game.discardToDrawUsed ? ' (used)' : ''}
                    </button>
                    <button class="secondary" onclick="handleAction(spendToRemoveStress)"
                            ${game.stress <= 0 || game.selectedCards.length !== 3 ? 'disabled' : ''}>
                        🧘 Spend 3 / -1 Stress
                    </button>
                    <button class="secondary" onclick="handleAction(endTurn)">⏩ End Turn</button>
                    ${specialButtons.join('')}
                </div>
            </div>
        </div>`;
}

// ----------------------------------------
// MAIN RENDER
// ----------------------------------------

function render() {
    const app = document.getElementById('app');
    if (!app) return;

    if (!AppConfig || !AppConfig.rules || !AppConfig.tasks) {
        app.innerHTML = `<div class="error-screen"><h2>Critical Error</h2><p>AppConfig data is missing or corrupted.</p></div>`;
        return;
    }

    if (!game) {
        app.innerHTML = setupScreen();
        return;
    }

    app.innerHTML = game.gameOver ? gameOverScreen() + gameScreen() : gameScreen();
}
