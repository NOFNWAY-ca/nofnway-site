// ============================================
// GAME CLASS
// Core game logic and state management
// ============================================

class Game {
    constructor(mode, conditions = []) {
        this.mode = mode;
        // Strip neurotypical out — it's a UI label, not a real condition flag
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

        // --- Per-turn condition trackers ---
        this.adhdFirstTaskBonus    = false;  // ADHD: after 1st task, next costs -1
        this.tasksCompletedThisTurn = 0;     // OCD: track completions for bonus
        this.nextTurnOcdBonus      = false;  // OCD: perfect turn → +2 draw next turn
        this.anxietyPeekUsed       = false;  // Anxiety: once-per-turn peek
        this.anxietyPeekedTask     = null;   // Anxiety: the peeked task object

        // --- Bipolar ---
        this.bipolarState = null; // 'manic' | 'depressive' | null

        if (this.conditions.includes('bipolar')) {
            this.bipolarDayFlip();
        }

        this.drawCards();
        this.drawTasks();
    }

    // ----------------------------------------
    // DECK CREATION & UTILITIES
    // ----------------------------------------

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

    // ----------------------------------------
    // BIPOLAR DAY FLIP
    // ----------------------------------------

    bipolarDayFlip() {
        if (this.fDeck.length === 0) {
            this.fDeck.push(...this.shuffle(this.fDeckDiscard));
            this.fDeckDiscard = [];
        }
        const card = this.fDeck.pop();
        this.fDeckDiscard.push(card);
        this.bipolarState = card.type === 'physical' ? 'manic' : 'depressive';
        const label = this.bipolarState === 'manic'
            ? '⚡ Manic episode — draw +2, 3 tasks, discard 3 at end of turn'
            : '🌧️ Depressive episode — draw -2, free skips, task completions heal Stress';
        this.message += ` (Bipolar: ${label})`;
    }

    // ----------------------------------------
    // DRAW CARDS
    // ----------------------------------------

    drawCards() {
        let drawCount = 5;

        // ADHD: draw 6
        if (this.conditions.includes('adhd')) drawCount += 1;

        // Bipolar episode modifier
        if (this.conditions.includes('bipolar')) {
            if (this.bipolarState === 'manic')      drawCount += 2;
            if (this.bipolarState === 'depressive') drawCount -= 2;
        }

        // Stress penalty
        if (this.stress >= 3 && this.stress <= 4) drawCount -= 1;
        if (this.stress >= 5 || this.burntOut)    drawCount -= 2;

        drawCount = Math.max(1, drawCount);

        // OCD perfect-turn bonus (from previous turn)
        if (this.nextTurnOcdBonus) {
            drawCount += 2;
            this.nextTurnOcdBonus = false;
            this.message += ' (OCD: Perfect turn! +2 cards)';
        }

        if (this.fDeck.length < drawCount) {
            this.fDeck.push(...this.shuffle(this.fDeckDiscard));
            this.fDeckDiscard = [];
            this.message += " (Shuffling F-Card discard pile...)";
        }

        for (let i = 0; i < drawCount && this.fDeck.length > 0; i++) {
            this.hand.push(this.fDeck.pop());
        }

        // OCD ritual: discard 1 card from hand at start of each turn
        if (this.conditions.includes('ocd') && this.hand.length > 0) {
            this.fDeckDiscard.push(this.hand.splice(0, 1)[0]);
            this.message += ' (OCD: Ritual discard -1 card)';
        }

        // PTSD: 1 free Stress Shield per turn
        if (this.conditions.includes('ptsd')) {
            this.stressShield += 1;
            this.message += ' (PTSD: +1 Stress Shield)';
        }
    }

    // ----------------------------------------
    // DRAW TASKS
    // ----------------------------------------

    drawTasks() {
        const { deck, discard, name } = this.getDecksForCurrentTurn();
        const lingeringDeck = this.getLingeringDeckForCurrentTurn();
        this.currentTasks = [];

        // Bipolar manic gets 3 tasks; everyone else gets 2
        const tasksToDraw = (this.conditions.includes('bipolar') && this.bipolarState === 'manic') ? 3 : 2;

        if (deck.length < tasksToDraw && discard.length > 0) {
            deck.push(...this.shuffle(discard));
            discard.splice(0, discard.length);
            this.message += ` (Shuffling ${name} task discard...)`;
        }

        if (lingeringDeck.length > 0) {
            this.currentTasks.push(lingeringDeck.pop());
        }
        while (this.currentTasks.length < tasksToDraw && deck.length > 0) {
            this.currentTasks.push(deck.pop());
        }
        while (this.currentTasks.length < tasksToDraw && lingeringDeck.length > 0) {
            this.currentTasks.push(lingeringDeck.pop());
        }
    }

    // ----------------------------------------
    // SELECTION
    // ----------------------------------------

    selectCard(index) {
        const cardIndex = this.selectedCards.indexOf(index);
        if (cardIndex > -1) {
            this.selectedCards.splice(cardIndex, 1);
        } else {
            this.selectedCards.push(index);
        }
    }

    selectTask(index) {
        this.selectedTask = this.selectedTask === index ? null : index;
    }

    // ----------------------------------------
    // COST CALCULATION
    // ----------------------------------------

    getModifiedCost(task) {
        const cost = { ...task.cost };
        const isFirstTask = !this.firstTaskAttempted;

        // --- DEPRESSION ---
        // Penalty 1: all Physical tasks +1
        if (this.conditions.includes('depression') && (task.cost.physical || 0) > 0) {
            cost.physical = (cost.physical || 0) + 1;
        }
        // Penalty 2: first task of the turn +1 (absorbed from Executive Dysfunction)
        if (this.conditions.includes('depression') && isFirstTask) {
            if ((task.cost.physical || 0) > 0) {
                cost.physical = (cost.physical || 0) + 1;
            } else {
                cost.mental = (cost.mental || 0) + 1;
            }
        }

        // --- ADHD ---
        // Penalty: first task of the turn +1 (absorbed from Executive Dysfunction)
        if (this.conditions.includes('adhd') && isFirstTask) {
            if ((task.cost.physical || 0) > 0) {
                cost.physical = (cost.physical || 0) + 1;
            } else {
                cost.mental = (cost.mental || 0) + 1;
            }
        }

        // --- ANXIETY ---
        // Penalty: all Social tasks +1
        if (this.conditions.includes('anxiety') && (task.cost.social || 0) > 0) {
            cost.social = (cost.social || 0) + 1;
        }

        // --- ASD ---
        // Penalty: all Social tasks +1 Social and +1 Mental
        if (this.conditions.includes('asd') && (task.cost.social || 0) > 0) {
            cost.social = (cost.social || 0) + 1;
            cost.mental = (cost.mental || 0) + 1;
        }

        // --- HIGH STRESS PENALTY ---
        if (this.stress >= 5 || this.burntOut) {
            cost.physical = (cost.physical || 0) + 1;
            cost.social   = (cost.social   || 0) + 1;
            cost.mental   = (cost.mental   || 0) + 1;
        }

        // --- Apply turn cost reductions (COST_REDUCTION_TURN effects) ---
        cost.physical = Math.max(0, (cost.physical || 0) - this.turnCostReduction.physical);
        cost.social   = Math.max(0, (cost.social   || 0) - this.turnCostReduction.social);
        cost.mental   = Math.max(0, (cost.mental   || 0) - this.turnCostReduction.mental);

        // --- ADHD POSITIVE ---
        // After completing first task, the next task costs -1 any type
        if (this.conditions.includes('adhd') && this.adhdFirstTaskBonus && !isFirstTask) {
            if      (cost.physical > 0) cost.physical--;
            else if (cost.social   > 0) cost.social--;
            else if (cost.mental   > 0) cost.mental--;
        }

        return cost;
    }

    // ----------------------------------------
    // ATTEMPT TASK
    // ----------------------------------------

    attemptTask() {
        if (this.selectedTask === null) { this.message = "⚠️ Select a task first!"; return; }
        if (this.selectedCards.length === 0) { this.message = "⚠️ Select F cards to play!"; return; }

        const task          = this.currentTasks[this.selectedTask];
        const selectedFCards = this.selectedCards.map(i => this.hand[i]);
        const modifiedCost  = this.getModifiedCost(task);

        const physicalNeeded = modifiedCost.physical || 0;
        const socialNeeded   = modifiedCost.social   || 0;
        const mentalNeeded   = modifiedCost.mental   || 0;

        const physicalPlayed = selectedFCards.filter(c => c.type === 'physical').length;
        const socialPlayed   = selectedFCards.filter(c => c.type === 'social').length;
        const mentalPlayed   = selectedFCards.filter(c => c.type === 'mental').length;

        if (physicalPlayed >= physicalNeeded && socialPlayed >= socialNeeded && mentalPlayed >= mentalNeeded) {
            const wasFirstTask = !this.firstTaskAttempted;
            this.firstTaskAttempted = true;

            const { discard } = this.getDecksForCurrentTurn();
            discard.push(task);

            this.completedTasks.push(task.name);
            this.currentTasks.splice(this.selectedTask, 1);

            this.selectedCards.sort((a, b) => b - a).forEach(i => {
                this.fDeckDiscard.push(this.hand.splice(i, 1)[0]);
            });

            this.message = `✅ Completed: ${task.name}`;
            this.selectedCards = [];
            this.selectedTask  = null;

            // Apply task effect
            if (task.effect) {
                this.applyEffect(task.effect, task.name);
            }

            // --- CONDITION POSITIVES ON TASK COMPLETION ---

            // Depression: completing first task draws +1 card
            if (wasFirstTask && this.conditions.includes('depression')) {
                this.drawWithReshuffle(1);
                this.message += ' (Depression: Momentum! +1 card)';
            }

            // ADHD: after completing first task, activate next-task discount
            if (wasFirstTask && this.conditions.includes('adhd')) {
                this.adhdFirstTaskBonus = true;
            } else if (!wasFirstTask && this.conditions.includes('adhd') && this.adhdFirstTaskBonus) {
                // Consume the bonus (it was applied in getModifiedCost)
                this.adhdFirstTaskBonus = false;
            }

            // ASD: completing a Social task draws +1 card
            if ((task.cost.social || 0) > 0 && this.conditions.includes('asd')) {
                this.drawWithReshuffle(1);
                this.message += ' (ASD: Social win! +1 card)';
            }

            // Bipolar Depressive: completing any task removes 1 Stress
            if (this.conditions.includes('bipolar') && this.bipolarState === 'depressive' && this.stress > 0) {
                this.stress = Math.max(0, this.stress - 1);
                this.message += ' (Bipolar Depressive: -1 Stress)';
            }

            // OCD: count tasks completed this turn
            this.tasksCompletedThisTurn++;

        } else {
            this.message = "❌ Wrong cards! Check the task requirements.";
        }
    }

    // ----------------------------------------
    // EFFECTS
    // ----------------------------------------

    applyEffect(effect, taskName) {
        if (this.burntOut &&
            (effect.code.includes('REMOVE_STRESS') ||
             effect.code.includes('PREVENT_STRESS') ||
             effect.code.includes('DRAW'))) {
            this.message += " (😡 Burnt Out: Effect fizzled...)";
            return;
        }

        this.message += ` (${effect.text})`;

        switch (effect.code) {
            case "DRAW":
                this.drawWithReshuffle(effect.value);
                break;
            case "DRAW_SPECIFIC":
                this.drawSpecific(effect.type, effect.value);
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
            case "COST_REDUCTION_TURN":
                this.turnCostReduction[effect.type] += effect.value;
                break;
            case "RESET_ACTION":
                if (effect.action === "discardToDrawUsed") {
                    this.discardToDrawUsed = false;
                }
                break;
        }
    }

    drawWithReshuffle(amount) {
        if (this.fDeck.length < amount) {
            this.fDeck.push(...this.shuffle(this.fDeckDiscard));
            this.fDeckDiscard = [];
        }
        for (let i = 0; i < amount && this.fDeck.length > 0; i++) {
            this.hand.push(this.fDeck.pop());
        }
    }

    drawSpecific(type, amount) {
        let found = 0;
        for (let i = this.fDeck.length - 1; i >= 0; i--) {
            if (this.fDeck[i].type === type) {
                this.hand.push(this.fDeck.splice(i, 1)[0]);
                found++;
                if (found === amount) return;
            }
        }
        this.fDeck.push(...this.shuffle(this.fDeckDiscard));
        this.fDeckDiscard = [];
        for (let i = this.fDeck.length - 1; i >= 0; i--) {
            if (this.fDeck[i].type === type) {
                this.hand.push(this.fDeck.splice(i, 1)[0]);
                found++;
                if (found === amount) return;
            }
        }
    }

    // ----------------------------------------
    // STRESS
    // ----------------------------------------

    addStress(amount) {
        if (this.burntOut) return;

        if (this.stressShield > 0) {
            const prevented = Math.min(this.stressShield, amount);
            this.stressShield -= prevented;
            amount -= prevented;
            this.message += ` (Prevented ${prevented} Stress!)`;
        }

        this.stress = Math.min(7, this.stress + amount);

        if (this.stress >= 7) {
            if (this.mode === 'life') {
                this.endGame();
            } else {
                this.burntOut = true;
                this.stress = 7;
                this.message += " 😡 You are Burnt Out! All tasks cost more and positive effects fizzle.";
            }
        }
    }

    // ----------------------------------------
    // SKIP TASK
    // ----------------------------------------

    skipTask() {
        if (this.selectedTask === null) { this.message = "⚠️ Select a task to skip!"; return; }

        this.firstTaskAttempted = true;

        const task = this.currentTasks.splice(this.selectedTask, 1)[0];
        const { discard } = this.getDecksForCurrentTurn();
        discard.push(task);

        this.message = `⏭️ Skipped: ${task.name}`;
        this.selectedTask = null;

        // Bipolar depressive: skipping costs 0 stress
        if (this.conditions.includes('bipolar') && this.bipolarState === 'depressive') {
            this.message += ' (Bipolar Depressive: no stress penalty)';
            return;
        }

        // PTSD: skipping costs +3 instead of +2
        let stressToAdd = this.conditions.includes('ptsd') ? 3 : 2;
        this.addStress(stressToAdd);
        this.message += ` (+${stressToAdd} Stress)`;
    }

    // ----------------------------------------
    // ANXIETY PEEK
    // ----------------------------------------

    peekNextTask() {
        if (!this.conditions.includes('anxiety')) return;
        if (this.anxietyPeekUsed) { this.message = "⚠️ Anxiety Peek already used this turn."; return; }

        // Get the next turn's deck (wraps to morning if on evening)
        const nextTurn = this.turn < 4 ? this.turn + 1 : 1;
        let nextDeck;
        switch (nextTurn) {
            case 1: nextDeck = this.morningTasks;   break;
            case 2: nextDeck = this.middayTasks;    break;
            case 3: nextDeck = this.afternoonTasks; break;
            case 4: nextDeck = this.eveningTasks;   break;
        }

        if (!nextDeck || nextDeck.length === 0) {
            this.message = "👁️ Next task deck is empty — nothing to peek at.";
            return;
        }

        this.anxietyPeekedTask = nextDeck[nextDeck.length - 1];
        this.anxietyPeekUsed   = true;
        const nextTurnName = ["Morning", "Midday", "Afternoon", "Evening"][nextTurn - 1];
        this.message = `👁️ Anxiety Peek: Coming up in ${nextTurnName} — "${this.anxietyPeekedTask.name}"`;
    }

    // ----------------------------------------
    // HYPERFOCUS (ADHD ability)
    // ----------------------------------------

    useHyperfocus() {
        if (!this.conditions.includes('adhd')) return;
        if (this.hyperfocusUsed)    { this.message = "⚠️ Hyperfocus already used this turn."; return; }
        if (this.selectedTask === null) { this.message = "⚠️ Select a task to hyperfocus on!"; return; }
        if (this.hand.length < 3)   { this.message = "⚠️ Need at least 3 cards to Hyperfocus!"; return; }

        const task = this.currentTasks[this.selectedTask];

        for (let i = 0; i < 3; i++) {
            this.fDeckDiscard.push(this.hand.splice(0, 1)[0]);
        }
        this.hyperfocusUsed     = true;
        this.firstTaskAttempted = true;

        const { discard } = this.getDecksForCurrentTurn();
        discard.push(task);
        this.completedTasks.push(task.name);
        this.currentTasks.splice(this.selectedTask, 1);

        this.message = `⚡ HYPERFOCUS! Completed: ${task.name}`;
        this.selectedCards = [];
        this.selectedTask  = null;

        this.tasksCompletedThisTurn++;
        // Activate ADHD discount for next task
        this.adhdFirstTaskBonus = true;

        if (task.effect) {
            this.applyEffect(task.effect, task.name);
        }
    }

    // ----------------------------------------
    // DISCARD 2 → DRAW 2
    // ----------------------------------------

    discardToDraw() {
        if (this.burntOut)         { this.message = "😡 Burnt out — too exhausted to search for cards."; return; }
        if (this.discardToDrawUsed) { this.message = "⚠️ Discard 2, Draw 2 already used this turn."; return; }
        if (this.selectedTask !== null) { this.message = "⚠️ Cannot discard cards while a task is selected."; return; }
        if (this.selectedCards.length !== 2) { this.message = "⚠️ Select exactly 2 cards to discard!"; return; }

        this.selectedCards.sort((a, b) => b - a).forEach(i => {
            this.fDeckDiscard.push(this.hand.splice(i, 1)[0]);
        });
        this.selectedCards     = [];
        this.discardToDrawUsed = true;

        this.drawWithReshuffle(2);
        this.message = "♻️ Discarded 2, drew 2.";
    }

    // ----------------------------------------
    // SPEND 3 → REMOVE 1 STRESS
    // ----------------------------------------

    spendToRemoveStress() {
        if (this.burntOut)    { this.message = "😡 Burnt out. This has no effect."; return; }
        if (this.selectedTask !== null) { this.message = "⚠️ Cannot spend cards while a task is selected."; return; }
        if (this.stress <= 0) { this.message = "⚠️ No stress to remove!"; return; }
        if (this.selectedCards.length !== 3) { this.message = "⚠️ Select exactly 3 cards to spend!"; return; }

        this.selectedCards.sort((a, b) => b - a).forEach(i => {
            this.fDeckDiscard.push(this.hand.splice(i, 1)[0]);
        });
        this.selectedCards = [];

        this.stress--;
        this.message = "🧘 Spent 3 cards to remove 1 stress.";
    }

    // ----------------------------------------
    // END TURN
    // ----------------------------------------

    endTurn() {
        // Burnout critical exhaustion
        if (this.burntOut && this.hand.length > 0) {
            this.fDeckDiscard.push(this.hand.splice(0, 1)[0]);
            this.message = "😡 Critical Exhaustion: Discarded 1 card. ";
        } else {
            this.message = "";
        }

        // OCD perfect-turn bonus check: both tasks done, nothing lingering
        if (this.conditions.includes('ocd')) {
            if (this.tasksCompletedThisTurn >= 2 && this.currentTasks.length === 0) {
                this.nextTurnOcdBonus = true;
                this.message += '(OCD: Perfect turn — +2 cards next turn!) ';
            }
        }

        // Handle incomplete tasks → lingering
        if (this.currentTasks.length > 0) {
            const lingeringDeck = this.getLingeringDeckForCurrentTurn();
            const stressFromIncomplete = this.currentTasks.length;
            while (this.currentTasks.length > 0) {
                lingeringDeck.push(this.currentTasks.pop());
            }
            this.addStress(stressFromIncomplete);
            this.message += `+${stressFromIncomplete} Stress from lingering tasks. `;
        }

        // ADHD end-of-turn discard
        if (this.conditions.includes('adhd') && this.hand.length > 0) {
            const discardAmount = Math.min(this.hand.length, 2);
            for (let i = 0; i < discardAmount; i++) {
                this.fDeckDiscard.push(this.hand.splice(0, 1)[0]);
            }
            this.message += `⏩ End Turn. Discarded ${discardAmount} cards (ADHD). `;
        } else {
            this.message += `⏩ End Turn. `;
        }

        // Bipolar Manic end-of-turn discard
        if (this.conditions.includes('bipolar') && this.bipolarState === 'manic' && this.hand.length > 0) {
            const discardAmount = Math.min(this.hand.length, 3);
            for (let i = 0; i < discardAmount; i++) {
                this.fDeckDiscard.push(this.hand.splice(0, 1)[0]);
            }
            this.message += `Discarded ${discardAmount} cards (Bipolar Manic). `;
        }

        // Discard all remaining hand cards to F-deck discard
        while (this.hand.length > 0) {
            this.fDeckDiscard.push(this.hand.pop());
        }

        // Reset per-turn state
        this.selectedCards         = [];
        this.selectedTask          = null;
        this.firstTaskAttempted    = false;
        this.hyperfocusUsed        = false;
        this.discardToDrawUsed     = false;
        this.stressShield          = 0;
        this.turnCostReduction     = { physical: 0, social: 0, mental: 0 };
        this.adhdFirstTaskBonus    = false;
        this.tasksCompletedThisTurn = 0;
        this.anxietyPeekUsed       = false;
        this.anxietyPeekedTask     = null;

        // Advance turn/day
        this.turn++;
        if (this.turn > 4) {
            this.turn = 1;
            this.day++;
        }

        if (this.day > this.dayLimit) {
            this.endGame();
        } else {
            // Bipolar: flip new episode card at the start of each new day
            if (this.turn === 1 && this.conditions.includes('bipolar')) {
                this.bipolarDayFlip();
            }

            this.drawCards();
            this.drawTasks();

            const turnName = ["Morning", "Midday", "Afternoon", "Evening"][this.turn - 1] || "";
            this.message += `📅 Day ${this.day} - ${turnName} (Turn ${this.turn}) started.`;
        }
    }

    // ----------------------------------------
    // GAME OVER
    // ----------------------------------------

    endGame() {
        this.gameOver = true;
        const tasksCompleted = this.completedTasks.length;

        if (this.stress >= 7) {
            this.message = `😡 BURNOUT. Stress limit reached.`;
            if (this.mode === 'life') {
                this.message += ` You survived ${this.day - 1} days and completed ${tasksCompleted} tasks. Life continues — just differently.`;
            } else {
                this.message += ` You completed ${tasksCompleted} tasks. Rest up.`;
            }
            return;
        }

        if (this.mode === 'life') {
            this.message = "Error: Life mode ended without burnout.";
            return;
        }

        if (this.burntOut) {
            this.message = `😡 BURNOUT. You finished the ${this.mode} in a burnt-out state. You completed ${tasksCompleted} tasks.`;
            return;
        }

        const totalPossibleTasks = this.dayLimit * 8;
        const completionRate     = tasksCompleted / totalPossibleTasks;

        if (completionRate >= 0.8) {
            this.message = `🎉 Fantastic! (A+) — You didn't just survive, you thrived! ${tasksCompleted} tasks completed.`;
        } else if (completionRate >= 0.6) {
            this.message = `👍 Great Job! (B) — You managed your Fs well. ${tasksCompleted} tasks completed.`;
        } else if (completionRate >= 0.4) {
            this.message = `😓 You Survived. (C) — It was a struggle, but you made it through. ${tasksCompleted} tasks completed.`;
        } else {
            this.message = `💔 Overwhelmed. (D) — The ${this.mode} was tough. ${tasksCompleted} tasks completed. You'll get 'em next time.`;
        }
    }
}
