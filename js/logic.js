// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyCQ7s2il50q5Cfv-1FYeSkMt7ZuptlzDks",
  authDomain: "gepunch-da073.firebaseapp.com",
  projectId: "gepunch-da073",
  storageBucket: "gepunch-da073.firebasestorage.app",
  messagingSenderId: "697171981095",
  appId: "1:697171981095:web:2af4b39df203903f1b2f02"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Save to Firebase
db.collection("punch_logs").add({
  name: currentUser.name,
  role: currentUser.role,
  date: new Date().toISOString().split("T")[0],
  punchIn: punchInTime.toLocaleTimeString(),
  punchOut: punchOutTime.toLocaleTimeString(),
  hours: hoursWorked.toFixed(2)
})
.then(() => {
  console.log("Punch log saved to Firebase.");
})
.catch((error) => {
  console.error("Error saving punch log:", error);
});
