// src/admin/pages/login.js
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

export function renderLogin() {
    const app = document.getElementById('app');
    
    // Hide global UI elements (sidebar/topbar) when on login page
    const sidebar = document.getElementById('sidebar');
    const topBar = document.getElementById('top-bar');
    if (sidebar) sidebar.style.display = 'none';
    if (topBar) topBar.style.display = 'none';

    // To center the login and take full screen, we remove main-content classes or style the app container directly
    // Assuming the app container is inside a flex area, we can render a full-viewport modal/container
    app.innerHTML = `
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 px-4">
            <div class="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
                
                <div class="text-center">
                    <h2 class="mt-4 text-3xl font-extrabold text-gray-900">Admin Login</h2>
                    <p class="mt-2 text-sm text-gray-600">Enter your credentials to manage the Gadget Store</p>
                </div>
                
                <form id="login-form" class="space-y-5">
                    <div id="login-error" class="hidden rounded-md bg-red-50 p-4 mb-4">
                        <div class="text-sm text-red-700 font-medium" id="login-error-text"></div>
                    </div>

                    <div>
                        <label for="email" class="block text-sm font-medium text-gray-700">Email Address</label>
                        <div class="mt-1">
                            <input id="email" name="email" type="email" autocomplete="email" required 
                                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors">
                        </div>
                    </div>

                    <div>
                        <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
                        <div class="mt-1">
                            <input id="password" name="password" type="password" autocomplete="current-password" required 
                                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors">
                        </div>
                    </div>

                    <div>
                        <button type="submit" id="login-submit-btn" class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                            Sign in
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    const form = document.getElementById('login-form');
    const errorContainer = document.getElementById('login-error');
    const errorText = document.getElementById('login-error-text');
    const submitBtn = document.getElementById('login-submit-btn');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const auth = getAuth();

        try {
            // Update UI State
            submitBtn.disabled = true;
            submitBtn.innerHTML = `
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
            `;
            errorContainer.classList.add('hidden');

            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            // onAuthStateChanged in app.js will handle the redirect to #dashboard
            // once it fires with the updated user — no need to force it here.

        } catch (error) {
            console.error("Login failed:", error);
            errorContainer.classList.remove('hidden');
            
            // Map common Firebase errors to user friendly text
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                errorText.textContent = "Invalid email or password.";
            } else if (error.code === 'auth/too-many-requests') {
                errorText.textContent = "Too many failed login attempts. Please try again later.";
            } else {
                errorText.textContent = "Failed to sign in. Please try again.";
            }
            
            submitBtn.disabled = false;
            submitBtn.textContent = 'Sign in';
        }
    });
}
