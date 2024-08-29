import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js';
import { getAuth, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';
import { getFirestore, collection, onSnapshot, doc, deleteDoc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDWmZIxV9Ar4fEWWJF17C0L4XhxtGPlI9E",
    authDomain: "coding-hub-99458.firebaseapp.com",
    projectId: "coding-hub-99458",
    storageBucket: "coding-hub-99458.appspot.com",
    messagingSenderId: "842265093879",
    appId: "1:842265093879:web:f5e8c4a5eea7dfc2b055f2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', () => {
    const favoritesCountElement = document.getElementById('favorites-count');

    if (favoritesCountElement) {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                const userId = user.uid;

                // Listen for real-time updates to the favorites collection
                const favoritesRef = collection(db, "favorites");
                onSnapshot(favoritesRef, (snapshot) => {
                    let favoritesCount = 0;

                    snapshot.forEach((doc) => {
                        const video = doc.data();
                        if (video.userId === userId) {  // Count only the current user's favorites
                            favoritesCount++;
                        }
                    });

                    // Update the favorites count in the navbar
                    favoritesCountElement.textContent = favoritesCount;
                }, (error) => {
                    console.error('Error listening to favorites:', error);
                });
            } else {
                favoritesCountElement.textContent = '0'; // Reset counter if the user is not logged in
            }
        });
    } else {
        console.error('Favorites count element not found');
    }
});



