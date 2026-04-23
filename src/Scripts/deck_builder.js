//DOM Elements
const deckNameElem = document.getElementById("deck-name");
const deckNameButton = document.getElementById("name-submit");
const deckNameInput = document.getElementById("name-input");
const searchButton = document.getElementById("search-submit");
const searchInput = document.getElementById("search-input");
const deckList = document.getElementById("deck-list-items");


/* Function Definitions */

function updateDeckList() {

    //remove previous entries
    deckList.replaceChildren();

    const decks = JSON.parse(localStorage.getItem("decks"));

    Object.keys(decks).forEach(deck => {
        const item = document.createElement("li");
        item.textContent = deck;
        deckList.appendChild(item);
    });
}

function displayFavorites() {

    const favorites = localStorage.getItem("favorites");
    if (favorites !== null) {
        const favoritesList = document.getElementById("favorite-list");

        //remove previous ones
        favoritesList.replaceChildren();

        const decks = JSON.parse(favorites);

        Object.keys(decks).forEach(deck => {
            const item = document.createElement("li");
            item.textContent = deck;
            favoritesList.appendChild(item);
        });
    }
}

/*
* function to save a deck name to local storage
* takes in a name, checks for existing name
* saves to local storage
*/
function saveDeck(deckname) {

    // get local storage
    // see if deckname is already inside
    // if not add to local storage and save

    const decklist = localStorage.getItem("decks");
    if (decklist !== null) {
        const deckObject = JSON.parse(decklist);
        if (deckObject[deckname] === undefined) {
            deckObject[deckname] = { cards: {} };
            localStorage.setItem("decks", JSON.stringify(deckObject));
        } else {
            alert(`${deckname} is already the name of one of your decks!`);
        }
    } else {
        const deckObject = {}
        deckObject[deckname] = { cards: {} };
        localStorage.setItem("decks", JSON.stringify(deckObject));
    }
}


// Adding the event listeners
document.addEventListener("DOMContentLoaded", () => {
    const artifactsElem = document.getElementById("artifacts");
    const creaturesElem = document.getElementById("creatures");
    const enchantmentsElem = document.getElementById("enchantments");
    const instantsElem = document.getElementById("instants");
    const sorceriesElem = document.getElementById("sorceries");
    const planeswalkersElem = document.getElementById("planeswalkers");
    const landsElem = document.getElementById("lands");

    let selectedCardId = null;

    const typeSections = {
        artifact: {
            section: artifactsElem,
            list: document.getElementById("artifacts-list")
        },
        creature: {
            section: creaturesElem,
            list: document.getElementById("creatures-list")
        },
        enchantment: {
            section: enchantmentsElem,
            list: document.getElementById("enchantments-list")
        },
        instant: {
            section: instantsElem,
            list: document.getElementById("instants-list")
        },
        sorcery: {
            section: sorceriesElem,
            list: document.getElementById("sorceries-list")
        },
        planeswalker: {
            section: planeswalkersElem,
            list: document.getElementById("planeswalkers-list")
        },
        land: {
            section: landsElem,
            list: document.getElementById("lands-list")
        }
    };

    const typePriority = [
        "creature",    // highest priority
        "artifact",
        "enchantment",
        "instant",
        "sorcery",
        "planeswalker",
        "land"
    ];

    // Load deck from localStorage, ONLY WORKS FOR ONE DECK
    // TODO: ADD SUPPORT FOR MORE DECKS
    const deck = JSON.parse(localStorage.getItem("currentDeck")) || { name: "", cards: [] };
    deckNameElem.textContent = deck.name;

    function getPrimaryType(typeLine) {
        const line = (typeLine || "").toLowerCase();
        return typePriority.find((typeKey) => line.includes(typeKey)) || null;
    }


    function addCardToTypeSections(card) {
        // Grab card type
        const typeKey = getPrimaryType(card.type_line);
        if (!typeKey) return; // skip unknown/unhandled types

        const bucket = typeSections[typeKey];
        const isFirstInSection = bucket.list.children.length === 0;

        const li = document.createElement("li");
        li.textContent = card.name;

        li.addEventListener("click", () => {
            const img = document.getElementById("card-image");
            const cardNameElem = document.getElementById("card-name");
            const cardTextElem = document.getElementById("card-text");

            const cardId = card.id || card.name;

            // if clicking the same card again, hide preview
            if (selectedCardId === cardId) {
                img.classList.add("hidden");
                cardNameElem.classList.add("hidden");
                cardTextElem.classList.add("hidden");
                selectedCardId = null;
                return;
            }

            //show new card
            img.src = card.image_uris.small;
            cardNameElem.textContent = card.name;
            cardTextElem.textContent = card.oracle_text || "";
            img.classList.remove("hidden");
            cardNameElem.classList.remove("hidden");
            cardTextElem.classList.remove("hidden");
            selectedCardId = cardId;
        });

        bucket.list.appendChild(li);

        if (isFirstInSection) {
            bucket.section.classList.remove("hidden");
        }
    }

    function displayDeckCards() {
        deck.cards.forEach(addCardToTypeSections);
    }

    displayDeckCards();

})


// Search redirect
searchButton.addEventListener("click", (event) => {
    event.preventDefault();
    const searchTerm = searchInput.value;
    const deckName = deckNameElem.textContent;

    window.location.href = `./search.html?deck=${encodeURIComponent(deckName)}&query=${encodeURIComponent(searchTerm)}`;
})

/*
* populate deck names from local storage to decklist
* and favorites
*/
document.addEventListener("DOMContentLoaded", () => {
    updateDeckList();
    //do the same for favorites
    displayFavorites();
});



// Set Deck name
deckNameButton.addEventListener("click", () => {

    let nameText = deckNameInput.value;
    deckNameElem.textContent = nameText;

    const existingDeck = JSON.parse(localStorage.getItem("currentDeck")) || { name: "", cards: [] };
    // shouldn't we get rid of the old cards in a new deck ?
    const currCards = existingDeck.cards;

    //create list item and append to decklist
    // add to local storage
    saveDeck(nameText);
    updateDeckList();

    // Maybe save this for a "Save" button?
    localStorage.setItem("currentDeck", JSON.stringify({
        name: nameText,
        cards: currCards
    }))

    //should make a different place for this
    //will update local storage
    const decks = JSON.parse(localStorage.getItem("decks"));
    decks[nameText] = { name: nameText, cards: currCards };
    localStorage.setItem("decks", JSON.stringify(decks));

    deckNameInput.value = "";
});

document.getElementById("favorite-button").addEventListener("click", () => {

    // get current deck from local storage
    const curdeck = JSON.parse(localStorage.getItem("currentDeck"));
    // store in new favorite category in local storage
    const favorites = localStorage.getItem("favorites");
    if (favorites !== null) {
        //if it exists
        const fav_list = JSON.parse(favorites);
        fav_list[curdeck.name] = { cards: curdeck.cards };

        //now store
        localStorage.setItem("favorites", JSON.stringify(fav_list));
    } else { // no exists
        var fav_deck = {};
        fav_deck[curdeck.name] = { cards: curdeck.cards };
        localStorage.setItem("favorites", JSON.stringify(fav_deck));
    }
    // update the favorites section
    displayFavorites();
});
