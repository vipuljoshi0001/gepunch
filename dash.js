let currentUser = {
    role: "assistant_professor", // professor | assistant_professor | other
    customWeeklyTarget: 32, // used if role is 'other'
    name: "Dr. John",
};

let punchInTime = null;
let punchOutTime = null;

let dailyLog = [];
let weeklyHours = 0;
let monthlyHours = 0;

const maxDailyHours = 6;

// Holidays (format: YYYY-MM-DD)
const holidayDates = [
    "2025-04-23", // National holiday
    "2025-04-27",
];

// Get weekly target based on role
function getOriginalWeeklyTarget() {
    switch (currentUser.role) {
        case "assistant_professor":
            return 35;
        case "professor":
            return 30;
        case "other":
            return currentUser.customWeeklyTarget;
    }
}

// Adjust weekly target based on working days
function getAdjustedWeeklyTarget() {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // Sunday

    let workingDays = 0;
    for (let i = 1; i <= 6; i++) {
        // Monday to Saturday
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);
        const dateStr = d.toISOString().split("T")[0];
        if (!holidayDates.includes(dateStr) && d.getDay() !== 0) {
            workingDays++;
        }
    }

    const originalTarget = getOriginalWeeklyTarget();
    return Math.round((originalTarget / 5) * workingDays);
}

// Punch In
function punchin() {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    if (holidayDates.includes(todayStr) || now.getDay() === 0) {
        alert("Today is a holiday or Sunday.");
        return;
    }

    if (punchInTime) {
        alert("Already punched in.");
        return;
    }

    punchInTime = now;
    alert(`Punched in at ${now.toLocaleTimeString()}`);
}

// Punch Out
function punchout() {
    const now = new Date();
    if (!punchInTime) {
        alert("Punch in first.");
        return;
    }

    punchOutTime = now;

    let hoursWorked = (punchOutTime - punchInTime) / (1000 * 60 * 60);
    hoursWorked = Math.min(hoursWorked, maxDailyHours);

    dailyLog.push({
        date: new Date().toISOString().split("T")[0],
        in: punchInTime.toLocaleTimeString(),
        out: punchOutTime.toLocaleTimeString(),
        hours: hoursWorked.toFixed(2),
    });

    weeklyHours += hoursWorked;
    monthlyHours += hoursWorked;
    punchInTime = null;
    punchOutTime = null;

    updateSummary();
    checkSmartReminder();

    alert(`Punched out. ${hoursWorked.toFixed(2)} hour(s) logged.`);
}

// Summary UI
function updateSummary() {
    const adjustedTarget = getAdjustedWeeklyTarget();
    const percentDone = Math.round((weeklyHours / adjustedTarget) * 100);
    const warning =
        new Date().getDay() === 5 && percentDone < 60 ? " ⚠️ Shortfall risk!" : "";

    // Summary order: This Week → This Month → Today
    document.querySelector(
        ".summary-box:nth-child(1)"
    ).textContent = `This Week: ${weeklyHours.toFixed(
        2
    )} hrs / ${adjustedTarget} hrs${warning}`;

    document.querySelector(
        ".summary-box:nth-child(2)"
    ).textContent = `This Month: ${monthlyHours.toFixed(2)} hrs`;

    document.querySelector(".summary-box:nth-child(3)").textContent = `Today: ${dailyLog.length > 0 ? dailyLog.at(-1).hours + " hrs" : "None"
        }`;
}

// Smart reminder logic
function checkSmartReminder() {
    const adjustedTarget = getAdjustedWeeklyTarget();
    const remaining = adjustedTarget - weeklyHours;
    const today = new Date();
    const daysLeft = 6 - today.getDay(); // Remaining working days (Mon-Sat)

    if (remaining > 0 && daysLeft <= 2) {
        const perDay = remaining / daysLeft;
        alert(
            `⏰ Reminder: You need ~${perDay.toFixed(
                2
            )} hrs/day for next ${daysLeft} day(s) to complete your weekly target.`
        );
    }
}

// Time + date updater
function updateTime() {
    const now = new Date();
    document.getElementById("real-time").textContent = now.toLocaleTimeString();
    document.getElementById("real-date").textContent = now.toLocaleDateString();
}
setInterval(updateTime, 1000);

// Button bindings
document.querySelector(".punch-in-btn").addEventListener("click", punchin);
document.querySelector(".punch-out-btn").addEventListener("click", punchout);
document.addEventListener("DOMContentLoaded", updateSummary);
