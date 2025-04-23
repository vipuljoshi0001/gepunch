// Initialize Firebase
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

const holidayDates = ["2025-04-26", "2025-04-27","2025-05-03","2025-05-04","2025-05-09","2025-05-10","2025-05-011","2025-05-12","2025-05-17","2025-05-18"];

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
    const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday

    // Block on Saturday or Sunday
    if (dayOfWeek === 0 || dayOfWeek === 6) {
        alert("Punch in not allowed on weekends (Saturday or Sunday).");
        return;
    }

    // Block on national holidays
    if (holidayDates.includes(todayStr)) {
        alert("Today is a holiday. Punch in is not allowed.");
        return;
    }

    // Check if user already punched in today
    const alreadyPunchedToday = dailyLog.some(entry => entry.date === todayStr);
    if (alreadyPunchedToday) {
        alert("You have already punched in and out today.");
        return;
    }

    // Proceed with punch in
    punchInTime = now;
    document.getElementById("punch-in-time").textContent = now.toLocaleTimeString();
    alert(`Punched in at ${now.toLocaleTimeString()}`);
}



function punchout() {
    if (!punchInTime) {
        alert("Punch in first.");
        return;
    }

    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    // Prevent multiple punchouts in a day
    const alreadyLoggedToday = dailyLog.some(entry => entry.date === todayStr);
    if (alreadyLoggedToday) {
        alert("You have already punched out today.");
        return;
    }

    punchOutTime = now;
    let hoursWorked = (punchOutTime - punchInTime) / (1000 * 60 * 60);
    hoursWorked = Math.min(hoursWorked, maxDailyHours);

    // Save punch log
    dailyLog.push({
        date: todayStr,
        in: punchInTime.toLocaleTimeString(),
        out: punchOutTime.toLocaleTimeString(),
        hours: hoursWorked.toFixed(2)
    });

    weeklyHours += hoursWorked;
    monthlyHours += hoursWorked;

    document.getElementById("punch-out-time").textContent = punchOutTime.toLocaleTimeString();
    document.getElementById("today-hours").textContent = `${hoursWorked.toFixed(2)} hrs`;

    // Reset for the day
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

function getChartDataFromLog() {
    const labels = [];
    const punchInData = [];
    const punchOutData = [];
    const hoursWorkedData = [];

    dailyLog.forEach(log => {
        const date = new Date(log.date);
        const dayLabel = date.toLocaleDateString(undefined, { weekday: 'short' });
        labels.push(dayLabel);

        punchInData.push(timeToDecimal(log.in));
        punchOutData.push(timeToDecimal(log.out));
        hoursWorkedData.push(parseFloat(log.hours));
    });

    return { labels, punchInData, punchOutData, hoursWorkedData };
}

let weeklyChart = null;

function initializeWeeklyChart() {
    const ctx = document.getElementById('weeklyChart').getContext('2d');

    weeklyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Punch In',
                    data: [],
                    backgroundColor: 'rgba(59, 130, 246, 0.6)',
                    order: 2
                },
                {
                    label: 'Punch Out',
                    data: [],
                    backgroundColor: 'rgba(16, 185, 129, 0.6)',
                    order: 1
                },
                {
                    type: 'line',
                    label: 'Hours Worked',
                    data: [],
                    borderColor: 'rgba(220, 38, 38, 0.8)',
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
                    max: 18
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const datasetLabel = context.dataset.label;
                            const value = context.raw;
                            if (datasetLabel === 'Hours Worked') {
                                return `${datasetLabel}: ${value.toFixed(1)} hours`;
                            }
                            const hours = Math.floor(value);
                            const minutes = Math.round((value - hours) * 60);
                            return `${datasetLabel}: ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                        }
                    }
                }
            }
        }
    });
}

function updateWeeklyChart() {
    if (!weeklyChart) return;

    const { labels, punchInData, punchOutData, hoursWorkedData } = getChartDataFromLog();

    weeklyChart.data.labels = labels;
    weeklyChart.data.datasets[0].data = punchInData;
    weeklyChart.data.datasets[1].data = punchOutData;
    weeklyChart.data.datasets[2].data = hoursWorkedData;

    weeklyChart.update();
}

document.addEventListener("DOMContentLoaded", function () {
    document.querySelector(".punch-in-btn").addEventListener("click", punchin);
    document.querySelector(".punch-out-btn").addEventListener("click", punchout);
    updateSummary();
    initializeWeeklyChart();
});
