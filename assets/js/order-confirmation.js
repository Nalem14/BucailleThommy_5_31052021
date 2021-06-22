let categories = []
window.addEventListener("DOMContentLoaded", (event) => {
    categories = ["teddies", "cameras", "furniture"];

    getOrderData().then(data => {
        console.log(data);
        renderOrderData(data);

        localStorage.clear();
    }).catch(error => {
        window.location.href = "/";
    });
});

function getOrderData() {
    return new Promise((resolve, reject) => {
        try {
            let orderIds = [];
            let totalPrice = 0;

            categories.forEach(category => {
                let id = localStorage.getItem("order-id-confirmation-" + category);
                if(typeof(id) == "undefined") {
                    reject();
                    return;
                }

                orderIds.push(id);
            })

            totalPrice = parseFloat(localStorage.getItem("order-price-confirmation"));

            return resolve({
                orderIds: orderIds,
                totalPrice: totalPrice
            });
        }
        catch(error) {
            reject(error);
        }
    });
}

function renderOrderData(data) {
    document.getElementById("order-id").innerHTML = "";
    data.orderIds.forEach(element => {
        if(element.trim().length > 0)
            document.getElementById("order-id").innerHTML += element + "<br>";
    })
    document.getElementById("order-price").innerHTML = toEuro(data.totalPrice);
}

function toEuro(number) {
    number = number/100;
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(number);
}