const APIURL = "https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=04c35731a5ee918f014970082a0088b1&page=1";
const IMGPATH = "https://image.tmdb.org/t/p/w1280";
const SEARCHAPI = "https://api.themoviedb.org/3/search/movie?&api_key=04c35731a5ee918f014970082a0088b1&query=";
const movieBox = document.querySelector("#moviebox");




// const getTrending= async()=>{
//     const options = {
//         method: 'GET',
//         headers: {
//           accept: 'application/json',
//           Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxOTVhYWRjMTYzMzU0OWU0NWM2N2U3OTZiZTA5M2Y3ZSIsInN1YiI6IjY1MDIxZDVhZTBjYTdmMDBhZTNmZWQ1NSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.XoGGNVylLERyAL7o4cGzraF4VJI9TeYbUWpNKtu2WpQ'
//         }
//       };
      
//     //   fetch('https://api.themoviedb.org/3/trending/movie/day?language=en-US', options)
//     //     .then(response => response.json())
//     //     .then(response => console.log(response))
//     //     .catch(err => console.error(err));

//     try {
//         const trendingResponse = await fetch('https://api.themoviedb.org/3/trending/movie/day?language=en-US', options);
//         const trendingResponseData = await trendingResponse.json();
//         const firstFourTrending= trendingResponseData.results.slice(0,4);
//         showTrending(firstFourTrending);
//         console.log(firstFourTrending);
//         console.log("Printed");
//         // startSlide();
//       } catch (error) {
//         console.log("Error fetching trending movies", error);
//       }
      
// }

const getMovies = async (url) => {
    try {
        const response = await fetch(url);
        const data = await response.json();
        showMovies(data.results);
    } catch (error) {
        console.log("Error fetching movies:", error);
    }
};

const getGenres = async (genreIds) => {
    try {
        const response = await fetch("https://api.themoviedb.org/3/genre/movie/list?api_key=04c35731a5ee918f014970082a0088b1");
        const data = await response.json();
        // console.log(data)
        const genres = data.genres.filter(genre => genreIds.includes(genre.id)).map(genre => genre.name);
        return genres;
    } catch (error) {
        console.log("Error fetching genres:", error);
        return [];
    }
};

const showMovies = (results) => {
    movieBox.innerHTML = "";
    results.forEach(async (result) => {
        const imagePath = result.poster_path ? IMGPATH + result.poster_path : "./missing-image";
        const genres = await getGenres(result.genre_ids);
        const box = document.createElement("div");
        box.classList.add("box");
        box.innerHTML = `
            <img src="${imagePath}" alt="" />
            <div class="overlay">
                <div class="title">
                    <h3>${result.original_title}</h3>
                    <span class="rating">${result.vote_average}</span>
                </div>
                <h4>Genres:</h4>
                <p>${genres.join(", ")}</p>
            </div>
        `;
        movieBox.appendChild(box);
    });
};

// const showTrending = (trendingResults) => {
//     const slideImages = document.getElementById("slideimages"); // Assuming you have an element with this ID

//     const imageElements = slideImages.querySelectorAll(".slide img");

//     imageElements.forEach((imgElement, index) => {
//         const result = trendingResults[index];
//         const imagePath = result.poster_path ? IMGPATH + result.poster_path : "./missing-image.jpg"; // Correct the missing image path
//         imgElement.src = imagePath;
//         imgElement.alt = result.title; // Set the alt attribute
//     });
// };

// const showTrending=(trendingResults) =>{
//     slideimages.innerHTML="";
//     trendingResults.forEach(
//         async(result)=>{
//             const imagePath=result.poster_path?IMGPATH+result.poster_path:"./missing-image";
//         const slide=document.createElement("div");
//         slide.classList.add("slide");
//         slide.innerHTML=`
//            <img src="${imagePath}" alt=".img/cherry.jpg" />
//         `;
//         slideimages.appendChild(slide);
//         }
    
//     );
// };

// const showTrending = async (trendingResults) => {
//     slideimages.innerHTML = "";

//     for (const result of trendingResults) {
//         const imagePath = result.poster_path ? IMGPATH + result.poster_path : "./missing-image";
//          console.log(result);
//         try {
//             const image = new Image();
//             image.src = imagePath;
            
//             await image.decode(); // Wait for the image to load and decode

//             const slide = document.createElement("div");
//             slide.classList.add("slide");
//             slide.innerHTML = `
//                 <img src="${imagePath}" alt="Image not found" />
//             `;
//             slideimages.appendChild(slide);
//             console.log("child added");
//         } catch (error) {
//             console.error("Error loading image:", error);
//             // Handle the error, e.g., display a placeholder image
//         }
//     }
// };



const searchMovies = (query) => {
    const url = SEARCHAPI + query;
    getMovies(url);
};

document.querySelector("#search").addEventListener("keyup", (event) => {
    const query = event.target.value.trim();
    if (query !== "") {
        searchMovies(query);
    } else {
        getMovies(APIURL);
    }
});


getMovies(APIURL);

