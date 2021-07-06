
let CART_TEDDIES, CART_FURNITURE, CART_CAMERAS, CART;
let categories = ["teddies", "cameras", "furniture"];

window.addEventListener("DOMContentLoaded", (event) => {

    // Initialize carts variables and render view
    getCarts().then((result) => {
        renderCart();
    }).catch((error) => {
        document.getElementById("cart-container").innerHTML = "<p>Erreur. Impossible de charger le panier : " + error + "</p>";
    });

    // Set events to contact-form inputs
    setContactListener();

    // When validate contact form, submit cart
    document.getElementById("contact-form").addEventListener("submit", (event) => {
        event.stopPropagation();
        event.preventDefault();

        checkCanSubmit().then(() => {
            handleCartSubmit(event);
        });
    });
});

function handleCartSubmit(event) {

    // Get all inputs values
    let firstName = document.getElementById("firstName").value;
    let lastName = document.getElementById("lastName").value;
    let email = document.getElementById("email").value;
    let city = document.getElementById("city").value;
    let address = document.getElementById("address").value;

    // Construct the contact object
    let contact = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        city: city,
        address: address
    }

    // For each categories, submit the cart
    let orderIds = {}, totalPrice = 0, nbPassed = 0;
    let promise = new Promise((resolve, reject) => {
        categories.forEach((category) => {

            // Get products of the current category
            getCarts(category).then(products => {

                // Check if category is used in the cart, else stop the request for this category
                if(products.length <= 0) {
                    nbPassed++;
                    if(nbPassed == categories.length)
                        resolve();
                    return;
                }

                let productsId = [];
                products.forEach(product => {
                    // Increase total price to save it later
                    totalPrice += product.price * product.qty;
                    // Add product id to submit later
                    productsId.push(product._id);
                });

                // Send request to the API of the current category
                fetch('http://localhost:3000/api/' + category + "/order", {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    method: 'post',
                    body: JSON.stringify({contact: contact, products: productsId})
                }).then(function(response) {
                    return response.json();
                }).then(function(data) {
                    // console.log(data);
                    orderIds[category] = data.orderId;
                    nbPassed++;
                    if(nbPassed == categories.length)
                        resolve();
                }).catch(error => {
                    document.getElementById("cart-container").innerHTML = "<p>Erreur: Impossible de valider le panier. Ré-essayez ou contacter un administrateur.<br>" + error + "</p>";
                    reject();
                });
            });
        });
    });

    promise.then(() => {        
        // Clear carts
        clearCarts();

        // Save order datas
        saveOrderDatas(orderIds, totalPrice);

        // Redirect to confirmation page
        window.location.href = "/pages/order-confirmation.html";
    });
}

function saveOrderDatas(orderIds, price) {
    // Save all order id and total price

    categories.forEach(category => {
        localStorage.removeItem("order-id-confirmation-" + category);
        if(orderIds[category] != null)
            localStorage.setItem("order-id-confirmation-" + category, orderIds[category]);
    });

    localStorage.removeItem("order-price-confirmation");
    localStorage.setItem("order-price-confirmation", price);
}

function clearCarts() {
    // Remove all datas in localStorage
    localStorage.clear();

    // Remove each element in the cart view
    document.querySelectorAll("artilcle").forEach(element => {
        element.remove();
    });

    document.getElementById("cart-container").innerHTML = "<p>Votre panier est vide.</p>";
}

function getCarts(type = null) {
    return new Promise((resolve, reject) => {
        try {

            if(type == null) {
                // Get all carts
                CART_TEDDIES = JSON.parse(localStorage.getItem("cart_teddies")) || [];
                CART_FURNITURE = JSON.parse(localStorage.getItem("cart_furniture")) || [];
                CART_CAMERAS = JSON.parse(localStorage.getItem("cart_cameras")) || [];
                CART = CART_TEDDIES.concat(CART_FURNITURE).concat(CART_CAMERAS);
                
                resolve(CART);
            }else{
                // Return only specifed cart
                let result = JSON.parse(localStorage.getItem("cart_" + type)) || [];
                resolve(result);
            }
        } catch (error) {
            reject(error);
        }
    });
}

function renderCart() {
    // Get container and cart total price element
    let container = document.getElementById("cart-container");
    let content = "", n = 0;

    if(CART.length <= 0) {
        container.innerHTML = "<p>Votre panier est vide.</p>";
        return;
    }

    container.innerHTML = "Chargement...";
    CART.forEach(element => {
        // Add HTML element in var
        content += `
            <article id="product-${element.id}" data-key="${n}" data-id="${element.id}" data-type="${element.type}" data-price="${element.price * element.qty}">
                <figure>
                    <img src="${element.imageUrl}" alt="" />
                </figure>

                <div>
                    <h3>
                        <a href="./product.html?id=${element.id.replace("-" + element.optionValue.replace(" ", ""), "")}&category=${element.type}">${element.name}</a>
                    </h3>
                    
                    <p>
                        ${element.description}
                        <strong>${element.optionName}: ${element.optionValue}</strong>
                    </p>
                </div>

                <form action="./cart.html" method="post">
                    <label for="quantity-${n}">Quantité</label>
                    <select name="quantity" id="quantity-${n}">
                        ${renderQty(element.qty)}
                    </select>
                </form>

                <span id="price-${n}">${toEuro(element.price * element.qty)}</span>
                <a href="#"><i class="fas fa-trash"></i></a>
            </article>
        `;
        n++;
    });

    // Set HTML content
    container.innerHTML = content;
    setProductsListeners();
    renderTotalPrice();
}

function setProductsListeners() {
    // Set listeners
    document.querySelectorAll("#cart-container article").forEach(element => {
        // Delete button
        onDeleteProduct(element);

        // Change quantity
        onChangeQuantity(element);
    });
}

function onDeleteProduct(element) {
    // Add event when click on the delete button to delete the product
    var nodes = element.querySelectorAll('a');
    var last = nodes[nodes.length-1];
    last.addEventListener("click", (event) => {
        deleteProduct(element.getAttribute("data-id").toString(), element.getAttribute("data-type").toString());
    });
}

function onChangeQuantity(element) {
    // Add event when change quantity
    element.querySelector("form").addEventListener("change", (event) => {
        let key = element.getAttribute("data-key");
        let type = element.getAttribute("data-type");
        let id = element.getAttribute("data-id");
        let newQty = document.getElementById("quantity-" + key).value;

        getCarts(type).then(result => {
            for(var i = 0; i < result.length; i++) {
                let product = result[i];

                if(product == null)
                    continue;

                if(product.id == id) {
                    result[i].qty = newQty;
                    element.setAttribute("data-price", product.price * newQty);
                    saveCart(result, type);
                    getCarts().then(result => {
                        renderTotalPrice();
                    });
                    break;
                }
            }
        });
    });
}

function toEuro(number) {
    number = number/100;
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(number);
}

function renderTotalPrice() {
    let total = 0;

    // Calculate total price of all elements in the cart
    document.querySelectorAll("#cart-container article").forEach(element => {
        total += parseInt(element.getAttribute("data-price"));
        document.getElementById("price-" + element.getAttribute("data-key")).innerHTML = toEuro(element.getAttribute("data-price"));
    });

    // Render total price in the view
    document.getElementById("cart-total").innerHTML = "Total: " + toEuro(total);
}

function renderQty(selected) {
    let qty = "";

    for(var i = 0; i < 10; i++) {
        let str = "";
        if(selected == i+1) // Set current option to selected
            str = "selected";

        qty += `<option value="${i+1}" ${str}>x${i+1}</option>`;
    }

    // Add custom option for current quantity, to prevent quantity not showed if to upper
    if(selected > 10) {
        qty += `<option value="${selected}" selected>x${selected}</option>`;
    }

    return qty;
}

function deleteProduct(id, type) {
    // Get the cart for its type
    getCarts(type).then(products => {
        let found = false;

        // Foreach elements of tha cart to find desired ID
        for(var i = 0; i < products.length; i++) {
            let product = products[i];

            // If element is null or undefined, go to the next
            if(product == null)
                continue;
                
            // If its the desired element, remove from the array
            // and stop the loop
            if(product.id == id) {
                found = true;
                products.splice(i, 1);
                break;
            }
        }

        if(found) {
            // Save new array and delete HTML element for the product
            saveCart(products, type);
            document.getElementById("product-" + id).remove();

            // Reload carts variables
            getCarts().then(result => {
                renderTotalPrice();
                document.getElementById("cart-count").innerHTML = CART.length;
            });
        }
    });
}

function saveCart(cart, type) {
    localStorage.setItem("cart_" + type, JSON.stringify(cart));
}


/**
 * Validations
 **/
function setContactListener() {
    document.querySelectorAll("#contact-form input").forEach(input => {
        input.addEventListener("keyup", (event) => {
            setInputValid(checkInput(input), input);
        });
    });
}
function checkCanSubmit() {
    let can = true;

    return new Promise((resolve, reject) => {
        let inputs = document.querySelectorAll("#contact-form input, #contact-form button");
        for(var i = 0; i < inputs.length; i++) {
            let input = inputs[i];
            let valid = checkInput(input);
            setInputValid(valid, input);

            if(!valid) {
                reject();
                break;
            }

            if(i == inputs.length-1)
                resolve();
        }
    });
}
function setInputValid(valid, input) {
    if(!valid) {
        input.classList.add("error");
        input.classList.remove("success");
        input.nextElementSibling?.classList.remove("hidden");
    }else{
        input.classList.add("success");
        input.classList.remove("error");
        input.nextElementSibling?.classList.add("hidden");
    }
}
function checkInput(input) {

    let validation = false;
    switch(input.getAttribute("data-validation")) {
        case "validateStringFr":
            validation = validateStringFr(input.value);
        break;

        case "validateEmail":
            validation = validateEmail(input.value);
        break;

        case "validateStringOnly":
            validation = validateStringOnly(input.value);
        break;

        case "validateStringAndNumber":
            validation = validateStringAndNumber(input.value);
        break;

        case "validateEmptyCart":
            validation = validateEmptyCart();
        break;

        default:
            // Validation type not exist, so don't do check
            validation = true;
        break;
    }

    return validation;
}

function validateStringAndNumber(value) {
    return !/[^a-zA-Z0-9 ]/.test(value) && value.trim().length >= 3 && value.trim().length < 60;
}

function validateStringOnly(value) {
    return !/[^a-zA-Z ]/.test(value) && value.trim().length >= 3 && value.trim().length < 60;
}

function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function validateStringFr(name) {
    return !/[^a-zA-ZéèÉÈêÊëË ]/.test(name) && name.trim().length >= 3 && name.trim().length < 25;
}

function validateEmptyCart() {
    if(CART.length <= 0)
        return false;

    return true;
}