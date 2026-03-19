import { renderDashboard } from './admin/pages/dashboard.js';
import { renderProducts } from './admin/pages/products.js';
import { renderOrders } from './admin/pages/orders.js';
import { renderCustomers } from './admin/pages/customers.js';
import { renderInventory } from './admin/pages/inventory.js';
import { renderSettings } from './admin/pages/settings.js';
import { renderCategories } from './admin/pages/categories.js';
import { renderLogin } from './admin/pages/login.js';
import { updateGlobalUI } from './admin/utils/ui-helpers.js';
import { auth } from './api/firebase-config.js';
import { onAuthStateChanged } from 'firebase/auth';

const routes = {
    'dashboard': renderDashboard,
    'products': renderProducts,
    'orders': renderOrders,
    'customers': renderCustomers,
    'inventory': renderInventory,
    'settings': renderSettings,
    'categories': renderCategories,
    'login': renderLogin,
};

let userChecked = false;
let currentUser = null;

// Track auth state
onAuthStateChanged(auth, (user) => {
    currentUser = user;
    userChecked = true;
    
    // If not on login page and not logged in, redirect
    if (!user && window.location.hash !== '#login') {
        window.location.hash = 'login';
    } 
    // If on login page and logged in, redirect to dashboard
    else if (user && window.location.hash === '#login') {
        window.location.hash = 'dashboard';
    }
});

export function initRouter() {
    async function handleRoute() {
        if (!userChecked) {
            // Wait for first auth state check before routing
            await new Promise(resolve => {
                const unsubscribe = onAuthStateChanged(auth, (user) => {
                    unsubscribe();
                    resolve();
                });
            });
        }

        const hash = window.location.hash.slice(1) || 'dashboard'; // Default to dashboard
        
        // Simple route guard check based on local currentUser
        if (!currentUser && hash !== 'login') {
            window.location.hash = 'login';
            return;
        }

        const renderer = routes[hash] || routes['dashboard'];

        // Clear app container
        const app = document.getElementById('app');
        if (app) app.innerHTML = '';

        // Render page
        await renderer();

        // Update global UI elements (Sidebar/Topbar) - skip on login page
        if (hash !== 'login') {
            await updateGlobalUI();
        }
    }

    // Handle hash changes
    window.addEventListener('hashchange', handleRoute);

    // Initial load - run immediately when initialized
    handleRoute();
}

