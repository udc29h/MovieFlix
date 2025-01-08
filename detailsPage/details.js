const API_KEY = "04c35731a5ee918f014970082a0088b1";
const IMGPATH = "https://image.tmdb.org/t/p/w1280";

// Get movie ID from URL
const urlParams = new URLSearchParams(window.location.search);
const movieId = urlParams.get('id');

// Loading component templates
const createShimmerEffect = () => `
    <div class="animate-pulse">
        <div class="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div class="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
`;

const createLoadingSpinner = () => `
    <div class="loading-spinner">
        <div class="spinner"></div>
    </div>
`;

// API Functions
const getMovieDetails = async (id) => {
    try {
        const response = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}`);
        const data = await response.json();
        showMovieDetails(data);
    } catch (error) {
        console.log("Error fetching movie details:", error);
    }
};

const getMovieTrailers = async (id) => {
    try {
        const response = await fetch(`https://api.themoviedb.org/3/movie/${id}/videos?api_key=${API_KEY}`);
        const data = await response.json();
        return data.results.filter(video => video.type === 'Trailer' && video.site === 'YouTube');
    } catch (error) {
        console.log("Error fetching movie trailers:", error);
        return [];
    }
};

const getComments = async (movieId) => {
    try {
        const response = await fetch(`https://movilist.onrender.com/comments/${movieId}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.log("Error fetching comments:", error);
        return [];
    }
};

const postComment = async (movieId, name, comment) => {
    try {
        const response = await fetch('https://movilist.onrender.com/comments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ movieId, name, comment })
        });
        return response.json();
    } catch (error) {
        console.log("Error posting comment:", error);
        return null;
    }
};

const getMovieRating = async (id) => {
    try {
        const response = await fetch(`https://movilist.onrender.com/ratings/${id}`);
        const data = await response.json();
        return data.averageRating;
    } catch (error) {
        console.log("Error fetching movie rating:", error);
        return null;
    }
};

const postRating = async (movieId, rating) => {
    const storageKey = `movie_${movieId}_rating`;
    if (localStorage.getItem(storageKey)) {
        console.log("You've already rated this movie");
        return null;
    }
    try {
        const response = await fetch('https://movilist.onrender.com/ratings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ movieId, rating })
        });
        const data = await response.json();
        if (data.averageRating) {
            localStorage.setItem(storageKey, rating);
        }
        return data.averageRating;
    } catch (error) {
        console.log("Error posting rating:", error);
        return null;
    }
};

const checkIfInWishlist = async (movieId) => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    try {
        const response = await fetch('https://movilist.onrender.com/wishlist', {
            method: 'GET',
            headers: {
                'Authorization': token
            },
        });
        const data = await response.json();
        const wishlist = data.wishlist;
        return wishlist.some(item => item.toString() === movieId.toString());
    } catch (err) {
        console.error("Error fetching wishlist:", err);
        return false;
    }
};

const addToWishlist = async (movieId) => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please log in to add to wishlist');
        return;
    }

    try {
        const response = await fetch('https://movilist.onrender.com/wishlist/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify({ movieId })
        });
        if (response.ok) {
            const wishlistBtn = document.getElementById('wishlistBtn');
            wishlistBtn.textContent = 'Added';
            wishlistBtn.disabled = true;
        }
    } catch (error) {
        console.error('Error adding to wishlist:', error);
    }
};

// Utility Functions
const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const commentTime = new Date(timestamp);
    const diffTime = now - commentTime;

    const seconds = Math.floor(diffTime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
};

const updateCommentTimestamps = () => {
    const comments = document.querySelectorAll('.comment');
    comments.forEach(comment => {
        const timestamp = comment.getAttribute('data-timestamp');
        const timeAgo = formatTimeAgo(timestamp);
        comment.querySelector('.time-ago').textContent = timeAgo;
    });
};

const highlightStars = (rating) => {
    const stars = document.querySelectorAll('.stars span');
    stars.forEach(star => {
        const starValue = star.getAttribute('data-value');
        if (starValue <= rating) {
            star.style.color = '#FFD700'; // gold color
        } else {
            star.style.color = '#E5E5E5'; // default color
        }
    });
};

// Setup Functions
const setupTrailerNavigation = (trailerCount) => {
    let currentTrailerIndex = 0;
    const prevBtn = document.getElementById('prev-trailer');
    const nextBtn = document.getElementById('next-trailer');

    prevBtn.disabled = false;
    nextBtn.disabled = false;

    const showTrailer = (index) => {
        document.querySelectorAll('.trailer').forEach((trailer, i) => {
            trailer.style.display = i === index ? '' : 'none';
        });
    };

    prevBtn.addEventListener('click', () => {
        if (currentTrailerIndex > 0) {
            currentTrailerIndex--;
            showTrailer(currentTrailerIndex);
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentTrailerIndex < trailerCount - 1) {
            currentTrailerIndex++;
            showTrailer(currentTrailerIndex);
        }
    });
};

const setupRatingSystem = (movieId, currentRating) => {
    const starsContainer = document.querySelector('.stars');
    highlightStars(currentRating);

    starsContainer.addEventListener('click', async (e) => {
        if (e.target.classList.contains('star')) {
            const rating = e.target.getAttribute('data-value');
            const newAverageRating = await postRating(movieId, rating);
            if (newAverageRating) {
                document.querySelector('.current-rating').textContent = newAverageRating;
                highlightStars(rating);
            }
        }
    });
};

const setupCommentSystem = (movieId) => {
    document.getElementById('submit-comment').addEventListener('click', async () => {
        const name = document.getElementById('comment-name').value;
        const comment = document.getElementById('comment-text').value;
        if (name && comment) {
            const newComment = await postComment(movieId, name, comment);
            if (newComment) {
                const commentHTML = `
                    <div class="comment" data-timestamp="${newComment.timestamp}">
                        <p><strong>${newComment.name}</strong> (<span class="time-ago">${formatTimeAgo(newComment.timestamp)}</span>):</p>
                        <p>${newComment.comment}</p>
                    </div>
                `;
                document.getElementById('comments-container').insertAdjacentHTML('afterbegin', commentHTML);
                document.getElementById('comment-name').value = '';
                document.getElementById('comment-text').value = '';
            }
        }
    });

    updateCommentTimestamps();
    setInterval(updateCommentTimestamps, 60000);
};

// Main render function
const showMovieDetails = async (movie) => {
    const movieDetails = document.getElementById("movie-details");
    const imagePath = movie.poster_path ? IMGPATH + movie.poster_path : "./missing-image";

    // Initial render with loading states
    movieDetails.innerHTML = `
        <div class="movie-detail-box">
            <img src="${imagePath}" alt="${movie.title}" />
            <div class="rating">
                <div class="rating-container loading">
                    ${createLoadingSpinner()}
                </div>
                <button id="wishlistBtn" class="wishlist-btn">Add to Wishlist</button>
            </div>
        </div>
        <div class="trailers">
            <div id="trailer-container">
                ${createLoadingSpinner()}
            </div>     
            <div class="trailer-buttons">
                <button id="prev-trailer" disabled>Prev</button>
                <button id="next-trailer" disabled>Next</button>
            </div>
            <div class="movie-info">
                <h2>${movie.title}</h2>
                <h3>${movie.genres.map(genre => genre.name).join(" | ")}</h3>
                <h4>IMDB: <span>${movie.vote_average}<span></h4>
                <h4>Release Date: ${movie.release_date}</h4>
            </div>
            <div class="overview" style="--bg-image: url(${imagePath});">
                <h2>Overview</h2>
                <p>${movie.overview}</p>
            </div>
        </div>
        <div class="comments-section">
            <div class="add-comment">
                <h4>Add a Comment</h4>
                <div id="input-section">
                    <input type="text" id="comment-name" placeholder="Your Name" required>
                    <textarea id="comment-text" placeholder="Your Comment" required></textarea>
                </div>
                <button id="submit-comment">Submit</button>
            </div>
            <div id="comments-container">
                ${createShimmerEffect()}
                ${createShimmerEffect()}
                ${createShimmerEffect()}
            </div>
        </div>
    `;

    // Load data concurrently
    const [trailers, comments, averageRating, isInWishlist] = await Promise.allSettled([
        getMovieTrailers(movie.id),
        getComments(movie.id),
        getMovieRating(movie.id),
        checkIfInWishlist(movie.id)
    ]);

    // Update trailer section when ready
    if (trailers.status === 'fulfilled' && trailers.value.length > 0) {
        const trailerHTML = trailers.value.map((trailer, index) => `
            <div class="trailer" id="trailer-${index}" style="${index === 0 ? '' : 'display:none;'}">
                <iframe width="560" height="315" src="https://www.youtube.com/embed/${trailer.key}" frameborder="0" allowfullscreen></iframe>
            </div>
        `).join("");
        
        document.getElementById('trailer-container').innerHTML = trailerHTML;
        setupTrailerNavigation(trailers.value.length);
    } else {
        document.getElementById('trailer-container').innerHTML = '<p>No trailers available</p>';
    }

    // Update rating section when ready
    if (averageRating.status === 'fulfilled') {
        const ratingContainer = document.querySelector('.rating-container');
        ratingContainer.classList.remove('loading');
        ratingContainer.innerHTML = `
            <div class="rating-score">${averageRating.value || 'N/A'}</div>
            <div class="stars">
                <span class="star" data-value="1">&#9733;</span>
                <span class="star" data-value="2">&#9733;</span>
                <span class="star" data-value="3">&#9733;</span>
                <span class="star" data-value="4">&#9733;</span>
                <span class="star" data-value="5">&#9733;</span>
            </div>
            <div class="user-rating">Your rating: <span class="current-rating">${averageRating.value || 'N/A'}</span></div>
        `;
        setupRatingSystem(movie.id, averageRating.value);
    }

    // Update comments section when ready
    if (comments.status === 'fulfilled') {
        const commentsHTML = comments.value
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .map(comment => `
                <div class="comment" data-timestamp="${comment.timestamp}">
                    <p><strong>${comment.name}</strong> (<span class="time-ago">${formatTimeAgo(comment.timestamp)}</span>):</p>
                    <p>${comment.comment}</p>
                </div>
            `).join("") || '<p>No comments yet</p>';
        
        document.getElementById('comments-container').innerHTML = commentsHTML;
        setupCommentSystem(movie.id);
    }

    // Update wishlist button when ready
    if (isInWishlist.status === 'fulfilled') {
        const wishlistBtn = document.getElementById('wishlistBtn');
        if (isInWishlist.value) {
            wishlistBtn.textContent = "Added";
            wishlistBtn.disabled = true;
        }
        wishlistBtn.addEventListener('click', () => addToWishlist(movie.id));
    }
};

// Initialize
getMovieDetails(movieId);