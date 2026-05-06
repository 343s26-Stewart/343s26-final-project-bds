//DOM Elements
const deckNameElem = document.getElementById("deck-name");
const deckNameButton = document.getElementById("name-submit");
const deckNameInput = document.getElementById("name-input");
const searchButton = document.getElementById("search-submit");
const searchInput = document.getElementById("search-input");
const deckList = document.getElementById("deck-list-items");
const formatSelect = document.getElementById("format-select");
const deleteCardButton = document.getElementById("delete-card-button");
const importButton = document.getElementById("import-button");
const exportButton = document.getElementById("export-button");


/* Function Definitions */

function updateDeckList() {

    //remove previous entries
    deckList.replaceChildren();

    var decks = JSON.parse(localStorage.getItem("decks"));

    if (decks) {
        Object.keys(decks).forEach(deck => {
            const item = document.createElement("li");
            const button = document.createElement("button");
            button.textContent = deck;
            button.classList.add("change-deck-button");
            button.addEventListener("click", () => {
                decks = JSON.parse(localStorage.getItem("decks"));
                localStorage.setItem("currentDeck", JSON.stringify(decks[deck]));
                window.location.reload();
            });
            item.appendChild(button);
            deckList.appendChild(item);
        });
    }
    else {
        decks = [];
    }
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
            const button = document.createElement("button");
            button.textContent = deck;
            button.classList.add("change-deck-button");
            button.addEventListener("click", () => {
                const items = JSON.parse(localStorage.getItem("favorites"));
                localStorage.setItem("currentDeck", JSON.stringify(items[deck]));
                window.location.reload();
            });
            item.appendChild(button);
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
    const deck = JSON.parse(localStorage.getItem("currentDeck")) || { name: "", cards: [], deckImage: "", format: "" };
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
        const button = document.createElement("button");
        button.textContent = card.name;
        button.classList.add("card-button");
        li.appendChild(button);

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
                deleteCardButton.classList.add("hidden");
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
            deleteCardButton.classList.remove("hidden");
            selectedCardId = cardId;
        });

        bucket.list.appendChild(li);

        if (isFirstInSection) {
            bucket.section.classList.remove("hidden");
        }
    }

    deleteCardButton.addEventListener("click", () => {
        const index = deck.cards.findIndex(card => (card.id || card.name) === selectedCardId);
        if (index === -1) return; // card not found, bail out
        deck.cards.splice(index, 1);

        localStorage.setItem("currentDeck", JSON.stringify(deck));

        const decks = JSON.parse(localStorage.getItem("decks"));
        if (decks && decks[deck.name]) {
            decks[deck.name].cards = deck.cards;
            localStorage.setItem("decks", JSON.stringify(decks));
        }

        // do the same for favorites if deck.name exists in favorites
        const favorites = JSON.parse(localStorage.getItem("favorites"));
        if (favorites && favorites[deck.name]) {
            favorites[deck.name].cards = deck.cards;
            localStorage.setItem("favorites", JSON.stringify(favorites));
        }

        selectedCardId = null;

        // Re-render the card lists
        Object.values(typeSections).forEach(({ section, list }) => {
            list.replaceChildren();
            section.classList.add("hidden");
        });
        displayDeckCards();

        document.getElementById("card-image").classList.add("hidden");
        document.getElementById("card-name").classList.add("hidden");
        document.getElementById("card-text").classList.add("hidden");
        deleteCardButton.classList.add("hidden");

    });

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

    window.location.href = `./Pages/search.html?deck=${encodeURIComponent(deckName)}&query=${encodeURIComponent(searchTerm)}`;
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

importButton.addEventListener("click", () => {
    const file = document.getElementById('jsonFile').files[0];
    if (!file) return alert("Please select a file first!");

    const reader = new FileReader();
    reader.onload = (e) => {
        const imported = JSON.parse(e.target.result);

        localStorage.setItem("currentDeck", JSON.stringify(imported));

        // 2) Save in decks collection
        const decks = JSON.parse(localStorage.getItem("decks")) || {};
        decks[imported.name] = imported;
        localStorage.setItem("decks", JSON.stringify(decks));

        // Optional: if you want visible name before reload
        //deckNameElem.textContent = deckToSave.name;

        // 3) Refresh UI to show imported cards/sections
        window.location.reload();

    };
    reader.readAsText(file);
});

exportButton.addEventListener("click", () => {
    const currentDeck = localStorage.getItem("currentDeck");
    // Maybe a better way to get the deck name
    const fileName = deckNameElem.textContent + ".json"
    const blob = new Blob([currentDeck], { type: "application/json" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();

    URL.revokeObjectURL(link.href);

});


// Set Deck name
deckNameButton.addEventListener("click", () => {

    let nameText = deckNameInput.value;
    deckNameElem.textContent = nameText;

    const existingDeck = JSON.parse(localStorage.getItem("currentDeck")) || { name: "", cards: [], deckImage: "", format: "" };
    // shouldn't we get rid of the old cards in a new deck ?
    const currCards = existingDeck.cards;

    //create list item and append to decklist
    // add to local storage
    saveDeck(nameText);
    updateDeckList();

    // Maybe save this for a "Save" button?
    localStorage.setItem("currentDeck", JSON.stringify({
        name: nameText,
        cards: currCards,
        deckImage: "",
        format: ""
    }))

    //should make a different place for this
    //will update local storage
    const decks = JSON.parse(localStorage.getItem("decks"));
    decks[nameText] = { name: nameText, cards: currCards, deckImage: "", format: formatSelect.value };
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
        fav_list[curdeck.name] = curdeck;

        //now store
        localStorage.setItem("favorites", JSON.stringify(fav_list));
    } else { // no exists
        var fav_deck = {};
        fav_deck[curdeck.name] = curdeck;
        localStorage.setItem("favorites", JSON.stringify(fav_deck));
    }
    // update the favorites section
    displayFavorites();
});

// delete deck button
document.getElementById("delete-button").addEventListener("click", () => {
    const curdeck = JSON.parse(localStorage.getItem("currentDeck"));
    const decks = JSON.parse(localStorage.getItem("decks"));
    const favorites = JSON.parse(localStorage.getItem("favorites"));


    // make sure we have a deck to delete
    if (!curdeck.name) {
        alert("No deck to delete!");
        return;
    }

    if (decks[curdeck.name]) {
        //set current deck to empty
        localStorage.setItem("currentDeck", JSON.stringify({ name: "", cards: [], deckImage: "", format: "" }));

        //delete from decks
        delete decks[curdeck.name];
        localStorage.setItem("decks", JSON.stringify(decks));
        

        // if it's in favorites, delete it from there too
        if (favorites && favorites[curdeck.name]) {
            delete favorites[curdeck.name];
            localStorage.setItem("favorites", JSON.stringify(favorites));
        }
    }
    window.location.reload();
});
