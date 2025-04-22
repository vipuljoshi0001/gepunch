// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";
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
export const auth = getAuth(app);
export const db = getFirestore(app);

const email = document.getElementById("email").value;
const password = document.getElementById("password").value;

const submit = document.getElementById("submit").value;
submit.addEventListener("click", function(sigin)
{
    event.preventDefault()
    const auth = getAuth();
    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
    // Signed in 
        const user = userCredential.user;
        alert("SignIn Successful.");
    // ...
    })
    .catch((error) => {
        const errorCode = error.code;
        if(errorCode==='auth/invalid-credential'){
            showMessage('Incorrect Email or Password', 'signInMessage');
        }
        else{
            showMessage('Account does not Exist', 'signInMessage');
        }
    });
    
})