	import { addToCart } from "../lib/cart.js";

	const form = document.getElementById("form");
	const btn = document.getElementById("add-to-cart");

	btn?.addEventListener("click", () => {

	const data = new FormData(form);

	// opciones seleccionadas
	const selectedOptions = Object.fromEntries(data.entries());

	// encontrar variante
	const variant = item.variantes.find(v =>
		Object.entries(selectedOptions).every(
			([key, value]) => v[key] === value
		)
	);

	if (!variant) {
		console.error("Variante no encontrada");
		return;
	}

	const product = {
		id: variant.sku,
		title: btn.dataset.title,
		price: Number(variant.precio),
		image: btn.dataset.image,

		// opciones seleccionadas
		options: selectedOptions
	};

	addToCart(product);

	document.dispatchEvent(new Event("cart:open"));
	window.dispatchEvent(new Event("cartUpdated"));

});