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
let bubblez = SVG("#maskBubblez");
let numOfBubblez = 50;

let circles = [{ x: 0, y: 0, radius: 0 }];

for (let i = 0; i < numOfBubblez; i++) {
  function drawCircleWithoutOverlap() {
    let newX = gsap.utils.random(0, 100);
    let newY = gsap.utils.random(0, 200);
    let newRadius = gsap.utils.random(4, 20);
    let newCircle = { x: newX, y: newY, radius: newRadius };
    let isOverlapping = false;

    circles.forEach((circle, i) => {
      let deltaX = newCircle.x - circles[i].x;
      let deltaY = newCircle.y - circles[i].y;
      let dist = Math.hypot(deltaX, deltaY);
      let radiiiis = circles[i].radius + newCircle.radius;

      if (dist < radiiiis) {
        isOverlapping = true;
      }
    });

    if (isOverlapping) {
      drawCircleWithoutOverlap();
    } else {
      bubblez
        .circle(newCircle.radius)
        .x(newCircle.x)
        .y(newCircle.y)
        .fill("#fff")
        .opacity(newCircle.radius / 20);

      circles.push(newCircle);
    }
  }

  drawCircleWithoutOverlap();
}

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

const user = null;
auth.onAuthStateChanged(function (user) {
  const welcomeElement = document.getElementById("nextPageButton");

  if (user) {
    // User is signed in.
    welcomeElement.textContent = "Profile";
  } else {
    // No user is signed in.
    welcomeElement.textContent = "Login";
  }
});

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("searchInput").focus();
});
document
  .getElementById("nextPageButton")
  .addEventListener("click", function () {
    const welcomeElement = document.getElementById("nextPageButton");
    if (welcomeElement.textContent === "Login") {
      window.location.href = "login.html";
    } else if (welcomeElement.textContent === "Profile") {
      window.location.href = "profile.html";
    }
  });

let start = 1;
const perPage = 10;
let isLoading = false;
let currentPostId = null;
let currentUrl = null;
let shouldLoadMoreImages = false;
document.getElementById("searchInput").addEventListener("input", function () {
  shouldLoadMoreImages = false;
});
document
  .getElementById("searchInput")
  .addEventListener("keydown", async function (event) {
    if (event.key === "Enter") {
      const cardContainer = document.getElementById("cardContainer");
      shouldLoadMoreImages = true;

      while (cardContainer.firstChild) {
        cardContainer.removeChild(cardContainer.firstChild);
      }
      searchDatabaseImage().then((postList) => {
        displayImages(postList);
      });
      await searchImages();
      await loadMoreImages();
      await loadMoreImages();
    }
  });

async function searchImages() {
  const searchTerm = document.getElementById("searchInput").value;
  var apiKey = "AIzaSyAQ3sc83x5CcAXW9NTt-NJUcT6C1Zzk6Fc";
  var cx = "a665304788edd4dd0";
  const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${searchTerm}+before:2021&searchType=image&start=${start}&num=${perPage}`;

  const cardContainer = document.getElementById("cardContainer");

  try {
    const response = await fetch(url);
    const data = await response.json();
    const images = data.items
      ? data.items.map((item) => ({
          link: item.link,
          title: item.title,
          thumb: item.image.thumbnailLink,
          contextLink: item.image.contextLink,
        }))
      : [];
    //console.log(data.items);
    displayImages(images);
    start += perPage;
  } catch (error) {
    console.error("searchImages", error);
  }
}

async function loadMoreImages() {
  if (!shouldLoadMoreImages || isLoading) return;
  isLoading = true;

  const searchTerm = document.getElementById("searchInput").value;
  if (!searchTerm) {
    isLoading = false;
    return;
  }
  var apiKey = "AIzaSyAQ3sc83x5CcAXW9NTt-NJUcT6C1Zzk6Fc";
  var cx = "a665304788edd4dd0";
  const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${searchTerm}+before:2021&searchType=image&start=${start}&num=${perPage}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const images = data.items
      ? data.items.map((item) => ({
          link: item.link,
          title: item.title,
          thumb: item.image.thumbnailLink,
          contextLink: item.image.contextLink,
        }))
      : [];

    displayImages(images);
    start += perPage;
  } catch (error) {
    console.error("loadMoreImages", error);
  } finally {
    isLoading = false;
  }
}

document
  .getElementById("close-cardClickPopup-button")
  .addEventListener("click", function () {
    currentPostId = null;
    currentUrl = null;
    hidePopup();
  });

document
  .getElementById("src-cardClickPopup-button")
  .addEventListener("click", function () {
    if (currentUrl.includes("http")) {
      window.open(currentUrl);
    } else {
      openNewPageWithParams("profile.html", {
        key: currentUrl,
      });
    }
  });
function hidePopup() {
  document.getElementById("cardClickPopup").style.display = "none";
}

function showGooglePopup(image) {
  document.getElementById("cardClickPopup").style.display = "block";

  const cardTitle = document.getElementById("cardClickPopup-cardTitle");
  const cardDescription = document.getElementById(
    "cardClickPopup-cardDescription"
  );
  const cardImage = document.getElementById("cardClickPopup-cardImage");

  currentUrl = image.contextLink;
  cardImage.src = image.link;
  cardImage.style.maxWidth = "100%";
  cardImage.style.maxHeight = "100%";

  cardTitle.textContent = image.title;
}
function showPopup(postId) {
  currentPostId = postId;

  //console.log("postid", postId);
  document.getElementById("cardClickPopup").style.display = "block";

  const cardTitle = document.getElementById("cardClickPopup-cardTitle");
  const cardDescription = document.getElementById(
    "cardClickPopup-cardDescription"
  );
  const cardImage = document.getElementById("cardClickPopup-cardImage");
  const docRef = doc(db, "database", postId);
  getDoc(docRef)
    .then((docSnap) => {
      //console.log(docSnap);
      if (docSnap.exists()) {
        const data = docSnap.data();
        let title = data.title;
        let image = data.Image;
        let description = data.description;
        let username = data.username;
        currentUrl = data.uid;
        cardImage.src = image;
        cardImage.style.maxWidth = "100%";
        cardImage.style.maxHeight = "100%";

        cardTitle.textContent = title;
        cardDescription.textContent = description;
      } else {
        console.log("docsnap does not exist");
      }
    })
    .catch((error) => {
      console.log("Error getting document:", error);
    });
}
function displayImages(images) {
  const cardContainer = document.getElementById("cardContainer");

  images.forEach((image) => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.setAttribute("postObject", JSON.stringify(image));
    //console.log(image);
    card.addEventListener("click", function (event) {
      if (image.contextLink.includes("http")) {
        showGooglePopup(image);
      } else {
        showPopup(image.contextLink);
      }
    });

    const img = document.createElement("img");
    img.addEventListener("error", function () {
      cardContainer.removeChild(card);
    });
    img.src = image.link;
    fetchImageAndSetSrc(image.link).then((statusCode) => {
      if (statusCode == 404) {
        cardContainer.removeChild(card);
      }
    });

    const titleElement = document.createElement("div");
    titleElement.classList.add("card-title");
    titleElement.textContent = image.title;

    card.appendChild(img);
    card.appendChild(titleElement);
    cardContainer.appendChild(card);
  });
}
async function fetchImageAndSetSrc(url) {
  const response = await fetch(url);

  return response.status;
}
window.addEventListener("scroll", function () {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  if (scrollTop + clientHeight >= scrollHeight - 50) {
    loadMoreImages();
  }
});
function openNewPageWithParams(baseUrl, params) {
  var queryParams = Object.keys(params)
    .map(
      (key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
    )
    .join("&");

  var fullUrl = baseUrl + "?" + queryParams;

  window.open(fullUrl, "_blank");
}
async function searchDatabaseImage() {
  const API_KEY = "b24f6db5b074d956b3a2be18bf263f0f";
  const APPLICATION_ID = "M8UVF5EX0F";
  const searchTerm = document.getElementById("searchInput").value;
  const url = `https://${APPLICATION_ID}-dsn.algolia.net/1/indexes/database/query`;
  let postList = [];

  const headers = {
    "X-Algolia-API-Key": API_KEY,
    "X-Algolia-Application-Id": APPLICATION_ID,
    "Content-Type": "application/json",
  };

  const data = {
    params: "query=" + searchTerm + "&hitsPerPage=2&getRankingInfo=1",
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(data),
    });
    const searchData = await response.json();

    if (searchData.hits && searchData.hits.length > 0) {
      for (const hit of searchData.hits) {
        const postRef = doc(db, "database", hit.objectID);
        try {
          const docSnap = await getDoc(postRef);
          if (docSnap.exists()) {
            const postData = docSnap.data();

            let title = postData.title;
            let image = postData.Image;
            let description = postData.description;
            let postUID = postData.uid;
            let media_url = postData.media_url;
            let username = postData.username;
            if (postData.verified) {
              postList.push({
                link: image,
                title: title,
                contextLink: hit.objectID,
              });
            }
          }
        } catch (error) {
          console.log("Error getting document:", error);
        }
      }
    } else {
      console.log("No hits found");
    }
  } catch (error) {
    console.error("Error:", error);
  }

  return postList;
}
