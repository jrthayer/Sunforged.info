// css selectors
const cssNameList = ".party-section__selection-names menu a";
const cssArrowButton = ".party-section__selection-container img";
const cssCharacterDetails = ".party-section__character-details p";

//Static DOM Elements
const nameContainer = document.querySelector(
    ".party-section__selection-names menu"
);

// CSS property values
let parentGap = window.getComputedStyle(nameContainer).getPropertyValue("gap");
parentGap = Number(parentGap.replace(/px$/, ""));
let nameHeight;

// States
let slider = 0;
let isMoving = false;
let selectedIndex = 0;
let nameContainerLength = 0;
const visibleNames = 3;
const numOfDuplicates = Math.floor(visibleNames / 2);
let characterData;

//Event listener for mobile navigation
document.querySelector("#mobile-nav-button").addEventListener("click", () => {
    document.querySelector(".social-links").classList.toggle("flex");
});

// script.js
document.addEventListener("DOMContentLoaded", function () {
    // Sample names (you can replace these with your data)
    // const characterData = [
    //     "carlisle",
    //     "desmond",
    //     "indrasa",
    //     "morgaine",
    //     "v",
    //     "tac",
    //     // Add more names as needed
    // ];
    //Get character data
    axios
        .get("/data/characters.json")
        .then(function (response) {
            characterData = response.data;
            let characterArray = characterData.characters;
            console.log(characterArray);
            //Insert Duplicate Names at beginning
            for (let x = numOfDuplicates; x > 0; x--) {
                let arrayEnd = characterArray.length;
                createdName = createNameElement(
                    characterArray[arrayEnd - x].name,
                    nameContainerLength,
                    arrayEnd - x
                );
                nameContainer.appendChild(createdName);
                nameContainerLength++;
            }

            //Create names elements
            characterArray.forEach((character, index) => {
                let createdName = createNameElement(
                    character.name,
                    nameContainerLength,
                    index
                );

                if (nameContainerLength === numOfDuplicates) {
                    createdName.classList.add("selected");
                    selectedIndex = nameContainerLength;
                }

                nameContainer.appendChild(createdName);
                nameContainerLength++;
            });

            characterArray.forEach((character, index) => {
                if (index < visibleNames) {
                    let createdName = createNameElement(
                        character.name,
                        nameContainerLength,
                        index
                    );

                    nameContainer.appendChild(createdName);
                    nameContainerLength++;
                }
            });

            //Set nameHeight global after names have been generated
            nameHeight = document.querySelector(cssNameList).offsetHeight;

            // Function to calculate and set the container height(Needed for resize listener)
            function setParentHeight(numberOfNames) {
                const height =
                    nameHeight * numberOfNames +
                    parentGap * (numberOfNames - 1);
                let parentContainer = document.querySelector(
                    ".party-section__selection-names"
                );
                parentContainer.style.height = `${height}px`; // Show 3 full names and 2 half names
            }

            // Calculate and set the initial container height
            setParentHeight(visibleNames);

            //Clicks the starting name
            let startingIndex = (resetIndex =
                nameContainerLength - visibleNames);
            let initialNameElement = document.querySelector(
                `${cssNameList}:nth-of-type(${startingIndex + 1})`
            );

            initialNameElement.click();
            // Listen for window resize events to adjust the container height
            window.addEventListener("resize", setParentHeight);
        })
        .catch(function (error) {
            console.log(error);
        });
});

function createNameElement(name, index, dataIndex) {
    const nameElement = document.createElement("a");
    nameElement.textContent = name;
    nameElement.dataset.index = index;

    nameElement.addEventListener("click", function () {
        // return if this name is already selected
        if (this.classList.contains("selected")) return;

        nameClickHandler(this, dataIndex);
    });

    return nameElement;
}

function nameClickHandler(element, dataIndex) {
    //If the name selector is currently moving do not allow another element to be selected
    if (isMoving === true) return;

    // Determine direction the menu needs to travel
    const prevSelectedIndex = selectedIndex;
    let clickedIndex = Number(element.dataset.index);

    let indexDifference = clickedIndex - prevSelectedIndex;
    let numberOfNames = Math.abs(indexDifference);

    let direction;
    indexDifference > 0 ? (direction = "down") : (direction = "up");

    // Determine if the previous name was an edge name
    let animate = true;
    if (
        prevSelectedIndex === numOfDuplicates ||
        prevSelectedIndex === nameContainerLength - numOfDuplicates - 1
    )
        animate = false;

    moveNames(direction, numberOfNames, animate);
    setSelectedState(element);

    //Load character data(WIP)(Currently sets src of character image only)
    setCharacterDetails(
        characterData.characters[dataIndex],
        characterData.level
    );
    //prettier-ignore
    document.querySelector(".party-section__image").src = `./images/${element.textContent}.webp`;
}

function setCharacterDetails(details, level) {
    let name = details.name;
    details = details.details;
    let fields = document.querySelectorAll(cssCharacterDetails);
    fields[0].textContent = upperCase(name);
    //Little wonky have an a inside a paragraph but it makes things easy
    fields[1].innerHTML = `<a href="${details.twitch}"
    class=""
    target="_blank"
    rel="noopener noreferrer">${upperCase(
        details.player
    )} <i class="fab fa-twitch" aria-hidden="true"></i></a>`;
    fields[2].textContent = upperCase(details.bio);
    fields[3].textContent = level;
    fields[4].textContent = upperCase(details.class);

    console.log(fields);
}

function upperCase(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

//sets the selected class on one name and removes it from the rest
function setSelectedState(selectedElement) {
    const nameElements = document.querySelectorAll(cssNameList);

    nameElements.forEach((element) => {
        element.classList.remove("selected");
    });

    selectedElement.classList.add("selected");
    selectedIndex = Number(selectedElement.dataset.index);
}

//moves the name container based on given direction, numberOfNames, and type of animation
function moveNames(direction, numberOfNames, animate) {
    let moveDistance = numberOfNames * (nameHeight + parentGap);
    direction === "up" ? (slider += moveDistance) : (slider -= moveDistance);

    if (animate) {
        isMoving = true;
        nameContainer.style.transition = "transform .4s linear";
    } else {
        isMoving = false;
        nameContainer.style.transition = "none";
    }

    nameContainer.style.transform = `translateY(${slider}px)`;
}

//At the end of the name selection transition the duplicate name element is clicked if the current name is near the edge
nameContainer.addEventListener("transitionend", () => {
    isMoving = false;

    let resetIndex = 0;

    //Top edge of name elements
    if (selectedIndex === numOfDuplicates) {
        resetIndex = nameContainerLength - visibleNames;
        document
            .querySelector(`${cssNameList}:nth-of-type(${resetIndex + 1})`)
            .click();
    }

    //Bottom edge of name elements
    if (selectedIndex === nameContainerLength - numOfDuplicates - 1) {
        resetIndex = visibleNames;
        document
            .querySelector(`${cssNameList}:nth-of-type(${resetIndex})`)
            .click();
    }
});

// The following event listeners are the arrow buttons of the name selection element
// nth-of-type starts at 1 instead of zero so this goes back one
document.querySelector(cssArrowButton).addEventListener("click", () => {
    document
        .querySelector(`${cssNameList}:nth-of-type(${selectedIndex})`)
        .click();
});

// nth-of-type starts at 1 instead of zero so you need to add 2 to go forward 1 name
document
    .querySelector(`${cssArrowButton}:last-of-type`)
    .addEventListener("click", () => {
        document
            .querySelector(`${cssNameList}:nth-of-type(${selectedIndex + 2})`)
            .click();
    });
