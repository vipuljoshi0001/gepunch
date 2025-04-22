// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc, arrayUnion, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCQ7s2il50q5Cfv-1FYeSkMt7ZuptlzDks",
    authDomain: "gepunch-da073.firebaseapp.com",
    projectId: "gepunch-da073",
    storageBucket: "gepunch-da073.firebasestorage.app",
    messagingSenderId: "697171981095",
    appId: "1:697171981095:web:2af4b39df203903f1b2f02"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const submit = document.getElementById("submit");
submit.addEventListener("click", function (event)
{
    event.preventDefault();
    console.log("Login button clicked");


    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        alert("SignIn Successful.");
        window.location.href = "dashboard.html";
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        alert(errorMessage);
      })
});

const punchin = document.getElementById("punchin");

punchin.addEventListener("click", function (event) {
    event.preventDefault();
    console.log("PunchIn button clicked");

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);
            const today = new Date().toDateString();

            let alreadyPunchedIn = false;

            if (userSnap.exists()) {
                const data = userSnap.data();
                const punchIns = data.punchIns || [];

                alreadyPunchedIn = punchIns.some(ts => {
                    const d = ts.toDate ? ts.toDate() : new Date(ts);
                    return d.toDateString() === today;
                });
            }

            if (alreadyPunchedIn) {
                alert("Already punched in today.");
            } else {
                try {
                    await updateDoc(userRef, {
                        punchIns: arrayUnion(serverTimestamp())
                    });
                    alert("Punch In recorded!");
                } catch (error) {
                    console.error("Error punching in:", error);
                    alert("Failed to punch in.");
                }
            }
        } else {
            alert("User not signed in.");
        }
    });
});

const punchout = document.getElementById("punchout");

punchout.addEventListener("click", function (event) {
  event.preventDefault();
  console.log("PunchOut button clicked");

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      const today = new Date().toDateString();

      let alreadyPunchedOut = false;

      if (userSnap.exists()) {
        const data = userSnap.data();
        const punchOuts = data.punchOuts || [];

        alreadyPunchedOut = punchOuts.some(ts => {
          const d = ts.toDate ? ts.toDate() : new Date(ts);
          return d.toDateString() === today;
        });
      }

      if (alreadyPunchedOut) {
        alert("Already punched out today.");
      } else {
        try {
          await updateDoc(userRef, {
            punchOuts: arrayUnion(serverTimestamp())
          });
          alert("Punch Out recorded!");

          //Calculate hours worked
          const updatedSnap = await getDoc(userRef);
          const data = updatedSnap.data();
          const punchIns = data.punchIns || [];
          const punchOuts = data.punchOuts || [];

          const todayPunchIn = punchIns.map(t => t.toDate()).find(d => d.toDateString() === today);
          const todayPunchOut = punchOuts.map(t => t.toDate()).find(d => d.toDateString() === today);

          if (todayPunchIn && todayPunchOut) {
            const workedHours = calculateWorkDuration(todayPunchIn, todayPunchOut);
            dailyHours += workedHours;
            weeklyHours += workedHours;
            monthlyHours += workedHours;
            updateSummary();
            console.log(`Worked ${workedHours} hrs today.`);
          }

        } catch (error) {
          console.error("Error punching out:", error);
          alert("Failed to punch out.");
        }
      }
    } else {
      alert("User not signed in.");
    }
  });
});
