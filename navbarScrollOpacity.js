document.addEventListener('DOMContentLoaded', function() {
    const navbar = document.querySelector('.navbar');
    
    if (!navbar) {
        console.error('Navbar element not found');
        return;
    }

    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.style.opacity = '0.8';
        } else {
            navbar.style.opacity = '1';
        }
    });
});