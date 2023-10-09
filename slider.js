const slideContainer=document.querySelector(".container");
const slide=document.querySelector(".slides")
const nxtBtn=document.getElementById("nxtBtn")
const prBtn=document.getElementById("prevBtn")
const interval=4000;
const IMGPAT = "https://image.tmdb.org/t/p/w1280";

let slides=document.querySelectorAll(".slide")
let slideId=null;
let firstClone;
let lastClone;
     
let index=1

const showTrending = (trendingResults) => {
    return new Promise((resolve) => {
        const slideImages = document.getElementById("slideimages");

        const imageElements = slideImages.querySelectorAll(".slide img");

        imageElements.forEach((imgElement, index) => {
            if (trendingResults[index]) {
                const result = trendingResults[index];
                const imagePath = result.poster_path ? IMGPAT + result.poster_path : "./missing-image.jpg";
                imgElement.src = imagePath;
                imgElement.alt = result.title;

                const slideOverlay = document.createElement("div");
                slideOverlay.classList.add("slide-overlay");

                const trendingIndex = document.createElement("h6");
                trendingIndex.classList.add("trendIndex");
                trendingIndex.innerHTML = `#${index + 1} <span>Spotlight<span>`;

                const slideTitle = document.createElement("h3");
                slideTitle.classList.add("slide-title");
                slideTitle.innerHTML = `<strong>${result.title}</strong>`;

                slideOverlay.appendChild(trendingIndex);
                slideOverlay.appendChild(slideTitle);
                imgElement.parentNode.appendChild(slideOverlay);
            }
        });

        // Clone and append the slides after they have been loaded
        slides = document.querySelectorAll(".slide");
        firstClone = slides[0].cloneNode(true);
        lastClone = slides[slides.length - 1].cloneNode(true);
        firstClone.id = 'first-clone';
        lastClone.id = 'last-clone';
        slide.append(firstClone);
        slide.prepend(lastClone);

        // Resolve the Promise when all images have been loaded
        slideImages.addEventListener('load', resolve);
    });
};
const getTrending= async()=>{
    const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxOTVhYWRjMTYzMzU0OWU0NWM2N2U3OTZiZTA5M2Y3ZSIsInN1YiI6IjY1MDIxZDVhZTBjYTdmMDBhZTNmZWQ1NSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.XoGGNVylLERyAL7o4cGzraF4VJI9TeYbUWpNKtu2WpQ'
        }
      };
      

    try {
        const trendingResponse = await fetch('https://api.themoviedb.org/3/trending/movie/day?language=en-US', options);
        const trendingResponseData = await trendingResponse.json();
        const firstFourTrending= trendingResponseData.results.slice(0,4);
        await showTrending(firstFourTrending);
        console.log(firstFourTrending);
        console.log("Printed");

        // slides=document.querySelectorAll(".slide");
        //  firstClone=slides[0].cloneNode(true);
        //  lastClone=slides[slide.length-1].cloneNode(true);
        // firstClone.id='first-clone';
        // lastClone.id='last-clone';
        // slide.append(firstClone);
        // slide.prepend(lastClone);
        startSlide();
      } catch (error) {
        console.log("Error fetching trending movies", error);
      }
      
}


const slideWidth=slides[index].clientWidth;

slide.style.transform=`translateX(${-slideWidth*index}px)`;

const startSlide=()=>{
    slideId = setInterval(()=>{
       moveToNextSlide();
    } , interval)
};

slide.addEventListener('transitionend',()=>{
    slides=getSlides();
    if(!slides[index]) {
        console.error('No slide at index', index, 'Slides:', slides);
        return;
    }
    if(slides[index].id===firstClone.id)
    {
        slide.style.transition='none';
        index=1;
        slide.style.transform=`translateX(${-slideWidth*index}px)`
    }
    if(slides[index].id===lastClone.id)
    {
        slide.style.transition='none';
        index=slides.length-2;
        slide.style.transform=`translateX(${-slideWidth*index}px)`
    }
});

const moveToNextSlide=()=>{
    slides=getSlides();

    if(index>=slides.length-1) return;
    index++;
    slide.style.transform=`translateX(${-slideWidth*index}px)`;
    slide.style.transition='.7s'
}

const moveToPrevSlide=()=>{
    slides=getSlides();
    if(index<=0) return ;
    index--;
    slide.style.transform=`translateX(${-slideWidth*index}px)`;
    slide.style.transition='.2s'
}

 getSlides=()=>document.querySelectorAll('.slide')

slideContainer.addEventListener('mouseenter',()=>{
    console.log("Hellow");
    clearInterval(slideId);
});

slideContainer.addEventListener('mouseleave',startSlide); 

nxtBtn.addEventListener('click',moveToNextSlide);
prBtn.addEventListener('click',moveToPrevSlide);
getTrending();
startSlide();


