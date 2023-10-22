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
let nameContainerLength = 0;
const visibleNames = 3;
const numOfDuplicates = Math.floor(visibleNames / 2);
let selectedIndex = numOfDuplicates;
let characterData;

//Event listener for mobile navigation
document.querySelector("#mobile-nav-button").addEventListener("click", () => {
    document.querySelector(".social-links").classList.toggle("flex");
});

// script.js
document.addEventListener("DOMContentLoaded", function () {
    //Get character data
    axios
        .get("./data/characters.json")
        .then(function (response) {
            characterData = response.data;
            let characterArray = characterData.characters;

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

            // Function to calculate and set the container height(Needed for resize listener)
            function setParentHeight(numberOfNames) {
                //Set nameHeight global after names have been generated
                nameHeight = document.querySelector(cssNameList).offsetHeight;

                const height =
                    nameHeight * numberOfNames +
                    parentGap * (numberOfNames - 1);
                let parentContainer = document.querySelector(
                    ".party-section__selection-names"
                );
                parentContainer.style.height = `${height}px`; // Show 3 full names and 2 half names
            }

            function setInitialName() {
                selectedIndex = numOfDuplicates;
                slider = 0;
                isMoving = false;
                nameContainer.style.transition = "none";
                nameContainer.style.transform = `translateY(${slider}px)`;

                //Clicks the starting name
                let startingIndex = nameContainerLength - visibleNames;
                let initialNameElement = document.querySelector(
                    `${cssNameList}:nth-of-type(${startingIndex + 1})`
                );

                initialNameElement.click();
            }

            // Calculate and set the initial container height
            setParentHeight(visibleNames);
            setInitialName();

            // Listen for window resize events to adjust the container height
            window.addEventListener("resize", function () {
                setParentHeight(visibleNames);
                setInitialName();
            });
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
        nameClickHandler(this, dataIndex);
    });

    return nameElement;
}

function nameClickHandler(element, dataIndex) {
    //If the name selector is currently moving do not allow another element to be selected
    if (isMoving === true) return;

    const prevSelectedIndex = selectedIndex;
    let clickedIndex = Number(element.dataset.index);
    let indexDifference = clickedIndex - prevSelectedIndex;
    let numberOfNames = Math.abs(indexDifference);

    //This means this is the currently selected name.
    // Since this script is reliant on the transitionend listener if you don't change to a different name the
    // script never changes the isMoving variable above.
    if (indexDifference === 0) return;

    // Determine direction the menu needs to travel
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

    //Load character data
    setCharacterDetails(
        characterData.characters[dataIndex],
        characterData.level
    );
    //prettier-ignore
    document.querySelector(".party-section__image").src = `./images/${upperCase(element.textContent)}.webp`;
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
