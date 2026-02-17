// ============================================
// AI STRATEGIES
// Contains the "brains" for different AI players.
// ============================================

/**
 * Helper function: Counts resources in hand and gets their indices.
 * @param {Array} hand - The game.hand array
 * @returns {object} - { counts: {physical: 2, ...}, indices: {physical: [0, 3], ...} }
 */
function getHandResources(hand) {
    const resources = {
        counts: { physical: 0, social: 0, mental: 0 },
        indices: { physical: [], social: [], mental: [] }
    };
    for (let i = 0; i < hand.length; i++) {
        const card = hand[i];
        if (card && card.type) {
            resources.counts[card.type]++;
            resources.indices[card.type].push(i);
        }
    }
    return resources;
}

/**
 * Helper function: Finds an affordable task.
 * @param {Game} game - The current game state.
 * @param {string} preference - 'any', 'cheapest', 'hardest'
 * @param {Array} [excludeIndices] - Hand indices to *not* use (e.g., a social card for ADHD)
 * @returns {object|null} - A valid 'attemptTask' move object, or null if none found.
 */
function findAffordableTask(game, preference = 'any', excludeIndices = []) {
    // Create a *virtual* hand that respects the indices to exclude
    const virtualHand = game.hand.filter((_, i) => !excludeIndices.includes(i));
    const handResources = getHandResources(virtualHand);
    
    // Map virtual indices back to real hand indices
    const realIndices = game.hand.map((_, i) => i).filter((_, i) => !excludeIndices.includes(i));

    let bestMove = null;
    let bestCost = (preference === 'cheapest') ? Infinity : -1;

    for (let i = 0; i < game.currentTasks.length; i++) {
        const task = game.currentTasks[i];
        if (!task) continue;

        const cost = game.getModifiedCost(task);
        const pNeeded = cost.physical || 0;
        const sNeeded = cost.social || 0;
        const mNeeded = cost.mental || 0;
        
        if (handResources.counts.physical >= pNeeded &&
            handResources.counts.social >= sNeeded &&
            handResources.counts.mental >= mNeeded) {
            
            const totalCost = pNeeded + sNeeded + mNeeded;
            let isBest = false;

            if (preference === 'any') isBest = true;
            else if (preference === 'cheapest' && totalCost < bestCost) isBest = true;
            else if (preference === 'hardest' && totalCost > bestCost) isBest = true;

            if (isBest) {
                // Get indices from the *virtual* hand
                const virtualIndicesToPlay = [
                    ...handResources.indices.physical.slice(0, pNeeded),
                    ...handResources.indices.social.slice(0, sNeeded),
                    ...handResources.indices.mental.slice(0, mNeeded)
                ];
                
                // Map them back to *real* hand indices
                const realCardIndices = virtualIndicesToPlay.map(vi => realIndices[vi]);

                bestMove = {
                    action: 'attemptTask',
                    taskIndex: i,
                    cardIndices: realCardIndices
                };
                bestCost = totalCost;

                if (preference === 'any') return bestMove;
            }
        }
    }
    return bestMove; // Return the best one found (or null)
}

/**
 * Helper function: Checks for a "bad hand" (e.g., heavily skewed)
 * @param {Array} hand - The game.hand array
 * @returns {boolean}
 */
function isHandBad(hand) {
    if (hand.length < 3) return false; // Not enough cards to judge
    const counts = { physical: 0, social: 0, mental: 0 };
    hand.forEach(card => counts[card.type]++);
    const maxCount = Math.max(counts.physical, counts.social, counts.mental);
    return (maxCount / hand.length) > 0.6;
}

// --- AI STRATEGY DEFINITIONS ---

const AI_STRATEGIES = {
    /**
     * The Rusher (Aggressive): Tries to complete any task, as fast as possible.
     */
    'aggressive': (game) => {
        // 1. Check for panic button
        // *** STRESS REWORK: Check for 8+ stress (danger zone) ***
        if (game.stress >= 8 && !game.mentalHealthDayUsed) {
            return { action: 'useMentalHealthDay' };
        }
        
        // 2. Can I complete *any* task?
        const taskMove = findAffordableTask(game, 'any');
        if (taskMove) {
            return taskMove;
        }

        // 3. Can't complete a task. Can I clear my hand for a better one?
        if (!game.discardToDrawUsed && game.hand.length >= 2) {
            return { action: 'discardToDraw', cardIndices: [0, 1] };
        }
        
        // 4. Nothing else to do.
        return { action: 'endTurn' };
    },

    /**
     * The Manager (Conservative): Prioritizes avoiding stress.
     */
    'conservative': (game) => {
        // 1. Check for panic button
        if (game.stress >= 8 && !game.mentalHealthDayUsed) {
            return { action: 'useMentalHealthDay' };
        }

        // 2. Is stress high? Fix it first.
        const stressCost = game.treatments.includes('therapy') ? 2 : 3;
        if (game.stress > 2 && game.hand.length >= stressCost && !game.spendToRemoveStressUsed) {
            const cardIndices = game.hand.slice(0, stressCost).map((_, i) => i);
            return { action: 'spendToRemoveStress', cardIndices: cardIndices };
        }

        // 3. Stress is low. Try to complete the *easiest* task.
        // *** ADHD LOGIC: Try to save one social card ***
        let exclude = [];
        if (game.conditions.includes('adhd')) {
            const socialCardIndex = game.hand.findIndex(c => c.type === 'social');
            if (socialCardIndex > -1) {
                exclude.push(socialCardIndex);
            }
        }
        const taskMove = findAffordableTask(game, 'cheapest', exclude);
        if (taskMove) {
            return taskMove;
        }

        // 4. Can't do anything useful. Just end the turn.
        return { action: 'endTurn' };
    },

    /**
     * The Gambler (Balanced): A mix of all strategies.
     */
    'balanced': (game) => {
        // 1. Check for panic button
        if (game.stress >= 8 && !game.mentalHealthDayUsed) {
            return { action: 'useMentalHealthDay' };
        }
        
        // *** 2. ADHD LOGIC: Try to save one social card ***
        let exclude = [];
        let socialIndex = -1;
        if (game.conditions.includes('adhd')) {
            socialIndex = game.hand.findIndex(c => c.type === 'social');
            if (socialIndex > -1) {
                exclude.push(socialIndex);
            }
        }

        // 3. Is my hand bad? (Excluding the saved social card)
        const virtualHand = game.hand.filter((_, i) => !exclude.includes(i));
        if (!game.discardToDrawUsed && virtualHand.length >= 2 && isHandBad(virtualHand)) {
            // Find two non-social cards to discard
            const discardIndices = [];
            for(let i = 0; i < game.hand.length; i++) {
                if (i !== socialIndex) {
                    discardIndices.push(i);
                }
                if (discardIndices.length === 2) break;
            }
            if (discardIndices.length === 2) {
                return { action: 'discardToDraw', cardIndices: discardIndices };
            }
        }

        // 4. Hand is good. Try to complete the *hardest* task I can (while saving my social card)
        const taskMove = findAffordableTask(game, 'hardest', exclude);
        if (taskMove) {
            return taskMove;
        }
        
        // 5. Can't complete the hardest. Can I complete *any* task?
        const anyTaskMove = findAffordableTask(game, 'any', exclude);
        if (anyTaskMove) {
            return anyTaskMove;
        }

        // 6. Can't complete a task. Is stress high?
        const stressCost = game.treatments.includes('therapy') ? 2 : 3;
        // *** STRESS REWORK: Check for stress > 5 (danger zone) ***
        if (game.stress > 5 && game.hand.length >= stressCost && !game.spendToRemoveStressUsed) {
            // Try to spend non-social cards first
            const stressCards = [];
            for(let i = 0; i < game.hand.length; i++) {
                if (i !== socialIndex) { // Don't spend the saved card
                    stressCards.push(i);
                }
            }
            // If we have enough, spend them.
            if (stressCards.length >= stressCost) {
                return { action: 'spendToRemoveStress', cardIndices: stressCards.slice(0, stressCost) };
            }
        }

        // 7. Nothing else to do.
        return { action: 'endTurn' };
    },

    'optimal': (game) => {
        // For now, optimal is just the balanced gambler
        return AI_STRATEGIES.balanced(game);
    }
};
