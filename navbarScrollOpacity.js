document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.getElementsByClassName('navbar');
    const maxOpacity = 0.9; // Adjust this value to set the maximum opacity you want

    window.addEventListener('scroll', () => {
        const scrollPos = window.scrollY;
        const navbarHeight = navbar.clientHeight;

        // Calculate the opacity based on the scroll position and navbar height
        const opacity = 1 - (scrollPos / navbarHeight);

        // Set the new opacity for the navigation bar
        navbar.style.opacity = Math.min(opacity, maxOpacity);
    });
});
