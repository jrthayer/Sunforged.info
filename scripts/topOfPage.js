//Event listener for mobile navigation
const topNavButton = document.querySelector("#top-nav-button");

topNavButton.addEventListener("click", () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth", // You can use 'auto' or 'smooth' for a smooth scroll effect
    });
});

function checkButtonDisplayStatus() {
    // Get the current scroll position
    let scrollPosition = window.scrollY;

    // Get the height of the viewport (screen size)
    let viewportHeight = window.innerHeight / 2;

    // Determine if the scroll position is greater than the screen size
    let isScrollGreaterThanScreen = scrollPosition > viewportHeight;

    // Use the result as needed
    if (isScrollGreaterThanScreen) {
        topNavButton.classList.add("flex");
    } else {
        topNavButton.classList.remove("flex");
    }
}

function handleResize() {
    if (window.innerWidth >= 1400 && window.innerHeight >= 900) {
        checkButtonDisplayStatus();
        window.addEventListener("scroll", checkButtonDisplayStatus);
    } else {
        topNavButton.classList.remove("flex");
        window.removeEventListener("scroll", checkButtonDisplayStatus);
    }
}

// Check on page load
handleResize();

// Add resize event listener
window.addEventListener("resize", handleResize);
