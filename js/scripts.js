'use strict'

const slidesContainer = document.querySelector('.slides-container');
const shopContainer = document.querySelector('.grid');
const modal = document.getElementById("modal");
const closeModal = document.getElementsByClassName("close")[0];
const form = document.querySelector('form');
const editBtns = document.getElementsByClassName('btn-update');
let shop = null;
let orderByAsc = true;

const renderShop = async(sortBy) => {
    let uri = 'http://localhost:3000/products'
    if (sortBy && orderByAsc) {
        uri += `?_sort=${sortBy}&_order=${orderByAsc}`;
    }
    debugger;
    shop = await fetch(uri).then(res => res.json());

    // Render carousel

    const slides = shop.filter(s => s.featured);
    let slidesTemplate = '';
    slides.forEach((slide, index) => {
        slidesTemplate += `
            <div class="${index === 0 ? 'slide visible' : 'slide'}">
                <img src="${slide.imageUrl}" style="width:100%" alt="slide of ${slide.title}"/>
                <a href="#" class="slide-title">
                    <figcaption>${slide.title}
                    </figcaption>
                </a>
            </div>
        `
    });
    slidesContainer.innerHTML = slidesTemplate;

    // Render shop items

    let shopTemplate = '';
    shop.forEach((product) => {
        const featureBtnTitle = product.featured ? 'Unfeature' : 'Feature';
        shopTemplate += `
            <figure>
                <img src="${product.imageUrl}" alt="Image of ${product.title}">
                <figcaption><strong>${product.title}</strong> <span class="price">€ ${product.price}</span></figcaption>
                <button class="btn btn-update" data-id="${product.id}"> Edit </button>
                <button class="btn btn-feature" onclick="featureInCarousel(${product.id}, ${product.featured})"> ${featureBtnTitle} </button>
                <button class="btn btn-delete" onclick="deleteShopItem(${product.id})" style="float:right;"> Delete </button>
            </figure>
        `
    });
    shopContainer.innerHTML = shopTemplate;
}

const openModal = (isNew, product = {}) => {
    modal.style.display = "block";
    modal.isNew = isNew;
    modal.editId = product.id;

    if (!isNew) {
        form.title.value = product.title;
        form.price.value = product.price;
        form.imageUrl.value = product.imageUrl;
        form.featured.checked = product.featured;
    }
}


document.addEventListener('click',function(e){
    if(e.target && e.target.className == 'btn btn-update'){
        let product = shop.find(s => s.id == e.target.getAttribute('data-id'));
        openModal(false, product);
     }
 });

const createNewShopItem = async () => {
    const item = {
        title: form.title.value,
        imageUrl: form.imageUrl.value,
        price: parseInt(form.price.value)
    }

    await fetch('http://localhost:3000/products', {
        method: 'POST',
        body: JSON.stringify(item),
        headers: { 'Content-type': 'application/json' }
    });

    modal.style.display = "none";
    renderShop();
}

const updateShopItem = async (id) => {
    const item = {
        title: form.title.value,
        imageUrl: form.imageUrl.value,
        price: form.price.value,
        featured: form.featured.checked
    }

    await fetch(`http://localhost:3000/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(item),
        headers: { 'Content-type': 'application/json' }
    });
    
    modal.style.display = "none";
    renderShop();
}

const featureInCarousel = async (id, isFeatured) => {
    const item = {
        featured: !isFeatured
    }

    await fetch(`http://localhost:3000/products/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(item),
        headers: { 'Content-type': 'application/json' }
    });
    
    renderShop();
}

const deleteShopItem = async( id) => {
    await fetch(`http://localhost:3000/products/${id}`, {
        method: 'DELETE'
    });
    
    renderShop();
}

const onSortClick = (sortBy) => {
    orderByAsc = !orderByAsc;
    renderShop(sortBy);
}

// don't want to pass event object so using arrow function (15:50 tut)
window.addEventListener('DOMContentLoaded', () => {
    renderShop();
});

window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
}

closeModal.onclick = function() {
    modal.style.display = "none";
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    modal.isNew ? createNewShopItem() : updateShopItem(modal.editId);
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