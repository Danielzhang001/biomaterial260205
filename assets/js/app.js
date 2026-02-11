const ALL = "全部分类";

const PRODUCT_META = {
  plla: {
    name: "聚左旋乳酸 PLLA",
    tagline: "高强度可吸收聚合物，适用于骨科与支架场景",
    category: "医用可吸收高分子",
    description: "PLLA 具备较高机械强度和中长期降解特性，支持分子量、端基、形态和包装定制。",
    applications: ["骨科固定", "可吸收膜材", "组织工程支架", "中长期缓释载体"]
  },
  pdlla: {
    name: "聚消旋乳酸 PDLLA",
    tagline: "无定形体系，降解速度快于 PLLA",
    category: "医用可吸收高分子",
    description: "PDLLA 适用于中短期支撑及药物递送，常用于可吸收填充和修复方案。",
    applications: ["药物缓释基体", "组织修复", "短中期固定", "可吸收填充"]
  },
  plga: {
    name: "聚乳酸-羟基乙酸共聚物 PLGA",
    tagline: "LA:GA 比例可调，释放周期可设计",
    category: "医用可吸收高分子",
    description: "PLGA 通过配比实现降解速率和力学窗口调控，适用于微球、膜材与可吸收器械。",
    applications: ["缓释微球", "组织工程", "抗粘连膜", "可吸收器械"]
  },
  ppdo: {
    name: "聚对二氧环己酮 PPDO",
    tagline: "高柔韧可吸收材料，适配缝线与软组织修复",
    category: "医用可吸收高分子",
    description: "PPDO 兼具柔韧性与延展性，适合单丝、编织和中期支撑类应用。",
    applications: ["可吸收缝线", "软组织修复", "可吸收网片", "中期支撑部件"]
  },
  pcl: {
    name: "聚己内酯 PCL",
    tagline: "低熔点、可加工性强的可吸收材料",
    category: "医用可吸收高分子",
    description: "PCL 适用于挤出、注塑、3D 打印及复合改性，在医美和组织工程中应用广泛。",
    applications: ["3D 打印耗材", "组织工程", "医美填充", "复合材料改性"]
  },
  pgcl: {
    name: "聚乙丙交酯 PGCL",
    tagline: "柔韧性优异的可吸收共聚体系",
    category: "医用可吸收高分子",
    description: "PGCL 在弹性和降解速率之间取得平衡，常用于软组织修复类器械。",
    applications: ["软组织修复", "可吸收缝线", "薄膜与管材", "弹性支撑结构"]
  },
  "l-la": {
    name: "L-乳酸单体",
    tagline: "医药级可聚合原料",
    category: "医药级单体",
    description: "用于高纯度可吸收聚合物合成，支持纯度与水分等关键指标控制。",
    applications: ["聚合原料", "工艺开发", "中试放大", "质量对照"]
  },
  "d-la": {
    name: "D-乳酸单体",
    tagline: "立体构型调控用关键单体",
    category: "医药级单体",
    description: "用于共聚及立构调控，适配科研与工艺验证场景。",
    applications: ["共聚改性", "立构调控", "工艺开发", "对照验证"]
  },
  "dl-la": {
    name: "DL-乳酸单体",
    tagline: "无定形聚乳酸体系常用原料",
    category: "医药级单体",
    description: "适用于 PDLLA 等体系开发，支持定制化供应。",
    applications: ["PDLLA 合成", "原料评估", "中试验证", "定制合成"]
  },
  "plla-ms": {
    name: "PLLA 微球",
    tagline: "中长期释放与支撑场景",
    category: "可吸收微球",
    description: "可按粒径、分布与端基定制，支持药械项目开发。",
    applications: ["缓释系统", "组织修复", "填充体系", "项目验证"]
  },
  "pdlla-ms": {
    name: "PDLLA 微球",
    tagline: "短中周期释放微球体系",
    category: "可吸收微球",
    description: "适合快速验证与短中周期释放需求。",
    applications: ["缓释载体", "注射微球", "工艺评估", "中试开发"]
  },
  "ppdo-ms": {
    name: "PPDO 微球",
    tagline: "柔性体系微球解决方案",
    category: "可吸收微球",
    description: "聚焦柔性体系开发，支持定制粒径与表面特性。",
    applications: ["柔性填充", "药械结合", "项目开发", "工艺放大"]
  },
  "plga-ms": {
    name: "PLGA 微球",
    tagline: "最常用可降解缓释微球平台",
    category: "可吸收微球",
    description: "可覆盖月级到季度级释放策略，适用于多种药物体系。",
    applications: ["长效注射", "月级释放", "工艺验证", "放大生产"]
  },
  "service-injection": {
    name: "注塑加工服务",
    tagline: "医疗级注塑打样与工艺窗口建立",
    category: "加工服务",
    description: "提供原料评估、模具配合、打样验证与参数优化。",
    applications: ["结构件打样", "工艺窗口", "可靠性测试", "小批试制"]
  },
  "service-microsphere": {
    name: "微球制备服务",
    tagline: "乳化固化与粒径分布控制",
    category: "加工服务",
    description: "覆盖处方筛选、粒径控制、残溶优化与放大验证。",
    applications: ["处方开发", "工艺开发", "放大验证", "质量控制"]
  },
  "service-3d": {
    name: "3D 打印耗材开发",
    tagline: "医疗级可吸收打印材料与参数配套",
    category: "加工服务",
    description: "提供线材/颗粒开发、打印参数匹配和样件验证。",
    applications: ["线材开发", "打印参数", "样件测试", "应用验证"]
  },
  bg45s5: {
    name: "生物活性玻璃 45S5",
    tagline: "骨修复常用生物活性无机材料",
    category: "生物陶瓷",
    description: "用于骨缺损修复和复合改性体系，支持粒径和包装定制。",
    applications: ["骨修复", "复合改性", "涂层应用", "材料开发"]
  },
  "beta-tcp": {
    name: "β-TCP 磷酸三钙",
    tagline: "骨传导常用生物陶瓷材料",
    category: "生物陶瓷",
    description: "适用于骨替代和骨填充复合体系。",
    applications: ["骨填充", "复合支架", "骨传导", "涂层体系"]
  },
  ha: {
    name: "羟基磷灰石 HA",
    tagline: "高生物相容性钙磷材料",
    category: "生物陶瓷",
    description: "常用于骨组织工程和复合改性，支持粒径和纯度控制。",
    applications: ["骨组织工程", "复合材料", "涂层开发", "修复填充"]
  }
};

const state = {
  products: []
};

function $(selector) {
  return document.querySelector(selector);
}

function showToast(text) {
  const toast = $("#toast");
  if (!toast) return;
  toast.textContent = text;
  toast.classList.add("show");
  clearTimeout(showToast._timer);
  showToast._timer = window.setTimeout(() => toast.classList.remove("show"), 2200);
}

function safe(value, fallback = "-") {
  if (value === null || value === undefined) return fallback;
  const text = String(value).trim();
  return text || fallback;
}

function priceText(value) {
  return typeof value === "number" && !Number.isNaN(value) ? `¥${value.toLocaleString("zh-CN")}` : "项目询价";
}

function normalizeVariant(raw) {
  const v = raw && typeof raw === "object" ? raw : {};
  return {
    sku: safe(v.sku, "CUSTOM-SKU"),
    mw: safe(v.mw, "可定制"),
    end_group: safe(v.end_group, "可定制"),
    form: safe(v.form, "可定制"),
    pack: safe(v.pack, "可定制"),
    lead_time: safe(v.lead_time, "7-15 个工作日"),
    iv: safe(v.iv, "可定制"),
    price_cny: typeof v.price_cny === "number" ? v.price_cny : null,
    properties: v.properties && typeof v.properties === "object" ? v.properties : {},
    reports: Array.isArray(v.reports)
      ? v.reports
          .map((item) => ({ name: safe(item?.name, "检测报告"), file: safe(item?.file, "") }))
          .filter((item) => item.file)
      : []
  };
}

function normalizeProduct(raw, idx) {
  const base = raw && typeof raw === "object" ? raw : {};
  const id = safe(base.id, `product-${idx + 1}`).toLowerCase();
  const meta = PRODUCT_META[id] || {};

  return {
    id,
    name: safe(meta.name || base.name, `产品 ${idx + 1}`),
    tagline: safe(meta.tagline || base.tagline, "医疗级生物材料"),
    category: safe(meta.category || base.category, "未分类"),
    description: safe(meta.description || base.description, "支持分子量、端基、形态及包装定制。"),
    applications: Array.isArray(meta.applications)
      ? meta.applications
      : Array.isArray(base.applications)
        ? base.applications.map((x) => safe(x)).filter(Boolean)
        : [],
    image: safe(base.image).replace(/\.(png|jpg|jpeg)$/i, ".webp"),
    variants: Array.isArray(base.variants) && base.variants.length
      ? base.variants.map(normalizeVariant)
      : [normalizeVariant({ sku: `${id}-CUSTOM` })]
  };
}

async function loadProducts() {
  try {
    const response = await fetch("assets/data/products.json", { cache: "no-store" });
    if (!response.ok) throw new Error("load failed");
    const data = await response.json();
    state.products = Array.isArray(data) ? data.map(normalizeProduct) : [];
  } catch (_) {
    state.products = [];
    showToast("产品数据加载失败，请检查 assets/data/products.json");
  }
}

function cardHTML(product) {
  return `
    <article class="card product-card">
      <div class="media"><img src="${safe(product.image, "assets/images/materials/plga.webp")}" alt="${safe(product.name)}" loading="lazy"/></div>
      <div class="card-pad stack">
        <span class="badge">${safe(product.category)}</span>
        <h3>${safe(product.name)}</h3>
        <p>${safe(product.tagline)}</p>
        <div class="inline" style="justify-content:space-between; margin-top:8px;">
          <strong style="color:#1c4f83;">${priceText(product.variants[0]?.price_cny)}</strong>
          <a class="btn btn-outline" href="product.html?id=${encodeURIComponent(product.id)}">查看详情</a>
        </div>
      </div>
    </article>
  `;
}

function renderHomeFeatured() {
  const host = $("#featuredProducts");
  if (!host) return;
  const items = state.products.filter((item) => item.category !== "加工服务").slice(0, 3);
  host.innerHTML = items.length ? items.map(cardHTML).join("") : "<div class='notice'>暂无产品数据</div>";
}

function renderProductsPage() {
  const grid = $("#productsGrid");
  if (!grid) return;

  const search = $("#productSearch");
  const select = $("#productCategory");
  const count = $("#productCount");
  const categories = [ALL, ...new Set(state.products.map((p) => p.category))];

  if (select) {
    select.innerHTML = categories.map((c) => `<option value="${c}">${c}</option>`).join("");
  }

  const render = () => {
    const keyword = safe(search?.value, "").toLowerCase();
    const category = safe(select?.value, ALL);

    const filtered = state.products.filter((item) => {
      const categoryMatch = category === ALL || item.category === category;
      const searchMatch = !keyword || `${item.name} ${item.tagline} ${item.description}`.toLowerCase().includes(keyword);
      return categoryMatch && searchMatch;
    });

    grid.innerHTML = filtered.length ? filtered.map(cardHTML).join("") : "<div class='notice'>未找到匹配结果，请调整筛选条件。</div>";
    if (count) count.textContent = `共 ${filtered.length} 项`;
    initIcons();
  };

  search?.addEventListener("input", render);
  select?.addEventListener("change", render);
  render();
}

function renderProductDetail() {
  const host = $("#productDetail");
  if (!host) return;

  const id = new URLSearchParams(window.location.search).get("id");
  const product = state.products.find((item) => item.id === id) || state.products[0];

  if (!product) {
    host.innerHTML = "<div class='notice'>未找到产品信息。</div>";
    return;
  }

  host.innerHTML = `
    <div class="grid two">
      <article class="card">
        <div class="media"><img src="${safe(product.image)}" alt="${safe(product.name)}" loading="lazy"/></div>
        <div class="card-pad stack">
          <span class="badge">${safe(product.category)}</span>
          <h1 class="section-title" style="font-size:30px;">${safe(product.name)}</h1>
          <p>${safe(product.description)}</p>
          <div class="stack">
            ${(product.applications || []).slice(0, 4).map((item) => `<div class="notice">${safe(item)}</div>`).join("")}
          </div>
        </div>
      </article>

      <section class="card card-pad stack">
        <div class="inline" style="justify-content:space-between; align-items:center;">
          <h2 style="margin:0;color:#1e2b3a;">规格与参数</h2>
          <a class="btn btn-primary" id="toContactBtn" href="contact.html?product=${encodeURIComponent(product.name)}">提交询价</a>
        </div>

        <div>
          <label for="variantSelect">规格型号</label>
          <select id="variantSelect" class="select">
            ${product.variants.map((v, idx) => `<option value="${idx}">${safe(v.sku)} / ${safe(v.form)}</option>`).join("")}
          </select>
        </div>

        <div class="grid two" id="variantSummary"></div>

        <div>
          <h3 style="margin:6px 0 10px;color:#1e2b3a;">关键参数</h3>
          <table class="table">
            <tbody id="variantProps"></tbody>
          </table>
        </div>

        <div id="variantReports" class="stack"></div>
      </section>
    </div>
  `;

  const select = $("#variantSelect");
  const summary = $("#variantSummary");
  const props = $("#variantProps");
  const reports = $("#variantReports");
  const toContactBtn = $("#toContactBtn");

  const applyVariant = (idx) => {
    const v = product.variants[idx] || product.variants[0];

    const rows = [
      ["SKU", v.sku],
      ["分子量", v.mw],
      ["端基", v.end_group],
      ["形态", v.form],
      ["包装", v.pack],
      ["交付周期", v.lead_time],
      ["报价", priceText(v.price_cny)]
    ];

    summary.innerHTML = rows
      .map((row) => `<div class="kpi"><strong style="font-size:16px;">${safe(row[1])}</strong><p>${row[0]}</p></div>`)
      .join("");

    const propRows = Object.entries(v.properties || {});
    props.innerHTML = propRows.length
      ? propRows.map(([k, val]) => `<tr><th>${safe(k)}</th><td>${safe(val)}</td></tr>`).join("")
      : "<tr><th>说明</th><td>当前规格暂无额外属性，支持按项目定制。</td></tr>";

    reports.innerHTML = v.reports.length
      ? v.reports.map((r) => `<a class="btn btn-outline" href="${safe(r.file)}" target="_blank" rel="noopener">${safe(r.name)}</a>`).join("")
      : "<div class='notice'>暂无可预览报告，提交需求后可由销售发送对应批次文件。</div>";

    toContactBtn.href = `contact.html?product=${encodeURIComponent(product.name)}&sku=${encodeURIComponent(v.sku)}`;
  };

  select?.addEventListener("change", () => applyVariant(Number(select.value)));
  applyVariant(0);
}

function bindMobileMenu() {
  const btn = $("#menuToggle");
  const menu = $("#mobileNav");
  if (!btn || !menu) return;

  btn.addEventListener("click", () => {
    const open = menu.classList.toggle("open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  });
}

function highlightNav() {
  const page = safe(document.body.dataset.page, "");
  document.querySelectorAll("[data-nav]").forEach((node) => {
    node.classList.toggle("active", node.dataset.nav === page);
  });
}

function fillContactContext() {
  const form = $("#contactForm");
  if (!form) return;

  const query = new URLSearchParams(window.location.search);
  const product = query.get("product");
  const sku = query.get("sku");

  const interestInput = $("#interestField");
  const messageInput = $("#messageField");

  if (product && interestInput) {
    interestInput.value = product;
  }

  if ((product || sku) && messageInput && !messageInput.value.trim()) {
    const prefill = [
      product ? `意向产品：${product}` : "",
      sku ? `意向规格：${sku}` : "",
      "请补充应用方向、预计用量和目标周期。"
    ].filter(Boolean).join("\n");

    messageInput.value = prefill;
  }
}

function bindApiForms() {
  document.querySelectorAll("[data-api-form]").forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const payload = Object.fromEntries(new FormData(form).entries());
      payload.page = window.location.pathname;
      payload.source = form.dataset.apiForm || "website";
      payload.submitted_at = new Date().toISOString();

      try {
        const response = await fetch(form.getAttribute("action") || "/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        const result = await response.json().catch(() => ({}));
        if (!response.ok || !result.ok) {
          throw new Error(result.error || "提交失败");
        }

        form.reset();
        fillContactContext();
        showToast("提交成功，我们会尽快联系你。");
      } catch (error) {
        showToast(`提交失败：${error.message || "请稍后重试"}`);
      }
    });
  });
}

function setYear() {
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });
}

function initIcons() {
  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons();
  }
}

async function init() {
  highlightNav();
  bindMobileMenu();
  setYear();
  bindApiForms();

  await loadProducts();
  renderHomeFeatured();
  renderProductsPage();
  renderProductDetail();
  fillContactContext();

  initIcons();
}

document.addEventListener("DOMContentLoaded", init);
