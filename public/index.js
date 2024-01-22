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

document.getElementById('nextPageButton').addEventListener('click', function() {
    window.location.href = 'login.html'; // Replace with your desired URL
  });
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
	y: () => 1 - gsap.utils.random(0.1, 0.4) * (ScrollTrigger.maxScroll(window)/4),
	ease: "none",
	scrollTrigger: {
		start: 0,
		end: "max",
		invalidateOnRefresh: true,
		scrub: 2
	}
});

const user = null
auth.onAuthStateChanged(function(user) {
	const welcomeElement = document.getElementById('welcome');

	if (user) {
	  // User is signed in.
	  welcomeElement.style.display = 'block';

	} else {
	  // No user is signed in.
	  welcomeElement.style.display = 'none';

	}
  });