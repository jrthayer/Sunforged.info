// =============================================
// table of contents
// =============================================
// 1. variables
//      1.1 css selectors
//      1.2 static dom elements
//      1.3 css properties
//      1.4 global states
// 2. component setup
//      2.1 create name element
// 3. event listeners
//      3.1 name element click handler
//          3.1.1 set character details
//          3.1.2 set selected class
//          3.1.3 move names position
//      3.2 transitionEnd listener
//      3.3 arrows click listeners
//      3.4 toggle mute listener
// =============================================

// ======================
// 1. Variables
// ======================
// 1.1 css selectors
const cssNameList = ".party-section__selection-names menu a";
const cssArrowButton = ".party-section__selection-container img";
const cssCharacterDetails = ".party-section__character-details p";

//1.2 static dom elements
const domNameContainer = document.querySelector(
    ".party-section__selection-names menu"
);
const domPartyAudio = document.querySelector("#partyAudio");
const domPartyMuteButton = document.querySelector(
    ".party-section__selection-container button"
);
const domArrowImageFirst = document.querySelector(cssArrowButton);
const domArrowImageLast = document.querySelector(
    `${cssArrowButton}:last-of-type`
);

// 1.3 css properties
let parentGap = window
    .getComputedStyle(domNameContainer)
    .getPropertyValue("gap");
parentGap = Number(parentGap.replace(/px$/, ""));
let nameHeight;

// 1.4 global states
let windowWidth = window.innerWidth;
let slider = 0;
let isMoving = false;
let nameContainerLength = 0;
const visibleNames = 3;
const numOfDuplicates = Math.floor(visibleNames / 2);
let selectedIndex = numOfDuplicates;
// Set characterData globally so that duplicate character data isn't created.
// Alternatively each name element could contain a copy of the character data making this no longer necessary.
let characterData;

const mutedObject = {
    _state: true,
    get state() {
        return this._state;
    },
    set state(newValue) {
        this._state = newValue;

        if (newValue) {
            domPartyMuteButton.innerHTML = '<i class="fas fa-volume-mute"></i>';
            domPartyAudio.pause();
            domPartyAudio.src = domPartyAudio.src;
        } else {
            domPartyMuteButton.innerHTML = '<i class="fas fa-volume-up"></i>';
            domPartyAudio.play();
        }
    },
};

// ======================
// 2. component setup
// ======================

// Setup character selector component
document.addEventListener("DOMContentLoaded", function () {
    //Get character data
    axios
        .get("./data/characters.json")
        .then(function (response) {
            characterData = response.data.characters;
            // create name elements for each character name

            // insert duplicate names at beginning
            for (let x = numOfDuplicates; x > 0; x--) {
                let arrayEnd = characterData.length;
                createdName = createNameElement(
                    nameContainerLength,
                    arrayEnd - x
                );
                domNameContainer.appendChild(createdName);
                nameContainerLength++;
            }

            // create a name element for every character
            characterData.forEach((character, index) => {
                let createdName = createNameElement(nameContainerLength, index);

                domNameContainer.appendChild(createdName);
                nameContainerLength++;
            });

            // insert duplicate names at the end
            for (let x = 0; x < visibleNames; x++) {
                let createdName = createNameElement(nameContainerLength, x);

                domNameContainer.appendChild(createdName);
                nameContainerLength++;
            }

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

            // set the state for the initial name
            function setInitialName() {
                // remove selected css class if currently on page
                let domSelected = document.querySelector(".selected");
                if (domSelected !== null) {
                    domSelected.classList.remove("selected");
                }

                // reset state values
                selectedIndex = numOfDuplicates;
                slider = 0;
                isMoving = false;

                // move name selection to top
                domNameContainer.style.transition = "none";
                domNameContainer.style.transform = `translateY(${slider}px)`;

                // click the starting name
                let startingIndex = nameContainerLength - visibleNames;
                let initialNameElement = document.querySelector(
                    `${cssNameList}:nth-of-type(${startingIndex + 1})`
                );
                initialNameElement.click();
            }

            // Calculate and set the initial container height
            mutedObject.state = true;

            setParentHeight(visibleNames);
            setInitialName();
            domPartyMuteButton.classList.remove("hidden");

            // Listen for window resize events to adjust the container height
            window.addEventListener("resize", function () {
                // Width didn't change so don't update component, needed for mobile.
                // Several browser hide the search bar when you scroll down and show it when you scroll up, this fires resize.
                if (windowWidth === window.innerWidth) return;

                mutedObject.state = true;
                setParentHeight(visibleNames);

                setInitialName();
                domPartyMuteButton.classList.remove("hidden");
                windowWidth = window.innerWidth;
            });
        })
        .catch(function (error) {
            console.log(error);
        });
});

// 2.1 create name element
// ======================
// listIndex = the index based on position in the domNameContainer
// dataIndex = the index that correlates with characterData array
function createNameElement(listIndex, dataIndex) {
    const nameElement = document.createElement("a");
    nameElement.textContent = characterData[dataIndex].name;
    nameElement.dataset.index = listIndex;

    nameElement.addEventListener("click", function () {
        nameClickHandler(this, dataIndex);
    });

    return nameElement;
}

// ======================
// 3. event listeners
// ======================

// =========
// 3.1 name element click handler
// ========
// element = dom element being clicked
// dataIndex = the index that correlates with characterData array
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
    if (indexDifference === 0) {
        //flip muted state to toggle party member greeting
        mutedObject.state = !mutedObject.state;
        return;
    }

    // determine direction the menu needs to travel
    let direction;
    indexDifference > 0 ? (direction = "down") : (direction = "up");

    // determine if the previous name was an edge name
    let animate = true;
    if (
        prevSelectedIndex === numOfDuplicates ||
        prevSelectedIndex === nameContainerLength - numOfDuplicates - 1
    ) {
        animate = false;
    }

    // move to clicked name, set selected class, and hide the audio symbol
    moveNames(direction, numberOfNames, animate);
    setSelectedState(element, prevSelectedIndex);
    domPartyMuteButton.classList.add("hidden");

    // determine if greeting should play
    if (
        selectedIndex !== numOfDuplicates &&
        selectedIndex !== nameContainerLength - numOfDuplicates - 1
    ) {
        domPartyAudio.src = `./audio/${characterData[dataIndex].name}1.mp3`;

        if (mutedObject.state !== true) {
            domPartyAudio.play();
        }
    }

    //Load character data
    setCharacterDetails(characterData[dataIndex]);
}

// 3.1.1 set character details
// populates character detail fields and sets character image src
function setCharacterDetails(data) {
    let fields = document.querySelectorAll(cssCharacterDetails);
    fields[0].textContent = upperCase(data.name);
    //Little wonky have an a tag inside a paragraph but it makes things easy
    fields[1].innerHTML = `<a href="${data.twitch}"
    class=""
    target="_blank"
    rel="noopener noreferrer">${upperCase(
        data.player
    )} <i class="fab fa-twitch" aria-hidden="true"></i></a>`;
    fields[2].textContent = upperCase(data.bio);
    fields[3].textContent = data.level;
    fields[4].textContent = upperCase(data.class);

    //Set character image
    document.querySelector(".party-section__image").src = `./images/${upperCase(
        data.name
    )}.webp`;
}

function upperCase(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

// 3.1.2 set selected class
//sets the selected class on selectedElement name and removes it from the prev selected element
function setSelectedState(selectedElement, prevSelectedIndex) {
    const prevSelected = document.querySelector(
        `${cssNameList}:nth-of-type(${prevSelectedIndex + 1})`
    );
    prevSelected.classList.remove("selected");

    selectedElement.classList.add("selected");
    selectedIndex = Number(selectedElement.dataset.index);
}

// 3.1.3 move names position
//moves the name container based on given direction, numberOfNames, and type of animation
function moveNames(direction, numberOfNames, animate) {
    let moveDistance = numberOfNames * (nameHeight + parentGap);
    direction === "up" ? (slider += moveDistance) : (slider -= moveDistance);

    if (animate) {
        isMoving = true;
        domNameContainer.style.transition = "transform .4s linear";
    } else {
        isMoving = false;
        domNameContainer.style.transition = "none";
    }

    domNameContainer.style.transform = `translateY(${slider}px)`;
}

// =========
// 3.2 transitionEnd listener
// =========
//At the end of the name selection transition the duplicate name element is clicked if the current name is near the edge
domNameContainer.addEventListener("transitionend", () => {
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

    domPartyMuteButton.classList.remove("hidden");
});

// =========
// 3.3 arrows click listeners
// =========
// The following event listeners are the arrow buttons of the name selection element
// nth-of-type starts at 1 instead of zero so this goes back one
domArrowImageFirst.addEventListener("click", () => {
    document
        .querySelector(`${cssNameList}:nth-of-type(${selectedIndex})`)
        .click();
});

// nth-of-type starts at 1 instead of zero so you need to add 2 to go forward 1 name
domArrowImageLast.addEventListener("click", () => {
    document
        .querySelector(`${cssNameList}:nth-of-type(${selectedIndex + 2})`)
        .click();
});

// =========
// 3.4 toggle mute listener
// =========
domPartyMuteButton.addEventListener("click", () => {
    mutedObject.state = !mutedObject.state;
});
