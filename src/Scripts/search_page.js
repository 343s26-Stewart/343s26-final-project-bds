

// global vars

// size of page
const pageSize = 20;
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
        cardImage.src = card.image_uris.small;
        cardName.textContent = card.name;
        results.appendChild(cardElement);
        //add event listener to card to display card details and ability to add to deck

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

//add ability to load more results when user presses a button to go forward/back through results


document.getElementById("scroll-left").addEventListener("click", () => {
    curitem -= pageSize;
    displayResults(card_data);
});

document.getElementById("scroll-right").addEventListener("click", () => {
    curitem += pageSize;
    displayResults(card_data);
});
