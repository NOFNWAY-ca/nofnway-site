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
        // PTSD: 1 stress shield only at the start of each day (not every turn)
        if (this.conditions.includes('ptsd') && this.turn === 1) {
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
            // ASD: completing a social task draws +3 (social win = energy spike)
            if ((task.cost.social || 0) > 0 && this.conditions.includes('asd')) {
                this.drawWithReshuffle(3);
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
            case "DRAW": this.drawWithReshuffle(effect.value); break;
            case "REMOVE_STRESS": this.stress = Math.max(0, this.stress - effect.value); break;
            case "PREVENT_STRESS": this.stressShield += effect.value; break;
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
        if (this.stress >= 7) this.burntOut = true;
    }

    endTurn() {
        if (this.currentTasks.length > 0) {
            const lingering = this.getLingeringDeckForCurrentTurn();
            this.addStress(this.currentTasks.length);
            while (this.currentTasks.length > 0) lingering.push(this.currentTasks.pop());
        }

        if (this.conditions.includes('ocd') && this.tasksCompletedThisTurn >= 2) {
            this.nextTurnOcdBonus = true;
        }

        if (this.conditions.includes('adhd') && this.hand.length > 0) {
            const disc = Math.min(this.hand.length, 2);
            for (let i = 0; i < disc; i++) this.fDeckDiscard.push(this.hand.splice(0, 1)[0]);
        }

        while (this.hand.length > 0) this.fDeckDiscard.push(this.hand.pop());

        this.turn++;
        if (this.turn > 4) { this.turn = 1; this.day++; }
        if (this.day > this.dayLimit) { this.gameOver = true; } 
        else {
            if (this.turn === 1 && this.conditions.includes('bipolar')) this.bipolarDayFlip();
            this.firstTaskAttempted = false;
            if (this.turn === 1) this.hyperfocusUsed = false; // resets once per day
            this.tasksCompletedThisTurn = 0;
            this.drawCards();
            this.drawTasks();
        }
    }
}
