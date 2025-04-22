// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc, arrayUnion, serverTimestamp, } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCQ7s2il50q5Cfv-1FYeSkMt7ZuptlzDks",
    authDomain: "gepunch-da073.firebaseapp.com",
    projectId: "gepunch-da073",
    storageBucket: "gepunch-da073.appspot.com",
    messagingSenderId: "697171981095",
    appId: "1:697171981095:web:2af4b39df203903f1b2f02",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    document.getElementById("real-time").textContent = timeString;
}
setInterval(updateTime, 1000);

document.addEventListener("DOMContentLoaded", () => {
    const now = new Date();
    const dateString = now.toLocaleDateString();
    document.getElementById("real-date").textContent = dateString;
    updateSummary();
});

let dailyHours = 0;
let weeklyHours = 0;
let monthlyHours = 0;
let totalHours = 0;

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
    document.getElementById(
    "today-hours"
    ).textContent = `Today: ${dailyHours.toFixed(2)} hrs`;
    document.getElementById(
    "week-hours"
    ).textContent = `This Week: ${weeklyHours.toFixed(2)} hrs`;
    document.getElementById(
    "month-hours"
    ).textContent = `This Month: ${monthlyHours.toFixed(2)} hrs`;
    console.log(
    `Today: ${dailyHours} hrs, Week: ${weeklyHours} hrs, Month: ${monthlyHours} hrs`
    );
}

function calculateWorkDuration(start, end) {
    const durationMs = end - start;
    return +(durationMs / (1000 * 60 * 60)).toFixed(2); // hours
}

// Reset intervals
setInterval(() => {
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() === 0) resetDailyHours();
}, 60000);
setInterval(() => {
    const now = new Date();
    if (now.getDay() === 0 && now.getHours() === 0 && now.getMinutes() === 0)
    resetWeeklyHours();
}, 60000);
setInterval(() => {
    const now = new Date();
    if (now.getDate() === 1 && now.getHours() === 0 && now.getMinutes() === 0)
    resetMonthlyHours();
}, 60000);

// Punch Out logic
document.getElementById("punchout").addEventListener("click", function (event) {
    event.preventDefault();
    console.log("PunchOut button clicked");

    onAuthStateChanged(auth, async (user) => {
    if (!user) return alert("User not signed in.");

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    const today = new Date().toDateString();

    let alreadyPunchedOut = false;

    if (userSnap.exists()) {
        const data = userSnap.data();
        const punchOuts = data.punchOuts || [];

        alreadyPunchedOut = punchOuts.some((ts) => {
        const d = ts.toDate ? ts.toDate() : new Date(ts);
        return d.toDateString() === today;
        });
    }

    if (alreadyPunchedOut) {
        alert("Already punched out today.");
    } else {
        try {
        await updateDoc(userRef, {
            punchOuts: arrayUnion(serverTimestamp()),
        });
        alert("Punch Out recorded!");

        // Fetch updated data
        const updatedSnap = await getDoc(userRef);
        const data = updatedSnap.data();
        const punchIns = data.punchIns || [];
        const punchOuts = data.punchOuts || [];

        const todayPunchIn = punchIns
            .map((t) => t.toDate())
            .find((d) => d.toDateString() === today);
        const todayPunchOut = punchOuts
            .map((t) => t.toDate())
            .find((d) => d.toDateString() === today);

        if (todayPunchIn && todayPunchOut) {
            const workedHours = calculateWorkDuration(
            todayPunchIn,
            todayPunchOut
            );
            dailyHours += workedHours;
            weeklyHours += workedHours;
            monthlyHours += workedHours;
            totalHours += workedHours;
            updateSummary();
        }
        } catch (error) {
        console.error("Error punching out:", error);
        alert("Failed to punch out.");
        }
    }
    });
});
