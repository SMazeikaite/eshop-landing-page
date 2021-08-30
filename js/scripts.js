'use strict'

const slidesContainer = document.querySelector('.slides-container');
const shopContainer = document.querySelector('.grid');
const modal = document.getElementById("modal");
const closeModal = document.getElementsByClassName("close")[0];
const form = document.querySelector('form');
const editBtns = document.getElementsByClassName('btn-update');
const sortBtn = document.getElementsByClassName('btn-sort')[0];
const searchForm = document.querySelector('.search');
let shop = null;
let orderByAsc = true;
let sortBy = '';
let timeout = null;
let previousQuery = null;

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

closeModal.onclick = function() {
    modal.style.display = "none";
}

document.addEventListener('click', function(e) {
    if (e.target && e.target.className == 'btn btn-update') {
        let product = shop.find(s => s.id == e.target.getAttribute('data-id'));
        openModal(false, product);
    }
});

window.addEventListener('DOMContentLoaded', () => {
    renderShop();
    onSortClick('price'); // auto sort onload
});

form.addEventListener('submit', (e) => {
    e.preventDefault();
    modal.isNew ? createNewShopItem() : updateShopItem(modal.editId);
});

searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    renderShop(true, searchForm.query.value.trim());
});

searchForm.addEventListener('keyup', (e) => {
    if (timeout) clearTimeout(timeout);
    if (searchForm.query.value.trim() !== previousQuery) {
        timeout = setTimeout(function() {
            renderShop(true, searchForm.query.value.trim());
            previousQuery = searchForm.query.value.trim();
        }, 500);
    }
});


const renderShop = async(isSorting, searchQuery) => {
    let uri = 'http://localhost:3000/products'
    if (orderByAsc !== undefined && sortBy) {
        const orderBy = orderByAsc ? 'asc' : 'desc';
        uri += `?_sort=${sortBy}&_order=${orderBy}`;
    }
    if (searchQuery) {
        uri += `&q=${searchQuery}`;
    }
    shop = await fetch(uri).then(res => res.json());

    // Render carousel
    if (!isSorting) {
        const slides = shop.filter(s => s.featured).sort();
        let slidesTemplate = '';
        slides.forEach((slide, index) => {
            slidesTemplate += `
            <div class="${index === 0 ? 'slide visible' : 'slide'}">
                <img src="${slide.imageUrl}" style="width:100%" alt="slide of ${slide.title}"/>
                <a href="#" class="slide-title">
                    <figcaption>${slide.title}</figcaption>
                </a>
            </div>
        `
        });
        slidesContainer.innerHTML = slidesTemplate;
    }

    // Render shop items
    let shopTemplate = '';
    shop.forEach((product) => {
        const featureBtnIcon = product.featured ? 'fas fa-eye-slash' : 'fas fa-eye';
        shopTemplate += `
            <figure>
                <img src="${product.imageUrl}" alt="Image of ${product.title}">
                <p class="float-right price-tag">€ ${product.price}</p>
                <figcaption>${product.title}</figcaption>
                <button class="btn btn-update" data-id="${product.id}">
                    &nbsp;<i class="fas fa-pencil-alt"></i> Edit &nbsp;
                </button>
                <button class="btn btn-feature" onclick="featureInCarousel(${product.id}, ${product.featured})">
                    <i class="${featureBtnIcon}"></i>
                </button>
                <button class="btn btn-delete float-right" onclick="deleteShopItem(${product.id})">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </figure>
        `
    });
    shopContainer.innerHTML = shopTemplate;
}

const openModal = (isNew, product = {}) => {
    modal.style.display = "block";
    modal.isNew = isNew;
    modal.editId = product.id;

    if (isNew) {
        form.reset();
    } else {
        form.title.value = product.title;
        form.price.value = product.price;
        form.imageUrl.value = product.imageUrl;
        form.featured.checked = product.featured;
    }
}

const featureInCarousel = async(id, isFeatured) => {
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


const createNewShopItem = async() => {
    const item = {
        title: form.title.value,
        imageUrl: form.imageUrl.value,
        price: Number(form.price.value)
    }

    await fetch('http://localhost:3000/products', {
        method: 'POST',
        body: JSON.stringify(item),
        headers: { 'Content-type': 'application/json' }
    });

    modal.style.display = "none";

    renderShop();
}

const updateShopItem = async(id) => {
    const item = {
        title: form.title.value,
        imageUrl: form.imageUrl.value,
        price: Number(form.price.value),
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

const deleteShopItem = async(id) => {
    await fetch(`http://localhost:3000/products/${id}`, {
        method: 'DELETE'
    });

    renderShop();
}

const onSortClick = (sortValue) => {
    sortBy = sortValue;
    orderByAsc = !orderByAsc;
    sortBtn.innerHTML = orderByAsc ?
        `<i class="fas fa-sort-amount-down-alt"></i> Sort by ${sortValue}` :
        `<i class="fas fa-sort-amount-up-alt"></i> Sort by ${sortValue}`;

    renderShop(true);
}

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