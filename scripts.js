// css selectors
const cssNameList = ".party-section__selection-names menu a";
const cssArrowButton = ".party-section__selection-container img";
const cssCharacterDetails = ".party-section__character-details p";

//Static DOM Elements
const domNameContainer = document.querySelector(
    ".party-section__selection-names menu"
);
const domPartyAudio = document.querySelector("#partyAudio");
const domPartyMuteButton = document.querySelector(
    ".party-section__content-container button"
);

// CSS property values
let parentGap = window
    .getComputedStyle(domNameContainer)
    .getPropertyValue("gap");
parentGap = Number(parentGap.replace(/px$/, ""));
let nameHeight;

// Global States
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

//Event listener for mobile navigation
document.querySelector("#mobile-nav-button").addEventListener("click", () => {
    document.querySelector(".social-links").classList.toggle("flex");
});

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
                    characterData[arrayEnd - x].name,
                    nameContainerLength,
                    arrayEnd - x
                );
                domNameContainer.appendChild(createdName);
                nameContainerLength++;
            }

            // create a name element for every character
            characterData.forEach((character, index) => {
                let createdName = createNameElement(
                    character.name,
                    nameContainerLength,
                    index
                );

                domNameContainer.appendChild(createdName);
                nameContainerLength++;
            });

            // insert duplicate names at the end
            for (let x = 0; x < visibleNames; x++) {
                let createdName = createNameElement(
                    characterData[x].name,
                    nameContainerLength,
                    x
                );

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
                // reset state values
                selectedIndex = numOfDuplicates;
                slider = 0;
                isMoving = false;

                // move name selection to top
                domNameContainer.style.transition = "none";
                domNameContainer.style.transform = `translateY(${slider}px)`;

                //Clicks the starting name
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

function createNameElement(name, listIndex, dataIndex) {
    const nameElement = document.createElement("a");
    nameElement.textContent = name;
    nameElement.dataset.index = listIndex;

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
    if (indexDifference === 0) {
        mutedObject.state = !mutedObject.state;
        return;
    }

    domPartyMuteButton.classList.add("hidden");
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

    let characterIndex = selectedIndex - 1;
    if (characterIndex === characterData.length) characterIndex = 0;

    if (
        selectedIndex !== numOfDuplicates &&
        selectedIndex !== nameContainerLength - numOfDuplicates - 1
    ) {
        domPartyAudio.src = `./audio/${characterData[characterIndex].name}1.mp3`;

        if (mutedObject.state !== true) {
            domPartyAudio.play();
        }
    }
    //Load character data
    setCharacterDetails(characterData[dataIndex]);
    //prettier-ignore
    document.querySelector(".party-section__image").src = `./images/${upperCase(element.textContent)}.webp`;
}

function setCharacterDetails(data) {
    let fields = document.querySelectorAll(cssCharacterDetails);
    fields[0].textContent = upperCase(data.name);
    //Little wonky have an a inside a paragraph but it makes things easy
    fields[1].innerHTML = `<a href="${data.twitch}"
    class=""
    target="_blank"
    rel="noopener noreferrer">${upperCase(
        data.player
    )} <i class="fab fa-twitch" aria-hidden="true"></i></a>`;
    fields[2].textContent = upperCase(data.bio);
    fields[3].textContent = data.level;
    fields[4].textContent = upperCase(data.class);
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
        domNameContainer.style.transition = "transform .4s linear";
    } else {
        isMoving = false;
        domNameContainer.style.transition = "none";
    }

    domNameContainer.style.transform = `translateY(${slider}px)`;
}

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

domPartyMuteButton.addEventListener("click", () => {
    mutedObject.state = !mutedObject.state;
});
