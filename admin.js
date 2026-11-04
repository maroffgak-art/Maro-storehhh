import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, addDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

// تهيئة الأحداث بعد تحميل الصفحة
window.addEventListener('DOMContentLoaded', () => {
    // ربط زر الدخول
    const loginBtn = document.querySelector('button[onclick="handleLogin()"]');
    if (loginBtn) {
        loginBtn.onclick = async () => {
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const errorEl = document.getElementById('login-error');
            
            try {
                // استدعاء دالة login من auth.js
                const result = await window.login(email, password);
                if (!result.success) {
                    errorEl.innerText = "بيانات الدخول غير صحيحة.";
                    errorEl.classList.remove('hidden');
                }
            } catch (e) {
                errorEl.innerText = "حدث خطأ: " + e.message;
                errorEl.classList.remove('hidden');
            }
        };
    }
});

// دالة تبديل التبويبات
window.switchTab = (tabId) => {
    ['overview', 'products'].forEach(t => {
        const el = document.getElementById(`tab-${t}`);
        if (el) el.classList.add('hidden');
        const btn = document.getElementById(`btn-${t}`);
        if (btn) btn.classList.remove('active');
    });
    
    const selectedTab = document.getElementById(`tab-${tabId}`);
    if (selectedTab) selectedTab.classList.remove('hidden');
    const selectedBtn = document.getElementById(`btn-${tabId}`);
    if (selectedBtn) selectedBtn.classList.add('active');
    
    const titles = { overview: 'نظرة عامة', products: 'المنتجات' };
    document.getElementById('page-title').innerText = titles[tabId] || '';
    
    if (tabId === 'overview') loadDashboardData();
    if (tabId === 'products') loadProductsTable();
};

// تحميل بيانات اللوحة
async function loadDashboardData() {
    try {
        const prodSnap = await getDocs(collection(db, "products"));
        const catSnap = await getDocs(collection(db, "categories"));
        
        allProducts = [];
        allCategories = [];
        
        prodSnap.forEach(doc => allProducts.push({ id: doc.id, ...doc.data() }));
        catSnap.forEach(doc => allCategories.push({ id: doc.id, ...doc.data() }));

        // تحديث الإحصائيات
        const totalSales = allProducts.reduce((sum, p) => sum + (p.price || 0), 0);
        document.getElementById('stat-sales').innerText = totalSales.toFixed(2);
        document.getElementById('stat-products').innerText = allProducts.length;
        document.getElementById('stat-categories').innerText = allCategories.length;

        renderCharts();
    } catch (e) {
        console.error("Error loading data:", e);
    }
}

// رسم المخططات
function renderCharts() {
    const ctxSales = document.getElementById('salesChart').getContext('2d');
    if (salesChartInstance) salesChartInstance.destroy();
    
    salesChartInstance = new Chart(ctxSales, {
        type: 'line',
        data: {
            labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
            datasets: [{
                label: 'المبيعات',
                data: [1200, 1900, 3000, 5000, 2300, 4300],
                borderColor: '#EDEDED',
                backgroundColor: 'rgba(237, 237, 237, 0.05)',
                borderWidth: 1.5,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#000000',
                pointBorderColor: '#EDEDED',
                pointBorderWidth: 1.5,
                pointRadius: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { grid: { color: '#1A1A1A' }, ticks: { color: '#888888', font: { size: 10 } } },
                x: { grid: { display: false }, ticks: { color: '#888888', font: { size: 10 } } }
            }
        }
    });

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
                backgroundColor: ['#EDEDED', '#888888', '#444444', '#222222'],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { color: '#888888', padding: 20, font: { size: 10 } } }
            },
            cutout: '75%'
        }
    });
}

// تحميل جدول المنتجات
async function loadProductsTable() {
    if (!allProducts.length) await loadDashboardData();
    
    const tbody = document.getElementById('products-table-body');
    tbody.innerHTML = '';
    
    const select = document.getElementById('prod-category');
    select.innerHTML = allCategories.map(c => `<option value="${c.id}">${c.label}</option>`).join('');

    if (allProducts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="p-8 text-center text-gray-500 text-sm">لا يوجد منتجات.</td></tr>';
        return;
    }

    allProducts.forEach(p => {
        const catName = allCategories.find(c => c.id === p.categoryId)?.label || 'غير محدد';
        const tr = document.createElement('tr');
        tr.className = 'table-row transition';
        tr.innerHTML = `
            <td class="p-4 flex items-center gap-3">
                ${p.image ? `<img src="${p.image}" class="w-8 h-8 rounded object-cover">` : `<div class="w-8 h-8 rounded bg-[#1A1A1A] flex items-center justify-center text-gray-600 text-xs">?</div>`}
                <span class="font-medium text-gray-200">${p.name}</span>
            </td>
            <td class="p-4 text-gray-500 text-xs">${catName}</td>
            <td class="p-4 text-gray-300 font-mono text-xs">$${p.price}</td>
            <td class="p-4 flex gap-2">
                <button onclick="editProduct('${p.id}')" class="text-blue-400 hover:text-blue-300 text-xs font-bold">تعديل</button>
                <button onclick="deleteProduct('${p.id}')" class="text-red-500 hover:text-red-400 text-xs font-bold">حذف</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// إدارة النافذة المنبثقة (Modal)
window.openModal = (id = null) => {
    const modal = document.getElementById('product-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    if (id) {
        const p = allProducts.find(x => x.id === id);
        document.getElementById('modal-title').innerText = 'تعديل منتج';
        document.getElementById('prod-id').value = p.id;
        document.getElementById('prod-name').value = p.name;
        document.getElementById('prod-price').value = p.price;
        document.getElementById('prod-category').value = p.categoryId;
        document.getElementById('prod-desc').value = p.description || '';
        base64Image = p.image || "";
    } else {
        document.getElementById('modal-title').innerText = 'إضافة منتج';
        document.getElementById('prod-id').value = '';
        document.getElementById('prod-name').value = '';
        document.getElementById('prod-price').value = '';
        document.getElementById('prod-desc').value = '';
        base64Image = "";
    }
};

window.closeModal = () => {
    const modal = document.getElementById('product-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
};

document.getElementById('prod-image').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(event) { base64Image = event.target.result; };
    reader.readAsDataURL(file);
});

window.saveProduct = async () => {
    const id = document.getElementById('prod-id').value;
    const name = document.getElementById('prod-name').value;
    const price = parseFloat(document.getElementById('prod-price').value);
    const categoryId = document.getElementById('prod-category').value;
    const description = document.getElementById('prod-desc').value;

    if (!name || isNaN(price)) return alert("أدخل اسم وسعر صحيح.");

    const data = { name, price, categoryId, description, image: base64Image, createdAt: Date.now() };

    try {
        if (id) {
            await updateDoc(doc(db, "products", id), data);
        } else {
            await addDoc(collection(db, "products"), data);
        }
        closeModal();
        await loadDashboardData();
        loadProductsTable();
    } catch (e) {
        alert("خطأ: " + e.message);
    }
};

window.editProduct = (id) => openModal(id);

window.deleteProduct = async (id) => {
    if (confirm("هل أنت متأكد من الحذف؟")) {
        try {
            await deleteDoc(doc(db, "products", id));
            await loadDashboardData();
            loadProductsTable();
        } catch (e) { alert("خطأ: " + e.message); }
    }
};
