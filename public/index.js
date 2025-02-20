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
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-analytics.js";

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
const user = null;

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
let serpStart = 1;
const perPage = 10;
let isLoading = false;
let currentPostId = null;
let currentUrl = null;
let previousSearchTerm = null;
let shouldLoadMoreImages = false;
let loadMoreCount = 0;
let player;

document.getElementById("searchInput").addEventListener("input", function () {
  shouldLoadMoreImages = false;
});
document
  .getElementById("searchInput")
  .addEventListener("keydown", async function (event) {
    if (event.key === "Enter") {
      const cardContainer = document.getElementById("cardContainer");
      const searchT = document.getElementById("searchInput").value;
      shouldLoadMoreImages = true;
      serpStart = 1;

      if (
        searchT != null &&
        searchT.trim() !== "" &&
        previousSearchTerm != searchT + " before:2022"
      ) {
        document.getElementById("searchInput").blur();
        while (cardContainer.firstChild) {
          cardContainer.removeChild(cardContainer.firstChild);
        }
        document.getElementById("termsContainer").style.display = "none";
        loadMoreCount = 0;
        searchDatabaseImage().then((postList) => {
          displayImages(postList);
        });
        await searchImages_serper();
        /*await loadMoreImages();
      await loadMoreImages();
      await loadMoreImages();
      await loadMoreImages();*/
      }
    }
  });

async function searchImages_serper() {
  const searchTerm =
    document.getElementById("searchInput").value + " before:2023";
  previousSearchTerm = searchTerm;
  var myHeaders = new Headers();

  myHeaders.append("X-API-KEY", "5160e63fe264a319c1043d69f2eb13873aa44110");
  myHeaders.append("Content-Type", "application/json");
  previousSearchTerm;
  var raw = JSON.stringify({
    q: searchTerm,
    num: 100,
    page: serpStart,
  });

  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  try {
    const response = await fetch(
      "https://google.serper.dev/images",
      requestOptions
    );
    const data = await response.json();
    serpStart += 1;
    const images = data.images
      ? data.images.map((item) => ({
          link: item.imageUrl,
          title: item.title,
          contextLink: item.link,
        }))
      : [];
    //console.log(data.items);
    displayImages(images);
  } catch (error) {
    console.error("searchImages", error);
  }
}

document
  .getElementById("cardClickPopup")
  .addEventListener("click", function () {
    hidePopup();
  });
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
  document.getElementById("cardClickPopup").style.display = "block";
  document.getElementById("youtube-container").innerHTML = "";
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
        loadVideo(data.cardlinkevidence);
        console.log(data.source);
        if (data.source != null) {
          currentUrl = data.source;
        } else {
          currentUrl = data.uid;
        }

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

  const observer = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const card = entry.target;
          const image = JSON.parse(card.getAttribute("postObject"));

          const img = document.createElement("img");
          img.onload = () => {
            card.appendChild(img);
          };
          img.onerror = () => {
            cardContainer.removeChild(card);
          };
          img.addEventListener("error", function () {
            cardContainer.removeChild(card);
          });
          fetchImageAndSetSrc(image.link).then((statusCode) => {
            if (statusCode == 404) {
              cardContainer.removeChild(card);
            }
          });

          img.src = image.link;

          observer.unobserve(card);
        }
      });
    },
    { rootMargin: "300px 0px", threshold: 0.1 }
  ); // Customize rootMargin and threshold as needed

  images.forEach((image) => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.setAttribute("postObject", JSON.stringify(image));

    card.addEventListener("click", function (event) {
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

    observer.observe(card); // Start observing the visibility of the card
  });
}

async function fetchImageAndSetSrc(url) {
  const response = await fetch(url);

  return response.status;
}
let isListenerLoading = false; // Flag to indicate if loading is in progress

window.addEventListener("scroll", function () {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  const searchT = document.getElementById("searchInput").value;
  const threshold = Math.min(100, clientHeight * 0.3);

  if (scrollTop + clientHeight >= scrollHeight - threshold) {
    if (
      !isListenerLoading &&
      searchT != null &&
      searchT.trim() !== "" &&
      loadMoreCount < 10
    ) {
      isListenerLoading = true; // Set the flag to true indicating loading has started
      loadMoreCount += 1;
      searchImages_serper()
        .then(() => {
          isListenerLoading = false; // Reset the flag once loading is complete
        })
        .catch(() => {
          isListenerLoading = false; // Also reset the flag in case of an error
        });
    }
  }
  //wdw
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

function getPostParamValue(url) {
  // Create a URL object from the given URL
  const urlObj = new URL(url);
  // Use URLSearchParams to work with the query string
  const params = new URLSearchParams(urlObj.search);
  // Get the value of the 'post' parameter
  const postValue = params.get("post");
  return postValue; // Returns null if the 'post' parameter is not present
}

// Function to check for and use the 'post' parameter from the URL
function checkForAndUsePostParam(url) {
  const postValue = getPostParamValue(url);
  if (postValue) {
    return postValue;
  } else {
    return null;
  }
}

const url_endpoint = checkForAndUsePostParam(window.location.href);
if (url_endpoint) {
  console.log("url endpoint", url_endpoint);
  showPopup(url_endpoint);
} else {
  console.log("url endpoint", "none");
}
function loadVideo(url) {
  const urlParams = new URL(url).searchParams;
  const videoId = urlParams.get("v");
  // Create iframe element
  const iframe = document.createElement("iframe");
  iframe.width = "560";
  iframe.height = "315";
  iframe.src = `https://www.youtube.com/embed/${videoId}`;
  iframe.frameBorder = "0";
  iframe.allowFullscreen = true;

  // Append the iframe to our container
  document.getElementById("youtube-container").appendChild(iframe);
}
