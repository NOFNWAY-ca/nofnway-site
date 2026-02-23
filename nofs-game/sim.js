// ============================================
// NO Fs TO GIVE — Balance Simulator
//
// HOW TO USE:
//   1. Open nofs-game/index.html in your browser
//   2. Press F12 → Console tab
//   3. Paste this entire file and press Enter
//   4. Results print as a table (~2 seconds to run)
//
// TUNING KNOBS (top of file):
//   N    — games per condition (more = more accurate, slower)
//   MODE — 'day' | 'week' | 'life' (week recommended)
// ============================================

(function runBalanceSim() {

    const N    = 300;      // games per condition
    const MODE = 'week';   // game length

    const CONDITIONS = [
        { label: 'Neurotypical', conds: []            },
        { label: 'Depression',   conds: ['depression'] },
        { label: 'ADHD',         conds: ['adhd']       },
        { label: 'Anxiety',      conds: ['anxiety']    },
        { label: 'ASD',          conds: ['asd']        },
        { label: 'OCD',          conds: ['ocd']        },
        { label: 'Bipolar',      conds: ['bipolar']    },
        { label: 'PTSD',         conds: ['ptsd']       },
    ];

    // ----------------------------------------
    // AUTO-PLAYER STRATEGY
    // Greedy: complete any task we can afford.
    // Falls back to ADHD Hyperfocus if stuck.
    // Skips if truly stuck (no valid moves).
    // ----------------------------------------
    function autoPlay(game) {
        const MAX_TURNS = MODE === 'life' ? 200 : 50; // safety cap
        let turnCount = 0;

        while (!game.gameOver && turnCount++ < MAX_TURNS) {

            // --- Try to complete tasks ---
            let madeProgress = true;
            while (madeProgress && !game.gameOver) {
                madeProgress = false;

                for (let ti = 0; ti < game.currentTasks.length; ti++) {
                    const cost = game.getModifiedCost(game.currentTasks[ti]);
                    const have = { physical: 0, social: 0, mental: 0 };
                    game.hand.forEach(c => have[c.type]++);

                    const needed = {
                        physical: cost.physical || 0,
                        social:   cost.social   || 0,
                        mental:   cost.mental   || 0,
                    };

                    if (have.physical >= needed.physical &&
                        have.social   >= needed.social   &&
                        have.mental   >= needed.mental) {

                        // Select task + exact cards needed
                        game.selectedTask  = ti;
                        game.selectedCards = [];
                        const toUse = { ...needed };
                        game.hand.forEach((c, i) => {
                            if (toUse[c.type] > 0) {
                                game.selectedCards.push(i);
                                toUse[c.type]--;
                            }
                        });
                        game.attemptTask();
                        madeProgress = true;
                        break; // indices changed — restart scan
                    }
                }

                // ADHD: use Hyperfocus on first stuck task (once per turn)
                if (!madeProgress &&
                    game.conditions.includes('adhd') &&
                    !game.hyperfocusUsed &&
                    game.currentTasks.length > 0 &&
                    game.hand.length >= 3) {
                    game.selectedTask = 0;
                    game.useHyperfocus();
                    madeProgress = true;
                }
            }

            // --- End turn ---
            if (!game.gameOver) game.endTurn();
        }
    }

    // ----------------------------------------
    // RUN SIMULATIONS
    // ----------------------------------------
    let baselineAvgTasks = 0;

    const rows = CONDITIONS.map(({ label, conds }) => {
        let totalTasks = 0, totalStress = 0, burnouts = 0, weeksDone = 0;

        for (let i = 0; i < N; i++) {
            const g = new Game(MODE, conds);
            autoPlay(g);

            totalTasks  += g.completedTasks.length;
            totalStress += g.stress;
            if (g.burntOut || g.stress >= 7) burnouts++;
            if (MODE === 'week' && g.day > 7)  weeksDone++;
            if (MODE === 'day'  && g.day >= 1 && !g.burntOut) weeksDone++;
        }

        const avgTasks = totalTasks / N;
        if (label === 'Neurotypical') baselineAvgTasks = avgTasks;

        return {
            Condition:     label,
            'Avg Tasks':   avgTasks.toFixed(1),
            'Burnout %':   Math.round(burnouts  / N * 100) + '%',
            'Finished %':  Math.round(weeksDone / N * 100) + '%',
            'Avg Stress':  (totalStress / N).toFixed(1),
        };
    });

    // ----------------------------------------
    // OUTPUT — plain text so copy-console works
    // ----------------------------------------
    const pad = (s, n) => String(s).padEnd(n);
    const header = `${pad('Condition',14)} | ${pad('Avg Tasks',9)} | ${pad('Burnout%',8)} | ${pad('Finished%',9)} | Avg Stress`;
    const divider = '-'.repeat(header.length);

    const lines = [
        '',
        `🎮 NO Fs TO GIVE — Balance Sim  (${N} games/condition, ${MODE} mode)`,
        '',
        header,
        divider,
        ...rows.map(r =>
            `${pad(r.Condition,14)} | ${pad(r['Avg Tasks'],9)} | ${pad(r['Burnout %'],8)} | ${pad(r['Finished %'],9)} | ${r['Avg Stress']}`
        ),
        divider,
        '',
        '📊 Task delta vs Neurotypical  (negative = harder):',
        ...rows
            .filter(r => r.Condition !== 'Neurotypical')
            .map(r => {
                const delta = parseFloat(r['Avg Tasks']) - baselineAvgTasks;
                const sign  = delta >= 0 ? '+' : '';
                let flag = '✅ balanced';
                if      (delta < -10) flag = '🔴 WAY too hard — reduce penalties';
                else if (delta <  -6) flag = '🟡 a bit harsh — consider softening';
                else if (delta >   9) flag = '🔴 too easy — positive may be too strong';
                else if (delta >   5) flag = '🟡 easier than baseline';
                return `  ${pad(r.Condition,14)} ${sign}${delta.toFixed(1)} tasks  ${flag}`;
            }),
        '',
        '💡 Burnout 10-40% = healthy range. Task delta -3 to -8 = meaningfully harder.',
        '   Bot never uses Discard2Draw or Spend3 — human players will do better.',
        '   Bipolar variance is high — run twice and average the results.',
        '',
    ];

    console.log(lines.join('\n'));

})();
