// Import Firebase SDKs
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js';
import { getAuth, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';
import { getFirestore, collection, getDocs, doc, deleteDoc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js';

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
const db = getFirestore(app);

// ----------------------------------------------------------

function formatViews(views) {
    if (views >= 1e9) {
        return (views / 1e9).toFixed(1) + ' B';
    } else if (views >= 1e6) {
        return (views / 1e6).toFixed(1) + ' M';
    } else if (views >= 1e3) {
        return (views / 1e3).toFixed(1) + ' K';
    } else {
        return views;
    }
}


document.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(auth, async (user) => {
        const favoriteContainer = document.getElementById('favorite-video-cards');
        if (user) {
            const userId = user.uid;

            // Fetching favorites based on userId
            const favoriteQuery = await getDocs(collection(db, "favorites"));

            favoriteContainer.innerHTML = '';
            let hasFavorites = false; // Flag to check if the user has favorites

            favoriteQuery.forEach((doc) => {
                const video = doc.data();
                if (video.userId === userId) {  // Ensure to only display the current user's favorites
                    hasFavorites = true; // Set the flag to true when a favorite is found
                    const videoCard = `
                        <div class="col-md-4 mb-4 d-flex align-items-stretch">
                            <div class="card">
                                <img src="${video.thumbnail}" class="card-img-top" alt="${video.title}">
                                <div class="card-body">
                                    <h5 class="card-title">${video.title}</h5>
                                    <p class="card-text">Channel: <a target="_blank" class="text-danger">${video.channelTitle}</a></p>
                                    <p class="card-text-views">Views: ${formatViews(video.views) || 'N/A'}</p> <!-- Display views correctly -->
                                    <button class="btn btn-danger view-video-btn" data-video-id="${video.videoId}">Watch Video</button>
                                    <button class="btn btn-light favorite-btn" data-video-id="${video.videoId}">
                                        <i class="fas fa-heart ${video.userId === userId ? 'text-danger' : 'text-muted'}"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                    favoriteContainer.insertAdjacentHTML('beforeend', videoCard);
                }
            });

            // If no favorites were found, display a message
            if (!hasFavorites) {
                favoriteContainer.innerHTML = '<p>Your favorites list is empty.</p>';
            }

            // Add event listeners to the "View Video" buttons
            document.querySelectorAll('.view-video-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const videoId = e.target.getAttribute('data-video-id');
                    openVideoPopup(videoId);
                });
            });

            // Add event listeners to the "Favorite" buttons to allow unfavoriting from this page
            document.querySelectorAll('.favorite-btn').forEach(button => {
                button.addEventListener('click', async (e) => {
                    const videoId = e.currentTarget.getAttribute('data-video-id');
                    const card = e.currentTarget.closest('.col-md-4');
                    await toggleFavorite(videoId, e.currentTarget, card);

                    // After unfavoriting, check if the favorites list is empty
                    if (favoriteContainer.children.length === 0) {
                        favoriteContainer.innerHTML = '<p>Your favorites list is empty.</p>';
                    }
                });
            });
        } else {
            favoriteContainer.innerHTML = '<p>You must be logged in to see your favorites.</p>';
        }
    });
});



async function toggleFavorite(videoId, button, card) {
    const user = auth.currentUser;
    if (user) {
        const userId = user.uid;
        const favoriteDocRef = doc(db, "favorites", `${userId}_${videoId}`);
        const docSnapshot = await getDoc(favoriteDocRef);

        if (docSnapshot.exists()) {
            // If video is already a favorite, remove it
            await deleteDoc(favoriteDocRef);
            button.querySelector('i').classList.remove('text-danger');
            button.querySelector('i').classList.add('text-muted');
            // Remove the card from the DOM
            card.remove();
        } else {
            // If video is not a favorite, add it
            const videoCard = button.closest('.card');
            await setDoc(favoriteDocRef, {
                userId: userId,
                videoId: videoId,
                thumbnail: videoCard.querySelector('img').src,
                title: videoCard.querySelector('.card-title').textContent,
                channelTitle: videoCard.querySelector('a').textContent,
                views: videoCard.querySelector('.card-text-views').textContent.split('Views:, ')[1] || 'N/A', // Correct extraction
                channelId: videoCard.querySelector('a').getAttribute('href').split('/').pop()
            });
            button.querySelector('i').classList.remove('text-muted');
            button.querySelector('i').classList.add('text-danger');
        }
    }
}


// --------------------------------------------------------
function openVideoPopup(videoId) {
    const videoUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    const videoFrame = document.getElementById('videoFrame');

    if (videoFrame) {
        videoFrame.src = videoUrl;
        $('#videoModal').modal('show'); // Ensure Bootstrap's JavaScript is correctly included
    } else {
        console.error('Video frame element not found');
    }
}

// Clear the video source when the modal is hidden
$('#videoModal').on('hidden.bs.modal', () => {
    const videoFrame = document.getElementById('videoFrame');
    if (videoFrame) {
        videoFrame.src = '';
    }
});

// Logout function
window.logout = function () {
    signOut(auth).then(() => {
        // Clear the stored language
        localStorage.removeItem('selectedLanguage');

        // Redirect to the login page after logout
        window.location.href = 'index.html'; // Ensure this is the correct path to your login page
    }).catch((error) => {
        console.error('Logout error:', error.message);
        alert('Error during logout. Please try again.');
    });
}


// ---------------------------------------------------
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