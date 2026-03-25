/* Piezas internas importantes */
const STORAGE_KEY = "cart";

// Devuelve un carrito válido vacío. Es el “fallback”.
const emptyCart = () => {
	return { items: [], updatedAt: Date.now() };
};

// Si no hay nada en localStorage -> devuelve carrito vacío
// Si el JSON está roto -> devuelve carrito vacío
// Si la estructura no es la esperada -> la normaliza
// Convierte tipos evita que el resto de funciones se rompan
const safeParseCart = (raw) => {
	if (!raw) return emptyCart();
	try {
		const parsed = JSON.parse(raw);
		if (!parsed || typeof parsed !== "object") return emptyCart();
		if (!Array.isArray(parsed.items)) return emptyCart();
		return {
			items: parsed.items
				.filter((i) => i && typeof i === "object")
				.map((i) => ({
					id: String(i.id ?? ""),
					title: String(i.title ?? ""),
					price: Number(i.price ?? 0),
					image: String(i.image ?? ""),
					quantity: Math.max(1, Number(i.quantity ?? 1)),
				}))
				.filter((i) => i.id),
			updatedAt: Number(parsed.updatedAt ?? Date.now()),
		};
	} catch {
		return emptyCart();
	}
}

// Guarda en localStorage y actualiza updatedAt
const persist = (cart) => {
	const toSave = { ...cart, updatedAt: Date.now() };
	localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
	return toSave;
};

// Funciones exportadas (API pública)
export function getCart() {
	if (typeof window === "undefined") return emptyCart();
	return safeParseCart(localStorage.getItem(STORAGE_KEY));
}

// Agrega un producto al carrito o incrementa su cantidad
export function addToCart(product) {
	const cart = getCart();
	const id = String(product?.id ?? "");
	if (!id) return cart;

	const title = String(product?.title ?? "");
	const price = Number(product?.price ?? 0);
	const image = String(product?.image ?? "");
	const variant = String(product?.variant ?? "");

	const idx = cart.items.findIndex((i) => i.id === id);
	if (idx >= 0) {
		const next = { ...cart.items[idx], quantity: cart.items[idx].quantity + 1 };
		const items = cart.items.slice();
		items[idx] = next;
		return persist({ ...cart, items });
	}

	const items = cart.items.concat([{ id, title, price, variant, image, quantity: 1 }]);
	return persist({ ...cart, items });
}

// Elimina un producto del carrito
export function removeFromCart(id) {
	const cart = getCart();
	const nextItems = cart.items.filter((i) => i.id !== String(id));
	return persist({ ...cart, items: nextItems });
}

// Actualiza la cantidad de un producto
export function updateQuantity(id, quantity) {
	const cart = getCart();
	const q = Math.max(1, Number(quantity ?? 1));
	const items = cart.items.map((i) => (i.id === String(id) ? { ...i, quantity: q } : i));
	return persist({ ...cart, items });
}

// Limpia el carrito
export function clearCart() {
	const cart = emptyCart();
	if (typeof window !== "undefined") {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
	}
	return cart;
}

// Devuelve el número total de productos en el carrito
export function getCartCount() {
	const cart = getCart();
	return cart.items.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);
}
