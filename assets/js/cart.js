
let CART_TEDDIES, CART_FURNITURE, CART_CAMERAS, CART;
window.addEventListener("DOMContentLoaded", (event) => {

    GetCarts().then((result) => {
        RenderCart();
    }).catch((error) => {
        document.getElementById("cart-container").innerHTML("Erreur. Impossible de charger le panier : " + error);
    });
});

function GetCarts(type = null) {
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

function RenderCart() {
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
                <h3>${element.name}</h3>
                <p>
                    ${element.description}
                    <strong>${element.optionName}: ${element.optionValue}</strong>
                </p>
                </div>

                <form action="./cart.html" method="post">
                <label for="quantity-${n}">Quantité</label>
                <select name="quantity" id="quantity-${n}">
                    ${RenderQty(element.qty)}
                </select>
                </form>

                <span>${ToEuro(element.price * element.qty)}</span>
                <a href="#"><i class="fas fa-trash"></i></a>
            </article>
        `;
    });

    // Set HTML content
    container.innerHTML = content;

    // Set listeners
    document.querySelectorAll("#cart-container article").forEach(element => {

        // Delete button
        element.querySelector("a").addEventListener("click", (event) => {
            DeleteProduct(element.getAttribute("data-id").toString(), element.getAttribute("data-type").toString());
        });

        // Change quantity
        element.querySelector("form").addEventListener("change", (event) => {
            let key = element.getAttribute("data-key");
            let type = element.getAttribute("data-type");
            let id = element.getAttribute("data-id");
            let newQty = document.getElementById("quantity-" + key).value;

            GetCarts(type).then(result => {
                for(var i = 0; i < result.length; i++) {
                    let product = result[i];

                    if(product == null || typeof(product) == undefined)
                        continue;

                    if(product.id == id) {
                        result[i].qty = newQty;
                        SaveCart(result);
                        GetCarts();
                        break;
                    }
                }
            });
        });
    });

    RenderTotalPrice();
}

function ToEuro(number) {
    number = number/100;
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(number);
}

function RenderTotalPrice() {
    let total = 0;
    document.querySelectorAll("#cart-container article").forEach(element => {
        total += element.getAttribute("data-price");
    });

    document.getElementById("cart-total").innerHTML = "Total: " + ToEuro(total);
}

function RenderQty(selected) {
    let qty = "";

    for(var i = 0; i < 10; i++) {
        let str = "";
        if(selected == i+1) // Set current option to selected
            str = "selected";

        qty += `<option value="${i+1}" ${str}>x${i+1}</option>`;
    }

    return qty;
}

function DeleteProduct(id, type) {
    // Get the cart for its type
    GetCarts(type).then(products => {
        let found = false;

        // Foreach elements of tha cart to find desired ID
        for(var i = 0; i < products.length; i++) {
            let product = products[i];

            // If element is null or undefined, go to the next
            if(product == null || typeof(product) == undefined)
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
            SaveCart(products, type);
            document.getElementById("product-" + id).remove();

            // Reload carts variables
            GetCarts().then(result => {
                RenderTotalPrice();
                document.getElementById("cart-count").innerHTML = CART.length;
            });
        }
    });
}

function SaveCart(cart, type) {
    localStorage.setItem("cart_" + type, JSON.stringify(cart));
}