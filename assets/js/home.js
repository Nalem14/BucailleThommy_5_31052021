window.addEventListener("DOMContentLoaded", (event) => {
    loadProducts("teddies");

    document.getElementById("teddies").addEventListener("click", () => {
        loadProducts("teddies");
    })

    document.getElementById("cameras").addEventListener("click", () => {
        loadProducts("cameras");
    })

    document.getElementById("furnitures").addEventListener("click", () => {
        loadProducts("furniture");
    })
});

//
//
// Need to refactore, render HTML in another function
//
//
function loadProducts(category) {
    let container = document.getElementById("products-container");
    container.innerHTML = "Chargement...";

    fetch('http://localhost:3000/api/' + category)
    .then(response => response.json())
    .then(datas => {
        //console.log(datas);
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
                        <span>`+ element.price +`€</span>
                    </a>
                    <a href="./pages/product.html?id=`+ element._id +`&category=`+ category +`" class="btn">Voir le produit</a>
                </article>
            `;
        });

        container.innerHTML = content;
        
    })
    .catch(error => {
        console.log(error);
        container.innerHTML = "Erreur : " + error;
    });
}