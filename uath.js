import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

// دالة تسجيل الدخول
window.login = async (email, password) => {
    try {
        await signInWithEmailAndPassword(auth, email, password);
        return { success: true };
    } catch (error) {
        return { success: false, message: error.message };
    }
};

// دالة تسجيل الخروج
window.logout = async () => {
    await signOut(auth);
    window.location.href = 'admin.html'; // إعادة توجيه لصفحة الدخول
};

// حماية الصفحة (Route Guard)
// إذا كان المستخدم في admin.html ولم يسجل دخول، يتم إخفاء المحتوى وإظهار شاشة الدخول
onAuthStateChanged(auth, (user) => {
    const loginScreen = document.getElementById('login-screen');
    const adminContent = document.getElementById('admin-content');

    if (user) {
        // المستخدم مسجل دخول
        if (loginScreen) loginScreen.classList.add('hidden');
        if (adminContent) adminContent.classList.remove('hidden');
        // إخفاء شاشة التحميل إن وجدت
        const loader = document.getElementById('global-loader');
        if (loader) loader.classList.add('hidden');
    } else {
        // المستخدم غير مسجل دخول
        if (loginScreen) loginScreen.classList.remove('hidden');
        if (adminContent) adminContent.classList.add('hidden');
        const loader = document.getElementById('global-loader');
        if (loader) loader.classList.add('hidden');
    }
});

export { auth, db };
