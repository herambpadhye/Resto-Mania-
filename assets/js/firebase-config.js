// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDOpj13kudrpvNTjNLcpV3n5I-v03WLfXA",
    authDomain: "restaurant-ai-f4be7.firebaseapp.com",
    projectId: "restaurant-ai-f4be7",
    storageBucket: "restaurant-ai-f4be7.firebasestorage.app",
    messagingSenderId: "234549241285",
    appId: "1:234549241285:web:fa807358afdca9a7e097ac"
};

let auth = null;

try {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    console.log("Firebase initialized successfully");
} catch (error) {
    console.error("Firebase initialization error:", error);
}

function getCurrentUserUID() {
    return auth.currentUser ? auth.currentUser.uid : null;
}

export { auth, getCurrentUserUID };
