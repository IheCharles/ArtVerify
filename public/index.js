import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import {
  getFirestore,
  getDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-analytics.js";

// Firebase configuration and initialization
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
const analytics = getAnalytics(app);

// Global state variables
let currentPostId = null;
let currentUrl = null;
let previousSearchTerm = "";
let serpStart = 1;
let loadMoreCount = 0;
let isListenerLoading = false;

/* ---------------------
   BUBBLE ANIMATION
--------------------- */
function drawBubbles(numBubbles = 50) {
  const bubblez = SVG("#maskBubblez");
  const circles = [];
  const maxAttempts = 100;

  for (let i = 0; i < numBubbles; i++) {
    let attempts = 0;
    let newCircle;
    let isOverlapping;

    do {
      newCircle = {
        x: gsap.utils.random(0, 100),
        y: gsap.utils.random(0, 200),
        radius: gsap.utils.random(4, 20),
      };
      isOverlapping = circles.some((circle) => {
        const deltaX = newCircle.x - circle.x;
        const deltaY = newCircle.y - circle.y;
        return Math.hypot(deltaX, deltaY) < circle.radius + newCircle.radius;
      });
      attempts++;
    } while (isOverlapping && attempts < maxAttempts);

    if (!isOverlapping) {
      bubblez
        .circle(newCircle.radius)
        .x(newCircle.x)
        .y(newCircle.y)
        .fill("#fff")
        .opacity(newCircle.radius / 20);
      circles.push(newCircle);
    }
  }
}

function initScrollAnimation() {
  gsap.registerPlugin(ScrollTrigger);
  gsap.to("circle", {
    y: () =>
      1 - gsap.utils.random(0.1, 0.4) * (ScrollTrigger.maxScroll(window) / 4),
    ease: "none",
    scrollTrigger: {
      start: 0,
      end: "max",
      invalidateOnRefresh: true,
      scrub: 2,
    },
  });
}

/* ---------------------
   AUTHENTICATION
--------------------- */
onAuthStateChanged(auth, (user) => {
  const welcomeElement = document.getElementById("nextPageButton");
  welcomeElement.textContent = user ? "Profile" : "Login";
});

/* ---------------------
   INITIALIZATION & EVENT HANDLERS
--------------------- */
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("searchInput").focus();
  initEventListeners();
  drawBubbles();
  initScrollAnimation();
  checkUrlForPost();
});

function initEventListeners() {
  // Navigation button
  document.getElementById("nextPageButton").addEventListener("click", () => {
    const welcomeElement = document.getElementById("nextPageButton");
    window.location.href =
      welcomeElement.textContent === "Login" ? "login.html" : "profile.html";
  });

  // Search input: trigger search on Enter key
  const searchInput = document.getElementById("searchInput");
  searchInput.addEventListener("keydown", async (event) => {
    if (event.key === "Enter") {
      const searchTerm = searchInput.value.trim();
      if (searchTerm && previousSearchTerm !== searchTerm + " before:2022") {
        // Clear previous results
        const cardContainer = document.getElementById("cardContainer");
        cardContainer.innerHTML = "";
        document.getElementById("termsContainer").style.display = "none";
        loadMoreCount = 0;
        serpStart = 1;
        previousSearchTerm = searchTerm + " before:2023"; // Note: check year filter consistency
        const dbImages = await searchDatabaseImage(searchTerm);
        displayImages(dbImages);
        await searchImagesSerper(searchTerm);
      }
    }
  });

  // Popup close and source buttons
  document
    .getElementById("cardClickPopup")
    .addEventListener("click", hidePopup);
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

  // Infinite scroll listener
  window.addEventListener("scroll", onScrollLoadMore);
}

/* ---------------------
   POPUP FUNCTIONS
--------------------- */
function hidePopup() {
  document.getElementById("cardClickPopup").style.display = "none";
  document.getElementById("youtube-container").innerHTML = "";
}

function showGooglePopup(image) {
  document.getElementById("cardClickPopup").style.display = "block";
  document.getElementById("cardClickPopup-cardTitle").textContent = image.title;
  const cardImage = document.getElementById("cardClickPopup-cardImage");
  cardImage.src = image.link;
  cardImage.style.maxWidth = "100%";
  cardImage.style.maxHeight = "100%";
  currentUrl = image.contextLink;
}

function showPopup(postId) {
  currentPostId = postId;
  document.getElementById("cardClickPopup").style.display = "block";
  const cardTitle = document.getElementById("cardClickPopup-cardTitle");
  const cardImage = document.getElementById("cardClickPopup-cardImage");
  const docRef = doc(db, "database", postId);
  getDoc(docRef)
    .then((docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        cardTitle.textContent = data.title;
        cardImage.src = data.Image;
        cardImage.style.maxWidth = "100%";
        cardImage.style.maxHeight = "100%";
        if (data.cardlinkevidence) {
          loadVideo(data.cardlinkevidence);
        }
        currentUrl = data.source ? data.source : data.uid;
      } else {
        console.error("Document does not exist");
      }
    })
    .catch((error) => console.error("Error getting document:", error));
}

/* ---------------------
   IMAGE DISPLAY & SEARCH
--------------------- */
function displayImages(images) {
  const cardContainer = document.getElementById("cardContainer");
  const observer = new IntersectionObserver(
    (entries, observerInstance) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const card = entry.target;
          const image = JSON.parse(card.getAttribute("postObject"));
          const img = new Image();
          img.onload = () => card.appendChild(img);
          img.onerror = () => cardContainer.removeChild(card);
          img.src = image.link;
          observerInstance.unobserve(card);
        }
      });
    },
    { rootMargin: "300px 0px", threshold: 0.1 }
  );

  images.forEach((image) => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.setAttribute("postObject", JSON.stringify(image));

    card.addEventListener("click", () => {
      if (image.contextLink && image.contextLink.includes("http")) {
        showGooglePopup(image);
      } else {
        showPopup(image.contextLink);
      }
    });

    const titleElement = document.createElement("div");
    titleElement.classList.add("card-title");
    titleElement.textContent = image.title;
    card.appendChild(titleElement);
    cardContainer.appendChild(card);
    observer.observe(card);
  });
}

async function searchImagesSerper(searchTerm) {
  const query = searchTerm + " before:2023"; // Note: verify the desired year filter
  const myHeaders = new Headers({
    "X-API-KEY": "5160e63fe264a319c1043d69f2eb13873aa44110",
    "Content-Type": "application/json",
  });
  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify({ q: query, num: 100, page: serpStart }),
  };

  try {
    const response = await fetch(
      "https://google.serper.dev/images",
      requestOptions
    );
    const data = await response.json();
    serpStart++;
    const images = data.images
      ? data.images.map((item) => ({
          link: item.imageUrl,
          title: item.title,
          contextLink: item.link,
        }))
      : [];
    displayImages(images);
    return images;
  } catch (error) {
    console.error("searchImagesSerper error:", error);
    return [];
  }
}

async function searchDatabaseImage(searchTerm) {
  const API_KEY = "b24f6db5b074d956b3a2be18bf263f0f";
  const APPLICATION_ID = "M8UVF5EX0F";
  const url = `https://${APPLICATION_ID}-dsn.algolia.net/1/indexes/database/query`;
  const headers = {
    "X-Algolia-API-Key": API_KEY,
    "X-Algolia-Application-Id": APPLICATION_ID,
    "Content-Type": "application/json",
  };
  const data = {
    params: `query=${searchTerm}&hitsPerPage=2&getRankingInfo=1`,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(data),
    });
    const searchData = await response.json();
    const postList = [];
    if (searchData.hits && searchData.hits.length > 0) {
      for (const hit of searchData.hits) {
        const postRef = doc(db, "database", hit.objectID);
        try {
          const docSnap = await getDoc(postRef);
          if (docSnap.exists()) {
            const postData = docSnap.data();
            if (postData.verified) {
              postList.push({
                link: postData.Image,
                title: postData.title,
                contextLink: hit.objectID,
              });
            }
          }
        } catch (error) {
          console.error("Error getting document:", error);
        }
      }
    } else {
      console.log("No hits found in database search");
    }
    return postList;
  } catch (error) {
    console.error("searchDatabaseImage error:", error);
    return [];
  }
}

/* ---------------------
   UTILITY FUNCTIONS
--------------------- */
function onScrollLoadMore() {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  const threshold = Math.min(100, clientHeight * 0.3);
  const searchTerm = document.getElementById("searchInput").value.trim();

  if (
    scrollTop + clientHeight >= scrollHeight - threshold &&
    searchTerm &&
    loadMoreCount < 10 &&
    !isListenerLoading
  ) {
    isListenerLoading = true;
    loadMoreCount++;
    searchImagesSerper(searchTerm).finally(() => (isListenerLoading = false));
  }
}

function openNewPageWithParams(baseUrl, params) {
  const queryParams = new URLSearchParams(params).toString();
  window.open(`${baseUrl}?${queryParams}`, "_blank");
}

function getPostParamValue(url) {
  const params = new URL(url).searchParams;
  return params.get("post");
}

function checkUrlForPost() {
  const postValue = getPostParamValue(window.location.href);
  if (postValue) {
    showPopup(postValue);
  }
}

function loadVideo(url) {
  const videoId = new URL(url).searchParams.get("v");
  if (videoId) {
    const iframe = document.createElement("iframe");
    iframe.width = "560";
    iframe.height = "315";
    iframe.src = `https://www.youtube.com/embed/${videoId}`;
    iframe.frameBorder = "0";
    iframe.allowFullscreen = true;
    document.getElementById("youtube-container").appendChild(iframe);
  }
}
