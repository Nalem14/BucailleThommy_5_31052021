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
    const result = await GetProduct(category, id);

    // Set window title and meta description
    document.title = result.name + " - Orinoco";
    document.querySelector('meta[name="description"]').setAttribute("content", result.description);

    // Render product datas in HTML
    ShowProduct(result);
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

function ShowProduct(_result) {
    // Set datas in view

    document.getElementById("product-name").innerHTML = _result.name;
    document.getElementById("product-img").src = _result.imageUrl;
    document.getElementById("product-description").innerHTML = _result.description;
    document.getElementById("product-price").innerHTML = _result.price + "€";

    // Check for specifics options in select and get the correct array
    // to render it
    if("colors" in _result) {
        ShowOptions(_result.colors);
        document.getElementById("options-name").innerHTML = "Couleur";
    }

    if("lenses" in _result) {
        ShowOptions(_result.lenses);
        document.getElementById("options-name").innerHTML = "Lentille";
    }

    if("varnish" in _result) {
        ShowOptions(_result.varnish);
        document.getElementById("options-name").innerHTML = "Vernis";
    }
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