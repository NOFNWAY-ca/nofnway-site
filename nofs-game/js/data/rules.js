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
            penalty: "All ⚡ Physical tasks cost +1 ⚡. The <em>first</em> task each turn costs an extra +1.",
            positive: "Completing your <em>first</em> task each turn draws +1 F-Card (momentum).",
            rule: "All ⚡ Physical tasks cost +1 ⚡. First task each turn costs +1 extra. But completing your first task draws +1 card."
        },
        'adhd': {
            name: "ADHD",
            penalty: "Draw 6 cards but discard 2 at end of turn. The <em>first</em> task each turn costs +1 extra.",
            positive: "After completing your first task, the next task costs -1 (any type). Gain one-use Hyperfocus ability each turn.",
            rule: "Draw 6 cards, discard 2 at end of turn. First task costs +1 extra. After first task, next task costs -1. Hyperfocus: discard 3 to complete any task for free (once/turn)."
        },
        'anxiety': {
            name: "Anxiety",
            penalty: "All 👥 Social tasks cost +1 👥 to complete.",
            positive: "Once per turn, Peek at the top card of the next time slot's task deck.",
            rule: "All 👥 Social tasks cost +1 👥. Once per turn, Peek at the top card of the next task deck."
        },
        'asd': {
            name: "ASD",
            penalty: "All 👥 Social tasks cost +1 👥 and +1 🧠 to complete.",
            positive: "Completing a Social task draws +1 F-Card.",
            rule: "All 👥 Social tasks cost +1 👥 and +1 🧠. Completing a Social task draws +1 card."
        },
        'ocd': {
            name: "OCD",
            penalty: "At the start of each turn, discard 1 card from your hand (ritual tax).",
            positive: "If you complete <em>both</em> tasks this turn with none lingering, draw +2 cards next turn.",
            rule: "Discard 1 card at turn start (ritual). Complete both tasks with no lingering → draw +2 next turn."
        },
        'bipolar': {
            name: "Bipolar",
            penalty: "Each day, flip an F-Card: ⚡Physical = Manic (draw +2, discard 3 at turn end, 3 tasks/turn). Social or Mental = Depressive (draw -2, skips cost 0 stress).",
            positive: "Manic: 3 tasks per turn. Depressive: completing any task removes 1 Stress.",
            rule: "Day-start flip determines episode. Manic: +2 draw, discard 3/turn, 3 tasks. Depressive: -2 draw, free skips, completing tasks removes 1 Stress."
        },
        'ptsd': {
            name: "PTSD",
            penalty: "Skipping a task costs +3 Stress instead of +2.",
            positive: "Start each turn with 1 free Stress Shield (absorbs 1 incoming Stress).",
            rule: "Skipping costs +3 Stress. But start each turn with 1 free Stress Shield."
        }
    }
};
