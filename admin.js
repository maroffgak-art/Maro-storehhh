import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

let products = [];
let categories = [];
let base64Image = "";
let salesChart, catChart;

window.login = () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    signInWithEmailAndPassword(auth, email, password).catch(err => {
        const el = document.getElementById('login-error');
        el.innerText = "بيانات الدخول غير صحيحة.";
        el.classList.remove('hidden');
    });
};

window.logout = () => signOut(auth);

onAuthStateChanged(auth, user => {
    if (user) {
        document.getElementById('login-screen').classList.add('hidden');
        loadData();
    } else {
        document.getElementById('login-screen').classList.remove('hidden');
    }
});

window.switchTab = (tab) => {
    ['dashboard', 'products', 'orders'].forEach(t => {
        document.getElementById(`tab-${t}`).classList.add('hidden');
        document.getElementById(`btn-${t}`).classList.remove('active');
    });
    document.getElementById(`tab-${tab}`).classList.remove('hidden');
    document.getElementById(`btn-${tab}`).classList.add('active');
    
    const titles = { dashboard: 'نظرة عامة', products: 'إدارة المنتجات', orders: 'الطلبات' };
    document.getElementById('page-title').innerText = titles[tab];
    
    if(tab === 'dashboard') renderCharts();
};

async function loadData() {
    try {
        const prodSnap = await getDocs(collection(db, "products"));
        const catSnap = await getDocs(collection(db, "categories"));
        
        products = prodSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        categories = catSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        document.getElementById('stat-products').innerText = products.length;
        document.getElementById('stat-sales').innerText = products.reduce((sum, p) => sum + (p.price || 0), 0).toFixed(2);
        document.getElementById('stat-orders').innerText = Math.floor(products.length * 1.8); // Dummy
        document.getElementById('stat-visitors').innerText = Math.floor(Math.random() * 50) + 10; // Dummy

        populateCategorySelect();
        renderProductsTable();
        renderCharts();
    } catch (e) {
        console.error(e);
    }
}

function renderCharts() {
    const salesCtx = document.getElementById('salesChart').getContext('2d');
    if (salesChart) salesChart.destroy();
    
    let gradient = salesCtx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(6, 182, 212, 0.5)');
    gradient.addColorStop(1, 'rgba(6, 182, 212, 0)');

    salesChart = new Chart(salesCtx, {
        type: 'line',
        data: {
            labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
            datasets: [{
                data: [1200, 1900, 3000, 5000, 2300, 4300],
                borderColor: '#06b6d4',
                backgroundColor: gradient,
                fill: true,
                tension: 0.4,
                borderWidth: 2,
                pointBackgroundColor: '#0a0a0a',
                pointBorderColor: '#06b6d4',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#6b7280' } },
                x: { grid: { display: false }, ticks: { color: '#6b7280' } }
            }
        }
    });

    const catCtx = document.getElementById('catChart').getContext('2d');
    if (catChart) catChart.destroy();
    
    catChart = new Chart(catCtx, {
        type: 'doughnut',
        data: {
            labels: categories.map(c => c.label),
            datasets: [{
                data: categories.map(c => products.filter(p => p.categoryId === c.id).length),
                backgroundColor: ['#06b6d4', '#3b82f6', '#a855f7', '#f59e0b'],
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: { position: 'bottom', labels: { color: '#9ca3af', font: { family: 'Cairo' } } }
            }
        }
    });
}

function populateCategorySelect() {
    const sel = document.getElementById('prod-category');
    sel.innerHTML = categories.map(c => `<option value="${c.id}">${c.label}</option>`).join('');
}

function renderProductsTable() {
    const tbody = document.getElementById('products-table');
    if(products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="p-8 text-center text-gray-500">لا يوجد منتجات.</td></tr>';
        return;
    }
    
    tbody.innerHTML = products.map(p => `
        <tr class="hover:bg-white/5 transition">
            <td class="p-5 flex items-center gap-4">
                <div class="w-12 h-12 rounded-xl bg-black border border-white/10 overflow-hidden">
                    ${p.image ? `<img src="${p.image}" class="w-full h-full object-cover">` : ''}
                </div>
                <span class="font-bold text-white">${p.name}</span>
            </td>
            <td class="p-5 text-cyan-400 font-black">$${p.price}</td>
            <td class="p-5 text-gray-400">${categories.find(c => c.id === p.categoryId)?.label || '-'}</td>
            <td class="p-5">
                <button onclick="editProduct('${p.id}')" class="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition inline-flex items-center justify-center mr-2"><i class="ph ph-pencil-simple"></i></button>
                <button onclick="deleteProduct('${p.id}')" class="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition inline-flex items-center justify-center"><i class="ph ph-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

window.openProductModal = (id = null) => {
    const modal = document.getElementById('product-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    if(id) {
        const p = products.find(x => x.id === id);
        document.getElementById('modal-title').innerText = 'تعديل منتج';
        document.getElementById('prod-id').value = p.id;
        document.getElementById('prod-name').value = p.name;
        document.getElementById('prod-price').value = p.price;
        document.getElementById('prod-category').value = p.categoryId;
        document.getElementById('prod-desc').value = p.description || '';
        base64Image = p.image || '';
    } else {
        document.getElementById('modal-title').innerText = 'إضافة منتج جديد';
        document.getElementById('prod-id').value = '';
        document.getElementById('prod-name').value = '';
        document.getElementById('prod-price').value = '';
        document.getElementById('prod-desc').value = '';
        base64Image = '';
    }
};

window.closeProductModal = () => {
    const modal = document.getElementById('product-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
};

document.getElementById('prod-image').addEventListener('change', e => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = ev => base64Image = ev.target.result;
    reader.readAsDataURL(file);
});

window.saveProduct = async () => {
    const id = document.getElementById('prod-id').value;
    const data = {
        name: document.getElementById('prod-name').value,
        price: parseFloat(document.getElementById('prod-price').value),
        categoryId: document.getElementById('prod-category').value,
        description: document.getElementById('prod-desc').value,
        image: base64Image,
        createdAt: Date.now()
    };
    
    if(!data.name || isNaN(data.price)) return alert("يرجى ملء البيانات.");
    
    try {
        if(id) await updateDoc(doc(db, "products", id), data);
        else await addDoc(collection(db, "products"), data);
        
        closeProductModal();
        loadData();
    } catch (e) {
        alert("خطأ: " + e.message);
    }
};

window.editProduct = (id) => openProductModal(id);

window.deleteProduct = async (id) => {
    if(confirm("تأكيد الحذف؟")) {
        try {
            await deleteDoc(doc(db, "products", id));
            loadData();
        } catch (e) {
            alert("خطأ: " + e.message);
        }
    }
};
