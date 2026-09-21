// Carrinho da Clã Ñandereko — sem preço fixo, fecha pedido via WhatsApp.
// Troque pelo número real da loja no formato internacional (DDI+DDD+número, só dígitos).
const WHATSAPP_NUMBER = "5500000000000";

const CART_STORAGE_KEY = "clanandereko_cart";

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch {
    /* localStorage indisponível — carrinho segue só em memória */
  }
}

let cart = loadCart();

function addToCart(productId) {
  cart[productId] = (cart[productId] || 0) + 1;
  saveCart(cart);
  renderCart();
}

function changeQty(productId, delta) {
  if (!cart[productId]) return;
  cart[productId] += delta;
  if (cart[productId] <= 0) delete cart[productId];
  saveCart(cart);
  renderCart();
}

function removeFromCart(productId) {
  delete cart[productId];
  saveCart(cart);
  renderCart();
}

function getCartCount() {
  return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
}

function renderCart() {
  const badge = document.getElementById("cartBadge");
  const body = document.getElementById("cartBody");
  const count = getCartCount();
  badge.textContent = count;
  badge.style.display = count > 0 ? "inline-flex" : "none";

  const entries = Object.entries(cart);

  if (entries.length === 0) {
    body.innerHTML = `<p class="cart-empty">Ainda não tem nada por aqui. Escolha um produto e o pedido aparece assim que você adicionar o primeiro item.</p>`;
    return;
  }

  body.innerHTML = entries
    .map(([id, qty]) => {
      const product = PRODUCTS.find((p) => p.id === id);
      if (!product) return "";
      return `
        <div class="cart-item">
          <div class="cart-item-media ${product.catClass}">
            <svg viewBox="0 0 64 64"><use href="#${product.icon}"/></svg>
          </div>
          <div class="cart-item-info">
            <h4>${product.name}</h4>
            <div class="size">${product.size}</div>
            <div class="qty-control">
              <button type="button" data-action="dec" data-id="${id}" aria-label="Diminuir quantidade">−</button>
              <span>${qty}</span>
              <button type="button" data-action="inc" data-id="${id}" aria-label="Aumentar quantidade">+</button>
              <button type="button" class="remove-item-btn" data-action="remove" data-id="${id}">remover</button>
            </div>
          </div>
        </div>`;
    })
    .join("");
}

function buildWhatsappMessage() {
  const name = document.getElementById("custName").value.trim();
  const phone = document.getElementById("custPhone").value.trim();
  const entries = Object.entries(cart);

  let msg = `Olá, Clã Ñandereko! Quero fazer um pedido:%0A%0A`;
  entries.forEach(([id, qty]) => {
    const product = PRODUCTS.find((p) => p.id === id);
    if (product) msg += `• ${product.name} (${product.size}) — Qtd: ${qty}%0A`;
  });
  msg += `%0A`;
  if (name) msg += `Nome: ${name}%0A`;
  if (phone) msg += `WhatsApp: ${phone}%0A`;
  msg += `%0APode me passar o valor, a taxa de entrega e o prazo?`;
  return msg;
}

function sendOrderToWhatsapp() {
  if (getCartCount() === 0) {
    alert("Seu carrinho está vazio. Adicione um produto antes de enviar o pedido.");
    return;
  }
  const message = buildWhatsappMessage();
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
  window.open(url, "_blank", "noopener");
}

document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  const { action, id } = btn.dataset;
  if (action === "inc") changeQty(id, 1);
  if (action === "dec") changeQty(id, -1);
  if (action === "remove") removeFromCart(id);
});

document.getElementById("sendWhatsappBtn").addEventListener("click", sendOrderToWhatsapp);

renderCart();
