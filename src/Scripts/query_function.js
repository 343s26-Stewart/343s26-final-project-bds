
//api scryfall search
const api = "https://api.scryfall.com/cards/search?q=";


// DOM elements for each function to access
// Have to make sure that the elements id's are as follows:
// search input: "search-input"
// search form: "search-form"
// error message: "error-message"
// loading indicator: "loading-indicator"
const input = document.getElementById("search-input");
const searchForm = document.getElementById("search-form");
const errorMessage = document.getElementById("error-message");
const loadingIndicator = document.getElementById("loading-indicator");
var callBackFunction = null;

// customizable loading time
// throttle requests to scryfall
// only 4 seconds of wait time
const loadingTime = 4000;


function getInput() {
    //make sure error message is hidden
    if (errorMessage.classList.contains("hidden") === false) {
        errorMessage.classList.toggle("hidden");
    }
    //get the input from user
    const searchTerm = input.value;
    return searchTerm;
}

function displayLoading() {
    //show loading indicator
    loadingIndicator.classList.toggle("hidden");
    loadingIndicator.textContent = "Loading";

    const ellipsesID = window.setInterval(() => {
        loadingIndicator.textContent += ".";
    }, 900);

    const resetID = window.setInterval(() => {
        loadingIndicator.textContent = "Loading";
    }, 3000);

    window.setTimeout(() => {
        window.clearInterval(ellipsesID);
        window.clearInterval(resetID);
    }, loadingTime);
}


function displayError(message) {

    errorMessage.classList.toggle("hidden");
    errorMessage.textContent = message || "An error occurred while fetching data. Please try again.";
}


function setCallBackFunction(func) {
    //set call back
    callBackFunction = func;
}

async function queryAPI() {

    const searchTerm = getInput();
    loadingIndicator.classList.toggle("hidden");

    try { // see if server responds
        const response = await fetch(`${api}${searchTerm}`);
        const data = await response.json();
        console.log(data);
        if (callBackFunction) { // make sure call back is set
            callBackFunction(data); // transform data
        }

    } catch (error) { // error message if server isn't responding
        console.error("Error fetching data:", error);
        displayError("Scryfall is not responding. Seems like the network is unstable!");
        return;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    searchForm.addEventListener("submit", async (event) => {
        event.preventDefault();


        // display loading indicator

        displayLoading(); //Loading -> Loading. -> Loading.. -> Loading...
        //  // Loading indicator will show for 3 seconds

        // query api with search term after 4.5 seconds
        window.setTimeout(async () => {
            await queryAPI();
        }, 4500);
    });
});
