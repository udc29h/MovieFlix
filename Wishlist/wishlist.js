
const API_KEY = "04c35731a5ee918f014970082a0088b1";

    const fetchWishlist = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please log in to view your wishlist');
            window.location.href = '../Login/login.html';
            return;
        }
    
        try {
            const response = await fetch('https://movilist.onrender.com/wishlist', {
                headers: { 'Authorization': token }
            });
            const data = await response.json();
            const movieDetails = await fetchMovieDetails(data.wishlist);
            displayWishlist(movieDetails);
        } catch (error) {
            console.error('Error fetching wishlist:', error);
        }
    };

    const fetchMovieDetails = async (movieIds) => {
        const moviePromises = movieIds.map(id => 
            fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}`)
                .then(res => res.json())
        );
        return Promise.all(moviePromises);
    };


const displayWishlist = (movies) => {
    const container = document.getElementById('wishlistContainer');
    container.innerHTML = '';
    movies.forEach(movie => {
        const movieElement = document.createElement('div');
        movieElement.className = 'movie-card';
        movieElement.innerHTML = `
            <img src="${movie.poster_path ? 'https://image.tmdb.org/t/p/w500' + movie.poster_path : '../img/brating.png'}" alt="${movie.title || 'Movie poster'}">
            <h3>${movie.title || 'Unknown Title'}</h3>
            <p>${movie.release_date ? movie.release_date.split('-')[0] : 'N/A'}</p>
            <button class="remove-btn" data-id="${movie.id}">Remove</button>
        `;
        container.appendChild(movieElement);
    });


    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener('click', removeFromWishlist);
    });
};


const removeFromWishlist = async (event) => {
    const movieId = event.target.getAttribute('data-id');
    const token = localStorage.getItem('token');

    try {
        const response = await fetch('https://movilist.onrender.com/wishlist/remove', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify({ movieId })
        });

        if (response.ok) {
            // alert('Movie removed from wishlist');
            fetchWishlist(); // Refresh the wishlist
        } else {
            const data = await response.json();
            alert(`Error: ${data.error}`);
        }
    } catch (error) {
        console.error('Error removing movie from wishlist:', error);
        alert('An error occurred while removing the movie from wishlist');
    }
};

// Logout functionality
document.getElementById('logoutLink').addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('token');
    window.location.href = '../index.html';
});

fetchWishlist();