document.addEventListener('DOMContentLoaded', () => {
    const themeToggleButton = document.getElementById('theme-toggle');
    const toggleCircle = themeToggleButton.querySelector('.toggle-circle');

    // Function to update the theme based on the current state
    const updateTheme = (theme) => {
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            toggleCircle.style.transform = 'translateX(calc(100% - 4px)) translateY(-50%)'; // Move circle to the right
        } else {
            document.documentElement.removeAttribute('data-theme');
            toggleCircle.style.transform = 'translateX(4px) translateY(-50%)'; // Move circle to the left
        }
    };

    // Check for saved theme in localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        updateTheme(savedTheme);
    }

    themeToggleButton.addEventListener('click', () => {
        let currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
        let newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        updateTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    });
});

