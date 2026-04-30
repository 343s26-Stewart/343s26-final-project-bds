// variables for library page

const template = document.getElementById("deck-template");


document.addEventListener("DOMContentLoaded", function () {
    const decks = localStorage.getItem("decks");

    if (decks !== null) {
        const deckObject = JSON.parse(decks);
        Object.keys(deckObject).forEach(deck => {
            const deckElement = template.content.cloneNode(true);
            const deckContainer = deckElement.querySelector(".deck-item");
            const deckName = deckElement.querySelector(".deck-name");
            //add deck to proper format section
            const format = document.querySelector(`.${deckObject[deck].format}`);
            format.classList.remove("hidden");

            //set the deck name
            deckName.textContent = deck;

            //set the deck image if it exists
            if (deckObject[deck].image !== "") {
                deckContainer.querySelector(".deck-image").src = deckObject[deck].deckImage;
            }

            //append to the format section as a list item
            const item = document.createElement("li");


            item.appendChild(deckContainer);
            format.querySelector(".decklist").appendChild(item);

            //add event listener for hover capabilities
            deckContainer.addEventListener("mouseenter", () => {
                deckContainer.classList.add("hovered");
            });
            deckContainer.addEventListener("mouseleave", () => {
                deckContainer.classList.remove("hovered");
            });

            //add event listener for clicking on deck to go to deck builder page
            deckContainer.addEventListener("click", () => {
                //save the current deck to local storage so that it can be accessed in the deck builder page
                localStorage.setItem("currentDeck", JSON.stringify(deckObject[deck]));
                window.location.href = "index.html";
            });

            deckContainer.querySelector("#edit-button").addEventListener("click", (event) => {
                event.stopPropagation(); // Prevent the click event from bubbling up to the deckContainer
                event.preventDefault(); // Prevent the default button behavior (if any)

                // show the dialog
                const dialog = document.getElementById("image-upload-dialog");
                dialog.showModal();

                // handle form submission
                const form = document.getElementById("image-upload-form");

                const deckImage = deckContainer.querySelector(".deck-image");
                const imagePreview = document.getElementById("image-preview");
                //add event listeners for upload, cancel, and submit buttons
                document.getElementById("upload-submit").addEventListener("click", (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    // show the image preview
                    const imageUrl = document.getElementById("image-url-input").value;
                    imagePreview.src = imageUrl;
                    imagePreview.classList.toggle("hidden");
                });

                document.getElementById("cancel-button").addEventListener("click", (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    imagePreview.classList.add("hidden");
                    dialog.close();
                });

                document.getElementById("submit-image").addEventListener("click", (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    // set the deck image
                    const imageUrl = document.getElementById("image-url-input").value;
                    deckImage.src = imageUrl;
                    // update the deck object in local storage
                    const deckData = JSON.parse(localStorage.getItem("decks"));
                    deckData[deck].deckImage = imageUrl;
                    localStorage.setItem("decks", JSON.stringify(deckData));
                    imagePreview.classList.add("hidden");
                    dialog.close();
                });



            });
        });
    }
});
