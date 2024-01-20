import { initializeApp }  from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, Timestamp, FieldValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth,signInWithPopup,setPersistence,browserLocalPersistence ,createUserWithEmailAndPassword,signInWithEmailAndPassword,GoogleAuthProvider    } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

const firebaseConfig = {
    apiKey: "AIzaSyAQ3sc83x5CcAXW9NTt-NJUcT6C1Zzk6Fc",
    authDomain: "artify-22dff.firebaseapp.com",
    projectId: "artify-22dff",
    storageBucket: "artify-22dff.appspot.com",
    messagingSenderId: "287489070433",
    appId: "1:287489070433:web:83767829fbbb878168e120",
    measurementId: "G-TVHZLDMK8L"
  };
 initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

let uid = null;
auth.onAuthStateChanged(function(user) {
	if (user) {
        uid = user.uid;
	} else {
        alert('You are not logged in');
	}
  });


const submitButton = document.getElementById('submit');

submitButton.addEventListener('click', () => {
    alert('Your profile IS BEING created!');
    const formInformation = {
        profileImage: document.getElementById('profile-image').value,
        username: document.getElementById('username').value,
        description: document.getElementById('description').value,
        link: document.getElementById('link').value
    };
    

    db.collection('artist').doc(uid).set(formInformation)
        .then(() => {
            alert('Your profile has been created!');
            window.location.href = 'profile.html';
        })
        .catch((error) => {
            alert('Your profile has NOT been created!');
            console.error('Error saving form information:', error);
        });
});

