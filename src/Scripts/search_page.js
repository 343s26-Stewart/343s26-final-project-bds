

// global vars

// size of page
const pageSize = 21;
var curitem = 0;


// get template and results container
const template = document.getElementById("card-template");
const results = document.getElementById("search-results");

// URL Params
const params = new URLSearchParams(window.location.search);
const deckName = params.get("deck");


var card_data;

//call back function for query results
setCallBackFunction(displayResults);

async function displayResults(data) {

    card_data = data;

    //clear out old cards
    deletePrevious()


    while (curitem + pageSize >= card_data.data.length && card_data.has_more === true) {

        const cards = card_data.data;

        //make fetch call ?
        const nextData = await fetch(card_data.next_page);
        card_data = await nextData.json();

        card_data.data = cards.concat(card_data.data); // combine data pieces to display
    }

    // check to see if curitem is still bigger and card_data has no more pages
    // if (curitem  + pagsize >= card_data.data.length)
    //  display error ("Improper request: The query does not have enough data to display");
    //  return ?; we have to exit here

    // display card image and name
    const dataPiece = card_data.data.slice(curitem, curitem + pageSize);


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


    if (curitem + pageSize >= card_data.data.length) {
        document.getElementById("scroll-right").classList.add("hidden");
    } else {
        document.getElementById("scroll-right").classList.remove("hidden");
    }

    if (curitem - pageSize < 0) {
        document.getElementById("scroll-left").classList.add("hidden");
    } else {
        document.getElementById("scroll-left").classList.remove("hidden");
    }
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

    window.location.href = "./index.html";
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
        await queryAPI();
    }, 4500);

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
            await queryAPI();
        }, 4500);
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
            await queryAPI();
        }, 1000);
    }


})
