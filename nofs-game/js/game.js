// ============================================
// GAME CLASS
// Core game logic and state management
// ============================================

class Game {
    constructor(mode, conditions = []) {
        this.mode = mode;
        this.conditions = conditions.filter(c => c !== 'neurotypical');
        this.day = 1;
        this.turn = 1;
        this.stress = 0;
        this.completedTasks = [];

        this.dayLimit = 0;
        if (mode === 'day') {
            this.dayLimit = 1;
        } else if (mode === 'week') {
            this.dayLimit = 7;
        } else if (mode === 'life') {
            this.dayLimit = Infinity;
        }

        this.fDeck = this.createFDeck();
        this.fDeckDiscard = [];

        this.morningTasks    = this.shuffle(AppConfig.tasks.filter(t => t.time === "Morning"));
        this.middayTasks     = this.shuffle(AppConfig.tasks.filter(t => t.time === "Midday"));
        this.afternoonTasks  = this.shuffle(AppConfig.tasks.filter(t => t.time === "Afternoon"));
        this.eveningTasks    = this.shuffle(AppConfig.tasks.filter(t => t.time === "Evening"));

        this.morningTasksDiscard   = [];
        this.middayTasksDiscard    = [];
        this.afternoonTasksDiscard = [];
        this.eveningTasksDiscard   = [];

        this.lingeringMorningTasks   = [];
        this.lingeringMiddayTasks    = [];
        this.lingeringAfternoonTasks = [];
        this.lingeringEveningTasks   = [];

        this.hand           = [];
        this.currentTasks   = [];
        this.selectedCards  = [];
        this.selectedTask   = null;
        this.message        = "📅 Day 1 - Morning (Turn 1) started.";
        this.gameOver       = false;

        this.burntOut           = false;
        this.firstTaskAttempted = false;
        this.hyperfocusUsed     = false;
        this.discardToDrawUsed  = false;

        this.stressShield       = 0;
        this.turnCostReduction  = { physical: 0, social: 0, mental: 0 };

        this.tasksCompletedThisTurn = 0;
        this.nextTurnOcdBonus      = false;
        this.anxietyPeekUsed       = false;
        this.anxietyPeekedTask     = null;

        this.bipolarState = null; 

        if (this.conditions.includes('bipolar')) {
            this.bipolarDayFlip();
        }

        this.drawCards();
        this.drawTasks();
    }

    createFDeck() {
        const deck = [];
        for (let i = 0; i < 20; i++) deck.push({ type: 'physical' });
        for (let i = 0; i < 20; i++) deck.push({ type: 'social' });
        for (let i = 0; i < 20; i++) deck.push({ type: 'mental' });
        return this.shuffle(deck);
    }

    shuffle(arr) {
        const shuffled = [...arr];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    getDecksForCurrentTurn() {
        switch (this.turn) {
            case 1: return { deck: this.morningTasks,   discard: this.morningTasksDiscard,   name: "Morning" };
            case 2: return { deck: this.middayTasks,    discard: this.middayTasksDiscard,    name: "Midday" };
            case 3: return { deck: this.afternoonTasks, discard: this.afternoonTasksDiscard, name: "Afternoon" };
            case 4: return { deck: this.eveningTasks,   discard: this.eveningTasksDiscard,   name: "Evening" };
            default: return { deck: [], discard: [], name: "Error" };
        }
    }

    getLingeringDeckForCurrentTurn() {
        switch (this.turn) {
            case 1: return this.lingeringMorningTasks;
            case 2: return this.lingeringMiddayTasks;
            case 3: return this.lingeringAfternoonTasks;
            case 4: return this.lingeringEveningTasks;
            default: return [];
        }
    }

    bipolarDayFlip() {
        if (this.fDeck.length === 0) {
            this.fDeck.push(...this.shuffle(this.fDeckDiscard));
            this.fDeckDiscard = [];
        }
        const card = this.fDeck.pop();
        this.fDeckDiscard.push(card);
        this.bipolarState = card.type === 'physical' ? 'manic' : 'depressive';
        const label = this.bipolarState === 'manic'
            ? '⚡ Manic episode'
            : '🌧️ Depressive episode';
        this.message += ` (Bipolar: ${label})`;
    }

    drawCards() {
        // Reset per-turn flags
        this.discardToDrawUsed = false;
        this.anxietyPeekUsed   = false;
        this.anxietyPeekedTask = null;
        this.turnCostReduction = { physical: 0, social: 0, mental: 0 };

        let drawCount = 5;
        if (this.conditions.includes('adhd'))      drawCount += 1;
        if (this.conditions.includes('depression')) drawCount -= 1; // motivation deficit; positive restores on first task
        if (this.conditions.includes('bipolar')) {
            if (this.bipolarState === 'manic')      drawCount += 2;
            if (this.bipolarState === 'depressive') drawCount -= 1; // was -2
        }
        if (this.stress >= 3 && this.stress <= 4) drawCount -= 1;
        if (this.stress >= 5 || this.burntOut)    drawCount -= 2;

        drawCount = Math.max(1, drawCount);

        if (this.nextTurnOcdBonus) {
            drawCount += 2;
            this.nextTurnOcdBonus = false;
        }

        this.drawWithReshuffle(drawCount);

        if (this.conditions.includes('ocd') && this.hand.length >= 4) {
            this.fDeckDiscard.push(this.hand.splice(0, 1)[0]);
        }
        // PTSD: 1 stress shield once per game (day 1 only)
        if (this.conditions.includes('ptsd') && this.day === 1 && this.turn === 1) {
            this.stressShield += 1;
        }
    }

    drawTasks() {
        const { deck, discard } = this.getDecksForCurrentTurn();
        const lingeringDeck = this.getLingeringDeckForCurrentTurn();
        this.currentTasks = [];

        const tasksToDraw = (this.conditions.includes('bipolar') && this.bipolarState === 'manic') ? 3 : 2;

        if (deck.length < tasksToDraw && discard.length > 0) {
            deck.push(...this.shuffle(discard));
            discard.splice(0, discard.length);
        }

        if (lingeringDeck.length > 0) {
            this.currentTasks.push(lingeringDeck.pop());
        }
        while (this.currentTasks.length < tasksToDraw && deck.length > 0) {
            this.currentTasks.push(deck.pop());
        }
    }

    getModifiedCost(task) {
        if (!task) return { physical: 0, social: 0, mental: 0 };
        const cost = { ...task.cost };
        const isFirstTask = !this.firstTaskAttempted;

        // Depression: draw -1/turn (motivation deficit) handled in drawCards

        // ADHD: first task of turn costs +1 mental (initiation difficulty)
        if (this.conditions.includes('adhd') && isFirstTask) {
            cost.mental = (cost.mental || 0) + 1;
        }

        // Anxiety: purely-social tasks cost +1 mental (overthinking).
        // Tasks that already have a mental cost are unaffected — you're already using that energy.
        if (this.conditions.includes('anxiety') && (task.cost.social || 0) > 0 && (task.cost.mental || 0) === 0) {
            cost.mental = (cost.mental || 0) + 1;
        }

        // ASD: social tasks cost +1 social (social battery drain)
        if (this.conditions.includes('asd') && (task.cost.social || 0) > 0) {
            cost.social = (cost.social || 0) + 1;
        }

        if (this.stress >= 5 || this.burntOut) {
            cost.physical = (cost.physical || 0) + 1;
            cost.social   = (cost.social   || 0) + 1;
            cost.mental   = (cost.mental   || 0) + 1;
        }

        cost.physical = Math.max(0, (cost.physical || 0) - this.turnCostReduction.physical);
        cost.social   = Math.max(0, (cost.social   || 0) - this.turnCostReduction.social);
        cost.mental   = Math.max(0, (cost.mental   || 0) - this.turnCostReduction.mental);

        return cost;
    }

    attemptTask() {
        if (this.selectedTask === null || !this.currentTasks[this.selectedTask]) return;
        
        const task = this.currentTasks[this.selectedTask];
        const modifiedCost = this.getModifiedCost(task);
        const selectedFCards = this.selectedCards.map(i => this.hand[i]);

        const pPlayed = selectedFCards.filter(c => c.type === 'physical').length;
        const sPlayed = selectedFCards.filter(c => c.type === 'social').length;
        const mPlayed = selectedFCards.filter(c => c.type === 'mental').length;

        if (pPlayed >= (modifiedCost.physical || 0) && 
            sPlayed >= (modifiedCost.social || 0) && 
            mPlayed >= (modifiedCost.mental || 0)) {
            
            const wasFirst = !this.firstTaskAttempted;
            this.firstTaskAttempted = true;

            const { discard } = this.getDecksForCurrentTurn();
            discard.push(this.currentTasks.splice(this.selectedTask, 1)[0]);

            this.completedTasks.push(task.name);
            this.selectedCards.sort((a, b) => b - a).forEach(i => {
                this.fDeckDiscard.push(this.hand.splice(i, 1)[0]);
            });

            if (task.effect) this.applyEffect(task.effect);

            // --- CONDITION POSITIVES ON COMPLETION ---
            // Depression: completing first task draws +1 (momentum)
            if (wasFirst && this.conditions.includes('depression')) {
                this.drawWithReshuffle(1);
            }
            // ASD: completing a social task draws +4 (social win = energy spike)
            if ((task.cost.social || 0) > 0 && this.conditions.includes('asd')) {
                this.drawWithReshuffle(4);
            }

            this.tasksCompletedThisTurn++;
            
            this.selectedTask = null;
            this.selectedCards = [];
        }
    }

    useHyperfocus() {
        if (!this.conditions.includes('adhd') || this.hyperfocusUsed) return;
        const task = this.currentTasks[this.selectedTask];
        if (!task || this.hand.length < 3) return;

        for (let i = 0; i < 3; i++) this.fDeckDiscard.push(this.hand.splice(0, 1)[0]);
        
        this.hyperfocusUsed = true;
        this.firstTaskAttempted = true;
        this.completedTasks.push(task.name);
        
        const { discard } = this.getDecksForCurrentTurn();
        discard.push(this.currentTasks.splice(this.selectedTask, 1)[0]);

        if (task.effect) this.applyEffect(task.effect);
        this.selectedTask = null;
    }

    applyEffect(effect) {
        if (this.burntOut) return;
        switch (effect.code) {
            case "DRAW":
                this.drawWithReshuffle(effect.value);
                break;
            case "REMOVE_STRESS":
                this.stress = Math.max(0, this.stress - effect.value);
                break;
            case "REMOVE_STRESS_ALL":
                this.stress = 0;
                break;
            case "PREVENT_STRESS":
                this.stressShield += effect.value;
                break;
            case "DRAW_SPECIFIC": {
                // Search deck for cards of the specified type
                let remaining = effect.value;
                for (let i = this.fDeck.length - 1; i >= 0 && remaining > 0; i--) {
                    if (this.fDeck[i].type === effect.type) {
                        this.hand.push(this.fDeck.splice(i, 1)[0]);
                        remaining--;
                    }
                }
                // Fall back to discard pile if deck runs out
                for (let i = this.fDeckDiscard.length - 1; i >= 0 && remaining > 0; i--) {
                    if (this.fDeckDiscard[i].type === effect.type) {
                        this.hand.push(this.fDeckDiscard.splice(i, 1)[0]);
                        remaining--;
                    }
                }
                break;
            }
            case "COST_REDUCTION_TURN":
                this.turnCostReduction[effect.type] = (this.turnCostReduction[effect.type] || 0) + effect.value;
                break;
            case "RESET_ACTION":
                this[effect.action] = false;
                break;
        }
    }

    drawWithReshuffle(amount) {
        for (let i = 0; i < amount; i++) {
            if (this.fDeck.length === 0) {
                if (this.fDeckDiscard.length === 0) break;
                this.fDeck = this.shuffle(this.fDeckDiscard);
                this.fDeckDiscard = [];
            }
            this.hand.push(this.fDeck.pop());
        }
    }

    addStress(amount) {
        if (this.burntOut) return;
        const prevented = Math.min(this.stressShield, amount);
        this.stressShield -= prevented;
        this.stress = Math.min(7, this.stress + (amount - prevented));
        if (this.stress >= 7) {
            this.burntOut = true;
            if (this.mode === 'life') {
                this.gameOver = true;
                this.message = `😡 BURNOUT after ${this.completedTasks.length} tasks over ${this.day} days. You gave it everything.`;
            }
        }
    }

    endTurn() {
        // OCD bonus: checked BEFORE lingering push — clean turn = nothing left on board
        if (this.conditions.includes('ocd') && this.tasksCompletedThisTurn >= 1 && this.currentTasks.length === 0) {
            this.nextTurnOcdBonus = true;
        }

        if (this.currentTasks.length > 0) {
            const lingering = this.getLingeringDeckForCurrentTurn();
            this.addStress(this.currentTasks.length);
            while (this.currentTasks.length > 0) lingering.push(this.currentTasks.pop());
        }

        if (this.conditions.includes('adhd') && this.hand.length > 0) {
            const disc = Math.min(this.hand.length, 2);
            for (let i = 0; i < disc; i++) this.fDeckDiscard.push(this.hand.splice(0, 1)[0]);
        }

        while (this.hand.length > 0) this.fDeckDiscard.push(this.hand.pop());

        this.turn++;
        if (this.turn > 4) { this.turn = 1; this.day++; }

        if (this.day > this.dayLimit) {
            this.gameOver = true;
            const done = this.completedTasks.length;
            const maxTasks = this.mode === 'day' ? 8 : 56;
            const pct = done / maxTasks;
            if (this.burntOut) {
                this.message = `😡 BURNOUT. You pushed too hard. ${done} tasks completed.`;
            } else if (pct >= 0.7) {
                this.message = `🎉 Fantastic! You completed ${done} tasks.`;
            } else if (pct >= 0.5) {
                this.message = `👍 Great Job! ${done} tasks done.`;
            } else if (pct >= 0.25) {
                this.message = `😓 You Survived. ${done} tasks done.`;
            } else {
                this.message = `💔 Overwhelmed. Only ${done} tasks done. Be kind to yourself.`;
            }
        } else {
            const turnNames = ['Morning', 'Midday', 'Afternoon', 'Evening'];
            this.message = `📅 Day ${this.day} — ${turnNames[this.turn - 1]}`;
            if (this.turn === 1 && this.conditions.includes('bipolar')) this.bipolarDayFlip();
            this.firstTaskAttempted = false;
            if (this.turn === 1) this.hyperfocusUsed = false; // resets once per day
            this.tasksCompletedThisTurn = 0;
            this.drawCards();
            this.drawTasks();
        }
    }

    // ----------------------------------------
    // PLAYER ACTIONS
    // ----------------------------------------

    selectCard(index) {
        const pos = this.selectedCards.indexOf(index);
        if (pos === -1) {
            this.selectedCards.push(index);
        } else {
            this.selectedCards.splice(pos, 1);
        }
    }

    selectTask(index) {
        if (this.selectedTask === index) {
            this.selectedTask = null;
        } else {
            this.selectedTask = index;
            this.selectedCards = [];
        }
    }

    skipTask() {
        if (this.selectedTask === null || !this.currentTasks[this.selectedTask]) return;

        let skipCost = 2;
        if (this.conditions.includes('ptsd')) skipCost = 3;
        if (this.conditions.includes('bipolar') && this.bipolarState === 'depressive') skipCost = 0;

        const { discard } = this.getDecksForCurrentTurn();
        discard.push(this.currentTasks.splice(this.selectedTask, 1)[0]);

        this.addStress(skipCost);
        this.firstTaskAttempted = true;
        this.selectedTask = null;
        this.selectedCards = [];
    }

    peekNextTask() {
        if (!this.conditions.includes('anxiety') || this.anxietyPeekUsed) return;

        const nextTurn = (this.turn % 4) + 1;
        const decks = [null, this.morningTasks, this.middayTasks, this.afternoonTasks, this.eveningTasks];
        const nextDeck = decks[nextTurn];

        if (nextDeck && nextDeck.length > 0) {
            this.anxietyPeekedTask = nextDeck[nextDeck.length - 1];
            this.anxietyPeekUsed = true;
            const c = this.anxietyPeekedTask.cost;
            const costStr = Object.entries(c).filter(([,v]) => v > 0)
                .map(([k,v]) => `${v}${k === 'physical' ? '⚡' : k === 'social' ? '👥' : '🧠'}`)
                .join(' ');
            this.message = `👁️ Peek: "${this.anxietyPeekedTask.name}" is coming up (${costStr || 'free'}).`;
        }
    }

    discardToDraw() {
        if (this.discardToDrawUsed || this.selectedCards.length !== 2) return;

        this.selectedCards.sort((a, b) => b - a).forEach(i => {
            this.fDeckDiscard.push(this.hand.splice(i, 1)[0]);
        });
        this.drawWithReshuffle(2);
        this.discardToDrawUsed = true;
        this.selectedCards = [];
    }

    spendToRemoveStress() {
        if (this.selectedCards.length !== 3 || this.stress <= 0) return;

        this.selectedCards.sort((a, b) => b - a).forEach(i => {
            this.fDeckDiscard.push(this.hand.splice(i, 1)[0]);
        });
        this.stress = Math.max(0, this.stress - 1);
        this.selectedCards = [];
    }
}
