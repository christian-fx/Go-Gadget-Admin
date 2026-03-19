import { Sidebar } from '../components/sidebar.js';
import { Topbar } from '../components/topbar.js';
import { initSidebarLogic } from '../utils/ui-helpers.js';
import { AdminCategoryStore } from '../store/admin-category-store.js';
import { AdminProductStore } from '../store/admin-product-store.js';
import { ConfirmationModal } from '../components/confirmation-modal.js';
import { Toast } from '../components/toast.js';

export function renderCategories() {
    const app = document.getElementById('app');

    app.innerHTML = `
        <div class="flex h-screen w-full overflow-hidden bg-slate-100">
            ${Sidebar('categories')}
            <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
                ${Topbar('Categories', 'Organize your product cataolog')}
                <main class="flex-1 overflow-y-auto p-4 md:p-8">
                     <div class="max-w-7xl mx-auto flex flex-col gap-6">
                        <!-- Toolbar -->
                        <div class="flex flex-col md:flex-row justify-between items-center gap-4 bg-surface p-4 rounded-xl border border-border-color shadow-sm">
                             <input type="text" placeholder="Search categories..." class="border-2 border-border-color rounded-lg px-3 py-2 text-sm bg-white text-text-main focus:border-primary focus:outline-none w-full md:w-64" />
                             <button id="openAddCategoryBtn" class="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3 py-2 rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors w-full md:w-auto">
                                <span class="material-symbols-outlined text-[20px]">add</span> Add Category
                            </button>
                        </div>
                        
                        <!-- Grid -->
                        <div id="categories-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            <!-- Categories will be injected here -->
                        </div>
                     </div>
                </main>
            </div>
        </div>

        <!-- Add Category Modal -->
        <div id="addCategoryModal" class="hidden fixed inset-0 z-50 items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
             <div class="bg-surface w-full max-w-md rounded-2xl shadow-2xl p-6 transform scale-100 transition-all">
                <h3 class="text-xl font-bold text-text-main mb-6">Add New Category</h3>
                <form id="addCategoryForm" class="space-y-4">
                    <div>
                        <label class="block text-sm font-semibold text-text-main mb-2">Category Name</label>
                        <input type="text" id="catName" class="block w-full rounded-lg border-2 border-border-color bg-white p-3 text-text-main focus:border-primary focus:outline-none" placeholder="e.g. Smartphones" required />
                    </div>
                     <div>
                        <label class="block text-sm font-semibold text-text-main mb-2">Slug (Auto-generated)</label>
                        <input type="text" id="catSlug" class="block w-full rounded-lg border-2 border-border-color bg-slate-50 p-3 text-text-muted focus:border-primary focus:outline-none font-mono text-sm" placeholder="e.g. smartphones" />
                    </div>
                     <div>
                        <label class="block text-sm font-semibold text-text-main mb-2">Icon (Material Symbol)</label>
                        <input type="text" id="catIcon" class="block w-full rounded-lg border-2 border-border-color bg-white p-3 text-text-main focus:border-primary focus:outline-none" placeholder="e.g. smartphone" required />
                    </div>
                    <div class="flex justify-end gap-3 pt-4">
                        <button type="button" id="closeCategoryModal" class="px-4 py-2 rounded-lg border border-border-color text-text-muted hover:bg-slate-50 font-medium text-sm transition-colors">Cancel</button>
                        <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium text-sm shadow-sm transition-colors">Save Category</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    initCategoriesLogic();
}

async function initCategoriesLogic() {
    initSidebarLogic();
    const grid = document.getElementById('categories-grid');
    if (grid) grid.innerHTML = '<div class="col-span-full text-center py-12 text-text-muted">Loading categories...</div>';

    try {
        await Promise.all([
            AdminCategoryStore.init(),
            AdminProductStore.init()
        ]);
        renderGrid();
    } catch (error) {
        if (grid) grid.innerHTML = '<div class="col-span-full text-center py-12 text-rose-500">Error loading categories.</div>';
    }

    setupEventListeners();
}

function setupEventListeners() {
    // Modal Logic
    const openBtn = document.getElementById('openAddCategoryBtn');
    const modal = document.getElementById('addCategoryModal');
    const closeBtn = document.getElementById('closeCategoryModal');
    const form = document.getElementById('addCategoryForm');
    const grid = document.getElementById('categories-grid');

    const toggleModal = (show) => {
        if (modal) {
            if (show) {
                modal.classList.remove('hidden');
                modal.classList.add('flex');
            } else {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
            }
        }
    };

    if (openBtn) openBtn.addEventListener('click', () => toggleModal(true));
    if (closeBtn) closeBtn.addEventListener('click', () => toggleModal(false));
    if (modal) modal.addEventListener('click', (e) => {
        if (e.target === modal) toggleModal(false);
    });

    if (form) {
        // Prevent duplicate listeners
        if (form.getAttribute('data-init') === 'true') return;
        form.setAttribute('data-init', 'true');

        // Auto-Generate Logic
        const nameInput = document.getElementById('catName');
        const slugInput = document.getElementById('catSlug');
        const iconInput = document.getElementById('catIcon');

        if (nameInput) {
            nameInput.addEventListener('input', (e) => {
                const val = e.target.value;

                // 1. Generate Slug
                if (slugInput) {
                    slugInput.value = val.toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/(^-|-$)/g, '');
                }

                // 2. Suggest Icon
                if (iconInput) {
                    const lowerVal = val.toLowerCase();
                    const map = {
                        'phone': 'smartphone',
                        'mobile': 'smartphone',
                        'smart': 'smartphone',
                        'laptop': 'laptop',
                        'computer': 'computer',
                        'pc': 'computer',
                        'screen': 'monitor',
                        'monitor': 'monitor',
                        'display': 'monitor',
                        'watch': 'watch',
                        'wear': 'watch',
                        'clock': 'watch',
                        'audio': 'headphones',
                        'sound': 'headphones',
                        'headphone': 'headphones',
                        'speaker': 'speaker',
                        'music': 'music_note',
                        'camera': 'photo_camera',
                        'photo': 'photo_camera',
                        'video': 'videocam',
                        'game': 'videogame_asset',
                        'gaming': 'videogame_asset',
                        'console': 'videogame_asset',
                        'tv': 'tv',
                        'television': 'tv',
                        'home': 'home',
                        'house': 'home',
                        'print': 'print',
                        'office': 'desk',
                        'desk': 'desk',
                        'chair': 'chair',
                        'tablet': 'tablet_mac',
                        'pad': 'tablet_mac'
                    };

                    for (const key in map) {
                        if (lowerVal.includes(key)) {
                            iconInput.value = map[key];
                            break;
                        }
                    }
                }
            });
        }

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();

            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn ? submitBtn.textContent : 'Save';
            if (submitBtn) {
                if (submitBtn.disabled) return;
                submitBtn.disabled = true;
                submitBtn.textContent = 'Saving...';
            }

            const name = document.getElementById('catName').value;
            const icon = document.getElementById('catIcon').value;
            const slug = document.getElementById('catSlug').value || name.toLowerCase().replace(/\s+/g, '-');

            try {
                await AdminCategoryStore.add({
                    name,
                    icon,
                    slug,
                    count: 0
                });
                renderGrid();
                toggleModal(false);
                form.reset();
                Toast.show('Category added successfully');
            } catch (error) {
                alert('Failed to add category');
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                }
            }
        });
    }

    // Delete Logic
    if (grid) {
        // Remove existing listeners if any (though difficult without reference, strict mode helps)
        // We rely on the fact that this function runs once per navigation
        grid.addEventListener('click', async (e) => {
            const deleteBtn = e.target.closest('.delete-cat-btn');

            if (deleteBtn) {
                e.preventDefault();
                e.stopPropagation();

                const confirmed = await ConfirmationModal.show({
                    title: 'Delete Category',
                    message: 'Are you sure you want to delete this category?',
                    confirmText: 'Delete',
                    variant: 'danger'
                });

                if (confirmed) {
                    const id = deleteBtn.dataset.id;
                    try {
                        await AdminCategoryStore.delete(id);
                        renderGrid();
                        Toast.show('Category deleted successfully');
                    } catch (err) {
                        console.error('Failed to delete:', err);
                        Toast.show('Failed to delete category', 'error');
                    }
                }
            }
        });
    }
}

function renderGrid() {
    const container = document.getElementById('categories-grid');
    const categories = AdminCategoryStore.getAll();

    if (container) {
        if (categories.length === 0) {
            container.innerHTML = '<div class="col-span-full text-center py-12 text-text-muted">No categories found. Create one above!</div>';
            return;
        }

        container.innerHTML = categories.map(cat => {
            // Calculate count
            const count = AdminProductStore.getAll().filter(p => p.category === cat.slug || p.category === cat.name).length;

            return `
            <div class="bg-surface rounded-xl border border-border-color p-6 shadow-sm hover:shadow-md transition-shadow group relative">
                <button class="delete-cat-btn absolute top-4 right-4 text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg px-3 py-1 z-30 cursor-pointer transition-colors text-xs font-bold uppercase tracking-wide shadow-sm hover:shadow pointer-events-auto" data-id="${cat.id}">
                    Remove
                </button>
                <div class="h-14 w-14 rounded-xl bg-blue-50 flex items-center justify-center text-primary mb-4">
                    <span class="material-symbols-outlined text-3xl">${cat.icon}</span>
                </div>
                <h3 class="font-bold text-text-main text-lg mb-1">${cat.name}</h3>
                <p class="text-text-muted text-sm">${count} Products</p>
                
                <div class="mt-4 pt-4 border-t border-border-color flex justify-between items-center">
                    <span class="text-xs font-mono text-text-muted bg-slate-100 px-2 py-1 rounded">/${cat.slug}</span>
                    <button class="text-primary text-sm font-bold hover:underline">Edit</button>
                </div>
            </div>
        `;
        }).join('');
    }
}
