// popup.js
import {
  getFirestore,
  getDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// Global state variables for popup
let currentPostId = null;
let currentUrl = null;
let db = null;
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
    const response = await fetch("popup.html");
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

  popup.addEventListener("click", (event) => {
    // Only close if clicking the background (not the content)
    if (event.target === popup) {
      hidePopup();
    }
  });

  document
    .getElementById("close-cardClickPopup-button")
    .addEventListener("click", () => {
      currentPostId = null;
      currentUrl = null;
      hidePopup();
    });

  document
    .getElementById("src-cardClickPopup-button")
    .addEventListener("click", () => {
      if (currentUrl && currentUrl.includes("http")) {
        window.open(currentUrl);
      } else {
        openNewPageWithParams("profile.html", { key: currentUrl });
      }
    });
}

// Helper function for opening new pages with parameters
function openNewPageWithParams(baseUrl, params) {
  const queryParams = new URLSearchParams(params).toString();
  window.open(`${baseUrl}?${queryParams}`, "_blank");
}

// Ensure popup is loaded before using it
async function ensurePopupLoaded() {
  if (!popupLoaded) {
    await loadPopupHTML();
    attachPopupListeners();
    popupLoaded = true;
  }
}

// Hide popup
export async function hidePopup() {
  await ensurePopupLoaded();
  const popup = document.getElementById("cardClickPopup");
  const youtubeContainer = document.getElementById("youtube-container");
  const cardImage = document.getElementById("cardClickPopup-cardImage");

  if (popup) popup.style.display = "none";
  if (youtubeContainer) youtubeContainer.innerHTML = "";
  if (cardImage) cardImage.src = "";
}

// Show Google popup
export async function showGooglePopup(image) {
  await ensurePopupLoaded();

  const popup = document.getElementById("cardClickPopup");
  const cardTitle = document.getElementById("cardClickPopup-cardTitle");
  const cardImage = document.getElementById("cardClickPopup-cardImage");

  if (!popup || !cardTitle || !cardImage) {
    console.error("Popup elements not found");
    return;
  }

  popup.style.display = "block";
  cardTitle.textContent = image.title;
  cardImage.src = image.link;
  cardImage.style.maxWidth = "100%";
  cardImage.style.maxHeight = "100%";
  currentUrl = image.contextLink;
}

// Show popup for a post
export async function showPopup(postId) {
  await ensurePopupLoaded();

  const popup = document.getElementById("cardClickPopup");
  const cardTitle = document.getElementById("cardClickPopup-cardTitle");
  const cardImage = document.getElementById("cardClickPopup-cardImage");

  if (!popup || !cardTitle || !cardImage) {
    console.error("Popup elements not found");
    return;
  }

  currentPostId = postId;
  popup.style.display = "block";

  const docRef = doc(db, "database", postId);
  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      cardTitle.textContent = data.title;
      cardImage.src = data.Image;
      cardImage.style.maxWidth = "100%";
      cardImage.style.maxHeight = "100%";

      if (
        data.cardlinkevidence &&
        data.cardlinkevidence.includes("youtube.com")
      ) {
        loadVideo(data.cardlinkevidence);
      }

      currentUrl = data.source ? data.source : data.uid;
    } else {
      console.error("Document does not exist");
    }
  } catch (error) {
    console.error("Error getting document:", error);
  }
}

// Load YouTube video
export async function loadVideo(url) {
  await ensurePopupLoaded();

  const youtubeContainer = document.getElementById("youtube-container");
  if (!youtubeContainer) {
    console.error("YouTube container not found");
    return;
  }

  const videoId = new URL(url).searchParams.get("v");
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

// Get current popup state
export function getPopupState() {
  return {
    currentPostId,
    currentUrl,
  };
}
