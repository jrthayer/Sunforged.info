document.querySelector("#test").addEventListener("click", () => {
    document.querySelector(".social-links").classList.toggle("flex");
});

console.log(document.querySelectorAll(".line a"));

document
    .querySelectorAll(".party-section__names a")
    .forEach((element, index, array) => {
        element.addEventListener("click", function () {
            array.forEach((element) => {
                element.classList.remove("selected");
                element.classList.remove("selected-adjacent");
            });

            //prettier-ignore
            document.querySelector(".party-section__image").src = `./images/${element.textContent}.png`;
            this.classList.add("selected");
        });
        return true;
    });

// script.js
document.addEventListener("DOMContentLoaded", function () {});

// script.js
document.addEventListener("DOMContentLoaded", function () {
    const nameContainer = document.querySelector(".party-section__names menu");
    const parentContainer = document.querySelector(".party-section__names");
    const numberOfNames = 5;
    // Sample names (you can replace these with your data)
    const characterData = [
        "Carlisle",
        "Desmond",
        "Indrasa",
        "Morgaine",
        "V",
        "Tac",
        // Add more names as needed
    ];

    let slider = 0;

    //Create names elements
    characterData.forEach((name, index, array) => {
        const nameElement = document.createElement("a");
        nameElement.textContent = name;
        nameElement.dataset.index = index;
        nameElement.addEventListener("click", function () {
            // Scroll to the center of the clicked name

            // Calculate scroll position of clicked name
            // prettier-ignore
            // const scrollY = this.offsetTop - parentContainer.offsetHeight / 2 + this.offsetHeight / 2;

            // scrollToCustom(parentContainer, scrollY, 1000);
            // parentContainer.scrollTo({
            //     top: scrollY,
            //     behavior: "smooth",
            // });
            setSelectedState(this, numberOfNames);

            slider -= 100;
            nameContainer.style.transform = `translateY(${slider}px)`;

            //prettier-ignore
            document.querySelector(".party-section__image").src = `./images/${this.textContent}.png`;
        });

        addedElement = nameContainer.appendChild(nameElement);
    });

    const nameElements = document.querySelectorAll(
        ".party-section__names menu a"
    );

    let parentGap = window
        .getComputedStyle(nameContainer)
        .getPropertyValue("gap");
    parentGap = Number(parentGap.replace(/px$/, ""));

    // Function to calculate and set the container height
    function setParentHeight(numberOfNames) {
        --numberOfNames;
        const height =
            nameElements[0].offsetHeight * (numberOfNames + 1) +
            parentGap * numberOfNames;
        parentContainer.style.height = `${height}px`; // Show 3 full names and 2 half names
    }

    // Calculate and set the initial container height
    setParentHeight(numberOfNames);

    // nameElements.forEach((element, index, array) => {
    //     const extraPadding = `${
    //         (element.offsetHeight + parentGap) * Math.floor(numberOfNames / 2) +
    //         (element.offsetHeight / 2) * (numberOfNames % 2)
    //     }px`;

    //     if (index === 0) {
    //         element.style.paddingTop = extraPadding;
    //     }

    //     if (index === array.length - 1) {
    //         element.style.paddingBottom = extraPadding;
    //     }
    // });

    // Listen for window resize events to adjust the container height
    window.addEventListener("resize", setParentHeight);
});

function setSelectedState(selectedElement, numberOfNames) {
    const selectedIndex = Number(selectedElement.dataset.index);
    const selectedAdjacentDepth = Math.floor(numberOfNames / 2);
    const nameElements = document.querySelectorAll(
        ".party-section__names menu a"
    );

    nameElements.forEach((element) => {
        const curIndex = Number(element.dataset.index);

        element.removeAttribute("class");
        element.removeAttribute("style");

        if (curIndex === selectedIndex) return;

        const indexDifference = Math.abs(curIndex - selectedIndex);

        if (indexDifference >= 0 && indexDifference <= selectedAdjacentDepth) {
            const indentSize = `${indexDifference * 3}rem`;
            element.style.transform = `translateX(${indentSize})`;
        }
    });

    selectedElement.classList.add("selected");
}
