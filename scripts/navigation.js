//Event listener for mobile navigation
document.querySelector("#mobile-nav-button").addEventListener("click", () => {
    document.querySelector(".social-links").classList.toggle("flex");
    document.querySelector("body").classList.toggle("hiddenY");
    document.querySelector(".floating-button__center").classList.toggle("open");
});
