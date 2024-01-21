import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js'
import { getAuth, setPersistence, browserLocalPersistence, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';
import { getFirestore,collection,getDocs, addDoc, setDoc,doc } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js'

const firebaseConfig = {
  apiKey: "AIzaSyAQ3sc83x5CcAXW9NTt-NJUcT6C1Zzk6Fc",
  authDomain: "artify-22dff.firebaseapp.com",
  projectId: "artify-22dff",
  storageBucket: "artify-22dff.appspot.com",
  messagingSenderId: "287489070433",
  appId: "1:287489070433:web:83767829fbbb878168e120",
  measurementId: "G-TVHZLDMK8L"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let uid = null;
auth.onAuthStateChanged(function(user) {
	if (user) {
    uid = user.uid;

	} else {
    alert('You are not logged in');
	}
});

const submitButton = document.getElementById('submit');

submitButton.addEventListener('click', async (e) => {
  alert('Your profile IS BEING created!');
  e.preventDefault();
  if (uid !== null){
    const formInformation = {
      profileImage: document.getElementById('profile-image').value,
      username: document.getElementById('username').value,
      description: document.getElementById('description').value,
      link: document.getElementById('link').value
    };
    
    try {
       setDoc(doc(db, 'artist', uid), formInformation);
      alert(uid);
    } catch (error) {
      console.error('Error creating profile:', error);
    }
  } else {
    alert('You are not logged in');
  }
});
