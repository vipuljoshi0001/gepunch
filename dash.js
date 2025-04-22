// Role can be "professor" or "assistant_professor"
let currentUserRole = "assistant_professor";  // Set dynamically from DB in real app

let dailyHours = 0;
let weeklyHours = 0;
let monthlyHours = 0;

const maxDailyHours = 6;
const maxWeeklyHours = {
    professor: 30,
    assistant_professor: 35
};
const workingDaysPerWeek = 5;

// Placeholder holiday dates (YYYY-MM-DD format)
const holidayDates = [
    "2025-04-23", // Example holiday
    "2025-04-27"
];

// Real-time date and clock
function updateTime() {
    const now = new Date();
    document.getElementById("real-time").textContent = now.toLocaleTimeString();
}
setInterval(updateTime, 1000);

document.addEventListener("DOMContentLoaded", () => {
    const now = new Date();
    document.getElementById("real-date").textContent = now.toLocaleDateString();
});

// Punch Logic
function punchin() {
    const now = new Date();
    const today = now.toISOString().split("T")[0]; // YYYY-MM-DD

    if (holidayDates.includes(today) || now.getDay() === 0) {
        alert("Today is a holiday or Sunday. No work logged.");
        return;
    }

    if (getWorkingDaysThisWeek() > workingDaysPerWeek) {
        alert("Exceeded maximum working days (5) this week.");
        return;
    }

    if (dailyHours >= maxDailyHours) {
        alert("Max daily hours (6) already logged.");
        return;
    }

    const remainingWeekly = maxWeeklyHours[currentUserRole] - weeklyHours;
    const logHours = Math.min(1, maxDailyHours - dailyHours, remainingWeekly);

    if (logHours <= 0) {
        alert("Weekly quota reached!");
        return;
    }

    dailyHours += logHours;
    weeklyHours += logHours;
    monthlyHours += logHours;

    alert(`Punched in: ${logHours.toFixed(2)} hr(s) logged`);
    updateSummary();
}

function getWorkingDaysThisWeek() {
    const now = new Date();
    let count = 0;
    for (let i = 1; i <= now.getDay(); i++) {
        const d = new Date();
        d.setDate(now.getDate() - (now.getDay() - i));
        const dayStr = d.toISOString().split("T")[0];
        if (!holidayDates.includes(dayStr) && d.getDay() !== 0) {
            count++;
        }
    }
    return count;
}

// Summary Box Updater
function updateSummary() {
    document.querySelector('.summary-box:nth-child(1)').textContent = `Today: ${dailyHours} hrs`;
    document.querySelector('.summary-box:nth-child(2)').textContent = `This Week: ${weeklyHours} hrs`;
    document.querySelector('.summary-box:nth-child(3)').textContent = `This Month: ${monthlyHours} hrs`;
}

// Resets
function resetDailyHours() {
    dailyHours = 0;
    updateSummary();
}
function resetWeeklyHours() {
    weeklyHours = 0;
    updateSummary();
}
function resetMonthlyHours() {
    monthlyHours = 0;
    updateSummary();
}

// Auto resets
setInterval(() => {
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() === 0) resetDailyHours();
}, 60000);

setInterval(() => {
    const now = new Date();
    if (now.getDay() === 0 && now.getHours() === 0 && now.getMinutes() === 0) resetWeeklyHours();
}, 60000);

setInterval(() => {
    const now = new Date();
    if (now.getDate() === 1 && now.getHours() === 0 && now.getMinutes() === 0) resetMonthlyHours();
}, 60000);

// Attach punch function
document.querySelector('.punch-button').addEventListener('click', punchin);
