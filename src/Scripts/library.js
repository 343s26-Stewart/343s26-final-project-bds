// variables for library page

const template = document.getElementById("deck-template");




function addDeleteButton(deckContainer, deck) {

    deckContainer.querySelector(".delete-button").addEventListener("click", (event) => {
        event.stopPropagation();

        // get decks / favorites from local storage
        const decks = JSON.parse(localStorage.getItem("decks"));
        const favorites = JSON.parse(localStorage.getItem("favorites"));

        // delete from decks
        if (decks[deck]) {
            delete decks[deck];
            localStorage.setItem("decks", JSON.stringify(decks));

            //see if it is in favorites, if so delete from there too
            if (favorites !== null) {
                if (favorites[deck]) {
                    delete favorites[deck];
                    localStorage.setItem("favorites", JSON.stringify(favorites));
                }

            }
            // and from curdeck if it is the same one
            const currentDeck = JSON.parse(localStorage.getItem("currentDeck"));
            if (currentDeck.name === deck) {
                localStorage.setItem("currentDeck", JSON.stringify({ name: "", cards: [], deckImage: "", format: "" }));
            }
        }
        //reload the page
        location.reload();

    });

}

function addEditButton(deckContainer, deck) {

    deckContainer.querySelector(".edit-button").addEventListener("click", (event) => {
        event.stopPropagation(); // Prevent the click event from bubbling up to the deckContainer
        event.preventDefault(); // Prevent the default button behavior (if any)

        // show the dialog
        const dialog = document.getElementById("image-upload-dialog");
        dialog.showModal();

        const deckImage = deckContainer.querySelector(".deck-image");
        const imagePreview = document.getElementById("image-preview");
        //add event listeners for upload, cancel, and submit buttons
        document.getElementById("upload-submit").addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            // show the image preview
            const imageUrl = document.getElementById("image-url-input").value;
            imagePreview.src = imageUrl;
            imagePreview.classList.remove("hidden");
        });

        document.getElementById("cancel-button").addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            imagePreview.classList.add("hidden");
            imagePreview.src = "";
            dialog.close();
        });

        document.getElementById("submit-image-form").addEventListener("submit", (event) => {
            event.stopPropagation();
            // set the deck image
            const imageUrl = document.getElementById("image-url-input").value;
            deckImage.src = imageUrl;
            // update the deck object in local storage
            const deckData = JSON.parse(localStorage.getItem("decks"));
            deckData[deck].deckImage = imageUrl;
            //save deck
            localStorage.setItem("decks", JSON.stringify(deckData));

            // update favorites if the deck is favorited
            const favorites = JSON.parse(localStorage.getItem("favorites")) || {};
            if (favorites[deck]) {
                //get favorite from local storage, update and save
                favorites[deck].deckImage = imageUrl;
                localStorage.setItem("favorites", JSON.stringify(favorites));

            }

            //do the same for current deck if the decks have the same name
            const currentDeck = JSON.parse(localStorage.getItem("currentDeck"));
            if (currentDeck.name === deck) {
                currentDeck.deckImage = imageUrl;
                localStorage.setItem("currentDeck", JSON.stringify(currentDeck));
            }

            imagePreview.classList.add("hidden");
            imagePreview.src = "";
            dialog.close();
        });
    });
}

function mouseHover(element) {

    element.addEventListener("mouseenter", () => {
        element.classList.add("hovered");
    });
    element.addEventListener("mouseleave", () => {
        element.classList.remove("hovered");
    });
}

document.addEventListener("DOMContentLoaded", function () {
    const decks = localStorage.getItem("decks");

    if (decks !== null) {
        const deckObject = JSON.parse(decks);
        Object.keys(deckObject).forEach(deck => {
            const deckElement = template.content.cloneNode(true);
            const deckContainer = deckElement.querySelector(".deck-item");
            const deckName = deckElement.querySelector(".deck-name");
            const anchor = deckElement.querySelector(".deck-item");

            deckContainer.href = "index.html";
            //add deck to proper format section
            const format = document.querySelector(`#${deckObject[deck].format}`);
            format.classList.remove("hidden");

            //set the deck name
            deckName.textContent = deck;

            //set the deck image if it exists
            if (deckObject[deck].deckImage !== "") {
                deckContainer.querySelector(".deck-image").src = deckObject[deck].deckImage;
            } else {

            }

            //append to the format section as a list item
            const item = document.createElement("li");


            item.appendChild(deckContainer);
            format.querySelector(".decklist").appendChild(item);

            //add event listener for hover capabilities
            mouseHover(deckContainer);

            //add event listener for clicking on deck to go to deck builder page
            deckContainer.addEventListener("click", () => {
                //save the current deck to local storage so that it can be accessed in the deck builder page
                localStorage.setItem("currentDeck", JSON.stringify(deckObject[deck]));
            });

            //add event listener for edit button
            addEditButton(deckContainer, deck);

            addDeleteButton(deckContainer, deck);
        });
    }
});


document.addEventListener("DOMContentLoaded", () => {
    const favoritesSection = document.getElementById("favorites");
    const favoriteDecks = document.getElementById("favorite-decks");
    const favorites = JSON.parse(localStorage.getItem("favorites")) || {};

    if (favorites !== null) {
        //populate favorites section
        Object.keys(favorites).forEach(deck => {
            const deckElement = template.content.cloneNode(true);
            const deckContainer = deckElement.querySelector(".deck-item");
            const deckName = deckElement.querySelector(".deck-name");

            favoritesSection.classList.remove("hidden");

            //add deck to section
            deckName.textContent = deck;

            //set the deck image if it exists
            if (favorites[deck].deckImage !== "") {
                deckContainer.querySelector(".deck-image").src = favorites[deck].deckImage;
            }

            //append to the format section as a list item
            const item = document.createElement("li");


            item.appendChild(deckContainer);
            favoriteDecks.appendChild(item);

            //add event listener for hover capabilities
            mouseHover(deckContainer);

            //add event listener for clicking on deck to go to deck builder page
            deckContainer.addEventListener("click", () => {
                //save the current deck to local storage so that it can be accessed in the deck builder page
                localStorage.setItem("currentDeck", JSON.stringify(favorites[deck]));
                window.location.href = "index.html";
            });

            //add event listener for edit button
            addEditButton(deckContainer, deck);

            addDeleteButton(deckContainer, deck);
        });
    }
})
