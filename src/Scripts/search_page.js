

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

    const previousCards = document.getElementsByClassName("card-result");

    if (previousCards.length > 0) {
        Array.from(previousCards).forEach((card) => {
            card.remove();
        });
    }


    // proccess data up to page size


    // display card image and name

    //add support here for possible fetching of next page
    if (curitem + pageSize > card_data.data.length && card_data.has_more === true) {

        //get slice of data left to display
        const cards = card_data.data;

        //make fetch call ?
        const nextData = await fetch(card_data.next_page);
        card_data = await nextData.json();
        console.log(card_data);

        card_data.data = cards.concat(card_data.data); // combine data pieces to display

    }

    const dataPiece = card_data.data.slice(curitem, curitem + pageSize);


    dataPiece.forEach((card) => {
        const cardElement = template.content.cloneNode(true);
        const cardContainer = cardElement.querySelector(".card-result");
        const cardImage = cardElement.querySelector(".card-image");
        const cardName = cardElement.querySelector(".card-name");
        console.log(card);
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
}

//Event listener for the add buttons
document.addEventListener("click", (event) => {
    // Not sure how much i like this condition, this listener is listening for every click on the page...
    if (!event.target.classList.contains("add-card-btn")) return;

    const card = JSON.parse(event.target.dataset.card);
    const deck = JSON.parse(localStorage.getItem("currentDeck")) || { name: "", cards: [] };
    deck.cards.push(card);
    localStorage.setItem("currentDeck", JSON.stringify(deck));
    window.location.href = "./index.html";
});

document.getElementById("search-form").addEventListener("submit", (event) => {
    event.preventDefault();
    event.stopPropagation();
    console.log("hello");
    console.log(document.getElementById("search-input").value);


    // window.location.href = new URL(`http://127.0.0.1:3000/343s26-final-project-bds/src/Pages/search.html?query=${encodeURIComponent(document.getElementById("search-input").value)}`);
    // display loading indicator
    const url = new URL(window.location.href);
    url.searchParams.set('query', (document.getElementById("search-input").value));
    window.history.pushState(null, '', url.toString());

    displayLoading(); //Loading -> Loading. -> Loading.. -> Loading...
    //  // Loading indicator will show for 3 seconds

    // query api with search term after 4.5 seconds
    window.setTimeout(async () => {
        await queryAPI();
    }, 4500);

});


//add ability to load more results when user presses a button to go forward/back through results


document.getElementById("scroll-left").addEventListener("click", () => {
    curitem -= pageSize;
    displayResults(card_data);
});

document.getElementById("scroll-right").addEventListener("click", () => {
    curitem += pageSize;
    displayResults(card_data);
});


// function to see if queried from deckbuilder
document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.has("deck") && urlParams.has("query")) {
        displayLoading(); //Loading -> Loading. -> Loading.. -> Loading...
        //  // Loading indicator will show for 3 seconds

        // query api with search term after 4.5 seconds
        window.setTimeout(async () => {
            await queryAPI();
        }, 4500);
    }
});
