import {
  getDoc,
  setDoc,
  deleteDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { applyViewportScaling } from "./imageScaler.js";

let db = null;
let username = null;
let description = null;
let profileImage = null;
let link = null;
let uid = null;
let postIds = [];
let currentPostId = null;
let popupLoaded = false;

// Initialize the popup module with Firestore instance
export function initPopup(firestoreInstance) {
  db = firestoreInstance;

  // Check if popup is already loaded
  if (document.getElementById("cardClickPopup")) {
    attachPopupListeners();
    popupLoaded = true;
  } else {
    // Load the popup HTML dynamically
    loadPopupHTML().then(() => {
      attachPopupListeners();
      popupLoaded = true;
    });
  }
}

// Load popup HTML from separate file
async function loadPopupHTML() {
  try {
    const response = await fetch("card-popup-profile.html");
    const html = await response.text();

    // Create container if it doesn't exist
    let container = document.getElementById("popup-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "popup-container";
      document.body.appendChild(container);
    }

    container.innerHTML = html;
    return true;
  } catch (error) {
    console.error("Error loading popup module:", error);
    return false;
  }
}

// Attach event listeners for popup
function attachPopupListeners() {
  const popup = document.getElementById("cardClickPopup");

  if (!popup) {
    console.error("Popup elements not found in DOM");
    return;
  }

  document
    .getElementById("verify-cardClickPopup-button")
    .addEventListener("click", function () {
      copyTextToClipboard(`https://goliadsearch.com/?post=${currentPostId}`);
      document.getElementById("verify-cardClickPopup-button").textContent =
        "Copied";
    });

  document
    .getElementById("close-cardPopup-button")
    .addEventListener("click", function () {
      document.getElementById("cardPopup").style.display = "none";
      document.getElementById("previewImage").style.display = "none";
      document.getElementById("previewImage").src = "";
      resetUploadProgress();
    });

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
}

// Ensure popup is loaded before using it
async function ensurePopupLoaded() {
  if (!popupLoaded) {
    await loadPopupHTML();
    attachPopupListeners();
    popupLoaded = true;
  }
}

export async function hidePopup() {
  await ensurePopupLoaded();
  const popup = document.getElementById("cardClickPopup");
  const youtubeContainer = document.getElementById("youtube-container");
  const cardImage = document.getElementById("cardClickPopup-cardImage");

  if (popup) popup.style.display = "none";
  if (youtubeContainer) youtubeContainer.innerHTML = "";
  if (cardImage) {
    cardImage.src = "";
    // Reset any custom styling that was applied
    cardImage.style.width = "";
    cardImage.style.height = "";
  }
}

export async function showPopup(postId) {
  await ensurePopupLoaded();
  currentPostId = postId;

  const popup = document.getElementById("cardClickPopup");
  const cardTitle = document.getElementById("cardClickPopup-cardTitle");
  const cardDescription = document.getElementById(
    "cardClickPopup-cardDescription"
  );
  const cardImage = document.getElementById("cardClickPopup-cardImage");

  if (!popup || !cardTitle || !cardDescription || !cardImage) {
    console.error("Popup elements not found");
    return;
  }

  popup.style.display = "flex";

  const docRef = doc(db, "database", postId);
  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      let title = data.title;
      let image = data.Image;
      let description = data.description;

      cardTitle.textContent = title;
      cardDescription.textContent = description;
      cardImage.src = image;

      // Apply viewport scaling to the image
      applyViewportScaling(cardImage)
        .then(() => {
          console.log("Image scaled successfully");
        })
        .catch((error) => {
          console.error("Error scaling image:", error);
          // Fallback to basic styling if scaling fails
          cardImage.style.maxWidth = "100%";
          cardImage.style.maxHeight = "100%";
        });

      if (
        data.cardlinkevidence &&
        data.cardlinkevidence.includes("youtube.com")
      ) {
        loadVideo(data.cardlinkevidence);
      }

      if (!data.verified) {
        document.getElementById("verify-cardClickPopup-button").style.display =
          "none";
      } else {
        document.getElementById("verify-cardClickPopup-button").style.display =
          "inline-block";
      }
    }
  } catch (error) {
    console.error("Error getting document:", error);
  }
}

export async function copyTextToClipboard(text) {
  await ensurePopupLoaded();
  navigator.clipboard
    .writeText(text)
    .then(() => {
      console.log("Text copied to clipboard successfully!", text);
    })
    .catch((err) => {
      console.error("Failed to copy text: ", err);
    });
}

export async function loadVideo(url) {
  await ensurePopupLoaded();

  const youtubeContainer = document.getElementById("youtube-container");
  if (!youtubeContainer) {
    console.error("YouTube container not found");
    return;
  }

  const urlParams = new URL(url).searchParams;
  const videoId = urlParams.get("v");

  if (videoId) {
    const iframe = document.createElement("iframe");
    iframe.width = "560";
    iframe.height = "315";
    iframe.src = `https://www.youtube.com/embed/${videoId}`;
    iframe.frameBorder = "0";
    iframe.allowFullscreen = true;
    youtubeContainer.appendChild(iframe);
  }
}
