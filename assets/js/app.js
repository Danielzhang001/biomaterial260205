const ALL_LABEL = "全部";
const LOCAL_CART_KEY = "cart";

const state = {
  products: [],
  cart: readCart(),
  filter: {
    q: "",
    category: getQueryParam("category") || ALL_LABEL,
    polymer: ALL_LABEL
  }
};

function getQueryParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}

function safeText(value, fallback = "-") {
  if (value === null || value === undefined) return fallback;
  const text = String(value).trim();
  return text || fallback;
}

function formatPrice(value) {
  if (typeof value !== "number" || Number.isNaN(value)) return "项目询价";
  return `¥${value.toLocaleString("zh-CN")}`;
}

function readCart() {
  try {
    const raw = localStorage.getItem(LOCAL_CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
}

function writeCart() {
  localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(state.cart));
  renderCartBadge();
  syncCartForm();
}

function addToCart(item) {
  const existing = state.cart.find((x) => x.sku === item.sku);
  if (existing) {
    existing.qty += item.qty;
  } else {
    state.cart.push(item);
  }
  writeCart();
  toast("已加入询价单");
}

function removeFromCart(sku) {
  state.cart = state.cart.filter((x) => x.sku !== sku);
  writeCart();
  renderCartPage();
}

function setCartQty(sku, qty) {
  const target = state.cart.find((x) => x.sku === sku);
  if (!target) return;
  target.qty = Math.max(1, Number(qty) || 1);
  writeCart();
  renderCartPage();
}

function clearCart() {
  state.cart = [];
  writeCart();
  renderCartPage();
  toast("询价单已清空");
}

function cartCount() {
  return state.cart.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
}

function cartNumericTotal() {
  return state.cart.reduce((sum, item) => sum + ((Number(item.unitPrice) || 0) * (Number(item.qty) || 0)), 0);
}

function cartHasPrice() {
  return state.cart.some((item) => typeof item.unitPrice === "number" && !Number.isNaN(item.unitPrice));
}

function renderCartBadge() {
  const count = cartCount();
  document.querySelectorAll("[data-cart-badge]").forEach((badge) => {
    badge.textContent = String(count);
    badge.classList.toggle("hidden", count === 0);
  });
}

function toast(message) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = message;
  el.classList.remove("opacity-0", "translate-y-3", "pointer-events-none");
  window.clearTimeout(el._hideTimer);
  el._hideTimer = window.setTimeout(() => {
    el.classList.add("opacity-0", "translate-y-3", "pointer-events-none");
  }, 1800);
}

function initIcons() {
  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons();
  }
}

function productImage(product) {
  if (product.image) {
    return `<img src="${product.image}" alt="${safeText(product.name)}" class="h-full w-full object-cover" loading="lazy"/>`;
  }
  return `
    <div class="grid h-full w-full place-items-center bg-gradient-to-br from-blue-600 to-cyan-500 text-white">
      <span class="text-lg font-semibold">${safeText(product.name, "材料")}</span>
    </div>
  `;
}

function variantSummary(variant) {
  const rows = [
    { label: "分子量", value: safeText(variant.mw) },
    { label: "端基", value: safeText(variant.end_group) },
    { label: "形态", value: safeText(variant.form) },
    { label: "包装", value: safeText(variant.pack) }
  ];

  return rows.map((row) => `
    <div class="glass-card p-4">
      <div class="text-xs text-slate-500">${row.label}</div>
      <div class="mt-1 text-sm font-semibold text-slate-900">${row.value}</div>
    </div>
  `).join("");
}

function getAllCategories() {
  const categories = Array.from(new Set(state.products.map((item) => item.category).filter(Boolean)));
  return [ALL_LABEL, ...categories];
}

function getPolymerOptions() {
  return [
    { id: ALL_LABEL, name: ALL_LABEL },
    ...state.products.map((item) => ({ id: item.id, name: item.name }))
  ];
}

function searchTarget(product) {
  const variants = (product.variants || [])
    .map((variant) => [variant.sku, variant.mw, variant.end_group, variant.form, variant.iv].join(" "))
    .join(" ");

  return [
    product.name,
    product.tagline,
    product.description,
    product.category,
    variants
  ].filter(Boolean).join(" ").toLowerCase();
}

function matchProduct(product) {
  const q = state.filter.q.trim().toLowerCase();
  const categoryOk = state.filter.category === ALL_LABEL || product.category === state.filter.category;
  const polymerOk = state.filter.polymer === ALL_LABEL || product.id === state.filter.polymer;
  const queryOk = !q || searchTarget(product).includes(q);
  return categoryOk && polymerOk && queryOk;
}

function renderFilters() {
  const catSelect = document.getElementById("catSelect");
  const polySelect = document.getElementById("polySelect");
  const qInput = document.getElementById("qInput");

  if (!catSelect || !polySelect) return;

  const categories = getAllCategories();
  if (!categories.includes(state.filter.category)) {
    state.filter.category = ALL_LABEL;
  }

  catSelect.innerHTML = categories.map((cat) => `<option value="${cat}">${cat}</option>`).join("");
  catSelect.value = state.filter.category;

  const polymers = getPolymerOptions();
  polySelect.innerHTML = polymers.map((item) => `<option value="${item.id}">${item.name}</option>`).join("");
  polySelect.value = state.filter.polymer;

  catSelect.onchange = () => {
    state.filter.category = catSelect.value;
    renderCatalog();
  };

  polySelect.onchange = () => {
    state.filter.polymer = polySelect.value;
    renderCatalog();
  };

  if (qInput) {
    qInput.addEventListener("input", () => {
      state.filter.q = qInput.value;
      renderCatalog();
    });
  }
}

function renderCatalog() {
  const grid = document.getElementById("productGrid");
  if (!grid) return;

  const items = state.products.filter(matchProduct);

  if (!items.length) {
    grid.innerHTML = `
      <div class="glass-card p-8 text-center text-sm text-slate-500 sm:col-span-2 xl:col-span-3">
        当前筛选条件下暂无结果，请调整关键词或分类。
      </div>
    `;
  } else {
    grid.innerHTML = items.map((product) => {
      const tags = (product.applications || []).slice(0, 2);
      return `
        <article class="group overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-float">
          <a href="product.html?id=${encodeURIComponent(product.id)}" class="block">
            <div class="aspect-[4/3] overflow-hidden">${productImage(product)}</div>
            <div class="p-5">
              <div class="text-xs text-sky-700">${safeText(product.category)}</div>
              <h3 class="mt-1 text-lg font-semibold text-slate-900">${safeText(product.name)}</h3>
              <p class="mt-2 line-clamp-2 text-sm text-slate-600">${safeText(product.tagline)}</p>
              <div class="mt-3 flex flex-wrap gap-2">
                ${tags.map((tag) => `<span class="chip">${safeText(tag)}</span>`).join("")}
              </div>
              <div class="mt-4 flex items-center justify-between">
                <span class="text-sm font-medium text-slate-600">${formatPrice(product.variants?.[0]?.price_cny)}</span>
                <span class="btn-soft">了解详情</span>
              </div>
            </div>
          </a>
        </article>
      `;
    }).join("");
  }

  const countEl = document.getElementById("resultCount");
  if (countEl) {
    countEl.textContent = `共 ${items.length} 项`;
  }

  initIcons();
}

function openReport(file, sku) {
  const modal = document.getElementById("reportModal");
  const frame = document.getElementById("reportFrame");
  const title = document.getElementById("reportTitle");
  if (!modal || !frame) return;

  if (title) {
    title.textContent = `检测报告：${sku}`;
  }
  frame.src = file;
  modal.classList.remove("hidden");
}

function closeReport() {
  const modal = document.getElementById("reportModal");
  const frame = document.getElementById("reportFrame");
  if (frame) frame.src = "about:blank";
  if (modal) modal.classList.add("hidden");
}

function renderVariantTabs(product, variant) {
  const props = Object.entries(variant.properties || {}).map(([key, value]) => `
    <tr class="border-b border-slate-100 even:bg-slate-50">
      <td class="px-3 py-2 text-sm text-slate-600">${key}</td>
      <td class="px-3 py-2 text-sm font-medium text-slate-900">${safeText(value)}</td>
    </tr>
  `).join("");

  const reports = (variant.reports || []).map((report) => `
    <button type="button" class="btn-soft w-full justify-between" data-open-report="${report.file}" data-report-sku="${variant.sku}">
      <span>${safeText(report.name)}</span>
      <span>查看</span>
    </button>
  `).join("") || "<p class=\"text-sm text-slate-500\">暂无可预览报告。</p>";

  const apps = (product.applications || []).map((item) => `
    <li class="rounded-xl border border-sky-100 bg-sky-50 px-3 py-2 text-sm text-slate-700">${safeText(item)}</li>
  `).join("");

  return [
    `<div class="overflow-hidden rounded-xl border border-slate-200"><table class="w-full">${props}</table></div>`,
    `<div class="space-y-3">${reports}</div>`,
    `<ul class="grid gap-2 sm:grid-cols-2">${apps}</ul>`
  ];
}

function bindTabSwitch(root) {
  const buttons = root.querySelectorAll(".tabBtn");
  const panels = root.querySelectorAll(".tabPanel");

  const setActive = (index) => {
    buttons.forEach((btn, idx) => {
      btn.className = idx === index
        ? "tabBtn rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white"
        : "tabBtn rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 hover:bg-slate-50";
    });
    panels.forEach((panel, idx) => {
      panel.classList.toggle("hidden", idx !== index);
    });
  };

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => setActive(Number(btn.dataset.tab)));
  });

  setActive(0);
}

function renderProductDetail() {
  const host = document.getElementById("productDetail");
  if (!host) return;

  const productId = getQueryParam("id");
  const product = state.products.find((item) => item.id === productId) || state.products[0];

  if (!product) {
    host.innerHTML = `<div class="glass-card p-8 text-sm text-slate-500">未找到产品信息。</div>`;
    return;
  }

  const variants = Array.isArray(product.variants) ? product.variants : [];
  let currentVariant = variants[0] || {};

  host.innerHTML = `
    <div class="grid gap-7 lg:grid-cols-12">
      <div class="lg:col-span-5">
        <article class="glass-card overflow-hidden">
          <div class="aspect-[4/3] overflow-hidden">${productImage(product)}</div>
          <div class="p-6">
            <p class="text-xs text-sky-700">${safeText(product.category)}</p>
            <h1 class="mt-1 text-3xl font-semibold text-slate-900">${safeText(product.name)}</h1>
            <p class="mt-3 text-sm leading-relaxed text-slate-600">${safeText(product.description)}</p>
            <div class="mt-4 flex flex-wrap gap-2">
              ${(product.applications || []).slice(0, 4).map((item) => `<span class="chip">${safeText(item)}</span>`).join("")}
            </div>
          </div>
        </article>
      </div>

      <div class="lg:col-span-7">
        <section class="glass-card p-6">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 class="text-xl font-semibold text-slate-900">规格与询价</h2>
              <p class="mt-1 text-sm text-slate-600">选择规格后可加入询价单，技术团队将 24 小时内回复。</p>
            </div>
            <a href="cart.html" class="btn-soft">查看询价单 <span class="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-900 px-1 text-xs text-white hidden" data-cart-badge>0</span></a>
          </div>

          <div class="mt-5 grid gap-4 sm:grid-cols-2" id="variantSummary"></div>

          <div class="mt-6 grid gap-3 sm:grid-cols-[minmax(0,1fr),auto,auto] sm:items-end">
            <div>
              <label class="text-sm text-slate-700">规格</label>
              <select id="variantSelect" class="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm">
                ${variants.map((variant, idx) => `<option value="${idx}">${safeText(variant.sku)} / ${safeText(variant.form)}</option>`).join("")}
              </select>
            </div>
            <div>
              <label class="text-sm text-slate-700">数量 (kg)</label>
              <input id="qtyInput" type="number" min="1" value="1" class="mt-2 w-28 rounded-xl border border-slate-200 px-3 py-3 text-sm" />
            </div>
            <button id="addBtn" type="button" class="btn-primary">加入询价单</button>
          </div>

          <div class="mt-5 rounded-xl bg-sky-50 p-4">
            <div class="text-xs text-slate-500">报价方式</div>
            <div id="priceText" class="mt-1 text-2xl font-semibold text-slate-900">${formatPrice(currentVariant.price_cny)}</div>
          </div>

          <div class="mt-6">
            <div class="flex flex-wrap gap-2">
              <button type="button" class="tabBtn" data-tab="0">关键参数</button>
              <button type="button" class="tabBtn" data-tab="1">检测报告</button>
              <button type="button" class="tabBtn" data-tab="2">应用场景</button>
            </div>
            <div id="tabPanels" class="mt-4"></div>
          </div>
        </section>
      </div>
    </div>
  `;

  const summaryHost = document.getElementById("variantSummary");
  const variantSelect = document.getElementById("variantSelect");
  const priceText = document.getElementById("priceText");
  const tabPanels = document.getElementById("tabPanels");
  const addBtn = document.getElementById("addBtn");
  const qtyInput = document.getElementById("qtyInput");

  const applyVariant = (variant) => {
    currentVariant = variant;

    if (summaryHost) {
      summaryHost.innerHTML = variantSummary(variant);
    }

    if (priceText) {
      priceText.textContent = formatPrice(variant.price_cny);
    }

    if (tabPanels) {
      const tabs = renderVariantTabs(product, variant);
      tabPanels.innerHTML = tabs.map((panel, idx) => `<section class="tabPanel ${idx !== 0 ? "hidden" : ""}">${panel}</section>`).join("");
      bindTabSwitch(host);

      tabPanels.querySelectorAll("[data-open-report]").forEach((button) => {
        button.addEventListener("click", () => {
          openReport(button.dataset.openReport, button.dataset.reportSku || variant.sku);
        });
      });
    }

    if (addBtn) {
      addBtn.onclick = () => {
        addToCart({
          productId: product.id,
          productName: product.name,
          sku: safeText(variant.sku, `${product.id}-custom`),
          pack: safeText(variant.pack, "定制包装"),
          unitPrice: typeof variant.price_cny === "number" ? variant.price_cny : null,
          qty: Math.max(1, Number(qtyInput?.value) || 1)
        });
      };
    }

    initIcons();
    renderCartBadge();
  };

  variantSelect?.addEventListener("change", () => {
    const selected = variants[Number(variantSelect.value)] || variants[0] || {};
    applyVariant(selected);
  });

  applyVariant(currentVariant);
}

function renderCartPage() {
  const table = document.getElementById("cartTable");
  if (!table) return;

  const empty = document.getElementById("cartEmpty");
  const totalEl = document.getElementById("cartTotal");

  if (!state.cart.length) {
    table.innerHTML = "";
    if (empty) empty.classList.remove("hidden");
    if (totalEl) totalEl.textContent = "项目询价";
    syncCartForm();
    return;
  }

  if (empty) empty.classList.add("hidden");

  table.innerHTML = state.cart.map((item) => {
    const product = state.products.find((x) => x.id === item.productId);
    const preview = product?.image
      ? `<img src="${product.image}" alt="${safeText(item.productName)}" class="h-12 w-12 rounded-xl object-cover" loading="lazy"/>`
      : "";

    return `
      <tr class="border-b border-slate-100">
        <td class="px-2 py-4">
          <div class="flex items-center gap-3">
            ${preview}
            <div>
              <div class="text-sm font-medium text-slate-900">${safeText(item.productName)}</div>
              <div class="text-xs text-slate-500">${safeText(item.sku)} / ${safeText(item.pack, "-")}</div>
            </div>
          </div>
        </td>
        <td class="px-2 py-4 text-sm text-slate-600">${formatPrice(item.unitPrice)}</td>
        <td class="px-2 py-4">
          <div class="inline-flex items-center overflow-hidden rounded-xl border border-slate-200">
            <button type="button" class="px-3 py-2 text-slate-600 hover:bg-slate-50" data-dec="${item.sku}">-</button>
            <input type="number" min="1" value="${item.qty}" class="w-14 text-center text-sm" data-qty="${item.sku}" />
            <button type="button" class="px-3 py-2 text-slate-600 hover:bg-slate-50" data-inc="${item.sku}">+</button>
          </div>
        </td>
        <td class="px-2 py-4 text-right">
          <button type="button" class="text-sm text-rose-500 hover:text-rose-600" data-rm="${item.sku}">移除</button>
        </td>
      </tr>
    `;
  }).join("");

  table.querySelectorAll("[data-rm]").forEach((button) => {
    button.addEventListener("click", () => removeFromCart(button.dataset.rm));
  });

  table.querySelectorAll("[data-inc]").forEach((button) => {
    button.addEventListener("click", () => {
      const item = state.cart.find((x) => x.sku === button.dataset.inc);
      setCartQty(button.dataset.inc, (item?.qty || 1) + 1);
    });
  });

  table.querySelectorAll("[data-dec]").forEach((button) => {
    button.addEventListener("click", () => {
      const item = state.cart.find((x) => x.sku === button.dataset.dec);
      setCartQty(button.dataset.dec, (item?.qty || 1) - 1);
    });
  });

  table.querySelectorAll("[data-qty]").forEach((input) => {
    input.addEventListener("change", () => {
      setCartQty(input.dataset.qty, input.value);
    });
  });

  if (totalEl) {
    totalEl.textContent = cartHasPrice() ? formatPrice(cartNumericTotal()) : "项目询价";
  }

  syncCartForm();
}

function cartSummaryText() {
  if (!state.cart.length) return "";

  return state.cart
    .map((item) => [
      safeText(item.productName),
      safeText(item.sku),
      `qty:${item.qty}`,
      `pack:${safeText(item.pack, "-")}`
    ].join(" | "))
    .join("\n");
}

function syncCartForm() {
  const itemsInput = document.getElementById("cartItemsInput");
  const totalInput = document.getElementById("cartTotalInput");
  const countInput = document.getElementById("cartCountInput");

  if (itemsInput) itemsInput.value = cartSummaryText();
  if (totalInput) totalInput.value = cartHasPrice() ? String(cartNumericTotal()) : "项目询价";
  if (countInput) countInput.value = String(cartCount());
}

async function submitFormByFetch(form) {
  const body = new URLSearchParams(new FormData(form)).toString();
  await fetch(form.getAttribute("action") || window.location.pathname, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });
}

function bindCartForm() {
  const form = document.getElementById("cartForm");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    if (!state.cart.length) {
      event.preventDefault();
      toast("询价单为空，请先添加产品规格");
      return;
    }

    event.preventDefault();
    syncCartForm();

    try {
      await submitFormByFetch(form);
      form.reset();
      toast("询价需求已提交，我们会尽快联系你");
    } catch (_) {
      toast("提交失败，请稍后重试或直接联系销售");
    }
  });

  const clearButton = document.getElementById("clearCartBtn");
  clearButton?.addEventListener("click", clearCart);
}

function bindQuoteForm() {
  const form = document.getElementById("quoteForm");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      await submitFormByFetch(form);
      form.reset();
      toast("已收到你的需求，我们会在 24 小时内回复");
    } catch (_) {
      toast("提交失败，请稍后重试");
    }
  });
}

function initSpecSelector() {
  const wrap = document.getElementById("specSelector");
  if (!wrap) return;

  const productSelect = document.getElementById("specProduct");
  const mwSelect = document.getElementById("specMw");
  const endSelect = document.getElementById("specEnd");
  const formSelect = document.getElementById("specForm");
  const skuEl = document.getElementById("specSku");
  const priceEl = document.getElementById("specPrice");
  const addButton = document.getElementById("specAddBtn");

  if (!productSelect || !mwSelect || !endSelect || !formSelect || !skuEl || !priceEl || !addButton) return;

  const candidates = state.products.filter((item) => Array.isArray(item.variants) && item.variants.length);
  if (!candidates.length) return;

  const uniq = (list) => Array.from(new Set(list.filter(Boolean)));

  productSelect.innerHTML = candidates.map((item) => `<option value="${item.id}">${item.name}</option>`).join("");

  const updateSelection = () => {
    const product = candidates.find((item) => item.id === productSelect.value) || candidates[0];
    const variants = product.variants || [];

    const mwOptions = uniq(variants.map((variant) => variant.mw));
    const endOptions = uniq(variants.map((variant) => variant.end_group));
    const formOptions = uniq(variants.map((variant) => variant.form));

    mwSelect.innerHTML = mwOptions.map((option) => `<option value="${option}">${option}</option>`).join("");
    endSelect.innerHTML = endOptions.map((option) => `<option value="${option}">${option}</option>`).join("");
    formSelect.innerHTML = formOptions.map((option) => `<option value="${option}">${option}</option>`).join("");

    updateVariant();
  };

  const updateVariant = () => {
    const product = candidates.find((item) => item.id === productSelect.value) || candidates[0];
    const variants = product.variants || [];

    const variant = variants.find((item) =>
      item.mw === mwSelect.value && item.end_group === endSelect.value && item.form === formSelect.value
    ) || variants[0] || {};

    skuEl.textContent = safeText(variant.sku);
    priceEl.textContent = formatPrice(variant.price_cny);

    addButton.onclick = () => {
      addToCart({
        productId: product.id,
        productName: product.name,
        sku: safeText(variant.sku, `${product.id}-custom`),
        pack: safeText(variant.pack, "定制包装"),
        unitPrice: typeof variant.price_cny === "number" ? variant.price_cny : null,
        qty: 1
      });
    };
  };

  productSelect.addEventListener("change", updateSelection);
  mwSelect.addEventListener("change", updateVariant);
  endSelect.addEventListener("change", updateVariant);
  formSelect.addEventListener("change", updateVariant);

  updateSelection();
}

function bindMobileMenu() {
  const toggle = document.querySelector("[data-menu-toggle]");
  const menu = document.getElementById("mobileMenu");
  if (!toggle || !menu) return;

  toggle.addEventListener("click", () => {
    menu.classList.toggle("hidden");
  });
}

function bindReportModal() {
  const close = document.getElementById("closeReportBtn");
  const backdrop = document.getElementById("reportBackdrop");
  close?.addEventListener("click", closeReport);
  backdrop?.addEventListener("click", closeReport);
}

async function loadProducts() {
  try {
    const response = await fetch("assets/data/products.json", { cache: "no-store" });
    if (!response.ok) throw new Error("load failed");
    state.products = await response.json();
  } catch (_) {
    state.products = [];
    toast("产品数据加载失败，请检查 assets/data/products.json");
  }
}

async function init() {
  bindMobileMenu();
  bindReportModal();
  bindQuoteForm();
  bindCartForm();

  renderCartBadge();

  await loadProducts();

  renderFilters();
  renderCatalog();
  renderProductDetail();
  renderCartPage();
  initSpecSelector();

  initIcons();
}

document.addEventListener("DOMContentLoaded", init);
