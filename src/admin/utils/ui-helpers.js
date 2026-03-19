export function initSidebarLogic() {
    const openBtn = document.getElementById('openSidebar');
    const closeBtn = document.getElementById('closeSidebar');
    const sidebar = document.getElementById('admin-sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    const toggleSidebar = (show) => {
        if (!sidebar) return;
        if (show) {
            sidebar.classList.remove('-translate-x-full');
            if (overlay) overlay.classList.remove('hidden');
        } else {
            sidebar.classList.add('-translate-x-full');
            if (overlay) overlay.classList.add('hidden');
        }
    };

    if (openBtn) {
        openBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent immediate closing if we click outside logic exists
            toggleSidebar(true);
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => toggleSidebar(false));
    }

    if (overlay) {
        overlay.addEventListener('click', () => toggleSidebar(false));
    }
}

import { AdminSettingsStore } from '../store/admin-settings-store.js';
import { AdminNotificationStore } from '../store/admin-notification-store.js';
import { AdminOrderStore } from '../store/admin-order-store.js';
import { AdminProductStore } from '../store/admin-product-store.js';
import { AdminUserStore } from '../store/admin-user-store.js';
import { auth } from '../../api/firebase-config.js';
import { signOut } from 'firebase/auth';

export async function updateGlobalUI() {
    // Ensure settings are loaded before updating UI
    await AdminSettingsStore.init();
    const settings = AdminSettingsStore.getSettings();

    // Init Notifications and Background Listeners
    initNotificationLogic();

    if (!settings) return;

    // Update Sidebar Brand
    const brandEl = document.getElementById('sidebar-brand-name');
    if (brandEl) {
        brandEl.textContent = settings.storeName || 'Gadget Admin';
    }

    // Update Topbar User
    const userNameEl = document.getElementById('topbar-user-name');

    if (userNameEl) {
        userNameEl.textContent = `${settings.firstName} ${settings.lastName}`;
    }

    // Wire up logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await signOut(auth);
                window.location.hash = 'login';
            } catch (err) {
                console.error('Logout failed:', err);
            }
        });
    }
}

export function initNotificationLogic() {
    // Initialize Stores for Real-time Updates & Notifications
    AdminNotificationStore.init();
    AdminOrderStore.init();
    AdminProductStore.init();
    AdminUserStore.init();

    const badge = document.getElementById('notificationBadge');
    const btn = document.getElementById('notificationsBtn');
    const dropdown = document.getElementById('notificationsDropdown');
    const list = dropdown ? dropdown.querySelector('.max-h-96') : null;
    const markAllBtn = dropdown ? dropdown.querySelector('span.cursor-pointer') : null;

    const render = (notifications) => {
        const unread = AdminNotificationStore.getUnreadCount();

        // Badge
        if (badge) {
            if (unread > 0) {
                badge.textContent = unread > 99 ? '99+' : unread;
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        }

        // List
        if (list) {
            if (notifications.length === 0) {
                list.innerHTML = '<div class="p-4 text-center text-sm text-slate-500">No notifications</div>';
            } else {
                list.innerHTML = notifications.map(n => `
                    <div class="notification-item relative overflow-hidden group px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-colors ${n.read ? 'opacity-60' : 'bg-blue-50/30'}" 
                        data-id="${n.id}" 
                        style="touch-action: pan-y; transition: transform 0.2s ease-out;">
                        <div class="flex items-start gap-3 pointer-events-none select-none">
                            <div class="mt-1 flex-shrink-0">
                                <span class="material-symbols-outlined text-[20px] ${getNotificationIconColor(n.type)}">
                                    ${getNotificationIcon(n.type)}
                                </span>
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="text-sm font-medium text-slate-900 ${n.read ? '' : 'font-semibold'}">${n.title}</p>
                                <p class="text-xs text-slate-500 mt-0.5 line-clamp-2">${n.message}</p>
                                <p class="text-[10px] text-slate-400 mt-1">${new Date(n.timestamp).toLocaleString()}</p>
                            </div>
                             ${!n.read ? `<div class="w-2 h-2 rounded-full bg-blue-600 mt-2 flex-shrink-0"></div>` : ''}
                        </div>
                    </div>
                `).join('');
            }
        }
    };

    // Initial Render
    render(AdminNotificationStore.getAll());

    // Seeding a welcome notification if empty so user sees the badge working immediately
    if (AdminNotificationStore.getAll().length === 0) {
        AdminNotificationStore.add(
            'System Ready',
            'Notification system is now active. Real-time alerts enabled.',
            'success'
        );
    }

    // Subscribe
    AdminNotificationStore.subscribe(render);

    // Swipe Logic
    if (list) {
        let startX = 0;
        let activeItem = null;

        list.addEventListener('touchstart', (e) => {
            const item = e.target.closest('.notification-item');
            if (!item) return;
            activeItem = item;
            startX = e.touches[0].clientX;
            activeItem.style.transition = 'none'; // Disable transition for direct follow
        }, { passive: true });

        list.addEventListener('touchmove', (e) => {
            if (!activeItem) return;
            const currentX = e.touches[0].clientX;
            const deltaX = currentX - startX;

            // Limit scroll to distinct horizontal moves
            activeItem.style.transform = `translateX(${deltaX}px)`;

            // Optional: Visual Feedback opacity
            if (Math.abs(deltaX) > 50) {
                activeItem.style.opacity = '0.5';
            } else {
                activeItem.style.opacity = '1';
            }
        }, { passive: true });

        list.addEventListener('touchend', (e) => {
            if (!activeItem) return;
            const endX = e.changedTouches[0].clientX;
            const deltaX = endX - startX;
            const id = activeItem.dataset.id;

            activeItem.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
            activeItem.style.opacity = '1';

            if (deltaX > 100) { // Swipe Right -> Mark Read
                activeItem.style.transform = `translateX(100%)`;
                setTimeout(() => {
                    AdminNotificationStore.markAsRead(id);
                }, 200);
            } else if (deltaX < -100) { // Swipe Left -> Remove
                activeItem.style.transform = `translateX(-100%)`;
                setTimeout(() => {
                    AdminNotificationStore.remove(id);
                }, 200);
            } else {
                // Snap back
                activeItem.style.transform = `translateX(0)`;
            }

            activeItem = null;
        });
    }

    // Events
    if (btn && dropdown) {
        // Remove old listeners to prevent duplicates (naive cloning)
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);

        newBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('hidden');
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!newBtn.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.add('hidden');
            }
        });
    }

    if (markAllBtn) {
        // Clone to clear listeners
        const newMarkBtn = markAllBtn.cloneNode(true);
        markAllBtn.parentNode.replaceChild(newMarkBtn, markAllBtn);

        newMarkBtn.addEventListener('click', () => {
            AdminNotificationStore.markAllAsRead();
        });
    }
}

function getNotificationIcon(type) {
    if (type === 'success') return 'check_circle';
    if (type === 'warning') return 'warning';
    if (type === 'error') return 'error';
    return 'notifications';
}

function getNotificationIconColor(type) {
    if (type === 'success') return 'text-emerald-500';
    if (type === 'warning') return 'text-amber-500';
    if (type === 'error') return 'text-rose-500';
    return 'text-blue-500';
}

export function getCurrencyDetails() {
    const settings = AdminSettingsStore.getSettings();
    const currency = settings.currency || 'USD';

    // Hardcoded rates for now. In a real app, fetch these from an API.
    const rates = {
        'USD': 1,
        'EUR': 0.92,
        'GBP': 0.79,
        'NGN': 1400
    };

    const rate = rates[currency] || 1;
    return { currency, rate };
}

export function formatCurrency(amount) {
    const { currency, rate } = getCurrencyDetails();
    const convertedValue = Number(amount) * rate;

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(convertedValue);
}
