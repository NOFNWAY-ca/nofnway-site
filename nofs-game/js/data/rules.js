// ============================================
// RULES DATA
// Single Source of Truth for all game text
// ============================================

const GAME_TEXT = {

    rulesOfPlay: [
        "The game is played over <strong>1 Day</strong>, <strong>1 Week</strong> (7 days), or <strong>'Life Mode'</strong> (unlimited).",
        "Each day has 4 turns: Morning, Midday, Afternoon, & Evening.",
        "To <strong>Complete a Task</strong>, match F-Cards (⚡Physical, 👥Social, 🧠Mental) to its cost.",
        "If you <strong>Skip a Task</strong>, you gain <strong>+2 Stress</strong> (conditions may change this).",
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

    conditionDetails: {
        'neurotypical': {
            name: "Neurotypical (Tutorial)",
            penalty: "No condition penalties.",
            positive: "No condition bonuses. Standard rules apply — great for learning the game.",
            rule: "No condition penalties or bonuses. Standard rules apply."
        },
        'depression': {
            name: "Depression",
            penalty: "Draw 1 fewer F-Card each turn (motivation deficit — 4 instead of 5).",
            positive: "Completing your <em>first</em> task each turn draws +1 card back (momentum restores you to 5).",
            rule: "Draw 4 cards/turn instead of 5. But completing your first task draws +1 card — if you get started, you're back to normal."
        },
        'adhd': {
            name: "ADHD",
            penalty: "Draw 6 cards but discard 2 at end of turn. The <em>first</em> task each turn costs +1 🧠 (initiation difficulty).",
            positive: "Hyperfocus: discard 3 cards to complete any task for free (once per <em>day</em>).",
            rule: "Draw 6 cards, discard 2 at end of turn. First task costs +1 🧠. Hyperfocus once per day: discard 3 to complete any task free."
        },
        'anxiety': {
            name: "Anxiety",
            penalty: "All 👥 Social tasks cost +1 🧠 (the overthinking/cognitive load).",
            positive: "Once per turn, Peek at the top card of the next time slot's task deck.",
            rule: "All 👥 Social tasks cost +1 🧠 (worry). Once per turn, Peek at the top card of the next task deck."
        },
        'asd': {
            name: "ASD",
            penalty: "All 👥 Social tasks cost +1 👥 (social battery drain).",
            positive: "Completing a Social task draws +4 F-Cards (social win = energy spike).",
            rule: "All 👥 Social tasks cost +1 👥. But completing a Social task draws +4 cards."
        },
        'ocd': {
            name: "OCD",
            penalty: "At the start of each turn, if you have 4+ cards, discard 1 (ritual tax).",
            positive: "If you complete <em>both</em> tasks this turn with none lingering, draw +2 cards next turn.",
            rule: "Discard 1 card at turn start if hand ≥ 4 (ritual). Complete both tasks with no lingering → draw +2 next turn."
        },
        'bipolar': {
            name: "Bipolar",
            penalty: "Each day, flip an F-Card: ⚡Physical = Manic (draw +2, discard 3 at turn end, 3 tasks/turn). 👥Social or 🧠Mental = Depressive (draw -1).",
            positive: "Manic: draw +2 and face 3 tasks per turn. Depressive: skipping a task costs 0 Stress.",
            rule: "Day-start flip determines episode. Manic: +2 draw, discard 3/turn, 3 tasks. Depressive: -1 draw, free skips."
        },
        'ptsd': {
            name: "PTSD",
            penalty: "Skipping a task costs +3 Stress (instead of +2).",
            positive: "Start the game with 1 free Stress Shield (absorbs 1 incoming Stress).",
            rule: "Skipping costs +3 Stress. But you begin with 1 free Stress Shield."
        }
    }
};
