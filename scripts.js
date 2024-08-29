// Import Firebase SDKs
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';

// Your Firebase configuration
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

// Initialize Google provider
const provider = new GoogleAuthProvider();

// Add event listeners for "Enter" key press
document.getElementById('signup-form').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        e.preventDefault(); // Prevent the default form submission
        signup(); // Call the signup function
    }
});

document.getElementById('signin-form').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        e.preventDefault(); // Prevent the default form submission
        signin(); // Call the signin function
    }
});

// Show different forms
window.showSignup = function () {
    clearErrorMessages();
    document.getElementById('signup-form').style.display = 'block';
    document.getElementById('signin-form').style.display = 'none';
    document.getElementById('forgot-password-form').style.display = 'none';
}

window.showSignin = function () {
    clearErrorMessages();
    document.getElementById('signup-form').style.display = 'none';
    document.getElementById('signin-form').style.display = 'block';
    document.getElementById('forgot-password-form').style.display = 'none';
}

window.showForgotPassword = function () {
    clearErrorMessages();
    document.getElementById('signup-form').style.display = 'none';
    document.getElementById('signin-form').style.display = 'none';
    document.getElementById('forgot-password-form').style.display = 'block';
}

// Helper function to check if email domain is Gmail
function isGmailEmail(email) {
    return email.endsWith('@gmail.com');
}

// Helper function to display error messages
function displayErrorMessage(inputId, message) {
    const inputElement = document.getElementById(inputId);
    let errorElement = document.querySelector(`#${inputId} + .error-message`);

    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'error-message text-danger mt-1';
        errorElement.innerText = message;
        inputElement.parentNode.appendChild(errorElement);

        // Remove the error message after 15 seconds
        setTimeout(() => {
            if (errorElement.parentNode) {
                errorElement.remove();
            }
        }, 5000); // 15 seconds
    }

    // Add event listener to remove error message when input field is cleared
    inputElement.addEventListener('input', function () {
        if (inputElement.value === '') {
            errorElement.remove();
        }
    });
}

// Helper function to clear all error messages
function clearErrorMessages() {
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach((msg) => msg.remove());
}

// Authentication methods
window.signup = function () {
    clearErrorMessages();
    const username = document.getElementById('signup-username').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;

    let hasError = false;

    if (password !== confirmPassword) {
        displayErrorMessage('signup-confirm-password', 'Passwords do not match');
        hasError = true;
    }

    if (!isGmailEmail(email)) {
        displayErrorMessage('signup-email', 'Gmail addresses are allowed');
        hasError = true;
    }

    if (password.length < 6) {
        displayErrorMessage('signup-password', 'Password should be at least 6 characters long');
        hasError = true;
    }

    if (!hasError) {
        createUserWithEmailAndPassword(auth, email, password)
            .then(() => {
                alert('Sign Up Successful');
                // Clear form fields
                document.getElementById('signup-username').value = '';
                document.getElementById('signup-email').value = '';
                document.getElementById('signup-password').value = '';
                document.getElementById('signup-confirm-password').value = '';
                showSignin();
            })
            .catch((error) => {
                displayErrorMessage('signup-email', error.message);
            });
    }
}

window.signin = function () {
    clearErrorMessages();
    const email = document.getElementById('signin-email').value;
    const password = document.getElementById('signin-password').value;

    let hasError = false;

    if (!isGmailEmail(email)) {
        displayErrorMessage('signin-email', 'Please enter a valid Gmail address');
        hasError = true;
    }

    if (password.length < 6) {
        displayErrorMessage('signin-password', 'Password should be at least 6 characters long');
        hasError = true;
    }

    if (!hasError) {
        signInWithEmailAndPassword(auth, email, password)
            .then(() => {
                // Redirect to the new page
                window.location.href = 'user-info.html'; // Ensure this path is correct
            })
            .catch((error) => {
                displayErrorMessage('signin-email', error.message);
            });
    }
}

window.logout = function () {
    signOut(auth).then(() => {
        showSignin();
    }).catch((error) => {
        alert(error.message);
    });
}

window.forgotPassword = function () {
    clearErrorMessages();
    const email = document.getElementById('forgot-email').value;

    if (!isGmailEmail(email)) {
        displayErrorMessage('forgot-email', 'Please enter a valid Gmail address');
        return;
    }

    sendPasswordResetEmail(auth, email)
        .then(() => {
            alert('Password reset email sent');
            // Clear form field
            document.getElementById('forgot-email').value = '';
            showSignin();
        })
        .catch((error) => {
            displayErrorMessage('forgot-email', error.message);
        });
}

// Google Sign-In method
window.googleSignIn = function () {
    signInWithPopup(auth, provider)
        .then((result) => {
            // User signed in with Google
            const user = result.user;
            console.log('Google Sign-In Successful:', user);
            window.location.href = 'user-info.html'; // Redirect to the dashboard
        })
        .catch((error) => {
            console.error('Google Sign-In Error:', error.message);
            alert(error.message);
        });
}

// Add event listener for Google Sign-In buttons
document.getElementById('google-signin-btn').addEventListener('click', googleSignIn);
document.getElementById('google-signup-btn').addEventListener('click', googleSignIn);

// Observe authentication state
onAuthStateChanged(auth, (user) => {
    if (!user) {
        showSignin(); // Show the sign-in form if no user is authenticated
    }
});


// ---------------------------------------------
document.addEventListener('click', function (event) {
    // Check if the clicked element is not inside the navbar or its toggler button
    if (!document.getElementById('navbarNav').contains(event.target) && !document.querySelector('.navbar-toggler').contains(event.target)) {
        // Collapse the navbar if it is currently shown
        var navbar = document.getElementById('navbarNav');
        if (navbar.classList.contains('show')) {
            $('.navbar-collapse').collapse('hide');
        }
    }
});