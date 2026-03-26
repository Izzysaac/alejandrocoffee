import {
	getCart,
	removeFromCart,
	updateQuantity,
	clearCart,
} from "@lib/cart.js";

import { getCloudinaryImageUrl } from "./imgHelper.js";

// Referencias al DOM
const dialog = document.getElementById("cart-dialog");
const closeBtn = document.getElementById("cart-close");
const itemsEl = document.getElementById("cart-items");
const totalEl = document.getElementById("cart-total");
const clearBtn = document.getElementById("cart-clear");



const formatPrice = (n) => {
	const num = Number(n) || 0;
	return `$${num.toLocaleString()}`;
};

const render = () => {
	const cart = getCart();
	// Calcula el total
	const total = cart.items.reduce(
		(acc, it) => acc + (Number(it.price) || 0) * (Number(it.quantity) || 0),
		0,
	);
	totalEl.textContent = formatPrice(total);

	// Si no hay items, muestra un mensaje
	if (!cart.items.length) {
		itemsEl.innerHTML = `<p class="empty">Tu carrito está vacío.</p>`;
		return;
	}
// transition:name="img-${it.image}-1"
	// Renderiza los items
	itemsEl.innerHTML = cart.items
		.map(
			(it) => `
					<div class="cart-item flex gap-2" data-id="${it.id}">
						<img class="object-cover w-16 h-16 rounded" src="${getCloudinaryImageUrl(it.image, { w: 150, h: 150 })}" alt="${it.title}" />
						<div>
							<p class="flex flex-col"><span>${it.title}</span><span>${it.variant}</span></p>
							<p>${formatPrice(it.price)}</p>
						</div>
						<div class="ms-auto flex flex-col justify-end gap-2">
							<div class="flex rounded-full border border-gray-300 ">
								<button type="button" data-action="dec" class="px-3 py-2">
									<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 -960 960 960" class="pointer-events-none"><path d="M200-440v-80h560v80z"/></svg>
								</button>
								<input value="${it.quantity}" inputmode="numeric" class="qty-input w-5 text-center" />
								<button type="button" data-action="inc" class="px-3 py-2">
									<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 -960 960 960" class="pointer-events-none"><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80z"/></svg>								</button>
							</div>
							<button type="button" class="remove flex justify-end" aria-label="Eliminar" data-action="remove">
								<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 -960 960 960" class="pointer-events-none"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120zm400-600H280v520h400zM360-280h80v-360h-80zm160 0h80v-360h-80zM280-720v520z"/></svg>
							</button>
						</div>
					</div>
				`,
		)
		.join("");
};

/* === Eventos de interacción dentro del listado === */
const onClick = (e) => {
	const target = e.target;
	const row = target.closest(".cart-item");
	if (!row) return;

	const id = row.dataset.id;
	const action = target.dataset.action;

	if (action === "remove") {
		removeFromCart(id);
		window.dispatchEvent(new Event("cartUpdated"));
		render();
		return;
	}

	if (action === "inc" || action === "dec") {
		const cart = getCart();
		const item = cart.items.find((i) => i.id === id);
		if (!item) return;
		const nextQ =
			action === "inc" ? item.quantity + 1 : Math.max(1, item.quantity - 1);
		updateQuantity(id, nextQ);
		window.dispatchEvent(new Event("cartUpdated"));
		render();
		return;
	}
};

// Cuando cambias el input en la cantidad
const onChange = (e) => {
	const input = e.target;
	if (!input.classList.contains("qty-input")) return;
	const row = input.closest(".cart-item");
	if (!row) return;
	const id = row.dataset.id;
	const q = Math.max(1, Number(input.value || 1));
	updateQuantity(id, q);
	window.dispatchEvent(new Event("cartUpdated"));
	render();
};

itemsEl.addEventListener("click", onClick);
itemsEl.addEventListener("change", onChange);

/* === Eventos de interacción fuera del listado (dialog) === */

dialog.addEventListener("click", (e) => {
	if (e.target === dialog) dialog.close();
});
closeBtn.addEventListener("click", () => dialog.close());

clearBtn.addEventListener("click", () => {
	clearCart();
	// Sincronización (misma pestaña + otras pestañas)
	window.dispatchEvent(new Event("cartUpdated"));
	render();
});

dialog.addEventListener("close", () => render());

window.addEventListener("cartUpdated", () => render());

window.addEventListener("storage", (ev) => {
	if (ev.key === "cart") render();
});

// Escuhe el evento que emite el navbar cart click para abrir el dialog
document.addEventListener("cart:open", () => {
	render();
	dialog.showModal();
});

// initial
render();
