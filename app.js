const productImages = [
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=180&q=80',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=180&q=80',
  'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=180&q=80',
  'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=180&q=80',
  'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=180&q=80'
];
let products = [
  { id: 1, name: 'سنيكرز Urban الأبيض', sku: 'MAR-001', category: 'أحذية', price: 249, sale: 199, stock: 42, status: 'نشط', date: 'منذ ساعتين', image: productImages[0], description: 'سنيكرز يومي بخامة مريحة وتصميم عصري.', details: 'مقاسات 39–44 · لون أبيض' },
  { id: 2, name: 'ساعة Minimal فضية', sku: 'MAR-024', category: 'إكسسوارات', price: 389, sale: null, stock: 18, status: 'نشط', date: 'منذ 5 ساعات', image: productImages[1], description: 'ساعة أنيقة بقرص بسيط وسوار معدني.', details: 'مقاومة للماء · ستانلس ستيل' },
  { id: 3, name: 'حقيبة كتف جلدية', sku: 'MAR-031', category: 'إكسسوارات', price: 299, sale: 249, stock: 7, status: 'منخفض المخزون', date: 'أمس', image: productImages[2], description: 'حقيبة عملية تناسب إطلالتك اليومية.', details: 'جلد نباتي · 3 جيوب داخلية' },
  { id: 4, name: 'كاميرا فورية Mini', sku: 'MAR-046', category: 'أزياء', price: 449, sale: null, stock: 26, status: 'نشط', date: 'أمس', image: productImages[3], description: 'كاميرا صغيرة لالتقاط اللحظات الجميلة.', details: 'فلاش تلقائي · لون أسود' },
  { id: 5, name: 'عطر Santal 50ml', sku: 'MAR-058', category: 'عناية', price: 179, sale: null, stock: 54, status: 'نشط', date: 'قبل يومين', image: productImages[4], description: 'رائحة دافئة بلمسات خشبية ناعمة.', details: '50 مل · ثبات طويل' },
  { id: 6, name: 'قميص كتان صيفي', sku: 'MAR-067', category: 'أزياء', price: 169, sale: 139, stock: 31, status: 'نشط', date: 'قبل 3 أيام', image: productImages[2], description: 'قميص كتان خفيف للجو الدافئ.', details: 'مقاسات S–XL · بيج' },
  { id: 7, name: 'محفظة جلدية صغيرة', sku: 'MAR-074', category: 'إكسسوارات', price: 89, sale: null, stock: 4, status: 'منخفض المخزون', date: 'قبل 3 أيام', image: productImages[2], description: 'محفظة صغيرة بترتيب عملي للبطاقات.', details: '6 خانات · بني' },
  { id: 8, name: 'تيشيرت Essential', sku: 'MAR-081', category: 'أزياء', price: 79, sale: null, stock: 0, status: 'مسودة', date: 'قبل 4 أيام', image: productImages[0], description: 'تيشيرت أساسي بقصة مريحة.', details: 'قطن 100% · رمادي' }
];
let categories = [
  { id: 1, name: 'أزياء', description: 'ملابس يومية وموسمية', count: 54, color: 'blue', updated: 'منذ يوم' },
  { id: 2, name: 'إكسسوارات', description: 'لمسات تكمل إطلالتك', count: 35, color: 'purple', updated: 'منذ 3 أيام' },
  { id: 3, name: 'أحذية', description: 'راحة وأناقة لكل خطوة', count: 23, color: 'orange', updated: 'منذ أسبوع' },
  { id: 4, name: 'عناية', description: 'منتجات للعناية اليومية', count: 16, color: 'green', updated: 'منذ أسبوع' }
];
let users = [
  { id: 1, name: 'سارة أحمد', email: 'sara@marostore.com', role: 'مديرة المتجر', status: 'نشط', last: 'الآن', initial: 'س', color: 'purple' },
  { id: 2, name: 'محمد خالد', email: 'mohamed@marostore.com', role: 'محرر المنتجات', status: 'نشط', last: 'منذ 20 دقيقة', initial: 'م', color: 'blue' },
  { id: 3, name: 'ليان عمر', email: 'layan@marostore.com', role: 'مشاهد', status: 'نشط', last: 'أمس، 08:42 م', initial: 'ل', color: 'orange' },
  { id: 4, name: 'يوسف عادل', email: 'yousef@marostore.com', role: 'محرر المنتجات', status: 'دعوة معلقة', last: 'لم يدخل بعد', initial: 'ي', color: 'green' }
];
let editingProductId = null;
let pendingDelete = null;
let toastTimer;

const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[char]));
const currency = value => `${Number(value || 0).toLocaleString('ar-SA')} ر.س`;
const icon = name => `<i data-lucide="${name}"></i>`;

function refreshIcons() { if (window.lucide) window.lucide.createIcons({ attrs: { 'stroke-width': 1.8 } }); }
function statusClass(status) { return status === 'نشط' ? 'active' : status === 'مسودة' ? 'draft' : 'low'; }
function productRow(product, compact = false) {
  return `<tr data-id="${product.id}">
    ${compact ? '' : '<td><input type="checkbox" aria-label="تحديد المنتج" /></td>'}
    <td><div class="product-cell"><img class="product-thumb" src="${product.image}" alt="${escapeHtml(product.name)}" onerror="this.style.visibility='hidden'" /><div class="product-name"><strong>${escapeHtml(product.name)}</strong><small>${escapeHtml(product.sku)}</small></div></div></td>
    ${compact ? `<td>${escapeHtml(product.category)}</td>` : `<td><span class="sku">${escapeHtml(product.sku)}</span></td><td>${escapeHtml(product.category)}</td>`}
    <td><div class="price">${currency(product.sale || product.price)}${product.sale ? `<del>${currency(product.price)}</del>` : ''}</div></td>
    <td><span class="stock">${product.stock.toLocaleString('ar-SA')}</span></td>
    <td><span class="status ${statusClass(product.status)}">${escapeHtml(product.status)}</span></td>
    ${compact ? '' : `<td><span class="muted">${escapeHtml(product.date)}</span></td>`}
    <td><button class="row-action" data-menu-product="${product.id}" aria-label="خيارات المنتج">${icon('more-horizontal')}</button></td>
  </tr>`;
}
function renderProducts() {
  const query = ($('#productSearch')?.value || $('#globalSearch')?.value || '').trim().toLowerCase();
  const category = $('#categoryFilter')?.value || 'all';
  const status = $('#statusFilter')?.value || 'all';
  const filtered = products.filter(product => {
    const matchesQuery = !query || `${product.name} ${product.sku} ${product.category}`.toLowerCase().includes(query);
    const matchesCategory = category === 'all' || product.category === category;
    const matchesStatus = status === 'all' || product.status === status;
    return matchesQuery && matchesCategory && matchesStatus;
  });
  const productsBody = $('#productsBody');
  const recentBody = $('#recentProductsBody');
  if (productsBody) productsBody.innerHTML = filtered.map(product => productRow(product)).join('') || `<tr><td colspan="9" class="empty-state">لا توجد منتجات تطابق بحثك.</td></tr>`;
  if (recentBody) recentBody.innerHTML = products.slice(0, 5).map(product => productRow(product, true)).join('');
  const count = $('#productCount');
  if (count) count.textContent = `${filtered.length} منتج${filtered.length === 1 ? '' : 'ات'}`;
  refreshIcons();
}
function renderCategories() {
  const cards = $('#categoryCards');
  const body = $('#categoriesBody');
  if (cards) cards.innerHTML = categories.map(category => `<article class="category-card"><div class="category-card-top"><span class="category-color ${category.color}">${icon(category.color === 'blue' ? 'shirt' : category.color === 'purple' ? 'watch' : category.color === 'orange' ? 'footprints' : 'sparkles')}</span><button class="row-action" data-menu-category="${category.id}">${icon('more-horizontal')}</button></div><h3>${escapeHtml(category.name)}</h3><p>${escapeHtml(category.description)}</p><div class="category-card-bottom"><span>عدد المنتجات</span><strong>${category.count}</strong></div></article>`).join('');
  if (body) body.innerHTML = categories.map(category => `<tr><td><div class="product-cell"><span class="category-color ${category.color}">${icon('folder')}</span><strong>${escapeHtml(category.name)}</strong></div></td><td class="muted">${escapeHtml(category.description)}</td><td><strong>${category.count} منتج</strong></td><td><span class="status active">نشط</span></td><td class="muted">${escapeHtml(category.updated)}</td><td><button class="row-action" data-menu-category="${category.id}">${icon('more-horizontal')}</button></td></tr>`).join('');
  refreshIcons();
}
function renderUsers() {
  const body = $('#usersBody');
  if (!body) return;
  body.innerHTML = users.map(user => `<tr><td><div class="user-cell"><span class="avatar avatar-${user.color}">${escapeHtml(user.initial)}</span><div><strong>${escapeHtml(user.name)}</strong><small>${escapeHtml(user.email)}</small></div></div></td><td><span class="role-tag">${escapeHtml(user.role)}</span></td><td class="muted">${escapeHtml(user.last)}</td><td><span class="status ${user.status === 'نشط' ? 'active' : 'draft'}">${escapeHtml(user.status)}</span></td><td><button class="row-action" data-menu-user="${user.id}">${icon('more-horizontal')}</button></td></tr>`).join('');
  refreshIcons();
}
function showModal(id) { const modal = $(`#${id}`); if (!modal) return; modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false'); setTimeout(() => modal.querySelector('input, select, textarea')?.focus(), 100); }
function closeModal(id) { const modal = $(`#${id}`); if (!modal) return; modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); }
function showToast(title = 'تمت العملية بنجاح', message = 'حُفظت التغييرات في لوحة التحكم.') { $('#toastTitle').textContent = title; $('#toastMessage').textContent = message; $('#toast').classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 3600); }
function openProductModal(id = null) {
  editingProductId = id;
  const form = $('#productForm'); form.reset(); $('#imagePreview').style.display = 'none'; $('#uploadBox').style.display = 'flex';
  $('#productModalTitle').textContent = id ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد';
  if (id) { const product = products.find(item => item.id === id); if (product) Object.entries(product).forEach(([key, value]) => { if (form.elements[key]) form.elements[key].value = value ?? ''; }); }
  showModal('productModal');
}
function openDelete(type, id, name) { pendingDelete = { type, id }; $('#confirmText').textContent = `هل أنت متأكد من حذف «${name}»؟ لا يمكن التراجع عن هذه العملية.`; showModal('confirmModal'); }
function switchView(view) {
  $$('.nav-item').forEach(item => item.classList.toggle('active', item.dataset.view === view));
  $$('[data-panel]').forEach(panel => panel.classList.toggle('active', panel.dataset.panel === view));
  const labels = { overview: 'نظرة عامة', products: 'المنتجات', categories: 'الأقسام', users: 'المستخدمون والصلاحيات', settings: 'الإعدادات' };
  $('#breadcrumbCurrent').textContent = labels[view] || 'نظرة عامة';
  $('#sidebar').classList.remove('open'); $('#sidebarOverlay').classList.remove('open');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function resetProductForm() { $('#productForm').reset(); editingProductId = null; $('#productModalTitle').textContent = 'إضافة منتج جديد'; $('#imagePreview').style.display = 'none'; $('#uploadBox').style.display = 'flex'; }

// Navigation and global actions
 document.addEventListener('click', event => {
  const nav = event.target.closest('[data-view]'); if (nav) { event.preventDefault(); switchView(nav.dataset.view); return; }
  const actionElement = event.target.closest('[data-action]');
  if (actionElement) {
    const action = actionElement.dataset.action;
    if (action === 'add-product') { resetProductForm(); openProductModal(); }
    if (action === 'add-category') { $('#categoryForm').reset(); showModal('categoryModal'); }
    if (action === 'add-user') { $('#userForm').reset(); showModal('userModal'); }
    if (action === 'profile') showModal('profileModal');
    if (action === 'show-toast') showToast('كل شيء تحت السيطرة', 'سيفتح الدليل التفاعلي في النسخة الكاملة.');
    if (action === 'export') showToast('جاري تجهيز التقرير', 'سيتم تنزيل ملف CSV عند اكتمال التجهيز.');
  }
  const close = event.target.closest('[data-close]'); if (close) closeModal(close.dataset.close);
  const productAction = event.target.closest('[data-menu-product]'); if (productAction) { const product = products.find(item => item.id === Number(productAction.dataset.menuProduct)); if (product) openProductModal(product.id); }
  const categoryAction = event.target.closest('[data-menu-category]'); if (categoryAction) { const category = categories.find(item => item.id === Number(categoryAction.dataset.menuCategory)); if (category) openDelete('category', category.id, category.name); }
  const userAction = event.target.closest('[data-menu-user]'); if (userAction) showToast('خيارات المستخدم', 'يمكنك تعديل الدور أو إيقاف الوصول من هنا.');
 });
 $$('.modal-backdrop').forEach(backdrop => backdrop.addEventListener('click', event => { if (event.target === backdrop) closeModal(backdrop.id); }));
 $('#mobileMenu').addEventListener('click', () => { $('#sidebar').classList.add('open'); $('#sidebarOverlay').classList.add('open'); });
 $('#sidebarClose').addEventListener('click', () => { $('#sidebar').classList.remove('open'); $('#sidebarOverlay').classList.remove('open'); });
 $('#sidebarOverlay').addEventListener('click', () => { $('#sidebar').classList.remove('open'); $('#sidebarOverlay').classList.remove('open'); });
 $('#themeToggle').addEventListener('click', () => { document.body.classList.toggle('dark'); localStorage.setItem('maro-theme', document.body.classList.contains('dark') ? 'dark' : 'light'); $('#themeToggle').innerHTML = icon(document.body.classList.contains('dark') ? 'sun' : 'moon'); refreshIcons(); });
 if (localStorage.getItem('maro-theme') === 'dark') { document.body.classList.add('dark'); $('#themeToggle').innerHTML = icon('sun'); }
 $('#toastClose').addEventListener('click', () => $('#toast').classList.remove('show'));

// Forms
 $('#productForm').addEventListener('submit', event => { event.preventDefault(); const data = Object.fromEntries(new FormData(event.currentTarget).entries()); const existing = editingProductId ? products.find(item => item.id === editingProductId) : null; const product = { id: editingProductId || Date.now(), name: data.name, sku: data.sku, category: data.category, price: Number(data.price), sale: data.sale ? Number(data.sale) : null, stock: Number(data.stock), status: Number(data.stock) === 0 ? 'مسودة' : Number(data.stock) < 10 ? 'منخفض المخزون' : 'نشط', date: existing?.date || 'الآن', image: existing?.image || productImages[products.length % productImages.length], description: data.description, details: data.details }; if (editingProductId) products = products.map(item => item.id === editingProductId ? product : item); else products.unshift(product); closeModal('productModal'); renderProducts(); showToast(existing ? 'تم تعديل المنتج' : 'تمت إضافة المنتج', existing ? 'تم تحديث بيانات المنتج بنجاح.' : `أضيف «${product.name}» إلى الكتالوج.`); });
 $('#categoryForm').addEventListener('submit', event => { event.preventDefault(); const data = Object.fromEntries(new FormData(event.currentTarget).entries()); const item = { id: Date.now(), name: data.name, description: data.description || 'قسم جديد في الكتالوج', count: 0, color: data.color, updated: 'الآن' }; categories.push(item); closeModal('categoryModal'); renderCategories(); showToast('تمت إضافة القسم', `أضيف قسم «${item.name}» بنجاح.`); });
 $('#userForm').addEventListener('submit', event => { event.preventDefault(); const data = Object.fromEntries(new FormData(event.currentTarget).entries()); users.push({ id: Date.now(), name: data.name, email: data.email, role: data.role, status: data.status, last: 'لم يدخل بعد', initial: data.name.trim().charAt(0), color: 'blue' }); closeModal('userModal'); renderUsers(); showToast('تم إرسال الدعوة', `أرسلت دعوة الوصول إلى ${data.email}.`); });
 $('#profileForm').addEventListener('submit', event => { event.preventDefault(); closeModal('profileModal'); showToast('تم تحديث الملف الشخصي', 'حُفظت بيانات حسابك الجديدة.'); });
 $('#confirmDelete').addEventListener('click', () => { if (!pendingDelete) return; if (pendingDelete.type === 'category') { categories = categories.filter(item => item.id !== pendingDelete.id); renderCategories(); } if (pendingDelete.type === 'product') { products = products.filter(item => item.id !== pendingDelete.id); renderProducts(); } closeModal('confirmModal'); showToast('تم الحذف', 'حُذف العنصر من لوحة التحكم.'); pendingDelete = null; });
 $('#imageInput').addEventListener('change', event => { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = e => { $('#imagePreview').src = e.target.result; $('#imagePreview').style.display = 'block'; $('#uploadBox').style.display = 'none'; }; reader.readAsDataURL(file); });
 $('#productSearch').addEventListener('input', renderProducts); $('#categoryFilter').addEventListener('change', renderProducts); $('#statusFilter').addEventListener('change', renderProducts); $('#globalSearch').addEventListener('input', () => { if ($('[data-panel="products"]').classList.contains('active')) renderProducts(); });
 document.addEventListener('keydown', event => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); $('#globalSearch').focus(); } if (event.key === 'Escape') $$('.modal-backdrop.open').forEach(modal => closeModal(modal.id)); });

renderProducts(); renderCategories(); renderUsers(); refreshIcons();
