function previousSlide() {
    const currCard = document.querySelector(".slide.visible");
    const prevCard = currCard.previousElementSibling ?
        currCard.previousElementSibling :
        document.querySelector(".slides-container").lastElementChild;
    currCard.classList.remove("visible");
    prevCard.classList.add("visible");
}

function nextSlide() {
    const currCard = document.querySelector(".slide.visible");
    const nextCard = currCard.nextElementSibling ?
        currCard.nextElementSibling :
        document.querySelector(".slides-container").firstElementChild;
    currCard.classList.remove("visible");
    nextCard.classList.add("visible");
}