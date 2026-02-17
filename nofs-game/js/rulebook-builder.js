// ============================================
// RULEBOOK BUILDER SCRIPT
// Automatically builds rulebook.html from rules.js
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    
    // Check if the GAME_TEXT object exists
    if (typeof GAME_TEXT === 'undefined') {
        console.error("GAME_TEXT not found. Make sure 'js/data/rules.js' is loaded.");
        return;
    }

    // 1. Populate "Rules of Play"
    const rulesList = document.getElementById('rules-list');
    if (rulesList) {
        GAME_TEXT.rulesOfPlay.forEach(rule => {
            rulesList.innerHTML += `<li>${rule}</li>`;
        });
    }

    // 2. Populate "Player Actions"
    const actionsList = document.getElementById('actions-list');
    if (actionsList) {
        // We get this list from the "How to Play" section
        GAME_TEXT.howToPlay.forEach(rule => {
            // Filter out the goal/burnout rules, which are already in the main list
            if (!rule.includes("Goal:") && !rule.includes("BURNOUT")) {
                actionsList.innerHTML += `<li>${rule}</li>`;
            }
        });
    }

    // 3. Populate "Conditions"
    const conditionsList = document.getElementById('conditions-list');
    if (conditionsList) {
        for (const key in GAME_TEXT.conditionDetails) {
            const cond = GAME_TEXT.conditionDetails[key];
            conditionsList.innerHTML += `
                <div class="condition-item">
                    <h3>${cond.name}</h3>
                    <p>${cond.rule}</p>
                </div>
            `;
        }
    }
});
