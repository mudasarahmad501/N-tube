
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
import { signOut as firebaseSignOut } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";

// Firebase configuration object
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
const auth = getAuth();
const db = getFirestore(app);



$(document).ready(function () {
    const professionSubcategories = {
        // Your existing profession subcategories object
        "Programming": ["Html", "CSS", "JavaScript", "Bootstrap", "Java", "C Language", "C++", "C#", "Ruby on Rails", "Python", "swift", "Kotlin", "PHP", "React", "Database", "Jquery", "XML", "MySql", "Django", "Numpy", "Pandas", "Nodejs", "Nextjs", "React Native", "Angular", "Git", "MongoBD", "ASP", "SAAS", "VUE", "DSA"],
        "Design & Creativity": ["Graphic Design", "UI/UX Design", "Animation & VFX", "Photography", "Video Editing", "Game Design", "3D Modeling", "Illustration & Digital Art"],
        "Business & Marketing": ["Entrepreneurship", "Digital Marketing", " SEO & Content Writing", "Business Strategy", "Finance & Accounting", "Project Management", "Sales & Negotiation", "Human Resources"],
        "Engineering": ["Electrical Engineering", "Mechanical Engineering", "Civil Engineering", "Aeronautical Engineering", "Chemical Engineering", "Biomedical Engineering", "Industrial Engineering", "Robotics"],
        "Science & Mathematics": [" Physics", "Chemistry", "Biology", "Mathematics", "Environmental Science", "Astronomy & Space Science", "Geology", "Nanotechnology", "Bio Phyics", "Bio Chemistry"],
        "Personal Development": ["Time Management", "Leadership Skills", "Public Speaking", "Emotional Intelligence", "Mindfulness & Meditation", "Productivity Hacks", "Career Development", "Language Learning"],
        "Health & Fitness": ["Nutrition", "Physical Fitness", "Yoga & Meditation", "Mental Health", "Personal Training", "Sports Science", "Wellness Coaching", "Diet & Weight Loss"],
        "Arts & Humanities": ["History ", "Philosophy", "Literature", "Music Theory", "Cultural Studies", "Religious Studies", "Languages & Linguistics"],
        "Kids & Education": ["Quran reading Basic", "Cartoons & Animation", "Educational Games", "Storytelling & Reading", "Math for Kids", "Science Experiments", "Language Learning", "Art & Craft", "Coding for Kids"],
        "Miscellaneous": ["Cooking & Culinary Arts", "Cooking & Culinary Arts", "DIY & Home Improvement", "Travel ", "Adventure", "Photography", "Pet Care & Training", "Fashion", "Beauty"],
        "Sports": ["Football", "Cricket", "Hockey", "Baseball", "Basketball", "Tennis", "Golf", "Rugby", "Swimming", "Cycling", "Volleyball", "Badminton", "Athletics", "Boxing", "Wrestling"],
        "Entertainment": ["Songs", "Comdey", "Dancing", "NETFLIX Seasons", "English Movies", "Dramas", "Punjabi Movies"],
    };

    $('.js-example-basic-multiple').select2();

    // Display subcategories based on selected profession
    $('#user-profession').on('change', function () {
        const profession = $(this).val();
        const subcategoriesContainer = $('#subcategories-container');
        const subcategoriesSelect = $('#user-subcategories');

        subcategoriesSelect.empty(); // Clear existing subcategories

        if (profession) {
            const subcategories = professionSubcategories[profession] || [];
            subcategories.forEach(subcategory => {
                const option = new Option(subcategory, subcategory);
                subcategoriesSelect.append(option);
            });

            subcategoriesContainer.show(); // Show the subcategories container
        } else {
            subcategoriesContainer.hide(); // Hide if no profession is selected
        }

        // Reinitialize select2 to apply changes
        $('.js-example-basic-multiple').select2();
    });

    // Ensure user is authenticated and handle form submission
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            try {
                // Fetch existing user data if available
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    $('#user-name').val(userData.name || '');
                    $('#user-age').val(userData.age || '');
                    $('#user-profession').val(userData.profession || '').trigger('change');

                    // Preselect subcategories if they exist
                    if (userData.profession && userData.subcategories) {
                        userData.subcategories.forEach(subcategory => {
                            const option = new Option(subcategory, subcategory, true, true);
                            $('#user-subcategories').append(option);
                        });
                        $('#subcategories-container').show();
                    }
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                alert("Error fetching user data: " + error.message);
            }

            // Form submission to save/update user data
            $('#user-info-form').on('submit', async function (event) {
                event.preventDefault();

                // Gather user data from form inputs
                const userName = $('#user-name').val();
                const userAge = $('#user-age').val();
                const userProfession = $('#user-profession').val();
                const selectedSubcategories = $('#user-subcategories').val() || []; // Ensure subcategories are always an array

                // Validate required fields
                if (!userProfession || ($('#subcategories-container').is(':visible') && selectedSubcategories.length === 0)) {
                    alert("Please select your profession and at least one subcategory.");
                    return;
                }

                try {
                    console.log("Saving user data:", {
                        name: userName,
                        age: userAge,
                        profession: userProfession,
                        subcategories: selectedSubcategories
                    });

                    // Save user data to Firestore with subcategories
                    await setDoc(doc(db, 'users', user.uid), {
                        name: userName,
                        age: userAge,
                        profession: userProfession,
                        subcategories: selectedSubcategories // Save subcategories as part of user data
                    }, { merge: true }); // Merge data to update the document instead of replacing it

                    alert("User information saved successfully!");
                    window.location.href = "dashboard.html";
                } catch (error) {
                    console.error("Error saving user information:", error);
                    alert("Error saving user information: " + error.message);
                }
            });
        } else {
            window.location.href = "index.html"; // Redirect to login if not authenticated
        }
    });
});


// ----------------------------------------
window.logout = function () {
    const auth = getAuth();
    firebaseSignOut(auth).then(() => {
        // Clear the stored language
        localStorage.removeItem('selectedLanguage');

        // Redirect to the login page after logout
        window.location.href = 'index.html';
    }).catch((error) => {
        alert('Error signing out: ' + error.message);
    });
}
