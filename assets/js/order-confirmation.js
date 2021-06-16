let categories = []
window.addEventListener("DOMContentLoaded", (event) => {
    categories = ["teddies", "cameras", "furniture"];

    GetOrderData().then(data => {
        console.log(data);
        RenderOrderData(data);

        localStorage.clear();
    }).catch(error => {
        window.location.href = "/";
    });
});

function GetOrderData() {
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
            if(typeof(totalPrice) == "undefined") {
                reject();
                return;
            } 

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

function RenderOrderData(data) {
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