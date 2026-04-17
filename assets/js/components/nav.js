// TTFinder — Top navigation bar

import { api } from '../api.js';
import { router } from '../router.js';
import { t, currentLocale, setLocale, SUPPORTED_LANGS } from '../i18n.js';

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

  navEl.addEventListener('change', async (e) => {
    if (e.target.id === 'lang-switcher') {
      await setLocale(e.target.value);
      updateNav();
      await router.navigate(window.location.pathname);
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
      <div class="flex items-center gap-3 text-sm">
        ${langSwitcher()}
        <a href="${base}/browse" class="text-gray-300 hover:text-white transition" data-link>${t('nav.browse')}</a>
        ${user ? loggedInLinks(user) : loggedOutLinks()}
      </div>
    </div>
  `;
}

function langSwitcher() {
  const current = currentLocale();
  const options = SUPPORTED_LANGS.map(code =>
    `<option value="${code}" ${code === current ? 'selected' : ''}>${code.toUpperCase()}</option>`
  ).join('');
  return `
    <select id="lang-switcher"
      class="bg-gray-800 border border-gray-700 rounded text-gray-300 text-xs px-1.5 py-1 cursor-pointer focus:outline-none focus:border-indigo-500 transition">
      ${options}
    </select>
  `;
}

function loggedOutLinks() {
  return `
    <a href="${base}/login"    class="text-gray-300 hover:text-white transition" data-link>${t('nav.login')}</a>
    <a href="${base}/register" class="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded transition" data-link>${t('nav.signup')}</a>
  `;
}

function loggedInLinks(user) {
  return `
    <a href="${base}/messages"  class="text-gray-300 hover:text-white transition" data-link>${t('nav.messages')}</a>
    <a href="${base}/dashboard" class="text-gray-300 hover:text-white transition" data-link>${escHtml(user.display_name)}</a>
    <button id="nav-logout" class="text-gray-400 hover:text-red-400 transition text-sm">${t('nav.logout')}</button>
  `;
}

function escHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
