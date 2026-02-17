// ============================================
// RULES DATA
// Single Source of Truth for all game text
// ============================================

const GAME_TEXT = {
    
    // === MODIFIED: Simplified rule text ===
    rulesOfPlay: [
        "The game is played over <strong>1 Day</strong>, <strong>1 Week</strong> (7 days), or <strong>'Life Mode'</strong> (unlimited).",
        "Each day has 4 turns: Morning, Midday, Afternoon, & Evening.",
        "To <strong>Complete a Task</strong>, match F-Cards (⚡Physical, 👥Social, 🧠Mental) to its cost.",
        "If you <strong>Skip a Task</strong>, you gain <strong>+2 Stress</strong>.",
        "Lingering tasks at <strong>End of Turn</strong> add <strong>+1 Stress</strong> each.",
        "Reaching <strong>7 Stress</strong> results in a <strong>BURNOUT</strong> state (or ends 'Life' mode)."
    ],

    howToPlay: [
        "<strong>Match F-Cards</strong> (⚡Physical, 👥Social, 🧠Mental) to a task's cost to complete it.",
        "<strong>Discard 2</strong> selected cards to <strong>Draw 2</strong>. (Once per turn)",
        "<strong>Spend 3</strong> selected cards to <strong>Remove 1 Stress</strong>.",
        "<strong>Lingering tasks</strong> at End of Turn add +1 Stress each.",
        "Reaching <strong>7 Stress</strong> = 😡 BURNOUT."
    ],

    // === MODIFIED: Simplified condition rules ===
    conditionDetails: {
        'depression': {
            name: "Depression",
            rule: "All ⚡ (Physical) tasks cost an additional +1 ⚡ to complete."
        },
        'adhd': {
            name: "ADHD",
            rule: "Draw 6 cards, discard 2. Gain one-use 'Hyperfocus' ability."
        },
        'anxiety': {
            name: "Anxiety",
            rule: "All 👥 (Social) tasks cost an additional +1 👥 to complete."
        },
        'execDys': {
            name: "Executive Dysfunction",
            rule: "The first task you attempt each turn costs +1 extra F-card."
        },
        'dyslexia': {
            name: "Dyslexia",
            rule: "All 🧠 (Mental) tasks cost an additional +1 🧠 to complete."
        },
        'asd': {
            name: "ASD",
            rule: "All 👥 (Social) tasks cost an additional +1 👥 and +1 🧠."
        }
    }
};
