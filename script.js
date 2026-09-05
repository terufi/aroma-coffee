// ДАННЫЕ ТОВАРОВ 
const productsData = [
    { id: 1, name: "Эфиопия Иргачев", type: "Зерновой", volume: "200г", roast: "Светлая", price: 590, stock: 12 },
    { id: 2, name: "Колумбия Супремо", type: "Зерновой", volume: "500г", roast: "Средняя", price: 990, stock: 8 },
    { id: 3, name: "Бразилия Сантос", type: "Молотый", volume: "200г", roast: "Средняя", price: 450, stock: 15 },
    { id: 4, name: "Вьетнам Далат", type: "Растворимый", volume: "200г", roast: "Тёмная", price: 380, stock: 10 },
    { id: 5, name: "Якобс Монарх", type: "Растворимый", volume: "500г", roast: "Средняя", price: 620, stock: 5 },
    { id: 6, name: "Итальянская обжарка", type: "Зерновой", volume: "1кг", roast: "Тёмная", price: 1250, stock: 4 },
    { id: 7, name: "Нескафе Голд", type: "Растворимый", volume: "200г", roast: "Средняя", price: 520, stock: 7 },
    { id: 8, name: "Капсулы L'OR", type: "В капсулах", volume: "10шт", roast: "Средняя", price: 390, stock: 20 },
    { id: 9, name: "Молотый Эспрессо", type: "Молотый", volume: "500г", roast: "Тёмная", price: 680, stock: 6 },
    { id: 10, name: "Зерновой Гватемала", type: "Зерновой", volume: "1кг", roast: "Светлая", price: 1450, stock: 3 }
];

let currentFilters = { type: "all", volume: "all", roast: "all" };
let cart = [];

function saveCartToLocal() { localStorage.setItem("coffeeCart", JSON.stringify(cart)); }
function loadCartFromLocal() {
    const saved = localStorage.getItem("coffeeCart");
    if (saved) try { cart = JSON.parse(saved); } catch(e) { cart = []; }
    else cart = [];
    renderCart();
    updateCartBadge();
}
function saveFiltersToLocal() { localStorage.setItem("coffeeFilters", JSON.stringify(currentFilters)); }
function loadFiltersFromLocal() {
    const saved = localStorage.getItem("coffeeFilters");
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            currentFilters = parsed;
            document.getElementById("filter-type").value = parsed.type || "all";
            document.getElementById("filter-volume").value = parsed.volume || "all";
            document.getElementById("filter-roast").value = parsed.roast || "all";
        } catch(e) {}
    }
}

function filterProducts() {
    return productsData.filter(p => {
        if (currentFilters.type !== "all" && p.type !== currentFilters.type) return false;
        if (currentFilters.volume !== "all" && p.volume !== currentFilters.volume) return false;
        if (currentFilters.roast !== "all" && p.roast !== currentFilters.roast) return false;
        return true;
    });
}

function renderProducts() {
    const container = document.getElementById("products-container");
    const filtered = filterProducts();
    if (filtered.length === 0) {
        container.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:40px;">☕ Нет товаров по выбранным фильтрам</div>`;
        return;
    }
    container.innerHTML = filtered.map(p => `
        <div class="product-card" data-id="${p.id}">
            <div class="product-title">${p.name}</div>
            <div class="product-details"><span>${p.type}</span><span>${p.volume}</span><span>${p.roast} обжарка</span></div>
            <div class="price">${p.price} ₽</div>
            <div class="stock"> В наличии: ${p.stock} шт.</div>
            <div class="add-control">
                <input type="number" min="1" max="${p.stock}" value="1" class="qty-input" id="qty-${p.id}">
                <button class="add-to-cart" data-id="${p.id}">+ В корзину</button>
            </div>
        </div>
    `).join('');
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            const product = productsData.find(p => p.id === id);
            const qtyInput = document.getElementById(`qty-${id}`);
            let qty = parseInt(qtyInput.value);
            if (isNaN(qty) || qty < 1) qty = 1;
            addToCart(product, qty);
        });
    });
}

function addToCart(product, requestedQty) {
    const existing = cart.find(i => i.id === product.id);
    const current = existing ? existing.quantity : 0;
    const total = current + requestedQty;
    if (total > product.stock) {
        alert(` Недостаточно товара: "${product.name}". Доступно только ${product.stock} шт.`);
        return false;
    }
    if (existing) existing.quantity = total;
    else cart.push({ id: product.id, quantity: requestedQty, product: product });
    saveCartToLocal();
    renderCart();
    updateCartBadge();
    return true;
}

function removeCartItem(productId) {
    cart = cart.filter(i => i.id !== productId);
    saveCartToLocal();
    renderCart();
    updateCartBadge();
}

function updateQuantity(productId, newQty) {
    const item = cart.find(i => i.id === productId);
    if (item) {
        if (newQty > item.product.stock) {
            alert(`Максимум доступно: ${item.product.stock} шт.`);
            newQty = item.product.stock;
        }
        if (newQty <= 0) removeCartItem(productId);
        else {
            item.quantity = newQty;
            saveCartToLocal();
            renderCart();
            updateCartBadge();
        }
    }
}

function renderCart() {
    const container = document.getElementById("cart-items-list");
    if (cart.length === 0) {
        container.innerHTML = "<div style='text-align:center; padding:12px;'>Корзина пуста</div>";
        document.getElementById("cart-total").innerText = "0";
        return;
    }
    let total = 0;
    container.innerHTML = cart.map(item => {
        const prod = item.product;
        const sum = prod.price * item.quantity;
        total += sum;
        return `
            <div class="cart-item">
                <div><strong>${prod.name}</strong><br>${prod.volume} / ${item.quantity} шт.</div>
                <div>${sum} ₽<br>
                    <button class="cart-inc" data-id="${prod.id}">➕</button>
                    <button class="cart-dec" data-id="${prod.id}">➖</button>
                    <button class="cart-remove" data-id="${prod.id}">❌</button>
                </div>
            </div>
        `;
    }).join('');
    document.getElementById("cart-total").innerText = total;

    document.querySelectorAll('.cart-inc').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            const item = cart.find(i => i.id === id);
            if (item) updateQuantity(id, item.quantity + 1);
        });
    });
    document.querySelectorAll('.cart-dec').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            const item = cart.find(i => i.id === id);
            if (item) updateQuantity(id, item.quantity - 1);
        });
    });
    document.querySelectorAll('.cart-remove').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            removeCartItem(id);
        });
    });
}

function updateCartBadge() {
    const total = cart.reduce((acc, i) => acc + i.quantity, 0);
    document.getElementById("cart-count").innerText = total;
}

// АНИМАЦИЯ ГРУЗОВИКА (ЕДЕТ ВЛЕВО)
function showTruckAnimation() {
    const overlay = document.getElementById("truck-overlay");
    const svg = overlay.querySelector(".truck-svg");
    if (!svg) {
        console.error("SVG не найден!");
        return;
    }
    // сброс анимации
    svg.style.animation = "none";
    void svg.offsetHeight;
    // запуск анимации движения влево
    svg.style.animation = "driveLeft 4s ease-in-out forwards";
    overlay.classList.add("active");
    setTimeout(() => {
        overlay.classList.remove("active");
        svg.style.animation = "";
    }, 4200);
}

function submitOrder(event) {
    event.preventDefault();
    const name = document.getElementById("user-name").value.trim();
    const address = document.getElementById("user-address").value.trim();
    const phone = document.getElementById("user-phone").value.trim();
    if (!name || !address || !phone) {
        alert("Пожалуйста, заполните все поля: имя, адрес, телефон");
        return;
    }
    if (cart.length === 0) {
        alert("Корзина пуста. Добавьте товары перед заказом.");
        return;
    }
    for (let item of cart) {
        const product = productsData.find(p => p.id === item.id);
        if (item.quantity > product.stock) {
            alert(`Извините, товара "${product.name}" осталось только ${product.stock} шт. Обновите корзину.`);
            return;
        }
    }
    for (let item of cart) {
        const product = productsData.find(p => p.id === item.id);
        product.stock -= item.quantity;
    }
    cart = [];
    saveCartToLocal();
    renderCart();
    updateCartBadge();
    renderProducts();
    showTruckAnimation();
    document.getElementById("order-form").reset();
    alert(`Спасибо, ${name}! Ваш заказ оформлен. Грузовик с логотипом уже в пути 🚚`);
}

function applyFilters() {
    currentFilters.type = document.getElementById("filter-type").value;
    currentFilters.volume = document.getElementById("filter-volume").value;
    currentFilters.roast = document.getElementById("filter-roast").value;
    saveFiltersToLocal();
    renderProducts();
}
function resetFilters() {
    currentFilters = { type: "all", volume: "all", roast: "all" };
    document.getElementById("filter-type").value = "all";
    document.getElementById("filter-volume").value = "all";
    document.getElementById("filter-roast").value = "all";
    saveFiltersToLocal();
    renderProducts();
}

document.addEventListener("DOMContentLoaded", () => {
    loadCartFromLocal();
    loadFiltersFromLocal();
    renderProducts();
    renderCart();

    document.getElementById("filter-type").addEventListener("change", applyFilters);
    document.getElementById("filter-volume").addEventListener("change", applyFilters);
    document.getElementById("filter-roast").addEventListener("change", applyFilters);
    document.getElementById("reset-filters").addEventListener("click", resetFilters);
    document.getElementById("clear-cart").addEventListener("click", () => {
        if (confirm("Очистить корзину?")) {
            cart = [];
            saveCartToLocal();
            renderCart();
            updateCartBadge();
        }
    });
    document.getElementById("order-form").addEventListener("submit", submitOrder);
});