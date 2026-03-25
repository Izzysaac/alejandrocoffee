	import { addToCart } from "../lib/cart.js";

	const form = document.getElementById("form");
	const btn = document.getElementById("add-to-cart");

	btn?.addEventListener("click", () => {

		const data = new FormData(form);
        const values = Object.fromEntries(data.entries());
        console.log(values.presentacion);

		const product = {
			id: btn.dataset.id,
			title: btn.dataset.title,
			price: Number(btn.dataset.price),
			image: btn.dataset.image,
            variant: values?.presentacion
		};

		addToCart(product);
		document.dispatchEvent(new Event("cart:open"));
		window.dispatchEvent(new Event("cartUpdated"));
	});