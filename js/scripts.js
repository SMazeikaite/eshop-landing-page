'use strict'

const container = document.querySelector('.slides-container');

const renderSlides = async () => {
    let uri = 'http://localhost:3000/slides'

    const slides = await fetch(uri).then(res => res.json());
    
    let template = '';
    slides.forEach(slide => {
        template += `
            <div class="${slide.id === 1 ? 'slide visible' : 'slide'}">
                <img src="${slide.imageUrl}" style="width:100%" alt="slide${slide.id}" />
                <a href="#" class="slide-title">
                    <span class="main-color">${slide.productType}</span>
                    <span class="white-10-color">|</span> ${slide.title}
                </a>
            </div>
        `
    });

    container.innerHTML = template;
}

// don't want to pass event object so using arrow function (15:50 tut)
window.addEventListener('DOMContentLoaded', () => renderSlides());

const previousSlideBtn = document.getElementsByClassName('previous-slide')[0];
const nextSlideBtn = document.getElementsByClassName('next-slide')[0];
let currCard = document.querySelector('.slide.visible');

previousSlideBtn.addEventListener('click', function() {
    currCard = document.querySelector('.slide.visible');
    const prevCard = currCard.previousElementSibling ?
        currCard.previousElementSibling :
        document.querySelector('.slides-container').lastElementChild;
    currCard.classList.remove('visible');
    prevCard.classList.add('visible');
});

nextSlideBtn.addEventListener('click', function() {
    currCard = document.querySelector('.slide.visible');
    const nextCard = currCard.nextElementSibling ?
        currCard.nextElementSibling :
        document.querySelector('.slides-container').firstElementChild;
    currCard.classList.remove('visible');
    nextCard.classList.add('visible');
});