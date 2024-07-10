const API_KEY = "04c35731a5ee918f014970082a0088b1";
const IMGPATH = "https://image.tmdb.org/t/p/w1280";

const urlParams = new URLSearchParams(window.location.search);
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
        const response = await fetch(`http://localhost:5000/comments/${movieId}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.log("Error fetching comments:", error);
        return [];
    }
};

const postComment = async (movieId, name, comment) => {
    try {
        const response = await fetch('https://probable-space-zebra-r547jqggw65fp67p-5000.app.github.dev/comments', {
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

const showMovieDetails = async (movie) => {
    const movieDetails = document.getElementById("movie-details");
    const imagePath = movie.poster_path ? IMGPATH + movie.poster_path : "./missing-image";
    const trailers = await getMovieTrailers(movie.id);
    const comments = await getComments(movie.id);

    const trailerHTML = trailers.map((trailer, index) => `
        <div class="trailer" id="trailer-${index}" style="${index === 0 ? '' : 'display:none;'}">
            <h4>${trailer.name}</h4>
            <iframe width="560" height="315" src="https://www.youtube.com/embed/${trailer.key}" frameborder="0" allowfullscreen></iframe>
        </div>
    `).join("");

    const commentsHTML = comments.map(comment => `
        <div class="comment">
            <p><strong>${comment.name}</strong> (${new Date(comment.timestamp).toLocaleString()}):</p>
            <p>${comment.comment}</p>
        </div>
    `).join("");

    movieDetails.innerHTML = `
        <div class="movie-detail-box">
            <img src="${imagePath}" alt="${movie.title}" />
            <div class="movie-info">
                <h2>${movie.title}</h2>
                <p>${movie.overview}</p>
                <h3>Genres: ${movie.genres.map(genre => genre.name).join(", ")}</h3>
                <h4>Rating: ${movie.vote_average}</h4>
                <h4>Release Date: ${movie.release_date}</h4>
            </div>
        </div>
        <div class="trailers">
            <h3>Trailers:</h3>
            <div id="trailer-container">
                ${trailerHTML}
            </div>
            <div class="trailer-buttons">
                <button id="prev-trailer">Previous</button>
                <button id="next-trailer">Next</button>
            </div>
        </div>
        <div class="comments-section">
            <h3>Comments:</h3>
            <div id="comments-container">
                ${commentsHTML}
            </div>
            <div class="add-comment">
                <h4>Add a Comment</h4>
                <input type="text" id="comment-name" placeholder="Your Name" required>
                <textarea id="comment-text" placeholder="Your Comment" required></textarea>
                <button id="submit-comment">Submit</button>
            </div>
        </div>
    `;

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

    document.getElementById('submit-comment').addEventListener('click', async () => {
        const name = document.getElementById('comment-name').value;
        const comment = document.getElementById('comment-text').value;

        if (name && comment) {
            const newComment = await postComment(movie.id, name, comment);
            if (newComment) {
                document.getElementById('comments-container').innerHTML += `
                    <div class="comment">
                        <p><strong>${newComment.name}</strong> (${new Date(newComment.timestamp).toLocaleString()}):</p>
                        <p>${newComment.comment}</p>
                    </div>
                `;
                document.getElementById('comment-name').value = '';
                document.getElementById('comment-text').value = '';
            }
        } else {
            alert('Please enter both name and comment.');
        }
    });
};

getMovieDetails(movieId);
