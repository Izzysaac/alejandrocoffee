let currentCategory = "";
let $products = null;
let $select = null;
let productItems = [];
/* ========= Helpers ========= */

export const createProductSlug = (name) => {
	return name
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/\s+/g, "-")
		.replace(/[^a-z0-9-]/g, "");
};

/* ========= FUNCTIONS ========= */

// Render products to DOM
export const renderProducts = () => {
	if (productItems.length === 0) return;

	for (const { el, category } of productItems) {
		// Si la categoría actual es 'all' (opcional), se muestran todos
		const hide = currentCategory !== '' && category !== currentCategory;
		// Si hide es true -> añade la clase. Si es false -> la quita.
		el.classList.toggle("product-hidden", hide);
	}
};

// Update URL without page reload
export const updateURL = () => {
	const url = currentCategory ? `/productos?categoria=${currentCategory}` : "/productos";
	const currentUrl = window.location.pathname + window.location.search;
	if (currentUrl === url) return;
	window.history.pushState({}, "", url);
};

// Update active filter in dropdown
export const updateActiveFilter = () => {
	if ($select) {
		$select.value = currentCategory || "";
	}
};

/* ========= Actions ========= */

// Filter products by category
export const filterByCategory = (categorySlug) => {
	currentCategory = categorySlug;
	renderProducts();
	updateURL();
	updateActiveFilter();
};

// Initialize products on page load
export const initCatalog = () => {

	// Cache products once
	if ($products) {
		productItems = Array.from($products.children).map((product) => ({
			el: product,
			category: product.dataset.category,
		}));
	}

	// Check URL params on load
	const urlParams = new URLSearchParams(window.location.search);
	const category = urlParams.get("categoria");

	if (category) {
		filterByCategory(category);
	} else {
		renderProducts();
		updateActiveFilter();
	}
};

/* ========= ======= ========= */

// Initialize when DOM is ready (catalog UI)
document.addEventListener("DOMContentLoaded", () => {
	$products = document.getElementById("products-container");
	$select = document.getElementById("category-filter");

	initCatalog();

	// Add event listener for filter changes
	if ($select) {
		$select.addEventListener("change", (e) => {
			filterByCategory(e.target.value);
		});
	}
});
