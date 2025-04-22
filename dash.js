function updateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString();
        document.getElementById("real-time").textContent = timeString;
    }

setInterval(updateTime, 1000);

let totalHours = 0;
let dailyHours = 0;
let weeklyHours = 0;
let monthlyHours = 0;

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

function updateSummary() {
    document.querySelector('.summary-box:nth-child(1)').textContent = `Today: ${dailyHours} hrs`;
    document.querySelector('.summary-box:nth-child(2)').textContent = `This Week: ${weeklyHours} hrs`;
    document.querySelector('.summary-box:nth-child(3)').textContent = `This Month: ${monthlyHours} hrs`;
}

function punch() {
    const now = new Date();
    const startHour = 9;
    const endHour = 17;

    if (now.getHours() >= startHour && now.getHours() < endHour) {
        const hoursWorked = endHour - now.getHours();
        dailyHours += hoursWorked;
        weeklyHours += hoursWorked;
        monthlyHours += hoursWorked;
        totalHours += hoursWorked;
        updateSummary();
    } else {
        alert('Punching is allowed only between 9:00 AM and 5:00 PM');
    }
}

// Reset daily hours at midnight
setInterval(() => {
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() === 0) {
        resetDailyHours();
    }
}, 60000);

// Reset weekly hours on Sunday at midnight
setInterval(() => {
    const now = new Date();
    if (now.getDay() === 0 && now.getHours() === 0 && now.getMinutes() === 0) {
        resetWeeklyHours();
    }
}, 60000);

// Reset monthly hours on the first day of the month at midnight
setInterval(() => {
    const now = new Date();
    if (now.getDate() === 1 && now.getHours() === 0 && now.getMinutes() === 0) {
        resetMonthlyHours();
    }
}, 60000);

// Attach punch function to the punch button
document.querySelector('.punch-button').addEventListener('click', punch);
