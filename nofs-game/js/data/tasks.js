// ============================================
// TASK DATA
// All tasks with base costs and new effect objects
// ============================================

const TASK_DATA = [
    // Morning tasks (7 tasks)
    {name: "SHOWER", cost: {physical: 1}, time: "Morning", image: "assets/images/tasks/SHOWER.png", effect: { text: "✨ Remove 1 Stress", code: "REMOVE_STRESS", value: 1 }, flavor: "Basically a human car wash. *Beep beep*."},
    {name: "GET DRESSED", cost: {physical: 1}, time: "Morning", image: "assets/images/tasks/GET_DRESSED.png", effect: { text: "✨ Prevent the next 1 Stress", code: "PREVENT_STRESS", value: 1 }, flavor: "Time to put on the 'going outside' costume."},
    {name: "MAKE BREAKFAST", cost: {physical: 1, mental: 1}, time: "Morning", image: "assets/images/tasks/MAKE_BREAKFAST.png", effect: { text: "✨ Draw 1 ⚡ card", code: "DRAW_SPECIFIC", type: "physical", value: 1 }, flavor: "Preparing the morning fuel. Caffeine counts as a food group, right?"},
    {name: "TAKE MEDICATION", cost: {mental: 1}, time: "Morning", image: "assets/images/tasks/TAKE_MEDICATION.png", effect: { text: "✨ Prevent the next 1 Stress", code: "PREVENT_STRESS", value: 1 }, flavor: "My daily subscription for a functional brain."},
    {name: "CHECK CALENDAR", cost: {mental: 1}, time: "Morning", image: "assets/images/tasks/CHECK_CALENDAR.png", effect: { text: "✨ 🧠 tasks cost -1 this turn", code: "COST_REDUCTION_TURN", type: "mental", value: 1 }, flavor: "Let's find and highlight all the holidays!"},
    {name: "COMMUTE TO WORK", cost: {physical: 1, mental: 1}, time: "Morning", image: "assets/images/tasks/COMMUTE_TO_WORK.png", effect: { text: "✨ Draw 1 card", code: "DRAW", value: 1 }, flavor: "My other car is a podcast."},
    {name: "MORNING MEETING", cost: {social: 1, mental: 1}, time: "Morning", image: "assets/images/tasks/MORNING_MEETING.png", effect: { text: "✨ Remove 1 Stress", code: "REMOVE_STRESS", value: 1 }, flavor: "The ritual of 'Could this have been an email?' begins."},
    
    // Midday tasks (8 tasks)
    {name: "RESPOND TO EMAILS", cost: {mental: 1}, time: "Midday", image: "assets/images/tasks/RESPOND_TO_EMAILS.png", effect: { text: "✨ Draw 1 🧠 card", code: "DRAW_SPECIFIC", type: "mental", value: 1 }, flavor: "Taming the inbox. 'Per my last email... '"},
    {name: "COMPLETE WORK TASK", cost: {mental: 2}, time: "Midday", image: "assets/images/tasks/COMPLETE_WORK_TASK.png", effect: { text: "✨ Draw 1 🧠 card", code: "DRAW_SPECIFIC", type: "mental", value: 1 }, flavor: "Turning caffeine into spreadsheets."},
    {name: "LUNCH BREAK", cost: {physical: 1}, time: "Midday", image: "assets/images/tasks/LUNCH_BREAK.png", effect: { text: "✨ Draw 2 cards", code: "DRAW", value: 2 }, flavor: "A 30-minute pause for sustenance. And cat videos."},
    {name: "PHONE CALL", cost: {social: 1}, time: "Midday", image: "assets/images/tasks/PHONE_CALL.png", effect: { text: "✨ Remove 1 Stress", code: "REMOVE_STRESS", value: 1 }, flavor: "An unscheduled audio event. Great."},
    {name: "TEAM COLLABORATION", cost: {social: 2}, time: "Midday", image: "assets/images/tasks/TEAM_COLLABORATION.png", effect: { text: "✨ Draw 1 👥 card", code: "DRAW_SPECIFIC", type: "social", value: 1 }, flavor: "Group projects: the ultimate test of 'we're all in this together'."},
    {name: "PROBLEM SOLVING", cost: {mental: 2}, time: "Midday", image: "assets/images/tasks/PROBLEM_SOLVING.png", effect: { text: "✨ Draw 1 🧠 card", code: "DRAW_SPECIFIC", type: "mental", value: 1 }, flavor: "Just call me 'The Fixer'. *sips coffee*"},
    {name: "MAKE DECISIONS", cost: {mental: 1}, time: "Midday", image: "assets/images/tasks/MAKE_DECISIONS.png", effect: { text: "✨ 🧠 tasks cost -1 this turn", code: "COST_REDUCTION_TURN", type: "mental", value: 1 }, flavor: "Let's flip a coin. Best two out of three."},
    {name: "HANDLE INTERRUPTION", cost: {mental: 1, social: 1}, time: "Midday", image: "assets/images/tasks/HANDLE_INTERRUPTION.png", effect: { text: "✨ Remove 1 Stress", code: "REMOVE_STRESS", value: 1 }, flavor: "OK, deadline's right around the corner so... oh, look! A squirrel!"},
    
    // Afternoon tasks (8 tasks)
    {name: "FINISH PROJECT", cost: {mental: 2}, time: "Afternoon", image: "assets/images/tasks/FINISH_PROJECT.png", effect: { text: "✨ Draw 2 cards", code: "DRAW", value: 2 }, flavor: "It's not 'giving up,' it's 'meeting the deadline'."},
    {name: "ATTEND MEETING", cost: {social: 1, mental: 1}, time: "Afternoon", image: "assets/images/tasks/ATTEND_MEETING.png", effect: { text: "✨ Remove 1 Stress", code: "REMOVE_STRESS", value: 1 }, flavor: "I survived another meeting that could have been an email."},
    {name: "ERRANDS/SHOPPING", cost: {physical: 1, mental: 1}, time: "Afternoon", image: "assets/images/tasks/ERRANDS_SHOPPING.png", effect: { text: "✨ Draw 1 ⚡ card", code: "DRAW_SPECIFIC", type: "physical", value: 1 }, flavor: "Hunter-gathering, but with coupons!"},
    {name: "EXERCISE", cost: {physical: 2}, time: "Afternoon", image: "assets/images/tasks/EXERCISE.png", effect: { text: "✨ Remove 2 Stress", code: "REMOVE_STRESS", value: 2 }, flavor: "The real meaning of 'walk it off'."},
    {name: "CLEAN/ORGANIZE", cost: {physical: 1, mental: 1}, time: "Afternoon", image: "assets/images/tasks/CLEAN_ORGANIZE.png", effect: { text: "✨ Draw 1 ⚡ card", code: "DRAW_SPECIFIC", type: "physical", value: 1 }, flavor: "Making one tiny corner of the world suck a little less."},
    {name: "PAY BILLS", cost: {mental: 1}, time: "Afternoon", image: "assets/images/tasks/PAY_BILLS.png", effect: { text: "✨ Prevent the next 1 Stress", code: "PREVENT_STRESS", value: 1 }, flavor: "Adulting is just paying for things. Over and over."},
    {name: "COOK DINNER", cost: {physical: 1, mental: 1}, time: "Afternoon", image: "assets/images/tasks/COOK_DINNER.png", effect: { text: "✨ Remove 1 Stress", code: "REMOVE_STRESS", value: 1 }, flavor: "Congratulations, you get to feed yourself. Again."},
    {name: "SCHEDULE APPOINTMENTS", cost: {mental: 1, social: 1}, time: "Afternoon", image: "assets/images/tasks/SCHEDULE_APPOINTMENTS.png", effect: { text: "✨ Prevent the next 2 Stress", code: "PREVENT_STRESS", value: 2 }, flavor: "Making a future appointment to be anxious about."},
    
    // Evening tasks (7 tasks)
    {name: "SOCIAL EVENT", cost: {social: 2}, time: "Evening", image: "assets/images/tasks/SOCIAL_EVENT.png", effect: { text: "✨ Draw 2 👥 cards", code: "DRAW_SPECIFIC", type: "social", value: 2 }, flavor: "Time to put on the 'social' battery pack. Hope it lasts."},
    {name: "FAMILY TIME", cost: {social: 1, physical: 1}, time: "Evening", image: "assets/images/tasks/FAMILY_TIME.png", effect: { text: "✨ Draw 1 👥 card", code: "DRAW_SPECIFIC", type: "social", value: 1 }, flavor: "Mandatory fun... that's actually kind of fun."},
    {name: "HOBBIES/RELAXATION", cost: {mental: 1}, time: "Evening", image: "assets/images/tasks/HOBBIES_RELAXATION.png", effect: { text: "✨ Remove all Stress", code: "REMOVE_STRESS_ALL" }, flavor: "Remember fun? Let's try to do that."},
    {name: "PREPARE FOR TOMORROW", cost: {mental: 1}, time: "Evening", image: "assets/images/tasks/PREPARE_FOR_TOMORROW.png", effect: { text: "✨ Prevent the next 1 Stress", code: "PREVENT_STRESS", value: 1 }, flavor: "A gift (or curse) for Future Me."},
    {name: "EVENING ROUTINE", cost: {physical: 1}, time: "Evening", image: "assets/images/tasks/EVENING_ROUTINE.png", effect: { text: "✨ Remove 1 Stress", code: "REMOVE_STRESS", value: 1 }, flavor: "The slow, gradual process of convincing my brain to shut up."},
    {name: "BEDTIME ROUTINE", cost: {physical: 1}, time: "Evening", image: "assets/images/tasks/BEDTIME_ROUTINE.png", effect: { text: "✨ Remove 1 Stress", code: "REMOVE_STRESS", value: 1 }, flavor: "Time to stare at the ceiling for an hour."},
    {name: "REFLECT ON DAY", cost: {mental: 1}, time: "Evening", image: "assets/images/tasks/REFLECT_ON_DAY.png", effect: { text: "✨ 'Discard 2' is usable again", code: "RESET_ACTION", action: "discardToDrawUsed" }, flavor: "Ah yes, I *did* exist today. Good job, me."}
];
