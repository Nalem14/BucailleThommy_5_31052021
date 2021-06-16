
let CART_TEDDIES, CART_FURNITURE, CART_CAMERAS, CART;
window.addEventListener("DOMContentLoaded", (event) => {

    // Initialize carts variables and render view
    getCarts().then((result) => {
        renderCart();
    }).catch((error) => {
        document.getElementById("cart-container").innerHTML("Erreur. Impossible de charger le panier : " + error);
    });

    // When confirm cart, show contact form and focus first input
    document.getElementById("confirm-cart").addEventListener("click", (event) => {
        confirmCart(event);
    });

    // When validate contact form, submit cart
    document.getElementById("contact-form").addEventListener("submit", (event) => {
        handleCartSubmit(event);
    });
});

function confirmCart(event) {
    // Show contact form
    document.getElementById("user-info").style.display = "flex";

    // Hide confirm cart button
    event.target.style.display = "none";

    // Focus first input
    document.querySelector("input[name=firstName]").select();

    // Scroll to section
    document.getElementById("user-info").scrollIntoView();
}

function handleCartSubmit(event) {
    event.stopPropagation();
    event.preventDefault();

    let firstName = document.getElementById("firstName").value;
    let lastName = document.getElementById("lastName").value;
    let email = document.getElementById("email").value;
    let city = document.getElementById("city").value;
    let address = document.getElementById("address").value;

    let contact = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        city: city,
        address: address
    }

    let categories = ["teddies", "cameras", "furniture"];
    categories.forEach(category => {

        getCarts(category).then(products => {

            let productsId = [];
            let totalPrice = 0;
            products.forEach(product => {
                totalPrice += product.price * product.qty;
                productsId.push(product._id);
            })
            // console.log({contact: contact, products: productsId});

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
                localStorage.setItem("order-id-confirmation-" + category, data.orderId);
                localStorage.setItem("order-price-confirmation-" + category, totalPrice);
            });
        })
    });

    // Clear carts
    clearCarts();

    // Redirect to confirmation page
    //window.location.href = "/pages/order-confirmation.html";
}

function clearCarts() {
    localStorage.clear();
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
        document.getElementById("confirm-cart").style.display = "none";
        return;
    }

    container.innerHTML = "Chargement...";
    document.getElementById("confirm-cart").style.display = "flex";
    CART.forEach(element => {
        // Add HTML element in var
        content += `
            <article id="product-${element.id}" data-key="${n}" data-id="${element.id}" data-type="${element.type}" data-price="${element.price * element.qty}">
                <figure>
                <img src="${element.imageUrl}" alt="" />
                </figure>

                <div>
                <h3>${element.name}</h3>
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
    element.querySelector("a").addEventListener("click", (event) => {
        deleteProduct(element.getAttribute("data-id").toString(), element.getAttribute("data-type").toString());
    });
}

function onChangeQuantity(element) {
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
    document.querySelectorAll("#cart-container article").forEach(element => {
        total += parseInt(element.getAttribute("data-price"));
        document.getElementById("price-" + element.getAttribute("data-key")).innerHTML = toEuro(element.getAttribute("data-price"));
    });

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