'use strict'

const slidesContainer = document.querySelector('.slides-container');
const shopContainer = document.querySelector('.grid');

const renderSlides = async() => {
    let uri = 'http://localhost:3000/slides'
    const slides = await fetch(uri).then(res => res.json());
    let slidesTemplate = '';

    slides.forEach((slide, index) => {
        slidesTemplate += `
            <div class="${index === 0 ? 'slide visible' : 'slide'}">
                <img src="${slide.imageUrl}" style="width:100%" alt="slide of ${slide.title}"/>
                <a href="#" class="slide-title">
                    <figcaption>
                        <span class="main-color">${slide.productType}</span>
                        <span class="white-10-color">|</span> ${slide.title}
                    </figcaption>
                </a>
            </div>
        `
    });
    slidesContainer.innerHTML = slidesTemplate;
}

const renderShop = async() => {
    let uri = 'http://localhost:3000/products'
    const shop = await fetch(uri).then(res => res.json());
    let shopTemplate = '';

    shop.forEach((product, index) => {
        shopTemplate += `
            <figure>
                <img src="${product.imageUrl}" alt="Image of ${product.title}">
                <figcaption><strong>${product.title}</strong></figcaption>
            </figure>
        `
    });
    shopContainer.innerHTML = shopTemplate;
}

// don't want to pass event object so using arrow function (15:50 tut)
window.addEventListener('DOMContentLoaded', () => {
    renderSlides();
    renderShop();
});

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