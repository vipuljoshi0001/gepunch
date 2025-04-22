// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
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
