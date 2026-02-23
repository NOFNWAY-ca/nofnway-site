// ============================================
// EVENT HANDLERS & INITIALIZATION
// User interaction and game control
// ============================================

let selectedMode = 'week'; // Default

// Select game mode and re-render setup screen to reflect selection
function selectMode(mode) {
    selectedMode = mode;
    render();
}

// Toggle a condition on/off, then re-render
function toggleCondition(cond) {
    if (selectedConditions.has(cond)) {
        selectedConditions.delete(cond);
    } else {
        selectedConditions.add(cond);
    }
    render();
}

// Select Neurotypical (tutorial) — clears all other conditions
function clearConditions() {
    selectedConditions.clear();
    render();
}

// Start a new game with selected mode and conditions
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

// ADHD: Hyperfocus ability
function useHyperfocus() {
    game.useHyperfocus();
    render();
}

// Anxiety: Peek at next task deck
function anxietyPeek() {
    game.peekNextTask();
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

// Reset with same mode and conditions
function resetGame() {
    game = new Game(selectedMode, [...selectedConditions]);
    render();
}

// Initialize on load
document.addEventListener('DOMContentLoaded', function () {
    render();
});
