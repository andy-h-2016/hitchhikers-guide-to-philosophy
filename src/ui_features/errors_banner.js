const errorsBanner = document.querySelector('.errors-container');
const errorsCloseButton = document.querySelector('.close-button');
errorsCloseButton.addEventListener("click", e => errorsBanner.classList.add('hidden'))