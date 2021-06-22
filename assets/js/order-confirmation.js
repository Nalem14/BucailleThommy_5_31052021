let categories = []
window.addEventListener("DOMContentLoaded", (event) => {
    categories = ["teddies", "cameras", "furniture"];

    getOrderData().then(data => {
        console.log(data);

        if(data.orderIds.length <= 0) {
            window.location.href = "/";
            return;
        }

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
                if(id == null) {
                    return;
                }

                orderIds.push(getCategoryName(category) + ": " + id);
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

function getCategoryName(type) {
    let str = "";

    switch(type) {
        case "teddies":
            str = "Ours";
        break;

        case "cameras":
            str = "Cameras";
        break;

        case "furniture":
            str = "Meubles";
        break;

        default:
            str = "Unknown";
        break;
    }

    return str;
}