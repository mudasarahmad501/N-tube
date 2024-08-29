// Import Firebase SDKs
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';

// Initialize Firebase
const auth = getAuth();

// Function to check authentication
function checkAuth() {
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            // Redirect to sign-in page if not authenticated
            window.location.href = 'index.html'; // Redirect to your sign-in page
        }
    });
}

// Call the function to check authentication
checkAuth();
