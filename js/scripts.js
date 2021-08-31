'use strict'

const slidesContainer = document.getElementsByClassName('slides-container')[0];
const shopContainer = document.getElementsByClassName('grid')[0];
const modal = document.getElementsByClassName("modal")[0];
const closeModal = document.getElementsByClassName("close")[0];
const form = document.getElementsByClassName('item-form')[0];
const editBtns = document.getElementsByClassName('btn-update');
const sortBtn = document.getElementsByClassName('btn-sort')[0];
const searchForm = document.querySelector('.search');
const body = document.querySelector('body');
let shop = null;
let orderByAsc = true;
let sortBy = '';
let timeout = null;
let previousQuery = null;

window.onclick = function(event) {
    if (event.target == modal) {
        onModalClose();
    }
}

closeModal.onclick = function() {
    onModalClose();
}

document.addEventListener('click', function(e) {
    if (e.target && e.target.className == 'btn btn-update') {
        let product = shop.find(s => s.id == e.target.getAttribute('data-id'));
        openModal(false, product);
    }
});

// after dom loads render the shop, carousel and sort by price
window.addEventListener('DOMContentLoaded', () => {
    renderShop();
    renderCarousel();
    onSortClick('price');
});

// on submit either create or update shop item
form.addEventListener('submit', (e) => {
    e.preventDefault();
    modal.isNew ? createNewShopItem() : updateShopItem(modal.editId);
});

// on submit search for the item in the shop
searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (timeout) clearTimeout(timeout);
    renderShop(searchForm.query.value.trim());
});


// on keyup search for the item in the shop
searchForm.addEventListener('keyup', (e) => {
    if (timeout) clearTimeout(timeout);
    if (searchForm.query.value.trim() !== previousQuery) {
        timeout = setTimeout(function() {
            renderShop(searchForm.query.value.trim());
            previousQuery = searchForm.query.value.trim();
        }, 500);
    }
});

const renderShop = async(searchQuery) => {
    let uri = new URL('http://localhost:3000/products');
    if (orderByAsc !== undefined && sortBy) {
        const orderBy = orderByAsc ? 'asc' : 'desc';
        uri.searchParams.append('_sort', sortBy);
        uri.searchParams.append('_order', orderBy);
    }
    if (searchQuery) {
        uri.searchParams.append('q', searchQuery);
    } else if (searchQuery === undefined && previousQuery) {
        uri.searchParams.append('q', previousQuery);
    }
    shop = await fetch(uri.toString()).then(res => res.json());

    let shopTemplate = '';
    shop.forEach((product) => {
        const featureBtnIcon = product.featured ? 'fas fa-eye-slash' : 'fas fa-eye';
        shopTemplate += `
            <figure>
                <img src="${product.imageUrl}" alt="Image of ${product.title}">
                <p class="float-right price-tag">€ ${product.price}</p>
                <figcaption>${product.title}</figcaption>
                <div class="item-tools">
                    <button class="btn btn-update" data-id="${product.id}">
                        &nbsp;<i class="fas fa-pencil-alt"></i> Edit &nbsp;
                    </button>
                    <button class="btn btn-feature" onclick="featureInCarousel(${product.id}, ${product.featured})">
                        <i class="${featureBtnIcon}"></i>
                    </button>
                    <button class="btn btn-delete" onclick="onDeleteClick(${product.id})">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </figure>
        `
    });
    shopContainer.innerHTML = shopTemplate;

    if (body.style.overflow === "hidden") body.style.overflow = "auto";
}

const renderCarousel = async() => {
    let uri = new URL('http://localhost:3000/products');
    uri.searchParams.append('featured', 'true');
    uri.searchParams.append('_sort', 'price');
    uri.searchParams.append('_order', 'desc');
    let slides = await fetch(uri.toString()).then(res => res.json());

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

const onDeleteClick = (productId) => {
    const result = confirm("Do you really want to delete this item?");
    if (result) {
        deleteShopItem(productId);
    }
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
    let scrollbarWidth = (window.innerWidth - document.body.clientWidth) + 'px';
    // Do not let scroll page when modal is open
    body.style.overflow = "hidden";
    // Do not shift page when modal is open
    body.style.marginRight = scrollbarWidth;
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
    renderCarousel();
}


const createNewShopItem = async() => {
    const item = {
        title: form.title.value,
        imageUrl: form.imageUrl.value,
        price: Number(form.price.value),
        featured: form.featured.checked
    }

    await fetch('http://localhost:3000/products', {
        method: 'POST',
        body: JSON.stringify(item),
        headers: { 'Content-type': 'application/json' }
    });

    onModalClose();

    renderShop();
    if (form.featured.checked) renderCarousel();
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

    onModalClose();

    renderShop();
    if (form.featured.checked) renderCarousel();
}

const deleteShopItem = async(id) => {
    await fetch(`http://localhost:3000/products/${id}`, {
        method: 'DELETE'
    });

    renderShop();
    renderCarousel();
}

const onSortClick = (sortValue) => {
    sortBy = sortValue;
    orderByAsc = !orderByAsc;
    sortBtn.innerHTML = orderByAsc ?
        `<i class="fas fa-sort-amount-up"></i> Sort by ${sortValue}` :
        `<i class="fas fa-sort-amount-down"></i> Sort by ${sortValue}`;

    renderShop();
}

const onModalClose = () => {
    modal.style.display = "none";
    body.style.overflow = "auto";
    body.style.marginRight = "0px";
}

const previousSlideBtn = document.getElementsByClassName('previous-slide')[0];
const nextSlideBtn = document.getElementsByClassName('next-slide')[0];

previousSlideBtn.addEventListener('click', function() {
    let currCard = document.querySelector('.slide.visible');
    const prevCard = currCard.previousElementSibling ?
        currCard.previousElementSibling :
        document.querySelector('.slides-container').lastElementChild;
    currCard.classList.remove('visible');
    prevCard.classList.add('visible');
});

nextSlideBtn.addEventListener('click', function() {
    let currCard = document.querySelector('.slide.visible');
    const nextCard = currCard.nextElementSibling ?
        currCard.nextElementSibling :
        document.querySelector('.slides-container').firstElementChild;
    currCard.classList.remove('visible');
    nextCard.classList.add('visible');
});