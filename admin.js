import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAZucoNuZyKDoxfS7tboc3-ZttqONuw_vw",
    authDomain: "maro-store-4dc09.firebaseapp.com",
    projectId: "maro-store-4dc09",
    storageBucket: "maro-store-4dc09.firebasestorage.app",
    messagingSenderId: "55163169834",
    appId: "1:55163169834:web:48ba5eda57e23c41886753"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let allProducts = [];
let allCategories = [];
let base64Image = "";
let salesChartInstance = null;
let categoryChartInstance = null;

// --- Auth Logic ---
window.login = () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    signInWithEmailAndPassword(auth, email, password)
        .catch(err => {
            const errEl = document.getElementById('login-error');
            errEl.innerText = "بيانات الدخول غير صحيحة.";
            errEl.classList.remove('hidden');
        });
};

window.logout = () => signOut(auth);

onAuthStateChanged(auth, user => {
    if (user) {
        document.getElementById('login-screen').classList.add('hidden');
        loadDashboardData();
    } else {
        document.getElementById('login-screen').classList.remove('hidden');
    }
});

// --- Tab Switching ---
window.switchTab = (tabId) => {
    // Hide all tabs
    ['dashboard', 'products', 'orders'].forEach(t => {
        const el = document.getElementById(`tab-${t}`);
        if(el) el.classList.add('hidden');
        const btn = document.getElementById(`btn-${t}`);
        if(btn) btn.classList.remove('active');
    });
    
    // Show selected
    const selectedTab = document.getElementById(`tab-${tabId}`);
    if(selectedTab) selectedTab.classList.remove('hidden');
    const selectedBtn = document.getElementById(`btn-${tabId}`);
    if(selectedBtn) selectedBtn.classList.add('active');
    
    // Update title
    const titles = { dashboard: 'نظرة عامة', products: 'إدارة المنتجات', orders: 'الطلبات' };
    document.getElementById('page-title').innerText = titles[tabId] || '';
    
    if(tabId === 'dashboard') loadDashboardData();
    if(tabId === 'products') loadProductsTable();
};

// --- Data Loading ---
async function loadDashboardData() {
    try {
        const prodSnap = await getDocs(collection(db, "products"));
        const catSnap = await getDocs(collection(db, "categories"));
        
        allProducts = [];
        allCategories = [];
        
        prodSnap.forEach(doc => allProducts.push({ id: doc.id, ...doc.data() }));
        catSnap.forEach(doc => allCategories.push({ id: doc.id, ...doc.data() }));

        // Update Stats
        const totalSales = allProducts.reduce((sum, p) => sum + (p.price || 0), 0);
        document.getElementById('stat-sales').innerText = totalSales.toFixed(2);
        document.getElementById('stat-products').innerText = allProducts.length;
        document.getElementById('stat-categories').innerText = allCategories.length;
        document.getElementById('stat-orders').innerText = Math.floor(allProducts.length * 1.5); // Fake data for demo

        renderCharts();
    } catch (e) {
        console.error("Error loading data:", e);
    }
}

// --- Charts ---
function renderCharts() {
    // Sales Chart (Line)
    const ctxSales = document.getElementById('salesChart').getContext('2d');
    if (salesChartInstance) salesChartInstance.destroy();
    
    let gradient = ctxSales.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(6, 182, 212, 0.5)');
    gradient.addColorStop(1, 'rgba(6, 182, 212, 0)');

    salesChartInstance = new Chart(ctxSales, {
        type: 'line',
        data: {
            labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
            datasets: [{
                label: 'المبيعات',
                data: [1200, 1900, 3000, 5000, 2300, 4300],
                borderColor: '#06b6d4',
                backgroundColor: gradient,
                borderWidth: 2,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#0b1120',
                pointBorderColor: '#06b6d4',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
            }
        }
    });

    // Category Chart (Doughnut)
    const ctxCat = document.getElementById('categoryChart').getContext('2d');
    if (categoryChartInstance) categoryChartInstance.destroy();
    
    const catLabels = allCategories.map(c => c.label);
    const catData = allCategories.map(c => allProducts.filter(p => p.categoryId === c.id).length);
    
    categoryChartInstance = new Chart(ctxCat, {
        type: 'doughnut',
        data: {
            labels: catLabels.length ? catLabels : ['لا يوجد أقسام'],
            datasets: [{
                data: catData.length ? catData : [1],
                backgroundColor: ['#06b6d4', '#3b82f6', '#a855f7', '#f59e0b', '#ef4444'],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 20, font: { family: 'Cairo' } } }
            },
            cutout: '75%'
        }
    });
}

// --- Products Table ---
async function loadProductsTable() {
    if(!allProducts.length) await loadDashboardData(); // Ensure data is loaded
    
    const tbody = document.getElementById('products-table-body');
    tbody.innerHTML = '';
    
    // Populate category select in modal
    const select = document.getElementById('prod-category');
    select.innerHTML = allCategories.map(c => `<option value="${c.id}">${c.label}</option>`).join('');

    if (allProducts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="p-8 text-center text-slate-500">لا يوجد منتجات حالياً.</td></tr>';
        return;
    }

    allProducts.forEach(p => {
        const catName = allCategories.find(c => c.id === p.categoryId)?.label || 'غير محدد';
        const tr = document.createElement('tr');
        tr.className = 'table-row transition';
        tr.innerHTML = `
            <td class="p-4 flex items-center gap-3">
                ${p.image ? `<img src="${p.image}" class="w-10 h-10 rounded-lg object-cover bg-white">` : `<div class="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-600"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>`}
                <span class="font-bold text-white">${p.name}</span>
            </td>
            <td class="p-4 text-slate-400">${catName}</td>
            <td class="p-4 text-cyan-400 font-bold">$${p.price}</td>
            <td class="p-4"><span class="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-bold">متاح</span></td>
            <td class="p-4 flex gap-2">
                <button onclick="editProduct('${p.id}')" class="text-blue-400 hover:text-blue-300 p-2 bg-blue-500/10 rounded-lg"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg></button>
                <button onclick="deleteProduct('${p.id}')" class="text-red-400 hover:text-red-300 p-2 bg-red-500/10 rounded-lg"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// --- Product Modal Logic ---
window.openProductModal = (id = null) => {
    const modal = document.getElementById('product-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    if (id) {
        const p = allProducts.find(x => x.id === id);
        document.getElementById('modal-title').innerText = 'تعديل المنتج';
        document.getElementById('prod-id').value = p.id;
        document.getElementById('prod-name').value = p.name;
        document.getElementById('prod-price').value = p.price;
        document.getElementById('prod-category').value = p.categoryId;
        document.getElementById('prod-desc').value = p.description || '';
        base64Image = p.image || "";
    } else {
        document.getElementById('modal-title').innerText = 'إضافة منتج جديد';
        document.getElementById('prod-id').value = '';
        document.getElementById('prod-name').value = '';
        document.getElementById('prod-price').value = '';
        document.getElementById('prod-desc').value = '';
        base64Image = "";
    }
};

window.closeProductModal = () => {
    const modal = document.getElementById('product-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
};

document.getElementById('prod-image').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(event) {
        base64Image = event.target.result;
    };
    reader.readAsDataURL(file);
});

window.saveProduct = async () => {
    const id = document.getElementById('prod-id').value;
    const name = document.getElementById('prod-name').value;
    const price = parseFloat(document.getElementById('prod-price').value);
    const categoryId = document.getElementById('prod-category').value;
    const description = document.getElementById('prod-desc').value;

    if (!name || isNaN(price)) return alert("يرجى إدخال اسم وسعر صحيح.");

    const data = { name, price, categoryId, description, image: base64Image, createdAt: Date.now() };

    try {
        if (id) {
            await updateDoc(doc(db, "products", id), data);
        } else {
            await addDoc(collection(db, "products"), data);
        }
        closeProductModal();
        await loadDashboardData();
        loadProductsTable();
    } catch (e) {
        alert("خطأ في الحفظ: " + e.message);
    }
};

window.editProduct = (id) => openProductModal(id);

window.deleteProduct = async (id) => {
    if (confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
        try {
            await deleteDoc(doc(db, "products", id));
            await loadDashboardData();
            loadProductsTable();
        } catch (e) {
            alert("خطأ في الحذف: " + e.message);
        }
    }
};
