

// global vars

// size of page
const pageSize = 20;
var curitem = 0;


// get template and results container
const template = document.getElementById("card-template");
const results = document.getElementById("search-results");

//call back function for query results
setCallBackFunction(displayResults);

function displayResults(data) {

    // proccess data up to page size


    // display card image and name
    const dataPiece = data.data.slice(curitem, curitem + pageSize);


    curitem += pageSize;

    dataPiece.forEach((card) => {
        const cardElement = template.content.cloneNode(true);
        const cardImage = cardElement.querySelector(".card-image");
        const cardName = cardElement.querySelector(".card-name");
        cardImage.src = card.image_uris.small;
        cardName.textContent = card.name;
        results.appendChild(cardElement);

        //add event listener to card to display card details and ability to add to deck

    });
}

//add ability to load more results when user presses a button to go forward/back through results
