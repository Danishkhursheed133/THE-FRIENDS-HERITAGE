console.log ("Script is working");
// ================= MOBILE MENU =================
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

if(menuToggle && navLinks){
    menuToggle.addEventListener("click", () => {
        navLinks.classList.toggle("active");
    });
}

// ================= SLIDER =================
const slides = document.querySelectorAll(".slide");
const dots = document.querySelectorAll(".dot");

let currentSlide = 0;
let autoSlide;

// Show Slide
function showSlide(index) {
    slides.forEach(slide => {
        slide.classList.remove("active");
    });

    dots.forEach(dot => {
        dot.classList.remove("active");
    });

    slides[index].classList.add("active");
    dots[index].classList.add("active");

    currentSlide = index;
}

// Next Slide
function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
}

// Previous Slide
function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(currentSlide);
}

// Auto Slide
function startSlider() {
    clearInterval(autoSlide);
    autoSlide = setInterval(nextSlide, 3000);
}

function stopSlider() {
    clearInterval(autoSlide);
}

// Next Button
const nextBtn = document.querySelector(".next");
const prevBtn = document.querySelector(".prev");

if(nextBtn){
    nextBtn.addEventListener("click", () => {
        stopSlider();
        nextSlide();
        startSlider();
    });
}

if(prevBtn){
    prevBtn.addEventListener("click", () => {
        stopSlider();
        prevSlide();
        startSlider();
    });
}

// Previous Button
document.querySelector(".prev").addEventListener("click", () => {
    stopSlider();
    prevSlide();
    startSlider();
});

// Dots Navigation
dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
        stopSlider();
        showSlide(index);
        startSlider();
    });
});

// Pause Slider on Hover
const slider = document.querySelector(".slider");

slider.addEventListener("mouseenter", stopSlider);
slider.addEventListener("mouseleave", startSlider);

// Start Slider
startSlider();