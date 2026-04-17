// TTFinder — Top navigation bar

import { api } from '../api.js';
import { router } from '../router.js';

const base = window.TTFinder?.base ?? '';

let navEl = null;

export function renderNav() {
  navEl = document.createElement('nav');
  navEl.id = 'main-nav';
  navEl.className = 'fixed top-0 left-0 right-0 z-50 bg-gray-900 border-b border-gray-800';

  navEl.addEventListener('click', async (e) => {
    const link = e.target.closest('[data-link]');
    if (link) {
      e.preventDefault();
      router.push(link.getAttribute('href'));
      return;
    }
    if (e.target.closest('#nav-logout')) {
      try { await api.auth.logout(); } finally {
        window.TTFinder.user = null;
        updateNav();
        router.push(`${base}/`);
      }
    }
  });

  document.body.prepend(navEl);
  document.getElementById('app').classList.add('pt-14');
  updateNav();
}

export function updateNav() {
  if (!navEl) return;
  const user = window.TTFinder?.user;

  navEl.innerHTML = `
    <div class="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
      <a href="${base}/" class="text-indigo-400 font-bold text-lg tracking-tight" data-link>TTFinder</a>
      <div class="flex items-center gap-4 text-sm">
        <a href="${base}/browse" class="text-gray-300 hover:text-white transition" data-link>Browse</a>
        ${user ? loggedInLinks(user) : loggedOutLinks()}
      </div>
    </div>
  `;
}

function loggedOutLinks() {
  return `
    <a href="${base}/login"    class="text-gray-300 hover:text-white transition" data-link>Log in</a>
    <a href="${base}/register" class="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded transition" data-link>Sign up</a>
  `;
}

function loggedInLinks(user) {
  return `
    <a href="${base}/messages"  class="text-gray-300 hover:text-white transition" data-link>Messages</a>
    <a href="${base}/dashboard" class="text-gray-300 hover:text-white transition" data-link>${escHtml(user.display_name)}</a>
    <button id="nav-logout" class="text-gray-400 hover:text-red-400 transition text-sm">Log out</button>
  `;
}

function escHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
