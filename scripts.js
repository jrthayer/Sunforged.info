const nameContainer = document.querySelector(
    ".party-section__selection-names menu"
);
let parentGap = window.getComputedStyle(nameContainer).getPropertyValue("gap");
parentGap = Number(parentGap.replace(/px$/, ""));
let nameHeight;

let slider = 0;
let isMoving = false;
let selectedIndex = 0;
let prevIndex = 0;
let nameContainerLength = 0;
const visibleNames = 3;
const numOfDuplicates = Math.floor(visibleNames / 2);

document.querySelector("#test").addEventListener("click", () => {
    document.querySelector(".social-links").classList.toggle("flex");
});

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
document.addEventListener("DOMContentLoaded", function () {
    const nameContainer = document.querySelector(
        ".party-section__selection-names menu"
    );
    const parentContainer = document.querySelector(
        ".party-section__selection-names"
    );
    // Needs to be odd

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

    //Insert Duplicate Names at beginning
    for (let x = numOfDuplicates; x > 0; x--) {
        let arrayEnd = characterData.length;
        createdName = createNameElement(
            characterData[arrayEnd - x],
            nameContainerLength
        );
        nameContainer.appendChild(createdName);
        nameContainerLength++;
    }

    //Create names elements
    characterData.forEach((name) => {
        let createdName = createNameElement(name, nameContainerLength);

        if (nameContainerLength === numOfDuplicates) {
            createdName.classList.add("selected");
            selectedIndex = nameContainerLength;
            prevIndex = selectedIndex;
        }

        nameContainer.appendChild(createdName);
        nameContainerLength++;
    });

    characterData.forEach((name, index) => {
        if (index < visibleNames) {
            let createdName = createNameElement(name, nameContainerLength);

            nameContainer.appendChild(createdName);
            nameContainerLength++;
        }
    });

    //Set nameHeight global after names have been generated
    nameHeight = document.querySelector(
        ".party-section__selection-names menu a"
    ).offsetHeight;

    // Function to calculate and set the container height
    function setParentHeight(numberOfNames) {
        --numberOfNames;
        const height =
            nameHeight * (numberOfNames + 1) + parentGap * numberOfNames;
        parentContainer.style.height = `${height}px`; // Show 3 full names and 2 half names
    }

    // Calculate and set the initial container height
    setParentHeight(visibleNames);

    // Listen for window resize events to adjust the container height
    window.addEventListener("resize", setParentHeight);

    //click on the name
    let startingIndex = (resetIndex = nameContainerLength - visibleNames);
    let initialNameElement = document.querySelector(
        `.party-section__selection-names menu a:nth-of-type(${
            startingIndex + 1
        })`
    );
    initialNameElement.click();
});

function createNameElement(name, index) {
    const nameElement = document.createElement("a");
    nameElement.textContent = name;
    nameElement.dataset.index = index;

    nameElement.addEventListener("click", function () {
        // Determine direction the menu needs to travel
        let prevSelectedName = document.querySelector(".selected");
        let prevSelectedIndex = prevSelectedName.dataset.index;
        prevIndex = prevSelectedIndex;
        let clickedIndex = Number(this.dataset.index);

        setSelectedState(this);

        let indexDifference = clickedIndex - prevSelectedIndex;
        let numberOfNames = Math.abs(indexDifference);

        let direction;
        indexDifference > 0 ? (direction = "down") : (direction = "up");

        moveNames(direction, numberOfNames);

        //prettier-ignore
        document.querySelector(".party-section__image").src = `./images/${this.textContent}.webp`;
    });

    return nameElement;
}

function setSelectedState(selectedElement) {
    selectedIndex = Number(selectedElement.dataset.index);

    const nameElements = document.querySelectorAll(
        ".party-section__selection-names menu a"
    );

    nameElements.forEach((element) => {
        element.classList.remove("selected");
        element.removeAttribute("style");
    });

    selectedElement.classList.add("selected");
}

function moveNames(direction, numberOfNames) {
    console.log(prevIndex);
    let moveDistance = numberOfNames * (nameHeight + parentGap);
    direction === "up" ? (slider += moveDistance) : (slider -= moveDistance);

    if (
        Number(prevIndex) === numOfDuplicates ||
        Number(prevIndex) === nameContainerLength - numOfDuplicates - 1
    ) {
        nameContainer.style.transition = "none";
    } else {
        nameContainer.style.transition = "transform .4s linear";
    }

    nameContainer.style.transform = `translateY(${slider}px)`;
    nameContainer.style.setProperty("--current:", `${selectedIndex}`);
}

nameContainer.addEventListener("transitionend", () => {
    let resetIndex = 0;
    if (selectedIndex === numOfDuplicates) {
        resetIndex = nameContainerLength - visibleNames;
        document
            .querySelector(
                `.party-section__selection-names menu a:nth-of-type(${
                    resetIndex + 1
                })`
            )
            .click();
    }

    if (selectedIndex === nameContainerLength - numOfDuplicates - 1) {
        resetIndex = visibleNames;
        document
            .querySelector(
                `.party-section__selection-names menu a:nth-of-type(${resetIndex})`
            )
            .click();
    }
});

// nth-of-type starts at 1 instead of zero so this goes back one
document
    .querySelector(".party-section__selection-container img")
    .addEventListener("click", () => {
        document
            .querySelector(
                `.party-section__selection-names menu a:nth-of-type(${selectedIndex})`
            )
            .click();
    });

// nth-of-type starts at 1 instead of zero so you need to add 2 to go forward 1 name
document
    .querySelector(".party-section__selection-container img:last-of-type")
    .addEventListener("click", () => {
        document
            .querySelector(
                `.party-section__selection-names menu a:nth-of-type(${
                    selectedIndex + 2
                })`
            )
            .click();
    });
