import { api } from '../api.js';
import { router } from '../router.js';

const base = window.TTFinder?.base ?? '';

export async function render(app) {
  const user = window.TTFinder?.user;

  if (!user) {
    router.push(`${base}/login`);
    return;
  }

  app.innerHTML = `
    <main class="max-w-4xl mx-auto px-4 py-10">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-white">Welcome, ${escHtml(user.display_name)}</h1>
        <p class="text-gray-400 mt-1">What would you like to do today?</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">

        <div class="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 class="text-lg font-semibold text-indigo-400 mb-1">Looking for Table</h2>
          <p class="text-gray-400 text-sm mb-4">Set up your player profile to find a group.</p>
          <button class="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition" disabled>
            Set up LFT profile <span class="text-indigo-300">(coming soon)</span>
          </button>
        </div>

        <div class="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 class="text-lg font-semibold text-emerald-400 mb-1">Looking for Players</h2>
          <p class="text-gray-400 text-sm mb-4">Create a listing to find players for your table.</p>
          <button class="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition" disabled>
            Create LFP listing <span class="text-emerald-300">(coming soon)</span>
          </button>
        </div>

      </div>

      <div class="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 class="text-base font-semibold text-gray-200 mb-3">Account</h2>
        <div class="text-sm text-gray-400 space-y-1 mb-4">
          <p>Email: <span class="text-gray-200">${escHtml(user.email)}</span></p>
        </div>
        <button id="logout-btn" class="text-sm text-red-400 hover:text-red-300 transition">
          Log out
        </button>
      </div>
    </main>
  `;

  app.querySelector('#logout-btn').addEventListener('click', async () => {
    try {
      await api.auth.logout();
    } finally {
      window.TTFinder.user = null;
      router.push(`${base}/`);
    }
  });
}

function escHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
