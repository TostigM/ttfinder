// TTFinder — Top navigation bar

import { router } from '../router.js';

export function renderNav() {
  const base = window.TTFinder?.base ?? '';

  const nav = document.createElement('nav');
  nav.className = 'fixed top-0 left-0 right-0 z-50 bg-gray-900 border-b border-gray-800';
  nav.innerHTML = `
    <div class="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
      <a href="${base}/" class="text-indigo-400 font-bold text-lg tracking-tight" data-link>TTFinder</a>
      <div class="flex items-center gap-4 text-sm" id="nav-links">
        <a href="${base}/browse" class="text-gray-300 hover:text-white transition" data-link>Browse</a>
        <a href="${base}/login"  class="text-gray-300 hover:text-white transition" data-link>Log in</a>
        <a href="${base}/register" class="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded transition" data-link>Sign up</a>
      </div>
    </div>
  `;

  // Intercept nav clicks for client-side routing
  nav.addEventListener('click', (e) => {
    const link = e.target.closest('[data-link]');
    if (link) {
      e.preventDefault();
      router.push(link.getAttribute('href'));
    }
  });

  document.body.prepend(nav);

  // Add top padding to app so content isn't hidden under nav
  document.getElementById('app').classList.add('pt-14');
}
