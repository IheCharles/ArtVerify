import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  signOut,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  doc,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  uploadBytes,
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
const storage = getStorage(app);
let username = null;
let description = null;
let profileImage = null;
let link = null;
let uid = null;
const params = new URLSearchParams(window.location.search);
const incomingId = params.get("key");
let postIds = [];
let currentPostId = null;
let isUploading = false; // Flag to prevent multiple submissions

// Close popup when clicking outside modal content
document
  .getElementById("cardClickPopup")
  .addEventListener("click", function (event) {
    if (event.target.id === "cardClickPopup") {
      hidePopup();
      clearPopupFields();
    }
  });

document
  .getElementById("verify-cardClickPopup-button")
  .addEventListener("click", function () {
    copyTextToClipboard(`https://goliadsearch.com/?post=${currentPostId}`);
    document.getElementById("verify-cardClickPopup-button").textContent =
      "Copied";
  });

document.getElementById("logoutButton").addEventListener("click", function () {
  signOut(auth)
    .then(() => {
      window.location.href = "index.html";
    })
    .catch((error) => {
      console.log(error);
    });
});

document
  .getElementById("imageUploadContainer")
  .addEventListener("click", function () {
    document.getElementById("imageInput").click();
  });

document
  .getElementById("imageInput")
  .addEventListener("change", function (event) {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();

      reader.onload = function (e) {
        document.getElementById("previewImage").src = e.target.result;
        document.getElementById("previewImage").style.display = "block";
      };

      reader.readAsDataURL(event.target.files[0]);
    }
  });

document
  .getElementById("add-card-cardContainer")
  .addEventListener("click", function () {
    document.getElementById("cardPopup").style.display = "block";
  });

document
  .getElementById("close-cardPopup-button")
  .addEventListener("click", function () {
    document.getElementById("cardPopup").style.display = "none";
    document.getElementById("previewImage").style.display = "none";
    document.getElementById("previewImage").src = "";
    resetUploadProgress();
  });

document.getElementById("saveCard").addEventListener("click", function () {
  // Prevent multiple submissions
  if (isUploading) {
    return;
  }

  const title = document.getElementById("cardTitle").value;
  const postDescription = document.getElementById("cardDescription").value;
  const imageFile = document.getElementById("imageInput").files[0];
  const cardlinkevidence = document.getElementById("cardlinkevidence").value;

  if (
    !title.trim() ||
    !postDescription.trim() ||
    !imageFile ||
    !cardlinkevidence.trim()
  ) {
    alert("Please fill all fields and select at least one file.");
    return;
  }

  // Set uploading flag to true
  isUploading = true;

  // Show progress elements and disable the save button
  document.getElementById("uploadProgressContainer").style.display = "block";
  document.getElementById("saveCard").disabled = true;
  document.getElementById("saveCard").textContent = "Uploading...";

  let formInformation = {
    title: title,
    description: postDescription,
    uid: uid,
    username: username,
    verified: false,
    timestamp: Date.now(),
    cardlinkevidence: cardlinkevidence ? cardlinkevidence : "null",
    source: null,
  };

  let userInformation = {
    username: username,
    profileImage: profileImage,
    description: description,
    link: link,
    posts: postIds,
  };

  const uploadTask = uploadBytesResumable(
    ref(storage, "images/" + imageFile.name),
    imageFile
  );

  uploadTask.on(
    "state_changed",
    (snapshot) => {
      // Update progress bar
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      document.getElementById("uploadProgressBar").style.width = progress + "%";
      document.getElementById("uploadProgressText").textContent =
        Math.round(progress) + "%";
    },
    (error) => {
      // Handle errors
      console.error("Upload failed", error);
      alert("Upload failed: " + error.message);
      isUploading = false;
      resetUploadProgress();
    },
    () => {
      // Upload completed successfully
      getDownloadURL(uploadTask.snapshot.ref).then((url) => {
        formInformation.Image = url;
        formInformation.media_url = "null";

        addDoc(collection(db, "database"), formInformation)
          .then((docRef) => {
            userInformation.posts.push(docRef.id);
            setDoc(doc(db, "artist", uid), userInformation)
              .then(() => {
                addCard(
                  formInformation.title,
                  formInformation.Image,
                  docRef.id
                );
                document.getElementById("cardPopup").style.display = "none";
                clearPopupFields();
                resetUploadProgress();
                isUploading = false;
              })
              .catch((error) => {
                console.error("Upload failed", error);
                isUploading = false;
                resetUploadProgress();
              });
          })
          .catch((error) => {
            console.error("Upload failed", error);
            isUploading = false;
            resetUploadProgress();
          });
      });
    }
  );
});

function resetUploadProgress() {
  document.getElementById("uploadProgressContainer").style.display = "none";
  document.getElementById("uploadProgressBar").style.width = "0%";
  document.getElementById("uploadProgressText").textContent = "0%";
  document.getElementById("saveCard").disabled = false;
  document.getElementById("saveCard").textContent = "Save";
}

document
  .getElementById("close-cardClickPopup-button")
  .addEventListener("click", function () {
    currentPostId = null;
    hidePopup();
  });

document
  .getElementById("delete-cardClickPopup-button")
  .addEventListener("click", function () {
    let userInformation = {};
    postIds = postIds.filter((item) => item !== currentPostId);
    userInformation.username = username;
    userInformation.profileImage = profileImage;
    userInformation.description = description;
    userInformation.link = link;
    userInformation.posts = postIds;
    const docRef = doc(db, "database", currentPostId);
    deleteDoc(docRef)
      .then(() => {
        setDoc(doc(db, "artist", uid), userInformation).catch((error) => {
          console.error("Upload failed", error);
        });

        const cardContainer = document.getElementById("card-container");
        const cardToRemove = cardContainer.querySelector(
          `div[postid="${currentPostId}"]`
        );

        if (cardContainer && cardToRemove) {
          cardContainer.removeChild(cardToRemove);
        } else {
          console.log("Element not found");
        }
      })
      .catch((error) => {
        console.error("Upload failed", error);
      });
    hidePopup();
  });

function hidePopup() {
  document.getElementById("cardClickPopup").style.display = "none";
  document.getElementById("youtube-container").innerHTML = "";
  document.getElementById("cardClickPopup-cardImage").src = "";
  document.getElementById("cardClickPopup-cardTitle").textContent = "";
  document.getElementById("cardClickPopup-cardDescription").textContent = "";
}

function showPopup(postId) {
  currentPostId = postId;
  document.getElementById("cardClickPopup").style.display = "block";
  const cardTitle = document.getElementById("cardClickPopup-cardTitle");
  const cardDescription = document.getElementById(
    "cardClickPopup-cardDescription"
  );
  const cardImage = document.getElementById("cardClickPopup-cardImage");
  const docRef = doc(db, "database", postId);
  getDoc(docRef).then((docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      let title = data.title;
      let image = data.Image;
      let description = data.description;
      if (
        data.cardlinkevidence &&
        data.cardlinkevidence.includes("youtube.com")
      ) {
        loadVideo(data.cardlinkevidence);
      }
      cardImage.src = image;
      cardTitle.textContent = title;
      cardDescription.textContent = description;
      if (!data.verified) {
        document.getElementById("verify-cardClickPopup-button").style.display =
          "none";
      } else {
        document.getElementById("verify-cardClickPopup-button").style.display =
          "inline-block";
      }
    }
  });
}

function addCard(title, imageSrc, postid, isVerified) {
  const cardContainer = document.getElementById("card-container");
  const newCard = document.createElement("div");
  newCard.classList.add("card");
  newCard.setAttribute("postid", postid);

  const imgElement = document.createElement("img");
  imgElement.src = imageSrc;
  newCard.appendChild(imgElement);

  const titleElement = document.createElement("h3");
  titleElement.textContent = title;
  if (!isVerified) {
    titleElement.textContent = "Verification in progress";
  }
  newCard.appendChild(titleElement);
  newCard.addEventListener("click", function () {
    showPopup(postid);
  });
  const addCardDiv = document.getElementById("add-card-cardContainer");
  cardContainer.insertBefore(newCard, addCardDiv);
}

function clearPopupFields() {
  document.getElementById("cardTitle").value = "";
  document.getElementById("cardDescription").value = "";
  document.getElementById("previewImage").style.display = "none";
  document.getElementById("previewImage").src = "";
  document.getElementById("cardlinkevidence").value = "";
  document.getElementById("verify-cardClickPopup-button").textContent = "Copy";
}

function populateCardContainer() {
  for (const post of postIds) {
    const postRef = doc(db, "database", post);
    getDoc(postRef)
      .then((docSnap) => {
        if (docSnap.exists()) {
          const postData = docSnap.data();
          let title = postData.title;
          let image = postData.Image;
          let isVerified = postData.verified;
          if (incomingId == null || (incomingId != null && isVerified)) {
            addCard(title, image, post, isVerified);
          }
        }
      })
      .catch((error) => {
        console.log("Error getting document:", error);
      });
  }
}

auth.onAuthStateChanged(function (user) {
  if (incomingId == null) {
    if (user) {
      document.getElementById("editButton").style.visibility = "visible";
      document.getElementById("logoutButton").style.visibility = "visible";
      document.getElementById("add-card-cardContainer").style.visibility =
        "visible";
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

            fetch(data.profileImage)
              .then((response) => response.blob())
              .then((blob) => {
                const imageUrl = URL.createObjectURL(blob);
                document.querySelector(".profile-image").src = imageUrl;
              })
              .catch((error) => {
                console.error("Error downloading profile image:", error);
              });
            document.querySelector(".profile-name").innerText = data.username;
            document.querySelector(".profile-description").innerText =
              data.description;
            document.querySelector(".profile-link").innerText = data.link;
            populateCardContainer();
          } else {
            alert("You have not created a profile yet");
          }
        })
        .catch((error) => {
          console.log("Error getting document:", error);
        });
    } else {
      console.log("You are not logged in");
    }
  } else {
    const docRef = doc(db, "artist", incomingId);
    getDoc(docRef)
      .then((docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          username = data.username;
          description = data.description;
          profileImage = data.profileImage;
          link = data.link;
          postIds = data.posts;

          fetch(data.profileImage)
            .then((response) => response.blob())
            .then((blob) => {
              const imageUrl = URL.createObjectURL(blob);
              document.querySelector(".profile-image").src = imageUrl;
            })
            .catch((error) => {
              console.error("Error downloading profile image:", error);
            });
          document.querySelector(".profile-name").innerText = data.username;
          document.querySelector(".profile-description").innerText =
            data.description;
          document.querySelector(".profile-link").innerText = data.link;
          populateCardContainer();
        } else {
          alert("You have not created a profile yet");
        }
      })
      .catch((error) => {
        console.log("Error getting document:", error);
      });
  }
});

function copyTextToClipboard(text) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      console.log("Text copied to clipboard successfully!", text);
    })
    .catch((err) => {
      console.error("Failed to copy text: ", err);
    });
}
function loadVideo(url) {
  const urlParams = new URL(url).searchParams;
  const videoId = urlParams.get("v");
  const iframe = document.createElement("iframe");
  iframe.width = "560";
  iframe.height = "315";
  iframe.src = `https://www.youtube.com/embed/${videoId}`;
  iframe.frameBorder = "0";
  iframe.allowFullscreen = true;
  document.getElementById("youtube-container").appendChild(iframe);
}
