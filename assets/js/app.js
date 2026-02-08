
const SVG = {
  bottle(plabel){
    return `
    <svg viewBox="0 0 220 220" class="w-full h-full" aria-hidden="true">
      <defs>
        <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="rgba(255,255,255,.9)"/>
          <stop offset="100%" stop-color="rgba(255,255,255,.2)"/>
        </linearGradient>
        <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="rgba(17,24,39,.9)"/>
          <stop offset="100%" stop-color="rgba(17,24,39,.55)"/>
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="220" height="220" rx="24" fill="url(#g2)"/>
      <g transform="translate(62,26)">
        <rect x="34" y="0" width="28" height="22" rx="6" fill="rgba(255,255,255,.9)"/>
        <rect x="25" y="16" width="46" height="20" rx="8" fill="rgba(255,255,255,.75)"/>
        <rect x="12" y="32" width="72" height="138" rx="22" fill="rgba(255,255,255,.14)" stroke="rgba(255,255,255,.25)"/>
        <rect x="18" y="78" width="60" height="54" rx="14" fill="url(#g1)" stroke="rgba(255,255,255,.35)"/>
        <text x="48" y="110" text-anchor="middle" font-size="16" font-weight="700" fill="rgba(17,24,39,.92)">${plabel}</text>
        <text x="48" y="128" text-anchor="middle" font-size="10" fill="rgba(17,24,39,.75)">Medical grade</text>
        <path d="M18 150 C40 138, 56 166, 78 150" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="2"/>
      </g>
    </svg>`;
  },
  microspheres(){
    const circles = Array.from({length:22}).map((_,i)=>{
      const x = 30 + (i%6)*28 + (i%2)*8;
      const y = 40 + Math.floor(i/6)*32 + (i%3)*6;
      const r = 10 + (i%4)*2;
      return `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#rg)" stroke="rgba(255,255,255,.18)"/>`;
    }).join('');
    return `
    <svg viewBox="0 0 220 220" class="w-full h-full" aria-hidden="true">
      <defs>
        <radialGradient id="rg" cx="50%" cy="45%" r="70%">
          <stop offset="0%" stop-color="rgba(255,255,255,.9)"/>
          <stop offset="45%" stop-color="rgba(255,255,255,.2)"/>
          <stop offset="100%" stop-color="rgba(255,255,255,.08)"/>
        </radialGradient>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="rgba(15,23,42,.95)"/>
          <stop offset="100%" stop-color="rgba(30,41,59,.7)"/>
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="220" height="220" rx="24" fill="url(#bg)"/>
      <g opacity="0.95">${circles}</g>
      <text x="110" y="196" text-anchor="middle" font-size="14" font-weight="700" fill="rgba(255,255,255,.85)">Microspheres</text>
    </svg>`;
  }
};

const PRODUCT_CATEGORIES = ['全部', '生物医用单体', '生物医用聚合物', '生物医用微球', '医用加工服务', '生物医用陶瓷'];

const FIELD_LABELS = {
  company: '公司/团队',
  contact: '联系人',
  email: '邮箱',
  phone: '电话',
  application: '应用领域',
  usage: '预计用量',
  requirements: '需求描述',
  notes: '补充说明',
  cart_items: '询价条目',
  cart_total: '预估总价',
  cart_count: '总数量'
};

const initialCategory = getQueryParam('category');

const state = {
  products: [],
  filter: {
    q: '',
    category: PRODUCT_CATEGORIES.includes(initialCategory) ? initialCategory : '全部',
    polymer: '全部'
  },
  cart: JSON.parse(localStorage.getItem('cart') || '[]')
};

function money(n){
  return '询价';
}

function saveCart(){
  localStorage.setItem('cart', JSON.stringify(state.cart));
  renderCartBadge();
  syncCartForm();
}

function addToCart(item){
  const existing = state.cart.find(x => x.sku === item.sku);
  if(existing) existing.qty += item.qty;
  else state.cart.push(item);
  saveCart();
  toast('已加入询价单');
}

function removeFromCart(sku){
  state.cart = state.cart.filter(x => x.sku !== sku);
  saveCart();
  renderCartPage();
}

function setQty(sku, qty){
  const it = state.cart.find(x => x.sku === sku);
  if(it) it.qty = Math.max(1, qty);
  saveCart();
  renderCartPage();
}

function renderCartBadge(){
  const el = document.querySelector('[data-cart-badge]');
  if(!el) return;
  const count = state.cart.reduce((s,x)=>s+x.qty,0);
  el.textContent = count;
  el.classList.toggle('hidden', count===0);
}

function toast(msg){
  const t = document.getElementById('toast');
  if(!t) return;
  t.textContent = msg;
  t.classList.remove('opacity-0','translate-y-2');
  setTimeout(()=>t.classList.add('opacity-0','translate-y-2'), 1600);
}

async function loadProducts(){
  const res = await fetch('assets/data/products.json');
  state.products = await res.json();
}

function matchProduct(p){
  const q = state.filter.q.trim().toLowerCase();
  const inQ = !q || (p.name + ' ' + p.tagline + ' ' + p.description).toLowerCase().includes(q) ||
    p.variants.some(v => (v.sku||'').toLowerCase().includes(q));
  const catOk = state.filter.category==='全部' || (p.category===state.filter.category);
  const polyOk = state.filter.polymer==='全部' || p.id===state.filter.polymer;
  return inQ && catOk && polyOk;
}

function productSvg(p){
  if(p.image_svg === 'microspheres') return SVG.microspheres();
  const label = {
    bottle_plla:'PLLA', bottle_ppdo:'PPDO', bottle_plga:'PLGA', bottle_pcl:'PCL'
  }[p.image_svg] || 'POLY';
  return SVG.bottle(label);
}

function productMedia(p){
  if(p.image){
    return `<img src="${p.image}" alt="${p.name}" class="w-full h-full object-cover" loading="lazy" decoding="async"/>`;
  }
  return productSvg(p);
}

function getProductById(id){
  return state.products.find(p => p.id === id);
}

function renderCatalog(){
  const grid = document.getElementById('productGrid');
  if(!grid) return;
  const items = state.products.filter(matchProduct);
  grid.innerHTML = items.map(p=>`
    <article class="catalog-hover-card group rounded-3xl border border-slate-200 glass-card transition overflow-hidden">
      <a href="product.html?id=${encodeURIComponent(p.id)}" class="block">
        <div class="catalog-visual aspect-[4/3]">
          <div class="card-art w-full h-full">${productMedia(p)}</div>
          <div class="catalog-overlay"></div>
          <div class="catalog-content">
            <h3 class="text-xl font-semibold tracking-tight text-white">${p.name}</h3>
            <p class="mt-2 text-sm text-slate-100 line-clamp-2">${p.tagline}</p>
          </div>
        </div>
      </a>
      <div class="p-4">
        <div class="flex items-center justify-between">
          <div class="text-sm text-slate-600">
            <span class="font-medium text-slate-900">${money(p.variants?.[0]?.price_cny)}</span>
            <span class="ml-2 text-xs text-slate-500">按项目报价</span>
          </div>
          <a href="product.html?id=${encodeURIComponent(p.id)}" class="btn-primary inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white px-3 py-2 text-sm hover:bg-slate-800 transition">
            进入详情
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </a>
        </div>
      </div>
    </article>
  `).join('');
  const rc = document.getElementById('resultCount');
  if(rc) rc.textContent = `${items.length} 个产品`;
}

function renderFilters(){
  const catSel = document.getElementById('catSelect');
  const polySel = document.getElementById('polySelect');
  if(catSel){
    catSel.innerHTML = PRODUCT_CATEGORIES.map(c=>`<option value="${c}">${c}</option>`).join('');
    catSel.value = state.filter.category;
    catSel.onchange = ()=>{ state.filter.category = catSel.value; renderCatalog(); };
  }
  if(polySel){
    const polys = [{id:'全部',name:'全部'}, ...state.products.map(p=>({id:p.id,name:p.name}))];
    polySel.innerHTML = polys.map(o=>`<option value="${o.id}">${o.name}</option>`).join('');
    polySel.value = state.filter.polymer;
    polySel.onchange = ()=>{ state.filter.polymer = polySel.value; renderCatalog(); };
  }
  const q = document.getElementById('qInput');
  if(q){
    q.oninput = ()=>{ state.filter.q = q.value; renderCatalog(); };
  }
}

function getQueryParam(key){
  return new URLSearchParams(location.search).get(key);
}

function normalizePropertyValue(key, value){
  const text = value == null ? '' : String(value).trim();
  if((key === 'Tg' || key === 'Tm') && (!text || text.toLowerCase() === 'null')){
    return '定制';
  }
  return text || '—';
}

function getSpecScope(product){
  if(product.spec_range) return product.spec_range;
  return {
    a_label: '粘均分子量',
    a_value: '0.6-100万（可定制）',
    b_label: '特性粘度',
    b_value: '0.3-5.0 dL/g（可定制）'
  };
}

function getSummaryCards(product, variant){
  const props = variant.properties || {};
  if(product.id === 'plla'){
    return [
      { label: '分子量 Mw', value: '可定制' },
      { label: '端基', value: '可定制' },
      { label: '黏度 IV', value: '可定制' },
      { label: '包装', value: variant.pack || '可定制' }
    ];
  }
  if(product.category === '生物医用单体'){
    return [
      { label: '纯度', value: props.purity || '≥99.0%' },
      { label: '形态', value: variant.form || '块状结晶/粉末' },
      { label: '水分', value: props.water || '≤0.1%' },
      { label: '包装', value: variant.pack || '可定制' }
    ];
  }
  if(product.category === '生物医用陶瓷'){
    return [
      { label: '形态', value: variant.form || '粉体/颗粒' },
      { label: '相特征', value: variant.crystallinity || '陶瓷晶相' },
      { label: '典型应用', value: product.applications?.[0] || '骨修复' },
      { label: '包装', value: variant.pack || '可定制' }
    ];
  }
  if(product.category === '医用加工服务'){
    return [
      { label: '服务类型', value: product.name.replace('医用加工服务：', '') },
      { label: '项目周期', value: variant.lead_time || '按项目评估' },
      { label: '交付', value: props.deliverables || '样件+参数建议' },
      { label: '报价方式', value: '项目询价' }
    ];
  }
  return [
    { label: '分子量 Mw', value: variant.mw || '—' },
    { label: '端基', value: variant.end_group || '—' },
    { label: '黏度 IV', value: variant.iv || '—' },
    { label: '包装', value: variant.pack || '—' }
  ];
}

function openReport(file, sku){
  const modal = document.getElementById('reportModal');
  const frame = document.getElementById('reportFrame');
  const title = document.getElementById('reportTitle');
  if(!modal || !frame) return;
  title.textContent = `检测报告：${sku}`;
  frame.src = file;
  modal.classList.remove('hidden');
}

function closeReport(){
  const modal = document.getElementById('reportModal');
  const frame = document.getElementById('reportFrame');
  if(frame) frame.src = 'about:blank';
  if(modal) modal.classList.add('hidden');
}

function renderProductDetail(){
  const wrap = document.getElementById('productDetail');
  if(!wrap) return;

  const pid = getQueryParam('id');
  const p = state.products.find(x=>x.id===pid) || state.products[0];
  if(!p) return;

  document.title = `${p.name}｜迪康医用材料`;

  wrap.innerHTML = `
    <div class="grid lg:grid-cols-12 gap-8">
      <div class="lg:col-span-5">
        <div class="glass-card hover-lift rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-sm">
          <div class="aspect-[4/3] card-visual">
            <span class="molecule-orbit"></span>
            <span class="molecule-orbit small"></span>
          <div class="card-art w-full h-full">${productMedia(p)}</div>
          </div>
          <div class="p-5">
            <h1 class="text-2xl font-semibold tracking-tight text-slate-900">${p.name}</h1>
            <p class="mt-2 text-slate-600 leading-relaxed">${p.description}</p>
            <div class="mt-4 flex flex-wrap gap-2">
              ${p.applications.slice(0,4).map(a=>`<span class="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700">${a}</span>`).join('')}
            </div>
          </div>
        </div>
        <div class="glass-card hover-lift mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 class="font-semibold text-slate-900">选型建议</h2>
          <ul class="mt-3 space-y-2 text-sm text-slate-700">
            <li class="flex gap-2"><span class="mt-1 h-1.5 w-1.5 rounded-full bg-slate-900"></span><span>强度优先：选更高分子量/更高黏度（需结合加工方式与灭菌条件验证）。</span></li>
            <li class="flex gap-2"><span class="mt-1 h-1.5 w-1.5 rounded-full bg-slate-900"></span><span>降解周期：通过分子量、共聚比例（PLGA）、结晶度与端基调控；建议用应用目标周期倒推材料窗口。</span></li>
            <li class="flex gap-2"><span class="mt-1 h-1.5 w-1.5 rounded-full bg-slate-900"></span><span>药物体系：优先评估溶剂相容性、玻璃化温度与载药释放曲线；可提供微球粒径与孔隙率调控服务。</span></li>
          </ul>
        </div>
      </div>

      <div class="lg:col-span-7">
        <div class="glass-card hover-lift rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div class="p-5 border-b border-slate-200">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 class="text-lg font-semibold text-slate-900">规格与报价</h2>
                <p class="text-sm text-slate-600 mt-1">选择规格后，可一键加入询价单；下单前可申请样品与技术沟通。</p>
              </div>
              <a href="cart.html" class="btn-ghost inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 hover:bg-slate-50">
                询价单
                <span class="relative ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-900 px-1 text-xs text-white hidden" data-cart-badge>0</span>
              </a>
            </div>
          </div>

          <div class="p-5">
            <div class="glass-card hover-lift rounded-2xl border border-slate-200 p-5 bg-slate-50">
              <div class="text-sm font-medium text-slate-900 mb-4">产品规格范围</div>
              <div class="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="text-slate-600">${getSpecScope(p).a_label}：</span>
                  <span class="font-medium text-slate-900">${getSpecScope(p).a_value}</span>
                </div>
                <div>
                  <span class="text-slate-600">${getSpecScope(p).b_label}：</span>
                  <span class="font-medium text-slate-900">${getSpecScope(p).b_value}</span>
                </div>
              </div>
            </div>

            <div class="mt-5 grid md:grid-cols-2 gap-4" id="variantSummary"></div>

            <div class="mt-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <div class="text-sm text-slate-600">报价方式</div>
                <div class="text-2xl font-semibold text-slate-900" id="priceText">询价</div>
                <div class="text-xs text-slate-500 mt-1">价格按需询价，销售团队将于24小时内联系。</div>
              </div>
              <div class="flex items-end gap-3">
                <div>
                  <label class="text-sm text-slate-700">购买量（kg）</label>
                  <input id="qtyInput" type="number" min="1" value="1"
                    class="mt-2 w-28 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"/>
                </div>
                <button id="addBtn" class="btn-primary rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800 transition">
                  加入询价单
                </button>
              </div>
            </div>

            <div class="mt-8">
              <div class="flex flex-wrap gap-2" role="tablist">
                ${['物理化学性质','检测报告','应用场景'].map((t,i)=>`
                  <button class="tabBtn rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                          data-tab="${i}">${t}</button>`).join('')}
              </div>

              <div class="mt-4" id="tabPanels"></div>
            </div>
          </div>
        </div>

        <div class="glass-card hover-lift mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 class="text-lg font-semibold text-slate-900">产品信息</h2>
          <div class="mt-4 grid lg:grid-cols-2 gap-6">
            <div class="space-y-4 text-sm text-slate-700">
              <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 class="font-medium text-slate-900">产品介绍</h3>
                <p class="mt-2 leading-relaxed">${p.description}</p>
              </div>
              <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 class="font-medium text-slate-900">应用场景</h3>
                <ul class="mt-2 space-y-1">
                  ${p.applications.map(app => `<li class="flex gap-2"><span class="text-slate-400">•</span><span>${app}</span></li>`).join('')}
                </ul>
              </div>
            </div>
            <div>
              <div class="card-visual aspect-[4/3] rounded-2xl overflow-hidden border border-slate-200">
                ${productMedia(p)}
              </div>
              <div class="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 class="font-medium text-slate-900">产品指标</h3>
                <div class="mt-3 grid gap-3 text-sm">
                  <div class="rounded-xl border border-slate-200 bg-white px-3 py-2">
                    <div class="text-xs text-slate-500">粘均分子量</div>
                    <div class="font-semibold text-slate-900">0.6-100万</div>
                  </div>
                  <div class="rounded-xl border border-slate-200 bg-white px-3 py-2">
                    <div class="text-xs text-slate-500">特性粘度</div>
                    <div class="font-semibold text-slate-900">0.3-5dL/g</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  const qtyInput = document.getElementById('qtyInput');
  const addBtn = document.getElementById('addBtn');
  const tabPanels = document.getElementById('tabPanels');

  // 使用第一个产品变体作为默认值
  const defaultVariant = p.variants[0];

  function renderVariant(){
    const v = defaultVariant;
    document.getElementById('priceText').textContent = money(v.price_cny);

    const summary = document.getElementById('variantSummary');
    const summaryCards = getSummaryCards(p, v);
    summary.innerHTML = summaryCards.map((item)=>`
      <div class="glass-card hover-lift rounded-2xl border border-slate-200 p-4">
        <div class="text-xs text-slate-500">${item.label}</div>
        <div class="mt-1 font-semibold text-slate-900">${item.value}</div>
      </div>
    `).join('');

    const propsRows = Object.entries(v.properties || {}).map(([k,val])=>`
      <tr class="border-b border-slate-100">
        <td class="py-3 pr-4 text-sm text-slate-600 w-1/3">${k}</td>
        <td class="py-3 text-sm font-medium text-slate-900">${normalizePropertyValue(k, val)}</td>
      </tr>
    `).join('');

    const reportCards = (v.reports||[]).map(r=>`
      <div class="glass-card hover-lift rounded-2xl border border-slate-200 p-4 flex items-center justify-between gap-3">
        <div class="min-w-0">
          <div class="font-medium text-slate-900">${r.name}</div>
          <div class="text-xs text-slate-500 mt-1">点击预览/下载（PDF）</div>
        </div>
        <button class="btn-primary rounded-xl bg-slate-900 text-white px-4 py-2 text-sm hover:bg-slate-800" data-open-report="${r.file}">查看</button>
      </div>
    `).join('') || `<div class="text-sm text-slate-600">暂无可展示报告。</div>`;

    const appList = `
      <div class="grid sm:grid-cols-2 gap-3">
        ${p.applications.map(a=>`
          <div class="glass-card hover-lift rounded-2xl border border-slate-200 p-4">
            <div class="font-medium text-slate-900">${a}</div>
            <div class="mt-1 text-xs text-slate-500">如需器械级验证资料，可提交应用场景，我们将推荐规格窗口与检测项。</div>
          </div>`).join('')}
      </div>
    `;

    const panels = [
      `<div class="rounded-2xl border border-slate-200 overflow-hidden"><table class="w-full">${propsRows || `<tr><td class="p-4 text-sm text-slate-600">暂无数据</td></tr>`}</table></div>`,
      `<div class="space-y-3">${reportCards}</div>`,
      appList
    ];

    tabPanels.innerHTML = panels.map((html,i)=>`<section class="tabPanel" data-panel="${i}">${html}</section>`).join('');

    const tabBtns = wrap.querySelectorAll('.tabBtn');
    const tabPanelsEls = wrap.querySelectorAll('.tabPanel');
    function setTab(i){
      tabBtns.forEach((b,bi)=>b.className = 'tabBtn rounded-full border px-4 py-2 text-sm ' +
        (bi===i?'border-slate-900 bg-slate-900 text-white':'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'));
      tabPanelsEls.forEach((pnl,pi)=>pnl.style.display = (pi===i?'block':'none'));
    }
    tabBtns.forEach((b)=>b.onclick=()=>setTab(Number(b.dataset.tab)));
    setTab(0);

    wrap.querySelectorAll('[data-open-report]').forEach(btn=>{
      btn.onclick = ()=>openReport(btn.dataset.openReport, v.sku);
    });

    addBtn.onclick = ()=>{
      addToCart({
        productId:p.id,
        productName:p.name,
        sku:v.sku,
        pack:v.pack,
        unitPrice:v.price_cny,
        qty: Math.max(1, Number(qtyInput.value||1))
      });
    };
  }

  renderVariant();
  renderCartBadge();
}

function renderCartPage(){
  const table = document.getElementById('cartTable');
  const empty = document.getElementById('cartEmpty');
  if(!table) return;

  if(state.cart.length===0){
    table.innerHTML = '';
    if(empty) empty.classList.remove('hidden');
    const totalEl = document.getElementById('cartTotal');
    if(totalEl) totalEl.textContent = '询价';
    syncCartForm();
    return;
  }
  if(empty) empty.classList.add('hidden');

  table.innerHTML = state.cart.map(it=>{
    const p = getProductById(it.productId);
    const img = p?.image ? `<img src="${p.image}" alt="${it.productName}" class="h-14 w-14 rounded-xl object-cover border border-slate-200"/>` : '';
    return `
    <tr class="border-b border-slate-100">
      <td class="py-4 pr-4">
        <div class="flex items-center gap-3">
          ${img}
          <div>
            <div class="font-medium text-slate-900">${it.productName}</div>
            <div class="text-xs text-slate-500 mt-1">${it.sku} · ${it.pack||''}</div>
          </div>
        </div>
      </td>
      <td class="py-4 pr-4 text-sm text-slate-700">${money(it.unitPrice)}</td>
      <td class="py-4 pr-4">
        <div class="inline-flex items-center rounded-xl border border-slate-200">
          <button class="px-3 py-2 text-slate-700 hover:bg-slate-50" data-dec="${it.sku}">-</button>
          <input class="w-16 text-center text-sm py-2 outline-none" value="${it.qty}" data-qty="${it.sku}"/>
          <button class="px-3 py-2 text-slate-700 hover:bg-slate-50" data-inc="${it.sku}">+</button>
        </div>
      </td>
      <td class="py-4 text-right">
        <button class="text-sm text-slate-700 hover:text-red-600" data-rm="${it.sku}">取消</button>
      </td>
    </tr>
  `;
  }).join('');

  table.querySelectorAll('[data-rm]').forEach(b=>b.onclick=()=>removeFromCart(b.dataset.rm));
  table.querySelectorAll('[data-inc]').forEach(b=>b.onclick=()=>setQty(b.dataset.inc, (state.cart.find(x=>x.sku===b.dataset.inc)?.qty||1)+1));
  table.querySelectorAll('[data-dec]').forEach(b=>b.onclick=()=>setQty(b.dataset.dec, (state.cart.find(x=>x.sku===b.dataset.dec)?.qty||1)-1));
  table.querySelectorAll('[data-qty]').forEach(inp=>inp.onchange=()=>setQty(inp.dataset.qty, Number(inp.value||1)));

  const total = state.cart.reduce((s,x)=>s+(x.unitPrice||0)*x.qty, 0);
  const totalEl = document.getElementById('cartTotal');
  if(totalEl) totalEl.textContent = '询价';
}


function cartSummaryText(){
  if(state.cart.length===0) return '';
  return state.cart.map(it=>[
    it.productName,
    it.sku,
    it.pack || '',
    `qty:${it.qty}`,
    `unit:${it.unitPrice ?? ''}`
  ].join(' | ')).join('\n');
}


function syncCartForm(){
  const itemsInput = document.getElementById('cartItemsInput');
  const totalInput = document.getElementById('cartTotalInput');
  const countInput = document.getElementById('cartCountInput');
  if(itemsInput) itemsInput.value = cartSummaryText();
  if(totalInput) totalInput.value = String(state.cart.reduce((s,x)=>s+(x.unitPrice||0)*x.qty, 0));
  if(countInput) countInput.value = String(state.cart.reduce((s,x)=>s+x.qty, 0));
}

function bindCartForm(){
  const form = document.getElementById('cartForm');
  if(!form) return;
  form.addEventListener('submit', async (e)=>{
    if(state.cart.length===0){
      e.preventDefault();
      toast('购物车为空，请先添加规格。');
      return;
    }
    e.preventDefault();
    syncCartForm();
    try{
      await fetch(form.getAttribute('action') || location.pathname, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(form)).toString()
      });
      form.reset();
      toast('感谢您的访问，将有专人沟通。');
    }catch(err){
      toast('提交失败，请稍后再试或直接联系。');
    }
  });
}

function initParticleNetwork(){
  const canvas = document.getElementById('particleNetwork');
  if(!canvas) return;
  if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ctx = canvas.getContext('2d');
  if(!ctx) return;

  let width = 0;
  let height = 0;
  let particles = [];

  function resize(){
    width = window.innerWidth;
    height = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(90, Math.floor(width / 14));
    particles = Array.from({length: count}).map(()=>({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: 1 + Math.random() * 1.6
    }));
  }

  function step(){
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(148,163,184,0.6)';
    ctx.strokeStyle = 'rgba(56,189,248,0.18)';
    ctx.lineWidth = 1;

    for(const p of particles){
      p.x += p.vx;
      p.y += p.vy;
      if(p.x < 0 || p.x > width) p.vx *= -1;
      if(p.y < 0 || p.y > height) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    for(let i=0; i<particles.length; i++){
      for(let j=i+1; j<particles.length; j++){
        const a = particles[i];
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if(dist < 120){
          ctx.globalAlpha = 1 - dist / 120;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(step);
  }

  resize();
  window.addEventListener('resize', resize);
  requestAnimationFrame(step);
}

function initFeishuWebhook(){
  const webhook = 'https://open.feishu.cn/open-apis/bot/v2/hook/1253e2da-3db8-4c86-9a6b-7fd839c5b44c';
  const forms = [
    document.getElementById('cartForm'),
    document.getElementById('quoteForm')
  ].filter(Boolean);

  if(forms.length === 0) return;

  forms.forEach(form => {
    form.addEventListener('submit', () => {
      const data = new FormData(form);
      const fields = [];
      data.forEach((value, key) => {
        if(key === 'bot-field' || key === 'form-name') return;
        if(!value) return;
        const v = String(value).trim();
        if(!v) return;
        const label = FIELD_LABELS[key] || key;
        const normalized = key === 'cart_items'
          ? v.split('\n').filter(Boolean).map((line, idx) => `${idx + 1}. ${line}`).join('\n')
          : v;
        fields.push({ label, value: normalized });
      });

      const title = form.id === 'cartForm' ? '新询价单提交' : '新样品/报价申请';
      const content = fields.map((item) => ([
        { tag: 'text', text: `${item.label}：` },
        { tag: 'text', text: `${item.value}\n` }
      ]));
      content.push([
        { tag: 'text', text: `提交时间：${new Date().toLocaleString('zh-CN', { hour12: false })}` }
      ]);

      fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          msg_type: 'post',
          content: {
            post: {
              zh_cn: {
                title,
                content
              }
            }
          }
        })
      }).catch(()=>{});
    });
  });
}

function bindQuoteForm(){
  const form = document.getElementById('quoteForm');
  if(!form) return;
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    try{
      await fetch(form.getAttribute('action') || location.pathname, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(form)).toString()
      });
      form.reset();
      toast('感谢您的访问，将有专人沟通。');
    }catch(err){
      toast('提交失败，请稍后再试或直接联系。');
    }
  });
}


function initSpecSelector(){
  const wrap = document.getElementById('specSelector');
  if(!wrap) return;
  const productSel = document.getElementById('specProduct');
  const mwSel = document.getElementById('specMw');
  const endSel = document.getElementById('specEnd');
  const formSel = document.getElementById('specForm');
  const skuEl = document.getElementById('specSku');
  const priceEl = document.getElementById('specPrice');
  const addBtn = document.getElementById('specAddBtn');

  const products = state.products.filter(p => ['plla','ppdo','plga','pcl','pdlla','pgcl'].includes(p.id));
  productSel.innerHTML = products.map(p => `<option value="${p.id}">${p.name}</option>`).join('');

  function uniq(arr){
    return Array.from(new Set(arr.filter(Boolean)));
  }

  function updateOptions(){
    const p = products.find(x => x.id === productSel.value) || products[0];
    const vars = p.variants || [];
    const mws = uniq(vars.map(v => v.mw));
    const ends = uniq(vars.map(v => v.end_group));
    const forms = uniq(vars.map(v => v.form));

    mwSel.innerHTML = mws.map(v => `<option value="${v}">${v}</option>`).join('');
    endSel.innerHTML = ends.map(v => `<option value="${v}">${v}</option>`).join('');
    formSel.innerHTML = forms.map(v => `<option value="${v}">${v}</option>`).join('');

    updateSelection();
  }

  function updateSelection(){
    const p = products.find(x => x.id === productSel.value) || products[0];
    const vars = p.variants || [];
    const v = vars.find(x => x.mw === mwSel.value && x.end_group === endSel.value && x.form === formSel.value)
      || vars.find(x => x.mw === mwSel.value && x.end_group === endSel.value)
      || vars[0];
    if(!v) return;
    skuEl.textContent = v.sku || '-';
    priceEl.textContent = v.price_cny ? money(v.price_cny) : '询价';

    if(addBtn){
      addBtn.onclick = () => {
        addToCart({
          productId: p.id,
          productName: p.name,
          sku: v.sku,
          pack: v.pack,
          unitPrice: v.price_cny,
          qty: 1
        });
      };
    }
  }

  productSel.onchange = updateOptions;
  mwSel.onchange = updateSelection;
  endSel.onchange = updateSelection;
  formSel.onchange = updateSelection;

  updateOptions();
}

function init(){
  bindCartForm();
  bindQuoteForm();
  initParticleNetwork();
  initFeishuWebhook();
  const closeBtn = document.getElementById('closeReportBtn');
  if(closeBtn) closeBtn.onclick = closeReport;
  const backdrop = document.getElementById('reportBackdrop');
  if(backdrop) backdrop.addEventListener('click', closeReport);

  loadProducts().then(()=>{
    renderCartBadge();
    renderFilters();
    initSpecSelector();
    renderCatalog();
    renderProductDetail();
    renderCartPage();
  });
}

document.addEventListener('DOMContentLoaded', init);
