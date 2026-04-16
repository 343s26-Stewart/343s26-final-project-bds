

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
        const cardImage = cardElement.querySelector(".card-image");
        const cardName = cardElement.querySelector(".card-name");

        if (card.image_uris != undefined) {
            cardImage.src = card.image_uris.small;
            cardName.textContent = card.name;
        } else if (card.card_faces != undefined) {
            cardImage.src = card.card_faces[0].image_uris.small;
            cardName.textContent = card.card_faces[0].name;
        }
        results.appendChild(cardElement);
        //add event listener to card to display card details and ability to add to deck

    });

    if (curitem - pageSize >= 0) { // if there are previous results to show, show scroll left button
        document.getElementById("scroll-left").classList.remove("hidden");
    } else if (curitem - pageSize < 0) { // if there are no previous results to show, hide scroll left button
        document.getElementById("scroll-left").classList.add("hidden");
    }

    if (curitem + pageSize < card_data.data.length) { // if there are more results to show, show scroll right button
        document.getElementById("scroll-right").classList.remove("hidden");
    } else if (curitem + pageSize >= card_data.data.length) { // if there are no more results to show, hide scroll right button
        document.getElementById("scroll-right").classList.add("hidden");
    }
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
