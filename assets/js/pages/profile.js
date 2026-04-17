import { api } from '../api.js';
import { router } from '../router.js';

const base = window.TTFinder?.base ?? '';

export async function render(app) {
  const user = window.TTFinder?.user;
  if (!user) { router.push(`${base}/login`); return; }

  app.innerHTML = `<div class="flex items-center justify-center min-h-screen"><p class="text-gray-500 text-sm">Loading…</p></div>`;

  const [lftRes, lfpRes] = await Promise.all([
    api.lft.get().catch(() => ({ profile: null })),
    api.lfp.list().catch(() => ({ listings: [] })),
  ]);

  const lft      = lftRes.profile;
  const listings = lfpRes.listings ?? [];

  app.innerHTML = `
    <main class="max-w-3xl mx-auto px-4 py-10 space-y-8">

      <div>
        <h1 class="text-2xl font-bold text-white">My Profile</h1>
        <p class="text-gray-400 text-sm mt-1">${escHtml(user.email)}</p>
      </div>

      <!-- LFT Section -->
      <section class="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-lg font-semibold text-indigo-400">Looking for Table</h2>
            <p class="text-gray-400 text-sm">Your player profile for finding a group.</p>
          </div>
          <a href="${base}/lft-setup" data-link
            class="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition">
            ${lft ? 'Edit' : 'Set up'}
          </a>
        </div>
        ${lft ? lftSummary(lft) : `<p class="text-gray-500 text-sm">Not set up yet.</p>`}
      </section>

      <!-- LFP Section -->
      <section class="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-lg font-semibold text-emerald-400">Looking for Players</h2>
            <p class="text-gray-400 text-sm">Your table listings for finding players.</p>
          </div>
          <a href="${base}/lfp-create" data-link
            class="text-sm bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg transition">
            + New listing
          </a>
        </div>
        ${listings.length ? lfpList(listings) : `<p class="text-gray-500 text-sm">No listings yet.</p>`}
      </section>

    </main>
  `;

  app.querySelectorAll('[data-link]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      router.push(e.target.closest('[data-link]').getAttribute('href'));
    });
  });
}

function lftSummary(lft) {
  const systems = lft.systems?.join(', ') || '—';
  const badge = lft.visibility === 'private'
    ? `<span class="text-xs bg-yellow-900/50 border border-yellow-700 text-yellow-300 px-2 py-0.5 rounded-full">Private</span>`
    : `<span class="text-xs bg-green-900/50 border border-green-700 text-green-300 px-2 py-0.5 rounded-full">Public</span>`;
  const active = lft.is_active
    ? `<span class="text-xs bg-indigo-900/50 border border-indigo-700 text-indigo-300 px-2 py-0.5 rounded-full">Active</span>`
    : `<span class="text-xs bg-gray-700 text-gray-400 px-2 py-0.5 rounded-full">Inactive</span>`;
  return `
    <div class="space-y-2 text-sm text-gray-300">
      <div class="flex gap-2">${badge}${active}</div>
      <p><span class="text-gray-500">Systems:</span> ${escHtml(systems)}</p>
      ${lft.availability ? `<p><span class="text-gray-500">Availability:</span> ${escHtml(lft.availability)}</p>` : ''}
    </div>
  `;
}

function lfpList(listings) {
  return listings.map(l => `
    <div class="border-t border-gray-800 pt-4 mt-4 first:border-0 first:pt-0 first:mt-0 flex items-start justify-between gap-4">
      <div class="space-y-1 text-sm">
        <p class="font-medium text-white">${escHtml(l.title)}</p>
        <p class="text-gray-400">${escHtml(l.systems?.join(', ') || '—')} · ${escHtml(l.location_town)}, ${escHtml(l.location_state)}</p>
        <span class="${l.is_active ? 'text-green-400' : 'text-gray-500'} text-xs">${l.is_active ? 'Active' : 'Inactive'}</span>
      </div>
    </div>
  `).join('');
}

function escHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
