

// make a chart for mana curve
//mkae sure to update on load
// when cards are added/removed
// maybe a bar chart

// get cards from current deck
// look at mana cost of each card and count them
// display in chart

function createManaCurveChart() {
    const context = document.getElementById("mana-curve-chart").getContext("2d");

    const curDeck = JSON.parse(localStorage.getItem("currentDeck")) || { name: "", cards: [], deckImage: "", format: "" };



    const manaCount = {};

    curDeck.cards.forEach(card => {
        //skip basic lands
        if (!(card.type_line.includes("Land"))) {
            manaCount[card.cmc] = (manaCount[card.cmc] || 0) + 1;
        }
    });

    // setup data for chart
    const data = {
        labels: Object.keys(manaCount),
        datasets: [{
            label: 'CMC of Cards in Deck',
            data: Object.values(manaCount),
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
        }]
    };

    // setup config for chart
    const config = {
        type: 'bar',
        data: data,
    }

    // create chart
    new Chart(context, config);

}


// make a chart for land ratios
// pie chart ?
// load on DOMContentLoaded
// also update on card add/remove

function createLandRatioChart() {

    const context = document.getElementById("land-ratio-chart").getContext("2d");

    const curDeck = JSON.parse(localStorage.getItem("currentDeck")) || { name: "", cards: [], deckImage: "", format: "" };


    // count lands

    // specify basic vs non basic

    // specify different basic land types

    // types are:
    // plains
    // island
    // swamp
    // mountain
    // forest

    const landCount = {
        "Plains": 0,
        "Island": 0,
        "Swamp": 0,
        "Mountain": 0,
        "Forest": 0,
        "Non-Basic": 0,
        "Non-Land": 0
    };

    curDeck.cards.forEach(card => {
        if (card.type_line.includes("Land")) {
            if (card.type_line.includes("Basic")) {
                if (card.type_line.includes("Plains")) {
                    landCount["Plains"]++;
                } else if (card.type_line.includes("Island")) {
                    landCount["Island"]++;
                } else if (card.type_line.includes("Swamp")) {
                    landCount["Swamp"]++;
                } else if (card.type_line.includes("Mountain")) {
                    landCount["Mountain"]++;
                } else if (card.type_line.includes("Forest")) {
                    landCount["Forest"]++;
                }
            } else {
                landCount["Non-Basic"]++;
            }
        } else {
            landCount["Non-Land"]++;
        }
    });

    // setup data for chart
    const data = {
        labels: Object.keys(landCount),
        datasets: [{
            label: 'Land Ratio in Deck',
            data: Object.values(landCount),
            backgroundColor: [
                'rgba(255, 255, 255, 0.7)', // plains
                'rgba(5, 75, 189, 0.94)', // island
                'rgba(30, 24, 12, 0.76)', // swamp
                'rgb(226, 27, 27)', // mountain
                'rgba(16, 158, 12, 0.74)', // forest
                'rgba(249, 21, 241, 0.88)', // non-basic
                'rgb(61, 55, 55)' // non-land
            ],
            borderColor: [
                'rgba(241, 222, 99, 0.81)', // plains
                'rgb(54, 162, 235)', //island
                'rgb(232, 230, 225)', // swamp
                'rgb(248, 185, 27)', // mountain
                'rgb(9, 244, 76)', // forest
                'rgb(6, 6, 5)', // non-basic
                'rgb(0, 0, 0)' // non-land
            ],
            borderWidth: 1
        }]
    };

    // setup config for chart
    const config = {
        type: 'pie',
        data: data
    };

    // create chart
    new Chart(context, config);
}


document.addEventListener("DOMContentLoaded", () => {
    createManaCurveChart();
    createLandRatioChart();
});
