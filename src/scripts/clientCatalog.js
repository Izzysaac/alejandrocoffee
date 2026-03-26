import data from "../../public/data.json";
import { getCloudinaryImageUrl } from "../scripts/imgHelper";

let allProducts = [];
let filteredProducts = [];

/* ========= Helpers ========= */

export const createProductSlug = (name) => {
	return name
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/\s+/g, "-")
		.replace(/[^a-z0-9-]/g, "");
};
/* ========= ======= ========= */

// Render products to DOM
export const renderProducts = (products) => {
	const container = document.getElementById("products-container");
	if (!container) return;

	container.innerHTML = products
		.map((product) => {
			// Precio mínimo de las variantes
			const prices = product.variantes?.map((v) => v.precio) ?? [];

			const minPrice = prices.length ? Math.min(...prices) : 0;

			const priceLabel =
				prices.length > 1
					? `Desde $${minPrice.toLocaleString()}`
					: `$${minPrice.toLocaleString()}`;

			return `
			<div class="product-card">

				<a href="/catalog/${createProductSlug(product.nombre)}"
				class="flex flex-col text-center">

					${
						product.media?.length > 0
							? `
								<img
									src="${getCloudinaryImageUrl(product.media[0], { width: 600, height: 600 })}"
									alt="${product.nombre}"
									loading="lazy"
									class="order-first"
								/>
							`
							: ""
					}

					<h2>
						${product.nombre}
					</h2>

					<p>
						${priceLabel}
					</p>

				</a>

			</div>
		`;
		})
		.join("");
};

// Update URL without page reload
export const updateURL = (categorySlug) => {
	const url = categorySlug ? `/catalog?category=${categorySlug}` : "/catalog";
	window.history.pushState({}, "", url);
};

// Update active filter in dropdown
export const updateActiveFilter = (categorySlug) => {
	const select = document.getElementById("category-filter");
	if (select) {
		select.value = categorySlug || "";
	}
};

/* ========= Actions ========= */

// Filter products by category
export const filterByCategory = (categorySlug) => {
	if (!categorySlug) {
		filteredProducts = [...allProducts];
	} else {
		filteredProducts = allProducts.filter(
			(product) =>
				product.categoria
					.toLowerCase()
					.normalize("NFD")
					.replace(/[\u0300-\u036f]/g, "")
					.replace(/\s+/g, "-")
					.replace(/[^a-z0-9-]/g, "") === categorySlug,
		);
	}

	renderProducts(filteredProducts);
	updateURL(categorySlug);
	updateActiveFilter(categorySlug);
};

// Initialize products on page load
export const initCatalog = () => {
	allProducts = data;
	filteredProducts = [...allProducts];

	// Check URL params on load
	const urlParams = new URLSearchParams(window.location.search);
	const category = urlParams.get("category");

	if (category) {
		filterByCategory(category);
	} else {
		renderProducts(allProducts);
	}
	updateActiveFilter(category);
};

/* ========= ======= ========= */

// Initialize when DOM is ready (catalog UI)
document.addEventListener("DOMContentLoaded", () => {
	initCatalog();

	// Add event listener for filter changes
	const filterSelect = document.getElementById("category-filter");
	if (filterSelect) {
		filterSelect.addEventListener("change", (e) => {
			filterByCategory(e.target.value);
		});
	}
});
