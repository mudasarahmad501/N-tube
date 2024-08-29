// Import Firebase SDKs
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js';
import { getAuth, signOut } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';
import { getFirestore, doc, setDoc, getDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';



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

// Logout function
window.logout = function () {
    signOut(auth).then(() => {
        // Clear the stored language
        localStorage.removeItem('selectedLanguage');

        // Redirect to the login page after logout
        window.location.href = 'index.html'; // Replace 'index.html' with the URL of your login page
    }).catch((error) => {
        alert(error.message);
    });
}

// ------------------Age Limit----------------------
$(document).ready(function () {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            try {
                // Retrieve user data from Firestore
                const userDoc = await getDoc(doc(db, 'users', user.uid));

                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    const subcategories = userData.subcategories || [];
                    const userAge = userData.age || 0; // Retrieve user's age from Firestore

                    // Get the scrolling bar element
                    const scrollingBar = $('.scrolling-bar');
                    scrollingBar.empty(); // Clear any existing elements

                    // Loop through subcategories and create <li> elements
                    subcategories.forEach(subcategory => {
                        const li = `<li>${subcategory}</li>`;
                        scrollingBar.append(li);
                    });

                    // Show or hide the search bar based on user's age
                    const searchForm = document.getElementById('searchForm');
                    if (userAge < 10) {
                        searchForm.style.display = 'none'; // Hide the search bar
                    } else {
                        searchForm.style.display = 'block'; // Show the search bar
                    }
                    const userInfo = document.getElementById('userInfo');
                    if (userAge < 10) {
                        userInfo.style.display = 'none';
                    } else {
                        userInfo.style.display = 'block'; // Show the search bar
                    }

                    // Attach click event to each <li> element
                    scrollingBar.find('li').each(function () {
                        $(this).on('click', async function () {
                            // Remove 'active-language' class from all <li> elements
                            scrollingBar.find('li').removeClass('active-language');
                            // Add 'active-language' class to the clicked <li>
                            $(this).addClass('active-language');

                            const selectedLanguage = $(this).text();
                            localStorage.setItem('selectedLanguage', selectedLanguage);

                            // Trigger the fetch and display of videos based on the selected language
                            await fetchAndDisplayVideos(selectedLanguage, await getFavoriteVideos());
                        });
                    });

                    // The rest of your existing code...
                } else {
                    console.log("No user data found!");
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        } else {
            // alert("User not authenticated. Please log in again.");
            window.location.href = "index.html"; // Redirect to login if not authenticated
        }
    });
});
// ------------------------Video section --------------------//

$(document).ready(function () {
    // Show the loading icon
    function showLoading() {
        $('#loading-icon').show();
    }

    // Hide the loading icon
    function hideLoading() {
        $('#loading-icon').hide();
    }

    // Function to format view counts
    function formatViews(views) {
        if (views >= 1_000_000) {
            return `${(views / 1_000_000).toFixed(1)}M`;
        } else if (views >= 1_000) {
            return `${(views / 1_000).toFixed(1)}K`;
        } else {
            return views.toString();
        }
    }

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            try {
                const userDoc = await getDoc(doc(db, 'users', user.uid));

                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    const subcategories = userData.subcategories || [];

                    localStorage.setItem('subcategories', JSON.stringify(subcategories));

                    const scrollingBar = $('.scrolling-bar');
                    scrollingBar.empty();

                    subcategories.forEach(subcategory => {
                        const li = `<li data-subcategory="${subcategory}">${subcategory}</li>`;
                        scrollingBar.append(li);
                    });

                    function parseYouTubeDuration(duration) {
                        const regex = /^PT(\d+H)?(\d+M)?(\d+S)?$/;
                        const matches = duration.match(regex);

                        if (!matches) return 0;

                        const hours = parseInt(matches[1], 10) || 0;
                        const minutes = parseInt(matches[2], 10) || 0;
                        const seconds = parseInt(matches[3], 10) || 0;

                        return (hours*3600) + (minutes*60) + seconds;
                    }

                    let allVideos = [];
                    let currentDisplayCount = 0;
                    const videosPerPage = 18;
                    const videoContainer = document.getElementById('video-cards');
                    const viewMoreButton = document.getElementById('view-more-btn');
                    const searchForm = document.getElementById('searchForm');
                    const searchInput = document.getElementById('searchInput');
                    const suggestionContainer = document.getElementById('suggestion-container'); // Suggestion container
                    const apiKey = 'AIzaSyDElY1z26yvj8PQATzvALCS2XWeLXrMjn4';

                    async function fetchAndDisplayVideos(query) {
                        currentDisplayCount = 0;
                        videoContainer.innerHTML = '';
                        suggestionContainer.innerHTML = ''; // Clear suggestion container
                        showLoading(); // Show loading icon
                        await fetchVideos(query);
                        displayNextVideos();
                        hideLoading(); // Hide loading icon
                    }

                    async function fetchVideos(query) {
                        const maxResults = 50;
                        const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${maxResults}&q=${encodeURIComponent(query)}&type=video&key=${apiKey}`;

                        try {
                            const response = await fetch(apiUrl);
                            const data = await response.json();

                            if (data.items.length === 0) {
                                console.log('No videos found for this query.');
                                return;
                            }

                            const videoIds = data.items.map(item => item.id.videoId).join(',');
                            const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails&id=${videoIds}&key=${apiKey}`;
                            const statsResponse = await fetch(statsUrl);
                            const statsData = await statsResponse.json();

                            allVideos = data.items
                                .map((item, index) => {
                                    const duration = statsData.items[index].contentDetails.duration;
                                    const videoDurationSeconds = parseYouTubeDuration(duration);

                                    return {
                                        ...item,
                                        views: parseInt(statsData.items[index].statistics.viewCount, 10),
                                        duration: videoDurationSeconds,
                                    };
                                })
                                .filter(video => video.duration >= 180)
                                .sort((a, b) => b.views - a.views);

                        } catch (error) {
                            console.error('Error fetching videos:', error);
                        }
                    }

                    function displayNextVideos() {
                        const nextVideos = allVideos.slice(currentDisplayCount, currentDisplayCount + videosPerPage);
                        nextVideos.forEach(video => {
                            const videoId = video.id.videoId;
                            const thumbnail = video.snippet.thumbnails.high.url;
                            const title = video.snippet.title;
                            const channelTitle = video.snippet.channelTitle;
                            const views = formatViews(video.views);
                            const heartClass = video.isFavorite ? 'text-danger' : 'text-muted';

                            const videoCard =
                                `<div class="col-md-4 mb-4 d-flex align-items-stretch">
                                    <div class="card">
                                        <img src="${thumbnail}" class="card-img-top" alt="${title}">
                                        <div class="card-body">
                                            <h5 class="card-title">${title}</h5>
                                            <p class="card-text">Channel: <a target="_blank">${channelTitle}</a></p>
                                            <p class="card-text-views">Views: ${views}</p>
                                            <button class="btn btn-danger view-video-btn" data-video-id="${videoId}">Watch Video</button>
                                            <button class="btn btn-light favorite-btn" data-video-id="${videoId}">
                                                <i class="fas fa-heart ${heartClass}"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>`;

                            videoContainer.insertAdjacentHTML('beforeend', videoCard);
                        });

                        currentDisplayCount += nextVideos.length;

                        if (currentDisplayCount < allVideos.length) {
                            viewMoreButton.style.display = 'block';
                        } else {
                            viewMoreButton.style.display = 'none';
                        }

                        document.querySelectorAll('.view-video-btn').forEach(button => {
                            button.addEventListener('click', (e) => {
                                const videoId = e.target.getAttribute('data-video-id');
                                openVideoPopup(videoId);
                            });
                        });

                        document.querySelectorAll('.favorite-btn').forEach(button => {
                            button.addEventListener('click', (e) => {
                                const videoId = e.currentTarget.getAttribute('data-video-id');
                                toggleFavorite(videoId, e.currentTarget);
                            });
                        });
                    }

                    function displayVideoSuggestions() {
                        const suggestionVideos = allVideos.slice(0, 49);
                        suggestionVideos.forEach(video => {
                            const videoId = video.id.videoId;
                            const thumbnail = video.snippet.thumbnails.medium.url;
                            const title = video.snippet.title;
                            const views = formatViews(video.views);

                            const suggestionCard =
                                `<div class="suggestion-card" data-video-url="https://www.youtube.com/embed/${videoId}">
                                    <img src="${thumbnail}" alt="${title}">
                                    <div class="suggestion-info">
                                        <p>${title}</p>
                                        <p>Views: ${views}</p>
                                    </div>
                                </div>`;

                            suggestionContainer.insertAdjacentHTML('beforeend', suggestionCard);
                        });

                        // Add click event listeners to suggestion cards
                        $('.suggestion-card').on('click', function () {
                            const videoUrl = $(this).data('video-url');
                            playVideo(videoUrl);
                        });
                    }

                    function openVideoPopup(videoId) {
                        const videoUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
                        const videoFrame = document.getElementById('videoFrame');
                        videoFrame.src = videoUrl;
                        $('#videoModal').modal('show');
                        displayVideoSuggestions(); // Display suggestions when video is opened
                    }

                    $('#videoModal').on('hidden.bs.modal', () => {
                        const videoFrame = document.getElementById('videoFrame');
                        videoFrame.src = '';
                        suggestionContainer.innerHTML = ''; // Clear suggestions when modal is closed
                    });

                    async function toggleFavorite(videoId, button) {
                        const user = auth.currentUser;
                        if (user) {
                            const userId = user.uid;
                            const favoriteDocRef = doc(db, "favorites", `${userId}_${videoId}`);
                            try {
                                const docSnapshot = await getDoc(favoriteDocRef);

                                if (docSnapshot.exists()) {
                                    await deleteDoc(favoriteDocRef);
                                    button.querySelector('i').classList.remove('text-danger');
                                    button.querySelector('i').classList.add('text-muted');
                                } else {
                                    const videoData = allVideos.find(video => video.id.videoId === videoId);
                                    if (videoData) {
                                        await setDoc(favoriteDocRef, {
                                            videoId,
                                            userId,
                                            title: videoData.snippet.title,
                                            thumbnail: videoData.snippet.thumbnails.high.url,
                                            views: videoData.views
                                        });
                                        button.querySelector('i').classList.add('text-danger');
                                        button.querySelector('i').classList.remove('text-muted');
                                    }
                                }
                            } catch (error) {
                                console.error('Error toggling favorite:', error);
                            }
                        }
                    }

                    // Set up search form submission event
                    searchForm.addEventListener('submit', async (e) => {
                        e.preventDefault();
                        const searchTerm = searchInput.value.trim();
                        if (searchTerm) {
                            await fetchAndDisplayVideos(searchTerm);
                        }
                    });

                    $('#view-more-btn').on('click', function () {
                        displayNextVideos();
                    });
                    scrollingBar.on('click', 'li', async function () {
                        // Remove the selected class from all li elements
                        scrollingBar.find('li').removeClass('selected-subcategory');
                        
                        // Add the selected class to the clicked li element
                        $(this).addClass('selected-subcategory');
                    
                        const subcategory = $(this).data('subcategory');
                        await fetchAndDisplayVideos(subcategory);
                    });
                    
                    // Trigger click on the first subcategory by default
                    $('.scrolling-bar li:first-child').trigger('click');
                } else {
                    console.log("User data does not exist.");
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        }
    });
});








// -----------------navbar close

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







