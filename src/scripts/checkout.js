import { getCloudinaryImageUrl } from "./imgHelper.js";

(() => {
	const STORAGE_KEY = "cart";
	const WHATSAPP_PHONE = "573163896572";
	const BASE_SHIPPING = 10000;
	const FREE_SHIPPING_THRESHOLD = 1000000;

	const elEmpty = document.getElementById("emptyState");
	const elContent = document.getElementById("checkoutContent");
	const elItems = document.getElementById("orderSummaryItems");
	const elProductsTotal = document.getElementById("orderSummaryProductsTotal");
	const elShipping = document.getElementById("orderSummaryShipping");
	const elGrandTotal = document.getElementById("orderSummaryGrandTotal");
	const elFinalTotal = document.getElementById("orderSummaryFinalTotal");
	const elBtn = document.getElementById("whatsappBtn");
	const elHint = document.getElementById("formHint");

	const elName = document.getElementById("customerName");
	const elPhone = document.getElementById("customerPhone");
	const elAddress = document.getElementById("customerAddress");

	if (
		!elEmpty ||
		!elContent ||
		!elItems ||
		!elProductsTotal ||
		!elShipping ||
		!elGrandTotal ||
		!elFinalTotal ||
		!elBtn ||
		!elHint ||
		!elName ||
		!elPhone ||
		!elAddress
	) {
		return;
	}

	const emptyStateEl = elEmpty;
	const contentEl = elContent;
	const itemsEl = elItems;
	const productsTotalEl = elProductsTotal;
	const shippingEl = elShipping;
	const grandTotalEl = elGrandTotal;
	const finalTotalEl = elFinalTotal;
	const whatsappBtn = /** @type {HTMLButtonElement} */ (elBtn);
	const hintEl = elHint;

	const nameInput = elName;
	const phoneInput = elPhone;
	const addressInput = elAddress;

	const formatPrice = (value) => {
		try {
			return new Intl.NumberFormat("es-CO", {
				style: "currency",
				currency: "COP",
				maximumFractionDigits: 0,
			}).format(Number(value) || 0);
		} catch {
			return `$${Math.round(Number(value) || 0).toLocaleString("es-CO")}`;
		}
	};

	const escapeHtml = (s) =>
		String(s)
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/\"/g, "&quot;")
			.replace(/'/g, "&#039;");

	const sanitizeText = (s) => {
		return String(s ?? "")
			.replace(/\s+/g, " ")
			.trim();
	};

	const parseCart = () => {
	const raw = localStorage.getItem(STORAGE_KEY);

	if (!raw) return { items: [] };

	try {
		const parsed = JSON.parse(raw);

		if (!parsed || typeof parsed !== "object")
			return { items: [] };

		if (!Array.isArray(parsed.items))
			return { items: [] };

		const items = parsed.items
			.filter((i) => i && typeof i === "object")
			.map((i) => {

				const options =
					i.options && typeof i.options === "object"
						? i.options
						: {};

				const variant =
					typeof i.variant === "string"
						? i.variant
						: Object.values(options).join(" · ");

				return {
					id: String(i.id ?? ""),
					title: String(i.title ?? ""),
					price: Number(i.price ?? 0),
					quantity: Math.max(
						1,
						Number(i.quantity ?? 1)
					),
					image: String(i.image ?? ""),

					// NUEVO
					options,
					variant
				};

			})
			.filter((i) => i.id);

		return { items };

	} catch {
		return { items: [] };
	}
};

	const computeTotal = (items) =>
		items.reduce(
			(acc, it) => acc + (Number(it.price) || 0) * (Number(it.quantity) || 0),
			0,
		);

	const getShipping = (items) => {
		const subtotal = computeTotal(items);

		if (subtotal >= FREE_SHIPPING_THRESHOLD) {
			return 0;
		}

		return BASE_SHIPPING;
	};

	const renderOrder = () => {
		const { items } = parseCart();
		if (!items.length) {
			emptyStateEl.hidden = false;
			contentEl.hidden = true;
			whatsappBtn.disabled = true;
			return;
		}

		emptyStateEl.hidden = true;
		contentEl.hidden = false;

		const subtotal = computeTotal(items);
		const shipping = getShipping(items);
		const grandTotal = subtotal + shipping;

		productsTotalEl.textContent = formatPrice(subtotal);
		shippingEl.textContent =
		shipping === 0
			? "Gratis"
			: formatPrice(shipping);
		grandTotalEl.textContent = formatPrice(grandTotal);
		finalTotalEl.textContent = formatPrice(grandTotal);

		itemsEl.innerHTML = items
			.map((it) => {
				const itSubtotal = (Number(it.price) || 0) * (Number(it.quantity) || 0);
				return `
							<li class="product-item flex gap-2 items-center">
								<div class="flex relative w-fit aspect-square">
									<img src="${getCloudinaryImageUrl(it.image, { w: 150, h: 150 })}" alt="${escapeHtml(it.title)}" width="64" height="64" class="rounded object-contain"/>
									<span class="product-badge self-end absolute -top-1 -right-1 bg-(--brand) text-(--on-brand) rounded px-1.5 py-0.5 text-xs font-bold">${escapeHtml(it.quantity)}</span>
								</div>
                                <p class="product-name" style="display: flex; flex-direction: column;">
									<span>${escapeHtml(it.title)}</span>
									<span>${escapeHtml(it.variant)}</span>
								</p>
                                <p class="product-subtotal  ms-auto text-nowrap">${escapeHtml(formatPrice(itSubtotal))}</p>
							</li>
						`;
			})
			.join("");
	};

	const setError = (field, msg) => {
		const el = document.querySelector(`.error[data-for="${field}"]`);
		if (el) el.textContent = msg || "";
	};

	const clearErrors = () => {
		setError("name", "");
		setError("phone", "");
		setError("address", "");
	};

	const getCustomerData = () => {
		const name = sanitizeText(
			nameInput instanceof HTMLInputElement ? nameInput.value : "",
		);
		const phone = sanitizeText(
			phoneInput instanceof HTMLInputElement ? phoneInput.value : "",
		);
		const address = sanitizeText(
			addressInput instanceof HTMLTextAreaElement ? addressInput.value : "",
		);
		return { name, phone, address };
	};

	const validate = () => {
		clearErrors();
		hintEl.textContent = "";

		const { items } = parseCart();
		if (!items.length) {
			whatsappBtn.disabled = true;
			hintEl.textContent = "Agrega productos al carrito para continuar.";
			return false;
		}

		const { name, phone, address } = getCustomerData();
		let ok = true;

		if (!name) {
			setError("name", "Ingresa tu nombre completo.");
			ok = false;
		}
		if (!phone) {
			setError("phone", "Ingresa tu teléfono.");
			ok = false;
		}
		if (!address) {
			setError("address", "Ingresa tu dirección.");
			ok = false;
		}

		whatsappBtn.disabled = !ok;
		if (!ok) hintEl.textContent = "Completa los campos requeridos.";
		return ok;
	};

	const buildMessage = () => {
		const { items } = parseCart();
		const { name, phone, address } = getCustomerData();
		const subtotal = computeTotal(items);
		const shipping = getShipping(items);
		const grandTotal = subtotal + shipping;

		const lines = [];
		lines.push("🛒 NUEVO PEDIDO");
		lines.push("");
		lines.push("🏍️ Productos:");
		items.forEach((it) => {
			const quantity = Number(it.quantity) || 0;
			const price = Number(it.price) || 0;
			const itSubtotal = price * quantity;

			const variantText = it.variant
				? ` (${sanitizeText(it.variant)})`
				: "";

			lines.push(
				`- ${quantity} x ${sanitizeText(it.title)}${variantText} - ${formatPrice(itSubtotal)}`
			);
		});
		lines.push("");
		lines.push(`🚚 Envío: ${formatPrice(shipping)}`);
		lines.push(`💰 Total: ${formatPrice(grandTotal)}`);
		lines.push("");
		lines.push(`👤 Nombre: ${name}`);
		lines.push(`📞 Teléfono: ${phone}`);
		lines.push(`📍 Dirección: ${address}`);
		lines.push("");

		return lines.join("\n");
	};

	const openWhatsApp = () => {
		if (!validate()) return;

		const msg = buildMessage();
		const encodeUtf8 = (text) => {
			try {
				const bytes = new TextEncoder().encode(String(text));
				let out = "";
				for (const b of bytes) out += `%${b.toString(16).padStart(2, "0")}`;
				return out;
			} catch {
				return encodeURIComponent(String(text));
			}
		};

		const safeMsg = msg.replace(/[\uFE0F\u200D]/g, "");
		const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeUtf8(safeMsg)}`;

		try {
			window.location.href = url;
		} catch {
			window.open(url, "_blank", "noopener,noreferrer");
		}

		// Opcional: limpiar carrito después de redirigir
		// localStorage.setItem(STORAGE_KEY, JSON.stringify({ items: [], updatedAt: Date.now() }));
	};

	nameInput.addEventListener("input", validate);
	phoneInput.addEventListener("input", validate);
	addressInput.addEventListener("input", validate);
	whatsappBtn.addEventListener("click", openWhatsApp);

	window.addEventListener("storage", (e) => {
		if (e.key === STORAGE_KEY) {
			renderOrder();
			validate();
		}
	});

	renderOrder();
	validate();
})();
