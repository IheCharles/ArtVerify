import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getAuth,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDoc,
  addDoc,
  setDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
const firebaseConfig = {
  apiKey: "AIzaSyAQ3sc83x5CcAXW9NTt-NJUcT6C1Zzk6Fc",
  authDomain: "artify-22dff.firebaseapp.com",
  projectId: "artify-22dff",
  storageBucket: "artify-22dff.appspot.com",
  messagingSenderId: "287489070433",
  appId: "1:287489070433:web:83767829fbbb878168e120",
  measurementId: "G-TVHZLDMK8L",
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
var provider = new GoogleAuthProvider(app);
provider.addScope("profile");
provider.addScope("email");
document.getElementById("signup-link").addEventListener("click", function () {
  document.getElementById("sign-in-button").style.display = "none";
  document.getElementById("sign-up-button").style.display = "block";
  document.getElementById("reenter-password").style.display = "block";
});

document
  .getElementById("google-login-button")
  .addEventListener("click", function () {
    setPersistence(auth, browserLocalPersistence).then(() => {
      signInWithPopup(auth, provider)
        .then((result) => {
          console.log(result);
          const docRef = doc(db, "artist", result.user.uid);
          getDoc(docRef).then((docSnap) => {
            if (docSnap.exists()) {
              window.location.href = "index.html";
            } else {
              window.location.href = "getstarted.html";
            }
          });
        })
        .catch((error) => {
          const errorMessage = error.message;

          const errorMessageElement = document.getElementById("error-message");
          errorMessageElement.style.display = "block";
          errorMessageElement.textContent = errorMessage;
        });
    });
  });

document
  .getElementById("sign-up-button")
  .addEventListener("click", function () {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const reenterPassword = document.getElementById("reenter-password").value;
    const errorMessageElement = document.getElementById("error-message");
    if (password !== reenterPassword) {
      document.getElementById("error-message").textContent =
        "Passwords do not match";
      return;
    }

    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        createUserWithEmailAndPassword(auth, email, password).then(() => {
          window.location.href = "getstarted.html";
        });
      })

      .catch((error) => {
        errorMessageElement.style.display = "block";
        const errorCode = error.code;
        console.log(errorCode);
        if (errorCode == "auth/invalid-email") {
          document.getElementById("error-message").textContent =
            "invalid email";
        } else if (errorCode == "auth/invalid-login-credentials") {
          document.getElementById("error-message").textContent =
            "invalid login password";
        }
      });
  });

document
  .getElementById("sign-in-button")
  .addEventListener("click", function () {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const errorMessageElement = document.getElementById("error-message");
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        return signInWithEmailAndPassword(auth, email, password);
      })
      .then(() => {
        window.location.href = "index.html";
      })
      .catch((error) => {
        const errorCode = error.code;
        console.log(errorCode);
        const errorMessage = error.message;
        const errorMessageElement = document.getElementById("error-message");
        errorMessageElement.style.display = "block";
        if (errorCode == "auth/invalid-email") {
          document.getElementById("error-message").textContent =
            "invalid email";
        } else if (errorCode == "auth/invalid-login-credentials") {
          document.getElementById("error-message").textContent =
            "invalid login password";
        }
      });
  });
