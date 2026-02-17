// ============================================
// UI RENDERING FUNCTIONS
// All screen generation and display logic
// ============================================

let game = null;
const selectedConditions = new Set();

// --- REMOVED: The CONDITION_DETAILS object is in js/data/rules.js ---

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
            
            <h2>🎮 No Fs Left to Give</h2>

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

            <p>Select conditions to play with (or none for neurotypical mode):</p>
            
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
                    I acknowledge that "The Daily Challenge," "No Fs Left to Give," and all NOFNWAY branding, game mechanics, rules, artwork, and code are proprietary intellectual property protected by copyright law. I agree not to copy, distribute, modify, reproduce, or create derivative works based on this game without express written permission.
                </label>
            </div>

            <div class="buttons">
                <button onclick="startGame()" id="startButton" disabled>START GAME</button>
            </div>
            
            <p class="footer-note">
                &copy; 2025 NOFNWAY. All Rights Reserved.<br>
                "No Fs Left to Give," "The Daily Challenge," all game mechanics, rules, text, artwork, and code expression are protected by U.S. and international copyright laws.<br>
                Unauthorized reproduction, distribution, or derivative works are strictly prohibited.<br>
                This is a playtest version for feedback purposes only.
            </p>
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
                <button class="secondary" onclick="game = null; render();">⚙️ Change Settings</button>
            </div>
        </div>
    `;
}

// Generate the main game screen
function gameScreen() {
    
    let dayText = "ERROR";
    if (game.mode === 'day') {
        dayText = `Day 1/1`;
    } else if (game.mode === 'week') {
        dayText = `Day ${game.day}/7`;
    } else if (game.mode === 'life') {
        dayText = `Day ${game.day}`;
    }
    
    let targetText = "<strong>Goal:</strong> Complete as many tasks as you can.";
    if (game.mode === 'life') {
        targetText = "<strong>Goal:</strong> Survive as long as you can.";
    }
    
    const completedText = `${game.completedTasks.length}`;
    
    let turnName = "Morning";
    if (game.turn === 2) turnName = "Midday";
    else if (game.turn === 3) turnName = "Afternoon";
    else if (game.turn === 4) turnName = "Evening";
    
    const allTasksAttempted = game.currentTasks.length === 0;

    let stressState = 'normal';
    let completedIcon = '✅';
    let headerStressClass = '';

    if (game.burntOut) {
        stressState = 'danger';
        completedIcon = '😡';
        headerStressClass = 'stress-danger burnt-out'; 
    } else if (game.stress >= 5) {
        stressState = 'danger';
        completedIcon = '😡'; 
        headerStressClass = 'stress-danger';
    } else if (game.stress >= 3) {
        stressState = 'warning';
        completedIcon = '⚠️';
        headerStressClass = 'stress-warning';
    }

    const buildCostHtml = (cost, modifiedCost) => {
        const p = cost.physical || 0;
        const s = cost.social || 0;
        const m = cost.mental || 0;
        
        const mod_p = modifiedCost.physical || 0;
        const mod_s = modifiedCost.social || 0;
        const mod_m = modifiedCost.mental || 0;

        const isModified = (p !== mod_p) || (s !== mod_s) || (m !== mod_m);

        let baseHtml = `
            ${p > 0 ? '⚡'.repeat(p) : ''}
            ${s > 0 ? '👥'.repeat(s) : ''}
            ${m > 0 ? '🧠'.repeat(m) : ''}
        `;
        if (baseHtml.trim() === '') baseHtml = '0'; 

        let modifiedHtml = `
            ${mod_p > 0 ? '⚡'.repeat(mod_p) : ''}
            ${mod_s > 0 ? '👥'.repeat(mod_s) : ''}
            ${mod_m > 0 ? '🧠'.repeat(mod_m) : ''}
        `;
        if (modifiedHtml.trim() === '') modifiedHtml = '0';

        if (isModified) {
            return `<span class="base-cost">${baseHtml}</span> <span class="mod-arrow">→</span> <span class="mod-cost">${modifiedHtml}</span>`;
        } else {
            return `<span>${baseHtml}</span>`;
        }
    };

    return `
        <div class="header ${game.burntOut ? 'burnt-out' : ''}">
            <h1>${dayText} - ${turnName}</h1>

            <div class="lingering-tasks-area">
                <div class="lingering-deck">
                    <div class="lingering-label">Morning Backlog</div>
                    <div class="mini-card-pile">
                        ${game.lingeringMorningTasks.map(() => `<div class="mini-task-card morning"></div>`).join('')}
                    </div>
                </div>
                <div class="lingering-deck">
                    <div class="lingering-label">Midday Backlog</div>
                    <div class="mini-card-pile">
                        ${game.lingeringMiddayTasks.map(() => `<div class="mini-task-card midday"></div>`).join('')}
                    </div>
                </div>
                <div class="lingering-deck">
                    <div class="lingering-label">Afternoon Backlog</div>
                    <div class="mini-card-pile">
                        ${game.lingeringAfternoonTasks.map(() => `<div class="mini-task-card afternoon"></div>`).join('')}
                    </div>
                </div>
                <div class="lingering-deck">
                    <div class="lingering-label">Evening Backlog</div>
                    <div class="mini-card-pile">
                        ${game.lingeringEveningTasks.map(() => `<div class="mini-task-card evening"></div>`).join('')}
                    </div>
                </div>
            </div>

            <div class="stats">
                <div class="stat"><strong>Completed:</strong> ${completedText}</div>
                <div class="stat"><strong>Hand:</strong> ${game.hand.length} cards</div>
                <div class="stat" style="color: ${game.stress >= 5 ? '#f44336' : game.stress >= 3 ? '#ff9800' : '#4CAF50'}">
                    <strong>Stress:</strong> ${game.stress}/7
                </div>
            </div>
            <div class="stress-tokens">
                ${Array(game.stress).fill(0).map(() => '<div class="stress-token"></div>').join('')}
            </div>
        </div>
        
        ${game.message ? `<div class="message ${game.message.includes('❌') || game.message.includes('BURNOUT') ? 'error' : game.message.includes('⚠️') ? 'warning' : ''}">${game.message}</div>` : ''}
        
        <div class="game-area">
            <div class="section">
                <h2>📋 Current Tasks</h2>
                <div class="task-card-area">
                    ${game.currentTasks.map((task, i) => {
                        const isSelected = game.selectedTask === i;
                        const modCost = game.getModifiedCost(task);
                        
                        const taskData = AppConfig.tasks.find(t => t.name === task.name);
                        const image = taskData.image.replace('assets/', `${THEME_REGISTRY[AppConfig.currentThemeId].path}assets/`); 
                        const flavor = taskData.flavor;

                        return `
                        <div class="card task-card ${isSelected ? 'selected' : ''}" 
                             style="background-image: url('${image}')" 
                             onclick="selectTask(${i})">
                            
                            <div class="card-header">
                                <div class="card-title">${task.name}</div>
                                <div class="card-cost">${buildCostHtml(task.cost, modCost)}</div>
                            </div>

                            <div class="card-content-middle">
                                <div class="card-time">${task.time}</div>
                                ${flavor ? `<div class="card-flavor">"${flavor}"</div>` : ''}
                            </div>
                            
                            ${task.effect ? `<div class="card-effect">${task.effect.text}</div>` : ''}
                        </div>`;

                    }).join('')}
                </div>
                ${allTasksAttempted ? '<p style="color: #4CAF50; font-size: 13px; margin-top: 10px;">✅ All tasks attempted. Click END TURN.</p>' : ''}
            </div>
            
            <div class="section">
                <h2>🃏 Your Hand (${game.hand.length})</h2>
                <div class="f-card-area">
                    ${game.hand.map((card, i) => {
                        const isSelected = game.selectedCards.includes(i);
                        let symbol = card.type === 'physical' ? '⚡' : card.type === 'social' ? '👥' : '🧠';
                        
                        const themePath = THEME_REGISTRY[AppConfig.currentThemeId].path;

                        return `
                        <div class="card f-card ${card.type} ${isSelected ? 'selected' : ''}" 
                             style="background-image: url('${themePath}assets/f_cards/${card.type}.png')"
                             onclick="selectCard(${i})">
                            
                            <div class="f-card-symbol">${symbol}</div>
                            <div class="f-card-label">${card.type.toUpperCase()} F</div>
                        </div>`;
                    }).join('')}
                </div>
                
                <div class="buttons">
                    <button onclick="attemptTask()" ${game.selectedTask === null || allTasksAttempted || game.selectedCards.length === 0 ? 'disabled' : ''}>
                        ✅ Complete Task
                    </button>
                    <button class="secondary" onclick="skipTask()" ${game.selectedTask === null || allTasksAttempted ? 'disabled' : ''}>
                        ⏭️ Skip Task
                    </button>
                    
                    <button class="secondary" onclick="discardToDraw()" ${game.discardToDrawUsed || game.selectedCards.length !== 2 || game.selectedTask !== null || game.burntOut ? 'disabled' : ''}>
                        ♻️ Discard 2, Draw 2
                    </button>
                    <button class="secondary" onclick="spendToRemoveStress()" ${game.selectedCards.length !== 3 || game.selectedTask !== null || game.stress === 0 || game.burntOut ? 'disabled' : ''}>
                        🧘 Spend 3, -1 Stress
                    </button>
                    
                    ${game.conditions.includes('adhd') ? `
                        <button class="secondary" onclick="useHyperfocus()" 
                            ${game.hyperfocusUsed || game.selectedTask === null || game.hand.length < 3 ? 'disabled' : ''}>
                            ⚡ Hyperfocus (3)
                        </button>
                    ` : ''}
                    <button class="secondary" onclick="endTurn()">
                        ⏩ End ${turnName}
                    </button>
                </div>
            </div>
            
            <div class="section">
                
                <h2>📖 How to Play</h2>
                <div class="rules-reminder">
                    <ul>
                        ${AppConfig.rules.howToPlay.map(rule => `<li>${rule}</li>`).join('')}
                        <li>${targetText}</li>
                    </ul>
                </div>

                <h2>🧠 Active Conditions</h2>
                <div class="condition-reminders">
                    ${game.conditions.length > 0 ? 
                        game.conditions.map(condId => `
                            <div class="condition-reminder">
                                <h3>${AppConfig.rules.conditionDetails[condId].name}</h3>
                                <p>${AppConfig.rules.conditionDetails[condId].rule}</p>
                                
                                </div>
                        `).join('') :
                        `<div class="condition-reminder">
                            <h3>Neurotypical Mode</h3>
                            <p>No extra rules are in effect.</p>
                        </div>`
                    }
                </div>
            
                <h2 class="${headerStressClass}">
                    ${completedIcon} Completed (${game.completedTasks.length})
                </h2>
                <div class="completed-tasks ${stressState}">
                    ${game.completedTasks.map(name => `
                        <div class="completed-task">${name}</div>
                    `).join('')}
                </div>
                
                <div style="margin-top: 15px;">
                    <button class="secondary" onclick="game = null; render();" style="width: 100%;">
                        ⚙️ Change Settings
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Main render function
function render() {
    const app = document.getElementById('app');
    if (!app) return; 

    // Don't render if data isn't loaded yet
    if (!AppConfig.rules || !AppConfig.tasks) {
        app.innerHTML = `<div class="setup-screen"><h2>Loading Game Data...</h2></div>`;
        return;
    }

    if (game && game.stress >= 7 && !game.gameOver && game.mode === 'life') {
         game.endGame();
    }
    
    if (!game) {
        app.innerHTML = setupScreen();
        if (document.getElementById(`mode-${selectedMode}`)) {
            document.getElementById(`mode-${selectedMode}`).classList.add('selected');
        }
        setTimeout(checkAgreement, 100);
        return;
    }
    
    if (game.gameOver) {
        app.innerHTML = gameOverScreen() + gameScreen(); 
        return;
    }
    
    app.innerHTML = gameScreen();
}
