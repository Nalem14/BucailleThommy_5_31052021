window.addEventListener("DOMContentLoaded", (event) => {
    getProducts("teddies").then(result => {
        renderProducts(result, "teddies");
    }).catch(error => {
        document.getElementById("products-container").innerHTML = "<p>Erreur: Impossible de charger les données. Veuillez ré-essayer ou contacter un administrateur.<br>"+ error +"</p>";
    });

    document.getElementById("teddies").addEventListener("click", () => {
        getProducts("teddies").then(result => {
            renderProducts(result, "teddies");
        }).catch(error => {
            document.getElementById("products-container").innerHTML = "<p>Erreur: Impossible de charger les données. Veuillez ré-essayer ou contacter un administrateur.<br>"+ error +"</p>";
        });
    })

    document.getElementById("cameras").addEventListener("click", () => {
        getProducts("cameras").then(result => {
            renderProducts(result, "cameras");
        }).catch(error => {
            document.getElementById("products-container").innerHTML = "<p>Erreur: Impossible de charger les données. Veuillez ré-essayer ou contacter un administrateur.<br>"+ error +"</p>";
        });
    })

    document.getElementById("furnitures").addEventListener("click", () => {
        getProducts("furniture").then(result => {
            renderProducts(result, "furniture");
        }).catch(error => {
            document.getElementById("products-container").innerHTML = "<p>Erreur: Impossible de charger les données. Veuillez ré-essayer ou contacter un administrateur.<br>"+ error +"</p>";
        });
    })
});

function getProducts(category) {
    return fetch('http://localhost:3000/api/' + category)
    .then(response => response.json())
    .then(datas => {
        return datas;
    })
    .catch(error => {
        console.log(error);
        return error;
    });
}

function renderProducts(datas, category) {
    let container = document.getElementById("products-container");
    container.innerHTML = "Chargement...";

    let content = "";
    datas.forEach(element => {
        content += `

            <article>
                <a href="./pages/product.html?id=`+ element._id +`&category=`+ category +`">
                    <figure>
                        <img src="`+ element.imageUrl +`" alt="`+ element.description +`" />
                    </figure>
                    <h3>`+ element.name +`</h3>
                    <p>`+ element.description +`t</p>
                    <span>`+ toEuro(element.price) +`</span>
                </a>
                <a href="./pages/product.html?id=`+ element._id +`&category=`+ category +`" class="btn">Voir le produit</a>
            </article>
        `;
    });

    container.innerHTML = content;
}

function toEuro(number) {
    number = number/100;
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(number);
}