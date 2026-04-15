

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


//call back function for query results
setCallBackFunction(displayResults);

function displayResults(data) {

    // proccess data up to page size


    // display card image and name
    const dataPiece = data.data.slice(curitem, curitem + pageSize);


    curitem += pageSize;

    dataPiece.forEach((card) => {
        const cardElement = template.content.cloneNode(true);
        const cardContainer = cardElement.querySelector(".card-result");
        const cardImage = cardElement.querySelector(".card-image");
        const cardName = cardElement.querySelector(".card-name");
        cardImage.src = card.image_uris.small;
        cardName.textContent = card.name;

        // Creates the add card button if searched from deck builder
        if (deckName) {
            const addButton = document.createElement("button");
            addButton.textContent = `Add to ${deckName}`;
            addButton.className = "add-card-btn";
            
            // Adds JSON card data to button element, ex) <button class="add-card-btn" data-card='{"name":"Lightning Bolt","image_uris":{...}}'>
            addButton.dataset.card = JSON.stringify(card);
            //cardElement.appendChild(addButton);
            cardContainer.appendChild(addButton);
        }

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
