export function Sidebar(activePage) {
    const menuItems = [
        { name: 'Dashboard', icon: 'dashboard', slug: 'dashboard' },
        { name: 'Products', icon: 'shopping_bag', slug: 'products' },
        { name: 'Orders', icon: 'shopping_cart', slug: 'orders' },
        { name: 'Customers', icon: 'group', slug: 'customers' },
        { name: 'Categories', icon: 'category', slug: 'categories' },
        { name: 'Inventory', icon: 'inventory_2', slug: 'inventory' },
        { name: 'Settings', icon: 'settings', slug: 'settings' },
    ];

    return `
        <!-- Mobile Overlay -->
        <div id="sidebar-overlay" class="fixed inset-0 bg-slate-900/50 z-40 hidden md:hidden backdrop-blur-sm transition-opacity"></div>

        <aside id="admin-sidebar" class="fixed inset-y-0 left-0 z-50 w-64 bg-[#0f172a] text-slate-300 flex flex-col h-full border-r border-[#1e293b] shadow-xl transform -translate-x-full transition-transform duration-300 md:translate-x-0 md:relative">
            <!-- Brand -->
            <div class="h-16 flex items-center justify-between px-6 border-b border-[#1e293b] bg-[#0f172a]">
                <div class="flex items-center">
                    <div class="h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-blue-500/20">
                        <span class="material-symbols-outlined text-white text-[20px]">storefront</span>
                    </div>
                    <div>
                        <h1 id="sidebar-brand-name" class="text-white font-bold text-lg tracking-tight">Go Gadgets Admin</h1>
                        <p class="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">v1.0.0</p>
                    </div>
                </div>
                <!-- Mobile Close Button -->
                <button id="closeSidebar" class="md:hidden text-slate-400 hover:text-white">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>

            <!-- Navigation -->
            <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                ${menuItems.map(item => `
                    <a href="#${item.slug}" 
                       class="flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group
                              ${activePage === item.slug
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 font-medium'
            : 'hover:bg-[#1e293b] hover:text-white'}"
                    >
                        <span class="material-symbols-outlined mr-3 text-[22px] ${activePage === item.slug ? 'text-white' : 'text-slate-400 group-hover:text-white transition-colors'}">
                            ${item.icon}
                        </span>
                        <span class="text-sm tracking-wide">${item.name}</span>
                    </a>
                `).join('')}
            </nav>

            <!-- Footer -->
            <div class="p-4 border-t border-[#1e293b] bg-[#0f172a]">
                <button id="logoutBtn" class="flex items-center w-full px-3 py-2.5 rounded-lg text-rose-500 hover:bg-[#1e293b] hover:text-rose-400 transition-colors group">
                     <span class="material-symbols-outlined mr-3 text-[22px] group-hover:text-rose-400">logout</span>
                     <span class="text-sm font-medium">Logout</span>
                </button>
            </div>
        </aside>
    `;
}
