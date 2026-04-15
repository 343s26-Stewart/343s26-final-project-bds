

// global vars

// size of page
const pageSize = 20;
var curitem = 0;


// get template and results container
const template = document.getElementById("card-template");
const results = document.getElementById("search-results");

var card_data;

//call back function for query results
setCallBackFunction(displayResults);

function displayResults(data) {

    if (card_data == undefined) {
        card_data = data;
    }

    const previousCards = document.getElementsByClassName("card-result");
    console.log(Array.from(previousCards));

    if (previousCards.length > 0) {
        Array.from(previousCards).forEach((card) => {
            card.remove();
        });
    }


    // proccess data up to page size


    // display card image and name

    //add support here for possible fetching of next page
    const dataPiece = data.data.slice(curitem, curitem + pageSize);


    dataPiece.forEach((card) => {
        const cardElement = template.content.cloneNode(true);
        const cardImage = cardElement.querySelector(".card-image");
        const cardName = cardElement.querySelector(".card-name");
        if (card.card_faces != undefined) {
            cardImage.src = card.card_faces[0].image_uris.small;
            cardName.textContent = card.card_faces[0].name;
        } else {
            cardImage.src = card.image_uris.small;
            cardName.textContent = card.name;

        }
        results.appendChild(cardElement);
        //add event listener to card to display card details and ability to add to deck
    });
}

//add ability to load more results when user presses a button to go forward/back through results


document.getElementById("scroll-left").addEventListener("click", () => {
    curitem -= pageSize;
    displayResults(card_data);
});

document.getElementById("scroll-right").addEventListener("click", () => {
    curitem += pageSize;
    displayResults(card_data);
});
