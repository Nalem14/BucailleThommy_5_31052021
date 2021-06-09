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
    const ID = url.searchParams.get("id");
    const CATEGORY = url.searchParams.get("category");

    // Get product from params
    const PRODUCT = await GetProduct(CATEGORY, ID);

    // Set window title and meta description
    document.title = PRODUCT.name + " - Orinoco";
    document.querySelector('meta[name="description"]').setAttribute("content", PRODUCT.description);

    // Render product datas in HTML
    ShowProduct(PRODUCT);

    // Listen when submit Add to cart
    document.getElementById("add-to-cart-form").addEventListener("click", (event) => {
        AddToCart(event, PRODUCT);
    });
});

async function GetProduct(_category, _id) {

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

function ShowProduct(_product) {
    // Set datas in view

    document.getElementById("product-name").innerHTML = _product.name;
    document.getElementById("product-img").src = _product.imageUrl;
    document.getElementById("product-description").innerHTML = _product.description;
    document.getElementById("product-price").innerHTML = _product.price + "€";

    // Check for specifics options in select and get the correct array
    // to render it
    let key = GetOptionKey(_product);
    ShowOptions(_product[key]);
    document.getElementById("options-name").innerHTML = GetOptionName(key);
}

function GetOptionKey(product) {
    if("colors" in product)
        return "colors";

    if("lenses" in product)
        return "lenses";

    if("varnish" in product)
        return "varnish";

    return "Unknown";
}

function GetOptionName(key) {
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

function ShowOptions(_options) {
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

function AddToCart(event, _product) {
    event.preventDefault();
    event.stopPropagation();

    let option_key = GetOptionKey(_product.type);

    let product = {
        id: _product._id,
        name: _product.name,
        type: _product.type,
        description: _product.description,
        imageUrl: _product.imageUrl,
        price: _product.price,
        option_name: GetOptionName(option_key),
        option: document.getElementById("options").value,
        qty: document.getElementById("quantity").value
    };

    localStorage.setItem("cart_" + _product.type, JSON.stringify(product));
    console.log(JSON.parse(localStorage.getItem("cart_" + _product.type)));

    window.location.href = "/pages/cart.html";
}