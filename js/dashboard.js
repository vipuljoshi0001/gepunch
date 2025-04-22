// 🔥 Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCQ7s2il50q5Cfv-1FYeSkMt7ZuptlzDks",
    authDomain: "gepunch-da073.firebaseapp.com",
    projectId: "gepunch-da073",
    storageBucket: "gepunch-da073.appspot.com",
    messagingSenderId: "697171981095",
    appId: "1:697171981095:web:2af4b39df203903f1b2f02"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

let currentUser = {
    role: "assistant_professor",
    customWeeklyTarget: 32,
    name: "Dr. John",
};

let punchInTime = null;
let punchOutTime = null;

let dailyLog = [];
let weeklyHours = 0;
let monthlyHours = 0;
const maxDailyHours = 6;

const holidayDates = ["2025-04-23", "2025-04-27"];

// Mock data for punch in/out times visualization
const punchLogData = [
    { day: 'Mon', punchIn: '09:00', punchOut: '15:00', hours: 6 },
    { day: 'Tue', punchIn: '08:30', punchOut: '13:00', hours: 4.5 },
    { day: 'Wed', punchIn: '10:00', punchOut: '13:00', hours: 3 },
    { day: 'Thu', punchIn: '09:30', punchOut: '13:00', hours: 3.5 },
    { day: 'Fri', punchIn: '11:00', punchOut: '13:00', hours: 2 }
];

function getOriginalWeeklyTarget() {
    switch (currentUser.role) {
        case "assistant_professor": return 35;
        case "professor": return 30;
        case "other": return currentUser.customWeeklyTarget;
    }
}

function getAdjustedWeeklyTarget() {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    let workingDays = 0;
    for (let i = 1; i <= 6; i++) {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);
        const dateStr = d.toISOString().split("T")[0];
        if (!holidayDates.includes(dateStr) && d.getDay() !== 0) workingDays++;
    }

    const originalTarget = getOriginalWeeklyTarget();
    return Math.round((originalTarget / 5) * workingDays);
}

function punchin() {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    if (holidayDates.includes(todayStr) || now.getDay() === 0) return alert("Today is a holiday or Sunday.");
    if (punchInTime) return alert("Already punched in.");

    punchInTime = now;
    document.getElementById("punch-in-time").textContent = now.toLocaleTimeString();
    alert(`Punched in at ${now.toLocaleTimeString()}`);
}

function punchout() {
    if (!punchInTime) return alert("Punch in first.");

    const now = new Date();
    punchOutTime = now;
    let hoursWorked = (punchOutTime - punchInTime) / (1000 * 60 * 60);
    hoursWorked = Math.min(hoursWorked, maxDailyHours);

    const dateStr = new Date().toISOString().split("T")[0];
    dailyLog.push({ date: dateStr, in: punchInTime.toLocaleTimeString(), out: punchOutTime.toLocaleTimeString(), hours: hoursWorked.toFixed(2) });

    weeklyHours += hoursWorked;
    monthlyHours += hoursWorked;

    document.getElementById("punch-out-time").textContent = punchOutTime.toLocaleTimeString();
    document.getElementById("today-hours").textContent = `${hoursWorked.toFixed(2)} hrs`;

    punchInTime = null;
    punchOutTime = null;

    updateSummary();
    checkSmartReminder();
    updateWeeklyChart();

    alert(`Punched out. ${hoursWorked.toFixed(2)} hour(s) logged.`);
}

function updateSummary() {
    const adjustedTarget = getAdjustedWeeklyTarget();
    const percentDone = Math.round((weeklyHours / adjustedTarget) * 100);
    const remaining = Math.max(adjustedTarget - weeklyHours, 0);
    const daysLeft = 6 - new Date().getDay();
    const avgNeeded = daysLeft > 0 ? (remaining / daysLeft).toFixed(2) : remaining;

    document.getElementById("required-hours").textContent = `Required Hours: ${adjustedTarget}h`;
    document.getElementById("completed-hours").textContent = `Completed: ${weeklyHours.toFixed(2)}h`;
    document.getElementById("remaining-hours").textContent = `Remaining: ${remaining.toFixed(2)}h`;
    document.getElementById("avg-needed").textContent = `Avg. Needed: ${avgNeeded}h/day`;
    document.getElementById("progress-bar").style.width = `${percentDone}%`;
}

function checkSmartReminder() {
    const adjustedTarget = getAdjustedWeeklyTarget();
    const remaining = adjustedTarget - weeklyHours;
    const today = new Date();
    const daysLeft = 6 - today.getDay();

    if (remaining > 0 && daysLeft <= 2) {
        const perDay = remaining / daysLeft;
        document.getElementById("smart-reminder").style.display = 'block';
        document.getElementById("smart-reminder").innerHTML =
            `<strong>⏰ You are ${remaining.toFixed(2)}h behind with ${daysLeft} day(s) left.</strong><br>Suggested Plan: Work <strong>${perDay.toFixed(2)}h/day</strong> to complete your goal.`;
    } else {
        document.getElementById("smart-reminder").style.display = 'none';
    }
}

function timeToDecimal(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours + (minutes / 60);
}
let weeklyChart = null;

// Initialize weekly chart
function initializeWeeklyChart() {
    const ctx = document.getElementById('weeklyChart').getContext('2d');

    const labels = punchLogData.map(day => day.day);
    const punchInData = punchLogData.map(day => timeToDecimal(day.punchIn));
    const punchOutData = punchLogData.map(day => timeToDecimal(day.punchOut));

    weeklyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Punch In',
                    data: punchInData,
                    backgroundColor: 'rgba(59, 130, 246, 0.6)', // Blue
                    order: 2
                },
                {
                    label: 'Punch Out',
                    data: punchOutData,
                    backgroundColor: 'rgba(16, 185, 129, 0.6)', // Green
                    order: 1
                },
                {
                    type: 'line',
                    label: 'Hours Worked',
                    data: punchLogData.map(day => day.hours),
                    borderColor: 'rgba(220, 38, 38, 0.8)', // Red
                    backgroundColor: 'rgba(220, 38, 38, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    order: 0
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Hours (24h format)'
                    },
                    max: 18 // Set max to 6pm (18:00)
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const datasetLabel = context.dataset.label;
                            const value = context.raw;

                            // Convert decimal hours back to time format
                            const hours = Math.floor(value);
                            const minutes = Math.round((value - hours) * 60);
                            const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

                            if (datasetLabel === 'Hours Worked') {
                                return `${datasetLabel}: ${value.toFixed(1)} hours`;
                            }
                            return `${datasetLabel}: ${timeStr}`;
                        }
                    }
                }
            }
        }
    });
}


function updateWeeklyChart() {
    if (!weeklyChart) return;

    weeklyChart.update();
}

// Event listeners
document.addEventListener("DOMContentLoaded", function () {
    document.querySelector(".punch-in-btn").addEventListener("click", punchin);
    document.querySelector(".punch-out-btn").addEventListener("click", punchout);
    updateSummary();
    initializeWeeklyChart();
});