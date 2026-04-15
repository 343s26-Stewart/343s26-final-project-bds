//DOM Elements
const deckNameElem = document.getElementById("deck-name");
const deckNameButton = document.getElementById("name-submit");
const deckNameInput = document.getElementById("name-input");
const searchButton = document.getElementById("search-submit");
const searchInput = document.getElementById("search-input");





// Adding the event listeners
document.addEventListener("DOMContentLoaded", () => {
    const artifactsElem = document.getElementById("artifacts");
    const creaturesElem = document.getElementById("creatures");
    const enchantmentsElem = document.getElementById("enchantments");
    const instantsElem = document.getElementById("instants");
    const sorceriesElem = document.getElementById("sorceries");
    const planeswalkersElem = document.getElementById("planeswalkers");
    const landsElem = document.getElementById("lands");

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
    const deck = JSON.parse(localStorage.getItem("currentDeck")) || {name: "", cards: []};
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
        bucket.list.appendChild(li);

        if (isFirstInSection) {
            bucket.section.classList.remove("hidden");
        }
    }

    function displayDeckCards() {
        deck.cards.forEach(addCardToTypeSections);
    }

    displayDeckCards();



    // Set Deck name
    deckNameButton.addEventListener("click", () => {
        let nameText = deckNameInput.value;
        deckNameElem.textContent = nameText;
        const existingDeck = JSON.parse(localStorage.getItem("currentDeck")) || { name: "", cards: [] };
        const currCards = existingDeck.cards;

        // Maybe save this for a "Save" button?
        localStorage.setItem("currentDeck", JSON.stringify({
            name: nameText,
            cards: currCards
        }))

        deckNameInput.value = "";
    });

    // Search redirect
    searchButton.addEventListener("click", (event) => {
        event.preventDefault();
        const searchTerm = searchInput.value;
        const deckName = deckNameElem.textContent;

        window.location.href = `./search.html?deck=${encodeURIComponent(deckName)}&query=${encodeURIComponent(searchTerm)}`;
    })


}) 

