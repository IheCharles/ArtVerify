import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getAuth,
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
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";

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

let uid = null;
let username = null;
let description = null;
let profileImage = null;
let link = null;
let postIds = [];
auth.onAuthStateChanged(function (user) {
  if (user) {
    uid = user.uid;
    const docRef = doc(db, "artist", uid);
    getDoc(docRef)
      .then((docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          username = data.username;
          description = data.description;
          profileImage = data.profileImage;
          link = data.link;
          postIds = data.posts;
          setUpButtonEventListeners();
          // Use the values of username, description, profileImage, and link here
        } else {
          console.log("You have not created a profile yet");
        }
      })
      .catch((error) => {
        console.log("Error getting document:", error);
      });
  } else {
    console.log("You are not logged in");
  }
});

function setUpButtonEventListeners() {
  const submitButton = document.getElementById("submit");
  submitButton.addEventListener("click", async (e) => {
    e.preventDefault();
    if (uid !== null) {
      const file = document.getElementById("profile-image").files[0];
      const storage = getStorage(app);

      try {
        const formInformation = {};
        const newUsername = document.getElementById("username").value;
        const newDescription = document.getElementById("description").value;
        const newLink = document.getElementById("link").value;

        if (newUsername !== "") {
          formInformation.username = newUsername;
        } else {
          formInformation.username = username;
        }
        if (newDescription !== "") {
          formInformation.description = newDescription;
        } else {
          formInformation.description = description;
        }
        if (newLink !== "") {
          formInformation.link = newLink;
        } else {
          formInformation.link = link;
        }

        formInformation.posts = postIds;

        if (file !== null && file !== undefined) {
          uploadBytesResumable(ref(storage, "images/" + file.name), file)
            .then((snapshot) => {
              console.log("Uploaded", snapshot.totalBytes, "bytes.");
              console.log("File metadata:", snapshot.metadata);

              getDownloadURL(snapshot.ref).then((url) => {
                console.log("File available at", url);
                formInformation.profileImage = url;
                saveFormInformation(formInformation);
              });
            })
            .catch((error) => {
              console.error("Upload failed", error);
            });
        } else {
          formInformation.profileImage = profileImage;
          saveFormInformation(formInformation);
        }
      } catch (error) {
        console.error("Error creating profile:", error);
      }
    } else {
      console.log("You are not logged in");
    }
  });

  function saveFormInformation(formInformation) {
    setDoc(doc(db, "artist", uid), formInformation).then(() => {
      window.location.href = "profile.html";
    });
  }
}
