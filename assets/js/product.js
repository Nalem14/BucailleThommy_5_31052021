window.addEventListener("DOMContentLoaded", async (event) => {

    // Get the select element for quantity
    const selectQuantity = document.getElementById('quantity');

    // Render quantity select options
    for(var i = 0; i < 10; i++) {
        var opt = document.createElement('option');
        opt.value = i+1;
        opt.innerHTML = i+1;
        selectQuantity.appendChild(opt);
    } 

    // Get URL params
    const url = new URL(window.location.href);
    const id = url.searchParams.get("id");
    const category = url.searchParams.get("category");

    // Get product from params
    const product = await getProduct(category, id);

    // Set window title and meta description
    document.title = product.name + " - Orinoco";
    document.querySelector('meta[name="description"]').setAttribute("content", product.description);

    // Render product datas in HTML
    renderProduct(product);

    // Listen when submit Add to cart
    document.getElementById("add-to-cart-form").addEventListener("submit", (event) => {
        addToCart(event, product, category);
    });
});

async function getProduct(_category, _id) {

    return fetch('http://localhost:3000/api/' + _category + '/' + _id)
    .then(response => response.json())
    .then(datas => {
        console.log(datas);
        return datas;
    })
    .catch(error => {
        console.log(error);
        return error;
    });
}

function renderProduct(_product) {
    // Set datas in view

    document.getElementById("product-name").innerHTML = _product.name;
    document.getElementById("product-img").src = _product.imageUrl;
    document.getElementById("product-description").innerHTML = _product.description;
    document.getElementById("product-price").innerHTML = toEuro(_product.price);

    // Check for specifics options in select and get the correct array
    // to render it
    let key = getOptionKey(_product);
    showOptions(_product[key]);
    document.getElementById("options-name").innerHTML = getOptionName(key);
}

function toEuro(number) {
    number = number/100;
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(number);
}

function getOptionKey(product) {
    if("colors" in product)
        return "colors";

    if("lenses" in product)
        return "lenses";

    if("varnish" in product)
        return "varnish";

    return "Unknown";
}

function getOptionName(key) {
    let name = "";
    switch (key) {
        case "colors":
            name = "Couleur";
            break;

        case "lenses":
            name = "Lentille";
            break;
        
        case "varnish":
            name = "Vernis";
            break;
    
        default:
            name = "Unknown";
            break;
    }

    return name;
}

function showOptions(_options) {
    const selectOption = document.getElementById("options");

    // For each options, add it to the 'options' select
    _options.forEach(element => {
        console.log(element);
        var opt = document.createElement('option');
        opt.value = element;
        opt.innerHTML = element;
        selectOption.appendChild(opt);
    });
}

function addToCart(event, _product, _type) {
    event.preventDefault();
    event.stopPropagation();

    let optionKey = getOptionKey(_product);
    let optionValue = document.getElementById("options").value;
    let quantity = parseInt(document.getElementById("quantity").value);

    let cart = JSON.parse(localStorage.getItem("cart_" + _type)) || [];
    let product = null;

    // Check if product already exist in cart
    // and increase its quantity
    cart.forEach(element => {
        if(element.id == _product._id + "-" + optionValue.replace(" ", "")) {
            product = true;
            element.qty += quantity;
            return;
        }
    });

    // Else, add product to the cart
    if(product == null) {
        product = {
            id: _product._id + "-" + optionValue.replace(" ", ""),
            name: _product.name,
            type: _type,
            description: _product.description,
            imageUrl: _product.imageUrl,
            price: _product.price,
            optionName: getOptionName(optionKey),
            optionValue: optionValue,
            qty: quantity
        };
        cart.push(product);
    }
    
    localStorage.setItem("cart_" + _type, JSON.stringify(cart));
    // console.log(JSON.parse(localStorage.getItem("cart_" + _type)));

    window.location.href = "/pages/cart.html";
}