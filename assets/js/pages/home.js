// TTFinder — Home / landing page

import { router } from '../router.js';

const base = window.TTFinder?.base ?? '';

export async function render(app) {
  app.innerHTML = `
    <main class="max-w-3xl mx-auto px-4 py-20 text-center">
      <h1 class="text-4xl font-bold text-white mb-4">Find Your Table</h1>
      <p class="text-gray-400 text-lg mb-10">
        Connect with TTRPG players and game masters near you — safely and simply.
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <button id="btn-lft" class="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-lg transition">
          I'm Looking for a Table
        </button>
        <button id="btn-lfp" class="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-3 rounded-lg transition">
          I'm Looking for Players
        </button>
      </div>
      <p class="mt-8 text-sm text-gray-500">
        Already have an account? <a href="${base}/login" class="text-indigo-400 hover:underline" data-link>Log in</a>
      </p>
    </main>
  `;

  app.querySelector('#btn-lft').addEventListener('click', () => router.push(`${base}/register`));
  app.querySelector('#btn-lfp').addEventListener('click', () => router.push(`${base}/register`));
  app.querySelector('[data-link]').addEventListener('click', (e) => {
    e.preventDefault();
    router.push(e.target.getAttribute('href'));
  });
}
