
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
    const params = new URLSearchParams(window.location.search);
    const query = params.get("query");
    return query;
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
        var data = await response.json();
        const getAll = setInterval(async () => {
            if (data.has_more === true) {
                const oldCards = data.data;
                const moreData = await fetch(data.next_page);
                data = await moreData.json();
                data.data = oldCards.concat(data.data);
            } else {
                clearInterval(getAll);
            }
        }, 1000);

        if (callBackFunction) { // make sure call back is set
            setTimeout(() => { callBackFunction(data) }, 2000);// transform data
            return data;
        }

    } catch (error) { // error message if server isn't responding
        console.error("Error fetching data:", error);
        displayError("Scryfall is not responding. Seems like the network is unstable!");
        return;
    }
}
