

// global vars

// size of page
const pageSize = 21;
var curitem = 0;


// get template and results container
const template = document.getElementById("card-template");
const results = document.getElementById("search-results");

// URL Params
var params = new URLSearchParams(window.location.search);
var deckName = params.get("deck");


var card_data;

//call back function for query results
setCallBackFunction(displayResults);

async function displayResults(data) {

    //clear out old cards
    deletePrevious()

    // display card image and name
    //filter data here based on url Params
    console.log(data);
    data.data = filterData(data.data);
    const dataPiece = data.data.slice(curitem, curitem + pageSize);

    console.log(data);

    dataPiece.forEach((card) => {
        const cardElement = template.content.cloneNode(true);
        const cardContainer = cardElement.querySelector(".card-result");
        const cardImage = cardElement.querySelector(".card-image");
        const cardName = cardElement.querySelector(".card-name");
        if (card.image_uris !== undefined) {
            cardImage.src = card.image_uris.small;
            cardName.textContent = card.name;
        } else if (card.card_faces !== undefined) { // add support for showing specific faces
            cardImage.src = card.card_faces[0].image_uris.small;
            cardName.textContent = card.card_faces[0].name;
        }

        results.appendChild(cardElement);
        //add event listener to card to display card details and ability to add to deck

        if (deckName) {
            const addButton = document.createElement("button");
            addButton.textContent = `Add to ${deckName}`;
            addButton.className = "add-card-btn";

            // Adds JSON card data to button element, ex) <button class="add-card-btn" data-card='{"name":"Lightning Bolt","image_uris":{...}}'>
            addButton.dataset.card = JSON.stringify(card);
            //cardElement.appendChild(addButton);
            cardContainer.appendChild(addButton);
        }
    });


    if (curitem + pageSize >= data.data.length) {
        document.getElementById("scroll-right").classList.add("hidden");
    } else {
        document.getElementById("scroll-right").classList.remove("hidden");
    }

    if (curitem - pageSize < 0) {
        document.getElementById("scroll-left").classList.add("hidden");
    } else {
        document.getElementById("scroll-left").classList.remove("hidden");
    }
    card_data = data;
}

function getFilterParams() {
    const filterForm = document.getElementById("filter-form");

    //get all of the inputs by id
    const inputs = filterForm.querySelectorAll("input");

    //construct FormData object
    const data = new FormData(filterForm);

    // load relevant items into url params, ex) if color checkbox is checked, add color=red to url params

    const urlParams = new URLSearchParams(window.location.search);
    const newUrlParams = new URLSearchParams();

    if (urlParams.has("query")) {
        newUrlParams.set("query", urlParams.get("query"));
    } else if (urlParams.has("deck")) {
        newUrlParams.set("deck", urlParams.get("deck"));
    }


    newUrlParams.set("filter", "true");

    // parse each of the forms inputs
    // make sure each of the checkboxes are checked
    inputs.forEach((input) => {
        if (input.type === "checkbox" && input.checked) {
            newUrlParams.set(input.name, input.value);
        } else if (input.type === "text" && input.value) {
            newUrlParams.set(input.name, input.value);
        } else if (input.type === "number" && input.value) {
            newUrlParams.set(input.name, input.value);
        }
    });

    // update url to include the new params
    const url = new URL(window.location.href);
    url.search = newUrlParams.toString();
    window.history.pushState(null, '', url.toString());
}

function filterData(data) {
    const urlParams = new URLSearchParams(window.location.search);

    //filter out unneeded params
    //const params = urlParams.keys().filter(param => { param !== "filter" && param !== "deck" && param !== "page" });

    var newData = data;
    if (urlParams.has("filter")) {
        //console.log(params);
        urlParams.keys().forEach((item) => {
            switch (item) {
                //need a case for each filter
                case "red-identity": //red
                    newData = newData.filter(card => card.color_identity.includes("R"));
                    break;
                case "blue-identity": //blue
                    newData = newData.filter(card => card.color_identity.includes("U"));
                    break;
                case "black-identity": //black
                    newData = newData.filter(card => card.color_identity.includes("B"));
                    break;
                case "white-identity": //white
                    newData = newData.filter(card => card.color_identity.includes("W"));
                    break;
                case "green-identity": //green
                    newData = newData.filter(card => card.color_identity.includes("G"));
                    break;
                case "CMC": //CMC
                    newData = newData.filter(card => card.cmc === parseInt(urlParams.get("CMC")));
                    break;
                case "card-name": //name
                    newData = newData.filter(card => card.name.includes(urlParams.get("card-name")));
                    break;
                case "creature-type": //creature
                    newData = newData.filter(card => card.type_line.includes("Creature"));
                    break;
                case "specific-creature-type": //creature type
                    newData = newData.filter(card => card.type_line.includes(urlParams.get("specific-creature-type")));
                    break;
                case "artifact-type": //artifact
                    newData = newData.filter(card => card.type_line.includes("Artifact"));
                    break;
                case "enchantment-type": //enchantment
                    newData = newData.filter(card => card.type_line.includes("Enchantment"));
                    break;
                case "instant-type": //instant
                    newData = newData.filter(card => card.type_line.includes("Instant"));
                    break;
                case "sorcery-type": //sorcery
                    newData = newData.filter(card => card.type_line.includes("Sorcery"));
                    break;
                case "planeswalker-type": //planeswalker
                    newData = newData.filter(card => card.type_line.includes("Planeswalker"));
                    break;
                default:
            }
        });
    }
    return newData;
}

function routeToPage(pageNum) {

    for (let i = 0; i < pageNum; i++) {
        curitem += pageSize;
    }
}

function deletePrevious() {
    const previousCards = document.getElementsByClassName("card-result");

    if (previousCards.length > 0) {
        Array.from(previousCards).forEach((card) => {
            card.remove();
        });
    }
}

//url filter params
document.getElementById("filter-form").addEventListener("submit", (event) => {
    event.preventDefault();
    event.stopPropagation();

    getFilterParams();

    displayLoading();

    curitem = 0;

    window.setTimeout(async () => {
        card_data = await queryAPI();
    }, 1000);

});


//Event listener for the add buttons
document.addEventListener("click", (event) => {
    // Not sure how much i like this condition, this listener is listening for every click on the page...
    if (!event.target.classList.contains("add-card-btn")) return;

    const card = JSON.parse(event.target.dataset.card);

    //current deck
    const deck = JSON.parse(localStorage.getItem("currentDeck")) || { name: "", cards: [] };
    deck.cards.push(card);
    localStorage.setItem("currentDeck", JSON.stringify(deck));

    //all decks
    const deckObj = JSON.parse(localStorage.getItem("decks"));
    deckObj[deck.name].cards.push(card);
    localStorage.setItem("decks", JSON.stringify(deckObj));

    //favorites
    const favorites = JSON.parse(localStorage.getItem("favorites"));
    if (favorites && favorites[deck.name]) {
        favorites[deck.name].cards.push(card);
        localStorage.setItem("favorites", JSON.stringify(favorites));
    }
    alert(`${card.name} was added to ${deck.name}`);

    //change this to allow multiple cards to be added
    //window.location.href = "./index.html";
});

document.getElementById("search-form").addEventListener("submit", (event) => {
    event.preventDefault();
    event.stopPropagation();

    deletePrevious()

    curitem = 0;
    // window.location.href = new URL(`http://127.0.0.1:3000/343s26-final-project-bds/src/Pages/search.html?query=${encodeURIComponent(document.getElementById("search-input").value)}`);
    // display loading indicator
    const url = new URL(window.location.href);
    url.searchParams.set('query', (document.getElementById("search-input").value));
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("page")) {
        url.searchParams.delete("page");
    }
    window.history.pushState(null, '', url.toString());

    displayLoading(); //Loading -> Loading. -> Loading.. -> Loading...
    //  // Loading indicator will show for 3 seconds

    // query api with search term after 4.5 seconds
    window.setTimeout(async () => {
        card_data = await queryAPI();
    }, 1000);

});


//add ability to load more results when user presses a button to go forward/back through results

// go back to previous
document.getElementById("scroll-left").addEventListener("click", () => {
    curitem -= pageSize;
    displayResults(card_data); //redisplay
    const url = new URL(window.location.href);
    if (url.searchParams.has("page")) { // update page param
        url.searchParams.set("page", parseInt(url.searchParams.get("page")) - 1);
        window.history.pushState(null, '', url.toString());
    }
});


// get more cards
document.getElementById("scroll-right").addEventListener("click", () => {
    curitem += pageSize;
    displayResults(card_data); //redisplay
    const url = new URL(window.location.href);
    if (url.searchParams.has("page")) { // update page param accordingly
        url.searchParams.set("page", parseInt(url.searchParams.get("page")) + 1);
        window.history.pushState(null, '', url.toString());
    } else { // set page param
        url.searchParams.set("page", 1);
        window.history.pushState(null, '', url.toString());
    }
});

//shareable url button
document.getElementById("shareable-url").addEventListener("click", (event) => {
    event.preventDefault(); //do not edit the url

    const url = new URL(window.location.href); // get url

    if (url.searchParams.has("deck")) { //remove deck parameter
        url.searchParams.remove("deck");
    }

    alert(`Shareable URL:\n${url.toString()}`); // give user url
});


// client side routing: see the event and update page based off that.


// function to see if we need to search based off url params
// these are obtained;
// by routing from deckbuilder
// obtaining a shareable url
document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.has("query")) {
        displayLoading(); //Loading -> Loading. -> Loading.. -> Loading...
        //  // Loading indicator will show for 3 seconds

        if (urlParams.has("page")) { //need to display proper cards
            //update curitem to proper page.
            routeToPage(parseInt(urlParams.get("page")));
        }

        // query api with search term after 4.5 seconds
        window.setTimeout(async () => {
            card_data = await queryAPI();
        }, 1000);
    }
});

// populate deck names from local storage to decklist
document.addEventListener("DOMContentLoaded", () => {
    const decks = localStorage.getItem("decks");
    if (decks) {
        const deckObject = JSON.parse(decks);
        Object.keys(deckObject).forEach((deck) => {
            const deckContainer = document.createElement("li");
            const button = document.createElement("button");
            button.textContent = deck;
            button.className = "change-deck-button";
            button.addEventListener("click", () => {
                //set url param to deck
                const url = new URL(window.location.href);
                url.searchParams.set("deck", deck);
                window.history.pushState(null, '', url.toString());

                //make sure to reset deckname variable
                params = new URLSearchParams(window.location.search);
                deckName = params.get("deck");
                window.location.reload();
            })
            deckContainer.className = "deck-container";
            deckContainer.appendChild(button);
            document.getElementById("deck-list-items").appendChild(deckContainer);
        });
    }
    const favorites = localStorage.getItem("favorites");
    if (favorites) {
        const favoritesObject = JSON.parse(favorites);
        Object.keys(favoritesObject).forEach((deck) => {
            const deckContainer = document.createElement("li");
            const button = document.createElement("button");
            button.textContent = deck;
            button.className = "change-deck-button";
            button.addEventListener("click", () => {
                //set url param to deck
                const url = new URL(window.location.href);
                url.searchParams.set("deck", deck);
                window.history.pushState(null, '', url.toString());

                //make sure to reset deckname variable
                params = new URLSearchParams(window.location.search);
                deckName = params.get("deck");
                window.location.reload();
            });
            deckContainer.className = "deck-container";
            deckContainer.appendChild(button);
            document.getElementById("favorite-list").appendChild(deckContainer);
        });
    }

});


window.addEventListener("popstate", () => {
    // see if param has query
    deletePrevious();
    const url = new URL(window.location.href);
    if (url.searchParams.has("query")) {
        // see if param has page
        curitem = 0;
        if (url.searchParams.has("page")) {
            // handle page
            routeToPage(url.searchParams.get("page"));
        }

        //display loading now
        displayLoading()

        // now query.
        window.setTimeout(async () => {
            card_data = await queryAPI();
        }, 1000);
    }


});

// on DOMContent Load populate filters/search with information provided by url
document.addEventListener("DOMContentLoaded", () => {
    const url = new URL(window.location);

    //get query and update search input
    if (url.searchParams.has("query")) {
        document.querySelector().value = url.searchParams.get("query");
    }

    // do the same for the filters
    if (url.searchParams.has()) { //black
        document.querySelector().value = url.searchParams.get("query");
    } else if (url.searchParams.has()) { //blue
        document.querySelector().value = url.searchParams.get("query");
    } else if (url.searchParams.has()) { //red
        document.querySelector().value = url.searchParams.get("query");
    } else if (url.searchParams.has()) { //white
        document.querySelector().value = url.searchParams.get("query");
    } else if (url.searchParams.has()) { //green
        document.querySelector().value = url.searchParams.get("query");
    } else if (url.searchParams.has()) { // creature
        document.querySelector().value = url.searchParams.get("query");
    } else if (url.searchParams.has()) { // creature-type
        document.querySelector().value = url.searchParams.get("query");
    } else if (url.searchParams.has()) { //instant
        document.querySelector().value = url.searchParams.get("query");
    } else if (url.searchParams.has()) { //sorcery
        document.querySelector().value = url.searchParams.get("query");
    } else if (url.searchParams.has()) { //artifact
        document.querySelector().value = url.searchParams.get("query");
    } else if (url.searchParams.has()) { //planeswalker
        document.querySelector().value = url.searchParams.get("query");
    } else if (url.searchParams.has()) { // enchantment
        document.querySelector().value = url.searchParams.get("query");
    } else if (url.searchParams.has()) { // CMC
        document.querySelector().value = url.searchParams.get("query");
    } else if (url.searchParams.has()) { // cardname
        document.querySelector().value = url.searchParams.get("query");
    }

});
