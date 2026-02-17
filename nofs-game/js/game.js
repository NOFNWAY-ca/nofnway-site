// ============================================
// GAME CLASS
// Core game logic and state management
// ============================================

class Game {
    constructor(mode, conditions = []) {
        this.mode = mode;
        this.conditions = conditions;
        this.day = 1; 
        this.turn = 1; 
        // === MODIFIED: Depression no longer adds start stress ===
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

        this.morningTasks = this.shuffle(AppConfig.tasks.filter(t => t.time === "Morning"));
        this.middayTasks = this.shuffle(AppConfig.tasks.filter(t => t.time === "Midday"));
        this.afternoonTasks = this.shuffle(AppConfig.tasks.filter(t => t.time === "Afternoon"));
        this.eveningTasks = this.shuffle(AppConfig.tasks.filter(t => t.time === "Evening"));
        
        this.morningTasksDiscard = [];
        this.middayTasksDiscard = [];
        this.afternoonTasksDiscard = [];
        this.eveningTasksDiscard = [];
        
        this.lingeringMorningTasks = [];
        this.lingeringMiddayTasks = [];
        this.lingeringAfternoonTasks = [];
        this.lingeringEveningTasks = [];
        
        this.hand = [];
        this.currentTasks = [];
        this.selectedCards = [];
        this.selectedTask = null;
        this.message = "📅 Day 1 - Morning (Turn 1) started."; 
        this.gameOver = false;
        
        this.burntOut = false; 
        this.firstTaskAttempted = false; 
        this.hyperfocusUsed = false;
        this.discardToDrawUsed = false; 
        
        this.stressShield = 0; 
        this.turnCostReduction = { physical: 0, social: 0, mental: 0 }; 

        // === MODIFIED: Anhedonia logic removed ===
        
        this.drawCards();
        this.drawTasks(); 
    }
    
    // Create the F-card deck (60 cards)
    createFDeck() {
        const deck = [];
        for (let i = 0; i < 20; i++) deck.push({type: 'physical'});
        for (let i = 0; i < 20; i++) deck.push({type: 'social'});
        for (let i = 0; i < 20; i++) deck.push({type: 'mental'});
        return this.shuffle(deck);
    }
    
    // Fisher-Yates shuffle algorithm
    shuffle(arr) {
        const shuffled = [...arr];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // Gets the correct deck/discard for the current turn
    getDecksForCurrentTurn() {
        switch (this.turn) {
            case 1: return { deck: this.morningTasks, discard: this.morningTasksDiscard, name: "Morning" };
            case 2: return { deck: this.middayTasks, discard: this.middayTasksDiscard, name: "Midday" };
            case 3: return { deck: this.afternoonTasks, discard: this.afternoonTasksDiscard, name: "Afternoon" };
            case 4: return { deck: this.eveningTasks, discard: this.eveningTasksDiscard, name: "Evening" };
            default: return { deck: [], discard: [], name: "Error" };
        }
    }

    // Gets the correct LINGERING deck for the current turn
    getLingeringDeckForCurrentTurn() {
        switch (this.turn) {
            case 1: return this.lingeringMorningTasks;
            case 2: return this.lingeringMiddayTasks;
            case 3: return this.lingeringAfternoonTasks;
            case 4: return this.lingeringEveningTasks;
            default: return [];
        }
    }
    
    // Draw cards based on conditions/stress
    drawCards() {
        let drawCount = 5; 
        if (this.conditions.includes('adhd')) drawCount += 1;
        if (this.stress >= 3 && this.stress <= 4) drawCount -= 1;
        if (this.stress >= 5 || this.burntOut) drawCount -= 2; 
        drawCount = Math.max(1, drawCount); 
        
        if (this.fDeck.length < drawCount) {
            this.fDeck.push(...this.shuffle(this.fDeckDiscard));
            this.fDeckDiscard = [];
            this.message += " (Shuffling F-Card discard pile...)";
        }

        for (let i = 0; i < drawCount && this.fDeck.length > 0; i++) {
            this.hand.push(this.fDeck.pop());
        }
    }
    
    // Draw tasks, prioritizing lingering
    drawTasks() {
        const { deck, discard, name } = this.getDecksForCurrentTurn();
        const lingeringDeck = this.getLingeringDeckForCurrentTurn();
        this.currentTasks = [];
        const tasksToDraw = 2;

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
    
    // Toggle card selection
    selectCard(index) {
        const cardIndex = this.selectedCards.indexOf(index);
        if (cardIndex > -1) {
            this.selectedCards.splice(cardIndex, 1);
        } else {
            this.selectedCards.push(index);
        }
    }
    
    // Toggle task selection
    selectTask(index) {
        this.selectedTask = this.selectedTask === index ? null : index;
    }
    
    // Calculate modified cost
    getModifiedCost(task) {
        const cost = {...task.cost};
        const isFirstTask = !this.firstTaskAttempted;
        
        if (this.conditions.includes('depression') && (task.cost.physical || 0) > 0) {
            cost.physical = (cost.physical || 0) + 1;
        }
        if (this.conditions.includes('anxiety') && (task.cost.social || 0) > 0) {
             cost.social = (cost.social || 0) + 1;
        }
        if (this.conditions.includes('execDys') && isFirstTask) {
            if ((task.cost.physical || 0) > 0) {
                cost.physical = (cost.physical || 0) + 1;
            } else {
                cost.mental = (cost.mental || 0) + 1;
            }
        }
        if (this.conditions.includes('dyslexia') && (task.cost.mental || 0) > 0) {
            cost.mental = (cost.mental || 0) + 1;
        }
        if (this.conditions.includes('asd') && (task.cost.social || 0) > 0) {
            cost.social = (cost.social || 0) + 1;
            cost.mental = (cost.mental || 0) + 1;
        }

        if (this.stress >= 5 || this.burntOut) {
            cost.physical = (cost.physical || 0) + 1;
            cost.social = (cost.social || 0) + 1;
            cost.mental = (cost.mental || 0) + 1;
        }
        
        cost.physical = Math.max(0, (cost.physical || 0) - this.turnCostReduction.physical);
        cost.social = Math.max(0, (cost.social || 0) - this.turnCostReduction.social);
        cost.mental = Math.max(0, (cost.mental || 0) - this.turnCostReduction.mental);
        
        return cost;
    }
    
    // Attempt to complete task
    attemptTask() {
        if (this.selectedTask === null) { this.message = "⚠️ Select a task first!"; return; }
        if (this.selectedCards.length === 0) { this.message = "⚠️ Select F cards to play!"; return; }
        
        const task = this.currentTasks[this.selectedTask];
        const selectedFCards = this.selectedCards.map(i => this.hand[i]);
        const modifiedCost = this.getModifiedCost(task);
        
        const physicalNeeded = modifiedCost.physical || 0;
        const socialNeeded = modifiedCost.social || 0;
        const mentalNeeded = modifiedCost.mental || 0;
        
        const physicalPlayed = selectedFCards.filter(c => c.type === 'physical').length;
        const socialPlayed = selectedFCards.filter(c => c.type === 'social').length;
        const mentalPlayed = selectedFCards.filter(c => c.type === 'mental').length;
        
        if (physicalPlayed >= physicalNeeded && socialPlayed >= socialNeeded && mentalPlayed >= mentalNeeded) {
            this.firstTaskAttempted = true; 
            
            const { discard } = this.getDecksForCurrentTurn();
            discard.push(task); 

            this.completedTasks.push(task.name);
            this.currentTasks.splice(this.selectedTask, 1);
            
            this.selectedCards.sort((a,b) => b - a).forEach(i => {
                this.fDeckDiscard.push(this.hand.splice(i, 1)[0]);
            });
            
            this.message = `✅ Completed: ${task.name}`;
            this.selectedCards = [];
            this.selectedTask = null;
            
            if (task.effect) {
                this.applyEffect(task.effect, task.name); 
            }

        } else {
            this.message = "❌ Wrong cards! Check the task requirements.";
        }
    }
    
    // === MODIFIED: Removed Anhedonia and ASD bonus logic ===
    applyEffect(effect, taskName) {
        // Check for Burnout Anhedonia
        if (this.burntOut && 
            (effect.code.includes('REMOVE_STRESS') || 
             effect.code.includes('PREVENT_STRESS') ||
             effect.code.includes('DRAW'))) {
            this.message += " (😡 Burnt Out: Effect fizzled...)";
            return;
        }
        
        // Depression/Anhedonia check removed
        
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
    
    // Helper for drawing with reshuffle check
    drawWithReshuffle(amount) {
        if (this.fDeck.length < amount) {
            this.fDeck.push(...this.shuffle(this.fDeckDiscard));
            this.fDeckDiscard = [];
        }
        for (let i = 0; i < amount && this.fDeck.length > 0; i++) {
            this.hand.push(this.fDeck.pop());
        }
    }

    // Helper for drawing specific cards
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
    
    // Helper function to add stress, checking shield
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
                this.message += " 😡 You are Burnt Out! All tasks cost more and positive effects have fizzled.";
            }
        }
    }
    
    // === MODIFIED: Removed Anxiety penalty ===
    skipTask() {
        if (this.selectedTask === null) { this.message = "⚠️ Select a task to skip!"; return; }
        
        this.firstTaskAttempted = true; 
        
        const task = this.currentTasks.splice(this.selectedTask, 1)[0];
        const { discard } = this.getDecksForCurrentTurn();
        discard.push(task); 

        this.message = `⏭️ Skipped: ${task.name}`;
        this.selectedTask = null;
        
        let stressToAdd = 2; // Base penalty
        // Anxiety check removed
        this.addStress(stressToAdd);
        this.message += ` (+${stressToAdd} Stress)`;
    }

    // Hyperfocus ability
    useHyperfocus() {
        if (!this.conditions.includes('adhd')) return;
        if (this.hyperfocusUsed) { this.message = "⚠️ Hyperfocus already used this turn."; return; }
        if (this.selectedTask === null) { this.message = "⚠️ Select a task to hyperfocus on!"; return; }
        if (this.hand.length < 3) { this.message = "⚠️ Need at least 3 cards to hyperfocus!"; return; }

        const task = this.currentTasks[this.selectedTask];
        
        for(let i = 0; i < 3; i++) {
            this.fDeckDiscard.push(this.hand.splice(0, 1)[0]);
        }
        this.hyperfocusUsed = true;
        this.firstTaskAttempted = true; 
        
        const { discard } = this.getDecksForCurrentTurn();
        discard.push(task); 
        this.completedTasks.push(task.name);
        this.currentTasks.splice(this.selectedTask, 1);
        
        this.message = `⚡ HYPERFOCUS! Completed: ${task.name}`;
        this.selectedCards = [];
        this.selectedTask = null;
        
        if (task.effect) {
            this.applyEffect(task.effect, task.name); 
        }
    }

    // Discard 2 *selected* to draw 2 (Once per turn)
    discardToDraw() {
        if (this.burntOut) { this.message = "😡 You are burnt out and too exhausted to search for cards."; return; }
        if (this.discardToDrawUsed) {
            this.message = "⚠️ Discard 2, Draw 2 already used this turn.";
            return;
        }
        if (this.selectedTask !== null) {
            this.message = "⚠️ Cannot discard cards while a task is selected.";
            return;
        }
        if (this.selectedCards.length !== 2) {
            this.message = "⚠️ Select exactly 2 cards to discard!";
            return;
        }

        this.selectedCards.sort((a,b) => b - a).forEach(i => {
            this.fDeckDiscard.push(this.hand.splice(i, 1)[0]);
        });
        this.selectedCards = [];
        this.discardToDrawUsed = true; 
        
        this.drawWithReshuffle(2); 
        this.message = "♻️ Discarded 2, drew 2.";
        if (this.fDeck.length < 2 && this.fDeckDiscard.length > 0) {
             this.message += " (Shuffled discard pile)";
        }
    }

    // Spend 3 *selected* to remove 1 stress
    spendToRemoveStress() {
        if (this.burntOut) { this.message = "😡 You are burnt out. This has no effect."; return; }
        if (this.selectedTask !== null) {
            this.message = "⚠️ Cannot spend cards while a task is selected.";
            return;
        }
        if (this.stress <= 0) {
            this.message = "⚠️ No stress to remove!";
            return;
        }
        if (this.selectedCards.length !== 3) {
            this.message = "⚠️ Select exactly 3 cards to spend!";
            return;
        }

        this.selectedCards.sort((a,b) => b - a).forEach(i => {
            this.fDeckDiscard.push(this.hand.splice(i, 1)[0]);
        });
        this.selectedCards = [];
        
        this.stress--;
        this.message = "🧘 Spent 3 cards to remove 1 stress.";
    }
    
    // === MODIFIED: Removed ASD lingering penalty and Anhedonia flip ===
    endTurn() {
        if (this.burntOut && this.hand.length > 0) {
            this.fDeckDiscard.push(this.hand.splice(0, 1)[0]); 
            this.message = "😡 Critical Exhaustion: Discarded 1 card. ";
        } else {
            this.message = ""; 
        }

        let stressFromIncomplete = 0;
        let stressPerTask = 1; 

        // ASD check removed

        if (this.currentTasks.length > 0) {
            const lingeringDeck = this.getLingeringDeckForCurrentTurn();
            stressFromIncomplete = this.currentTasks.length * stressPerTask;
            
            while (this.currentTasks.length > 0) {
                lingeringDeck.push(this.currentTasks.pop());
            }
        }
        
        if (this.conditions.includes('adhd') && this.hand.length > 0) {
            const discardAmount = Math.min(this.hand.length, 2);
            for(let i = 0; i < discardAmount; i++) {
                this.fDeckDiscard.push(this.hand.splice(0, 1)[0]);
            }
            this.message += `⏩ End Turn. Discarded ${discardAmount} cards (ADHD penalty).`;
        } else {
             this.message += `⏩ End Turn.`;
        }
        
        if (stressFromIncomplete > 0) {
            this.addStress(stressFromIncomplete); 
            this.message += ` (+${stressFromIncomplete} Stress from lingering tasks)`;
        }
        
        while (this.hand.length > 0) {
            this.fDeckDiscard.push(this.hand.pop());
        }
        this.selectedCards = [];
        this.selectedTask = null;
        
        this.firstTaskAttempted = false;
        this.hyperfocusUsed = false;
        this.discardToDrawUsed = false; 
        this.stressShield = 0; 
        this.turnCostReduction = { physical: 0, social: 0, mental: 0 }; 

        // Anhedonia flip logic removed
        
        this.turn++; 
        if (this.turn > 4) { 
            this.turn = 1; 
            this.day++; 
        }
        
        if (this.day > this.dayLimit) {
            this.endGame();
        } else {
            this.drawCards();
            this.drawTasks(); 
            
            let turnName = "";
            if (this.turn === 1) turnName = "Morning";
            else if (this.turn === 2) turnName = "Midday";
            else if (this.turn === 3) turnName = "Afternoon";
            else if (this.turn === 4) turnName = "Evening";
            this.message += ` 📅 Day ${this.day} - ${turnName} (Turn ${this.turn}) started.`;
        }
    }
    
    // End the game
    endGame() {
        this.gameOver = true;
        const tasksCompleted = this.completedTasks.length;

        if (this.stress >= 7) {
            this.message = `😡 BURNOUT! Stress limit reached at ${this.stress}.`;
            if (this.mode === 'life') {
                this.message += ` You survived for ${this.day - 1} days and completed ${tasksCompleted} tasks.`;
            } else {
                this.message += ` You completed ${tasksCompleted} tasks.`;
            }
            return;
        }

        if (this.mode === 'life') {
            this.message = "Error: 'Life' mode ended without burnout.";
            return;
        }
        
        if (this.burntOut) {
            this.message = `😡 BURNOUT. You finished the ${this.mode} in a state of burnout. You completed ${tasksCompleted} tasks.`;
            return;
        }
        
        const totalPossibleTasks = this.dayLimit * 8; 
        const completionRate = tasksCompleted / totalPossibleTasks;

        if (completionRate >= 0.8) {
            this.message = `🎉 Fantastic! (A+) - You didn't just survive, you thrived! You completed ${tasksCompleted} tasks.`;
        } else if (completionRate >= 0.6) {
            this.message = `👍 Great Job! (B) - You managed your Fs well and got a lot done. You completed ${tasksCompleted} tasks.`;
        } else if (completionRate >= 0.4) {
            this.message = `😓 You Survived. (C) - It was a struggle, but you made it through. You completed ${tasksCompleted} tasks.`;
        } else {
            this.message = `💔 Overwhelmed. (D) - The ${this.mode} was tough, but you'll get 'em next time. You completed ${tasksCompleted} tasks.`;
        }
    }
}
