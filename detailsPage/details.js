const API_KEY = "04c35731a5ee918f014970082a0088b1";
const IMGPATH = "https://image.tmdb.org/t/p/w1280";

const urlParams = new URLSearchParams(window.location.search);
console.log(urlParams)
const movieId = urlParams.get('id');

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
        const response = await fetch(`http://localhost:4000/comments/${movieId}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.log("Error fetching comments:", error);
        return [];
    }
};

const postComment = async (movieId, name, comment) => {
    try {
        const response = await fetch('http://localhost:4000/comments', {
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

const getMovieRating = async (id) => {
    try {
        const response = await fetch(`http://localhost:4000/ratings/${id}`);
        const data = await response.json();
        return data.averageRating;
    } catch (error) {
        console.log("Error fetching movie rating:", error);
        return null;
    }
};

const postRating = async (movieId, rating) => {
    const storagekey=`movie_${movieId}_rating`;
    if(localStorage.getItem(storagekey)){
        console.log("You've already rated this movie");
        return null;
    }
    try {
        const response = await fetch('http://localhost:4000/ratings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ movieId, rating })
        });
        const data = await response.json();
        if(data.averageRating){
            localStorage.setItem(storagekey,rating);
        }
        return data.averageRating
    } catch (error) {
        console.log("Error posting rating:", error);
        return null;
    }
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

const addToWishlist = async (movieId) => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please log in to add to wishlist');
        return;
    }

    try {
        const response = await fetch('http://localhost:4000/wishlist/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify({ movieId })
        });
        const data = await response.json();
        alert(data.message);
    } catch (error) {
        console.error('Error adding to wishlist:', error);
    }
};


const showMovieDetails = async (movie) => {
    const movieDetails = document.getElementById("movie-details");
    const loadingIcon = document.createElement("div");
    loadingIcon.innerHTML = "Loading...";

    movieDetails.appendChild(loadingIcon);

    // Set the background image for the overview section
    const overviewElement = document.querySelector('.overview');
    if (overviewElement) {
        overviewElement.style.setProperty('--bg-image', `url(${imagePath})`);
    }

    try {
        const imagePath = movie.poster_path ? IMGPATH + movie.poster_path : "./missing-image";
        const trailers = await getMovieTrailers(movie.id);
        const comments = await getComments(movie.id);
        const averageRating = await getMovieRating(movie.id);

        const trailerHTML = trailers.map((trailer, index) => `
            <div class="trailer" id="trailer-${index}" style="${index === 0 ? '' : 'display:none;'}">
                <iframe width="560" height="315" src="https://www.youtube.com/embed/${trailer.key}" frameborder="0" allowfullscreen></iframe>
            </div>
        `).join("");

        const commentsHTML = comments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).map(comment => `
            <div class="comment" data-timestamp="${comment.timestamp}">
                <p><strong>${comment.name}</strong> (<span class="time-ago">${formatTimeAgo(comment.timestamp)}</span>):</p>
                <p>${comment.comment}</p>
            </div>
        `).join("");

        const ratingHTML = `
        <div class="rating-container" style="user-select: none;">
            <div class="rating-score">${averageRating ? averageRating : 'N/A'}</div>
            <div class="stars">
                <span class="star" data-value="1">&#9733;</span>
                <span class="star" data-value="2">&#9733;</span>
                <span class="star" data-value="3">&#9733;</span>
                <span class="star" data-value="4">&#9733;</span>
                <span class="star" data-value="5">&#9733;</span>
            </div>
            <div class="user-rating">Your rating: <span class="current-rating">${averageRating ? averageRating : 'N/A'}</span></div>
        </div>
    `;

 


   

        movieDetails.innerHTML = `
            <div class="movie-detail-box">
                <img src="${imagePath}" alt="${movie.title}" />
                <div class="rating">
                ${ratingHTML}
                <button id="wishlistBtn" class="wishlist-btn">Add to Wishlist</button>
            </div>
            </div>
            <div class="trailers">
                <div id="trailer-container">
                    ${trailerHTML}
                </div>     
                <div class="trailer-buttons">
                    <button id="prev-trailer">Prev</button>
                    <button id="next-trailer">Next</button>
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
                    ${commentsHTML}
                </div>
            </div>
        `;

        loadingIcon.remove(); // Remove loading icon after content is loaded

        // Add event listeners for trailer navigation
        let currentTrailerIndex = 0;

        const showTrailer = (index) => {
            document.querySelectorAll('.trailer').forEach((trailer, i) => {
                trailer.style.display = i === index ? '' : 'none';
            });
        };

        document.getElementById('prev-trailer').addEventListener('click', () => {
            if (currentTrailerIndex > 0) {
                currentTrailerIndex--;
                showTrailer(currentTrailerIndex);
            }
        });

        document.getElementById('next-trailer').addEventListener('click', () => {
            if (currentTrailerIndex < trailers.length - 1) {
                currentTrailerIndex++;
                showTrailer(currentTrailerIndex);
            }
        });

        document.getElementById('wishlistBtn').addEventListener('click', () => addToWishlist(movie.id));

        // Add event listener for star rating
        const starsContainer = document.querySelector('.stars');
        starsContainer.addEventListener('click', async (e) => {
            if (e.target.classList.contains('star')) {
                const rating = e.target.getAttribute('data-value');
                const newAverageRating = await postRating(movie.id, rating);
                if (newAverageRating) {
                    document.querySelector('.current-rating').textContent = newAverageRating;
                    highlightStars(rating);
                }
            }
        });

        highlightStars(averageRating);

        // Add event listener for comment submission
        document.getElementById('submit-comment').addEventListener('click', async () => {
            const name = document.getElementById('comment-name').value;
            const comment = document.getElementById('comment-text').value;
            if (name && comment) {
                const newComment = await postComment(movie.id, name, comment);
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
        setInterval(updateCommentTimestamps, 60000); // Update comment timestamps every minute

    } catch (error) {
        console.log("Error showing movie details:", error);
    }
};

getMovieDetails(movieId);
