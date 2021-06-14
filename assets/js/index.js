window.addEventListener("DOMContentLoaded", (event) => {
    CartCount();
});

function CartCount() {
    const CART_TEDDIES = JSON.parse(localStorage.getItem("cart_teddies")) || [];
    const CART_FURNITURE = JSON.parse(localStorage.getItem("cart_furniture")) || [];
    const CART_CAMERAS = JSON.parse(localStorage.getItem("cart_cameras")) || [];
    const CART = CART_TEDDIES.concat(CART_FURNITURE).concat(CART_CAMERAS);

    document.getElementById("cart-count").innerHTML = CART.length;
}