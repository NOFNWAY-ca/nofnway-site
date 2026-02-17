// ============================================
// EVENT HANDLERS & INITIALIZATION
// User interaction and game control
// ============================================

// === NEW: Global variable for game mode ===
let selectedMode = 'week'; // Default mode

// Toggle condition selection
function toggleCondition(cond) {
    const elem = document.getElementById(`cond-${cond}`);
    if (selectedConditions.has(cond)) {
        selectedConditions.delete(cond);
        elem.classList.remove('selected');
    } else {
        selectedConditions.add(cond);
        elem.classList.add('selected');
    }
}

// === NEW: Function to select game mode ===
function selectMode(mode) {
    selectedMode = mode;
    // Update button visual state
    document.getElementById('mode-day').classList.remove('selected');
    document.getElementById('mode-week').classList.remove('selected');
    document.getElementById('mode-life').classList.remove('selected');
    document.getElementById(`mode-${mode}`).classList.add('selected');
}

// Enable/disable start button
function checkAgreement() {
    const checkbox = document.getElementById('agreementCheckbox');
    const button = document.getElementById('startButton');
    button.disabled = !checkbox.checked;
}

// === MODIFIED: Start a new game with selected mode and conditions ===
function startGame() {
    game = new Game(selectedMode, [...selectedConditions]);
    render();
}

// Select/deselect a card from hand
function selectCard(index) {
    game.selectCard(index);
    render();
}

// Select/deselect a task
function selectTask(index) {
    game.selectTask(index);
    render();
}

// Attempt to complete selected task
function attemptTask() {
    game.attemptTask();
    render();
}

// Use the ADHD Hyperfocus ability
function useHyperfocus() {
    game.useHyperfocus();
    render();
}

// Discard 2 cards to draw 2
function discardToDraw() {
    game.discardToDraw();
    render();
}

// Spend 3 cards to remove 1 stress
function spendToRemoveStress() {
    game.spendToRemoveStress();
    render();
}

// Skip selected task
function skipTask() {
    game.skipTask();
    render();
}

// End current turn
function endTurn() {
    game.endTurn();
    render();
}

// === MODIFIED: Reset game with same mode and conditions ===
function resetGame() {
    game = new Game(selectedMode, [...selectedConditions]); 
    render();
}

// Initialize the game when page loads
document.addEventListener('DOMContentLoaded', function() {
    render();
});
