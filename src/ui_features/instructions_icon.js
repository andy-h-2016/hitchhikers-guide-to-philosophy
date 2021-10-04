const instructionsIcon = document.querySelector('.instructions-icon');
instructionsIcon.addEventListener("mouseenter", toggleInstructions);
instructionsIcon.addEventListener("mouseleave", toggleInstructions);

function toggleInstructions(e) {
  e.currentTarget.firstElementChild.classList.toggle("hidden")
}

export default instructionsIcon;