import { api } from '../api.js';
import { router } from '../router.js';

const base = window.TTFinder?.base ?? '';

export async function render(app) {
  const user = window.TTFinder?.user;
  if (!user) { router.push(`${base}/login`); return; }

  app.innerHTML = `
    <main class="max-w-4xl mx-auto px-4 py-10">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-white">Welcome, ${escHtml(user.display_name)}</h1>
        <p class="text-gray-400 mt-1">What would you like to do today?</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">

        <div class="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 class="text-lg font-semibold text-indigo-400 mb-1">Looking for Table</h2>
          <p class="text-gray-400 text-sm mb-4">Set up your player profile to find a group.</p>
          <a href="${base}/lft-setup" data-link
            class="inline-block bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            Set up LFT profile
          </a>
        </div>

        <div class="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 class="text-lg font-semibold text-emerald-400 mb-1">Looking for Players</h2>
          <p class="text-gray-400 text-sm mb-4">Create a listing to find players for your table.</p>
          <a href="${base}/lfp-create" data-link
            class="inline-block bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            Create LFP listing
          </a>
        </div>

      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

        <a href="${base}/browse" data-link
          class="bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl p-6 transition block">
          <h2 class="text-base font-semibold text-gray-200 mb-1">Browse listings</h2>
          <p class="text-gray-500 text-sm">Find tables and players near you.</p>
        </a>

        <a href="${base}/profile" data-link
          class="bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl p-6 transition block">
          <h2 class="text-base font-semibold text-gray-200 mb-1">My profile</h2>
          <p class="text-gray-500 text-sm">View and manage your LFT profile and LFP listings.</p>
        </a>

      </div>

      <div class="mt-8 text-right">
        <button id="logout-btn" class="text-sm text-gray-500 hover:text-red-400 transition">Log out</button>
      </div>
    </main>
  `;

  app.querySelectorAll('[data-link]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      router.push(e.target.closest('[data-link]').getAttribute('href'));
    });
  });

  app.querySelector('#logout-btn').addEventListener('click', async () => {
    try { await api.auth.logout(); } finally {
      window.TTFinder.user = null;
      window.TTFinder.updateNav?.();
      router.push(`${base}/`);
    }
  });
}

function escHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
